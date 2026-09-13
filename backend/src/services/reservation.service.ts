import { ReservationStatus, RoleName } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { reservationRepository } from "../repositories/reservation.repository";
import { environmentRepository } from "../repositories/environment.repository";
import { userRepository } from "../repositories/user.repository";
import { penaltyRepository } from "../repositories/penalty.repository";
import { conflictService } from "./conflict.service";
import { registerAudit } from "../utils/audit";
import { combineDateAndTime, minutesBetween } from "../utils/dateUtils";
import { env as appEnv } from "../config/env";
import { prisma } from "../config/prisma";

interface CurrentUser {
  id: string;
  role: RoleName;
}

const ACTIVE_STATUSES: ReservationStatus[] = [
  "SOLICITADA",
  "PENDENTE_APROVACAO",
  "PENDENTE_ANALISE_TECNICA",
  "APROVADA",
  "EM_USO",
];

async function assertEligibility(environmentId: string, requesterRole: RoleName, userId: string) {
  // Verifica bloqueio ativo por penalidade
  const activeBlock = await penaltyRepository.activeBlockForUser(userId);
  if (activeBlock) {
    throw new AppError(
      `Usuário está temporariamente bloqueado para novas reservas até ${activeBlock.blockedUntil?.toLocaleString(
        "pt-BR"
      )}`,
      403
    );
  }

  const environment = await environmentRepository.findById(environmentId);
  if (!environment) throw new AppError("Ambiente não encontrado", 404);
  if (!environment.active) throw new AppError("Ambiente inativo", 400);

  const rule = environment.rules[0];
  if (rule && rule.allowedRoles.length > 0 && !rule.allowedRoles.includes(requesterRole)) {
    throw new AppError("Perfil não elegível para reservar este ambiente", 403);
  }

  if (environment.criticality !== "COMUM" && requesterRole === "SOLICITANTE" && rule?.allowedRoles.length === 0) {
    // Ambientes controlados/restritos sem lista explícita ainda exigem aprovação (tratado abaixo)
  }

  return environment;
}

function resolveInitialStatus(environment: any, requesterRole: RoleName): ReservationStatus {
  const rule = environment.rules[0];
  const requiresTechnical = rule?.requiresTechnicalReview || environment.requiresTechnicalResponsible;
  const requiresApproval = rule ? rule.requiresApproval : true;

  if (requiresTechnical) return "PENDENTE_ANALISE_TECNICA";
  if (requiresApproval && requesterRole !== "ADMINISTRADOR") return "PENDENTE_APROVACAO";
  return "APROVADA";
}

function validateAdvanceAndDuration(environment: any, startTime: Date, endTime: Date) {
  const rule = environment.rules[0];
  const now = new Date();
  const minAdvance = rule?.minAdvanceMinutes ?? 60;
  const maxAdvanceDays = rule?.maxAdvanceDays ?? 60;
  const maxDuration = rule?.maxDurationMinutes ?? 240;

  const advanceMinutes = minutesBetween(now, startTime);
  if (startTime < now) {
    throw new AppError("Não é possível reservar em data/horário no passado", 400);
  }
  if (advanceMinutes < minAdvance) {
    throw new AppError(`Antecedência mínima de ${minAdvance} minutos não respeitada`, 400);
  }
  const maxAdvanceMs = maxAdvanceDays * 24 * 60 * 60000;
  if (startTime.getTime() - now.getTime() > maxAdvanceMs) {
    throw new AppError(`Antecedência máxima de ${maxAdvanceDays} dias excedida`, 400);
  }

  const durationMinutes = minutesBetween(startTime, endTime);
  if (durationMinutes > maxDuration) {
    throw new AppError(`Duração máxima permitida é de ${maxDuration} minutos`, 400);
  }
}

export const reservationService = {
  create: async (currentUser: CurrentUser, payload: any) => {
    if (!payload.termsAccepted) {
      throw new AppError("É necessário aceitar o termo de responsabilidade", 400);
    }

    const environment = await assertEligibility(payload.environmentId, currentUser.role, currentUser.id);

    if (payload.participantsCount > environment.capacity) {
      throw new AppError(
        `Número de participantes (${payload.participantsCount}) excede a capacidade máxima (${environment.capacity})`,
        400
      );
    }

    const startTime = combineDateAndTime(payload.date, payload.startTime);
    const endTime = combineDateAndTime(payload.date, payload.endTime);

    validateAdvanceAndDuration(environment, startTime, endTime);

    await conflictService.assertAvailable({ environmentId: environment.id, startTime, endTime });

    const responsibleId = payload.responsibleId || currentUser.id;
    const responsible = await userRepository.findById(responsibleId);
    if (!responsible) throw new AppError("Responsável informado não encontrado", 404);

    const status = resolveInitialStatus(environment, currentUser.role);

    const created = await reservationRepository.create({
      environment: { connect: { id: environment.id } },
      requestedBy: { connect: { id: currentUser.id } },
      responsible: { connect: { id: responsibleId } },
      purpose: payload.purpose,
      participantsCount: payload.participantsCount,
      date: new Date(payload.date),
      startTime,
      endTime,
      status,
      termsAccepted: true,
      participants: payload.participants
        ? {
            create: payload.participants.map((p: any) => ({
              name: p.name,
              email: p.email,
              userId: p.userId,
            })),
          }
        : undefined,
      resources: payload.resources
        ? {
            create: payload.resources.map((r: any) => ({
              resourceId: r.resourceId,
              quantity: r.quantity || 1,
            })),
          }
        : undefined,
    });

    await registerAudit({
      userId: currentUser.id,
      action: "CRIAR",
      entity: "Reservation",
      entityId: created.id,
      after: created,
    });

    return created;
  },

  createRecurring: async (currentUser: CurrentUser, payload: any) => {
    if (!payload.termsAccepted) {
      throw new AppError("É necessário aceitar o termo de responsabilidade", 400);
    }
    const environment = await assertEligibility(payload.environmentId, currentUser.role, currentUser.id);

    const start = new Date(payload.startDate);
    const end = new Date(payload.endDate);
    const occurrences: Date[] = [];
    const stepDays = payload.frequency === "QUINZENAL" ? 14 : 7;

    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      if (payload.daysOfWeek.includes(cursor.getDay())) {
        occurrences.push(new Date(cursor));
      }
    }

    // Para quinzenal, mantém somente semanas alternadas a partir da primeira ocorrência
    let filtered = occurrences;
    if (payload.frequency === "QUINZENAL" && occurrences.length > 0) {
      const first = occurrences[0].getTime();
      filtered = occurrences.filter(
        (d) => Math.round((d.getTime() - first) / (1000 * 60 * 60 * 24)) % stepDays === 0
      );
    }

    const recurring = await prisma.recurringReservation.create({
      data: {
        frequency: payload.frequency,
        daysOfWeek: payload.daysOfWeek,
        startDate: start,
        endDate: end,
        startTime: payload.startTime,
        endTime: payload.endTime,
        createdById: currentUser.id,
      },
    });

    const valid: any[] = [];
    const conflicts: any[] = [];

    for (const date of filtered) {
      const startTime = combineDateAndTime(date, payload.startTime);
      const endTime = combineDateAndTime(date, payload.endTime);

      try {
        validateAdvanceAndDuration(environment, startTime, endTime);
        const availability = await conflictService.checkAvailability({
          environmentId: environment.id,
          startTime,
          endTime,
        });
        if (!availability.available) {
          conflicts.push({ date, reason: availability.reason });
          continue;
        }

        const status = resolveInitialStatus(environment, currentUser.role);
        const created = await reservationRepository.create({
          environment: { connect: { id: environment.id } },
          requestedBy: { connect: { id: currentUser.id } },
          responsible: { connect: { id: payload.responsibleId || currentUser.id } },
          recurring: { connect: { id: recurring.id } },
          purpose: payload.purpose,
          participantsCount: payload.participantsCount,
          date,
          startTime,
          endTime,
          status,
          termsAccepted: true,
        });
        valid.push(created);
      } catch (err: any) {
        conflicts.push({ date, reason: err.message });
      }
    }

    await registerAudit({
      userId: currentUser.id,
      action: "CRIAR_RECORRENTE",
      entity: "RecurringReservation",
      entityId: recurring.id,
      after: { valid: valid.length, conflicts: conflicts.length },
    });

    return { recurring, created: valid, conflicts };
  },

  createChain: async (currentUser: CurrentUser, payload: any) => {
    if (!payload.termsAccepted) {
      throw new AppError("É necessário aceitar o termo de responsabilidade", 400);
    }

    const chain = await prisma.reservationChain.create({
      data: { title: payload.title, createdById: currentUser.id },
    });

    const created: any[] = [];
    for (const item of payload.items) {
      const environment = await assertEligibility(item.environmentId, currentUser.role, currentUser.id);
      const startTime = combineDateAndTime(item.date, item.startTime);
      const endTime = combineDateAndTime(item.date, item.endTime);

      validateAdvanceAndDuration(environment, startTime, endTime);
      await conflictService.assertAvailable({ environmentId: environment.id, startTime, endTime });

      const status = resolveInitialStatus(environment, currentUser.role);
      const reservation = await reservationRepository.create({
        environment: { connect: { id: environment.id } },
        requestedBy: { connect: { id: currentUser.id } },
        responsible: { connect: { id: item.responsibleId || currentUser.id } },
        chain: { connect: { id: chain.id } },
        purpose: item.purpose,
        participantsCount: item.participantsCount,
        date: new Date(item.date),
        startTime,
        endTime,
        status,
        termsAccepted: true,
      });
      created.push(reservation);
    }

    await registerAudit({
      userId: currentUser.id,
      action: "CRIAR_CADEIA",
      entity: "ReservationChain",
      entityId: chain.id,
      after: { total: created.length },
    });

    return { chain, reservations: created };
  },

  getById: async (id: string) => {
    const reservation = await reservationRepository.findById(id);
    if (!reservation) throw new AppError("Reserva não encontrada", 404);
    return reservation;
  },

  list: (filters: any) => reservationRepository.list(filters),

  pendingApprovals: () => reservationRepository.pending(),

  update: async (currentUser: CurrentUser, id: string, payload: any) => {
    const reservation = await reservationService.getById(id);

    const isOwner = reservation.requestedById === currentUser.id;
    const isAdmin = currentUser.role === "ADMINISTRADOR";
    if (!isOwner && !isAdmin) {
      throw new AppError("Sem permissão para alterar esta reserva", 403);
    }

    if (!["SOLICITADA", "PENDENTE_APROVACAO", "PENDENTE_ANALISE_TECNICA", "APROVADA"].includes(reservation.status)) {
      throw new AppError("Reserva não pode mais ser alterada no status atual", 400);
    }

    const environmentId = payload.environmentId || reservation.environmentId;
    const environment = await environmentRepository.findById(environmentId);
    if (!environment) throw new AppError("Ambiente não encontrado", 404);

    const date = payload.date || reservation.date;
    const startTime = payload.startTime
      ? combineDateAndTime(date, payload.startTime)
      : reservation.startTime;
    const endTime = payload.endTime ? combineDateAndTime(date, payload.endTime) : reservation.endTime;

    validateAdvanceAndDuration(environment, startTime, endTime);

    await conflictService.assertAvailable({
      environmentId,
      startTime,
      endTime,
      excludeReservationId: id,
    });

    if (payload.participantsCount && payload.participantsCount > environment.capacity) {
      throw new AppError("Número de participantes excede a capacidade do ambiente", 400);
    }

    const wasApproved = reservation.status === "APROVADA";
    const newStatus = wasApproved ? resolveInitialStatus(environment, currentUser.role) : reservation.status;

    const updated = await reservationRepository.update(id, {
      environment: { connect: { id: environmentId } },
      date: new Date(date),
      startTime,
      endTime,
      purpose: payload.purpose ?? reservation.purpose,
      participantsCount: payload.participantsCount ?? reservation.participantsCount,
      responsible: payload.responsibleId ? { connect: { id: payload.responsibleId } } : undefined,
      status: newStatus,
      approvedBy: wasApproved && newStatus !== "APROVADA" ? { disconnect: true } : undefined,
    });

    await registerAudit({
      userId: currentUser.id,
      action: "ALTERAR",
      entity: "Reservation",
      entityId: id,
      before: reservation,
      after: updated,
    });

    return updated;
  },

  approve: async (currentUser: CurrentUser, id: string) => {
    const reservation = await reservationService.getById(id);
    if (!["PENDENTE_APROVACAO", "PENDENTE_ANALISE_TECNICA"].includes(reservation.status)) {
      throw new AppError("Reserva não está pendente de aprovação", 400);
    }

    const updated = await reservationRepository.update(id, {
      status: "APROVADA",
      approvedBy: { connect: { id: currentUser.id } },
    });

    await registerAudit({
      userId: currentUser.id,
      action: "APROVAR",
      entity: "Reservation",
      entityId: id,
      before: reservation,
      after: updated,
    });
    return updated;
  },

  reject: async (currentUser: CurrentUser, id: string, reason: string) => {
    const reservation = await reservationService.getById(id);
    if (!["PENDENTE_APROVACAO", "PENDENTE_ANALISE_TECNICA"].includes(reservation.status)) {
      throw new AppError("Reserva não está pendente de aprovação", 400);
    }

    const updated = await reservationRepository.update(id, {
      status: "RECUSADA",
      approvedBy: { connect: { id: currentUser.id } },
      rejectionReason: reason,
    });

    await registerAudit({
      userId: currentUser.id,
      action: "RECUSAR",
      entity: "Reservation",
      entityId: id,
      before: reservation,
      after: updated,
    });
    return updated;
  },

  cancel: async (currentUser: CurrentUser, id: string, reason: string) => {
    const reservation = await reservationService.getById(id);
    const isOwner = reservation.requestedById === currentUser.id;
    const isAdmin = currentUser.role === "ADMINISTRADOR";

    if (!isOwner && !isAdmin) {
      throw new AppError("Sem permissão para cancelar esta reserva", 403);
    }
    if (!ACTIVE_STATUSES.includes(reservation.status)) {
      throw new AppError("Reserva não pode ser cancelada no status atual", 400);
    }

    const updated = await reservationRepository.update(id, {
      status: "CANCELADA",
      cancellationReason: reason,
      cancelledById: currentUser.id,
    });

    await registerAudit({
      userId: currentUser.id,
      action: "CANCELAR",
      entity: "Reservation",
      entityId: id,
      before: reservation,
      after: updated,
    });
    return updated;
  },

  checkIn: async (currentUser: CurrentUser, id: string) => {
    const reservation = await reservationService.getById(id);

    const canCheckIn =
      reservation.requestedById === currentUser.id ||
      reservation.responsibleId === currentUser.id ||
      currentUser.role === "ADMINISTRADOR";
    if (!canCheckIn) {
      throw new AppError("Apenas o solicitante ou o responsável podem realizar check-in", 403);
    }

    if (reservation.status !== "APROVADA") {
      throw new AppError("Reserva precisa estar aprovada para check-in", 400);
    }

    const now = new Date();
    const minutesLate = minutesBetween(reservation.startTime, now);

    if (now > reservation.startTime && minutesLate > appEnv.checkinToleranceMinutes) {
      const updated = await reservationRepository.update(id, { status: "NO_SHOW" });
      await registerAudit({
        userId: currentUser.id,
        action: "NO_SHOW",
        entity: "Reservation",
        entityId: id,
        before: reservation,
        after: updated,
      });
      throw new AppError("Período de tolerância para check-in expirado. Reserva marcada como NO_SHOW", 409);
    }

    const updated = await reservationRepository.update(id, {
      status: "EM_USO",
      checkInAt: now,
    });

    await registerAudit({
      userId: currentUser.id,
      action: "CHECK_IN",
      entity: "Reservation",
      entityId: id,
      before: reservation,
      after: updated,
    });
    return updated;
  },

  checkOut: async (currentUser: CurrentUser, id: string, checklist?: Record<string, boolean>) => {
    const reservation = await reservationService.getById(id);

    const canCheckOut =
      reservation.requestedById === currentUser.id ||
      reservation.responsibleId === currentUser.id ||
      currentUser.role === "ADMINISTRADOR";
    if (!canCheckOut) {
      throw new AppError("Apenas o solicitante ou o responsável podem realizar check-out", 403);
    }

    if (reservation.status !== "EM_USO") {
      throw new AppError("Reserva precisa estar em uso para check-out", 400);
    }

    const updated = await reservationRepository.update(id, {
      status: "ENCERRADA",
      checkOutAt: new Date(),
      checkoutChecklist: checklist ?? undefined,
    });

    await registerAudit({
      userId: currentUser.id,
      action: "CHECK_OUT",
      entity: "Reservation",
      entityId: id,
      before: reservation,
      after: updated,
    });
    return updated;
  },

  markNoShowIfExpired: async (id: string) => {
    const reservation = await reservationService.getById(id);
    if (reservation.status !== "APROVADA") return reservation;

    const now = new Date();
    const minutesLate = minutesBetween(reservation.startTime, now);
    if (now > reservation.startTime && minutesLate > appEnv.checkinToleranceMinutes) {
      const updated = await reservationRepository.update(id, { status: "NO_SHOW" });
      await registerAudit({
        action: "NO_SHOW",
        entity: "Reservation",
        entityId: id,
        before: reservation,
        after: updated,
      });
      return updated;
    }
    return reservation;
  },
};
