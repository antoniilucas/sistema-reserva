import { prisma } from "../config/prisma";
import { Prisma, ReservationStatus } from "@prisma/client";

const fullInclude = {
  environment: true,
  requestedBy: { select: { id: true, name: true, email: true } },
  responsible: { select: { id: true, name: true, email: true } },
  approvedBy: { select: { id: true, name: true, email: true } },
  participants: true,
  resources: { include: { resource: true } },
  occurrences: true,
  supportRequests: true,
} satisfies Prisma.ReservationInclude;

export const reservationRepository = {
  create: (data: Prisma.ReservationCreateInput) =>
    prisma.reservation.create({ data, include: fullInclude }),
  findById: (id: string) =>
    prisma.reservation.findUnique({ where: { id }, include: fullInclude }),
  update: (id: string, data: Prisma.ReservationUpdateInput) =>
    prisma.reservation.update({ where: { id }, data, include: fullInclude }),
  list: (filters: {
    requesterId?: string;
    status?: ReservationStatus;
    environmentId?: string;
    from?: Date;
    to?: Date;
  }) =>
    prisma.reservation.findMany({
      where: {
        requestedById: filters.requesterId,
        status: filters.status,
        environmentId: filters.environmentId,
        date: {
          gte: filters.from,
          lte: filters.to,
        },
      },
      include: fullInclude,
      orderBy: { date: "desc" },
    }),
  findConflicting: (environmentId: string, start: Date, end: Date, excludeId?: string) =>
    prisma.reservation.findMany({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        environmentId,
        status: { in: ["SOLICITADA", "PENDENTE_APROVACAO", "PENDENTE_ANALISE_TECNICA", "APROVADA", "EM_USO"] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    }),
  pending: () =>
    prisma.reservation.findMany({
      where: { status: { in: ["PENDENTE_APROVACAO", "PENDENTE_ANALISE_TECNICA"] } },
      include: fullInclude,
      orderBy: { createdAt: "asc" },
    }),
};
