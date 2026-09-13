import { AppError } from "../utils/AppError";
import { supportRepository } from "../repositories/support.repository";
import { reservationRepository } from "../repositories/reservation.repository";
import { registerAudit } from "../utils/audit";

export const supportService = {
  create: async (userId: string, payload: any) => {
    const reservation = await reservationRepository.findById(payload.reservationId);
    if (!reservation) throw new AppError("Reserva não encontrada", 404);

    const created = await supportRepository.create({
      reservation: { connect: { id: payload.reservationId } },
      type: payload.type,
      description: payload.description,
      requestedBy: { connect: { id: userId } },
    });

    await registerAudit({ userId, action: "SOLICITAR_SUPORTE", entity: "SupportRequest", entityId: created.id, after: created });
    return created;
  },

  list: (filters: any) => supportRepository.list(filters),

  updateStatus: async (userId: string, id: string, status: string) => {
    const updated = await supportRepository.update(id, {
      status: status as any,
      assignedTo: status === "ACEITA" || status === "EM_ANDAMENTO" ? { connect: { id: userId } } : undefined,
    });

    await registerAudit({ userId, action: "ATUALIZAR_STATUS_SUPORTE", entity: "SupportRequest", entityId: id, after: updated });
    return updated;
  },
};
