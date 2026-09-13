import { AppError } from "../utils/AppError";
import { occurrenceRepository } from "../repositories/occurrence.repository";
import { reservationRepository } from "../repositories/reservation.repository";
import { registerAudit } from "../utils/audit";

export const occurrenceService = {
  create: async (userId: string, payload: any) => {
    const reservation = await reservationRepository.findById(payload.reservationId);
    if (!reservation) throw new AppError("Reserva não encontrada", 404);

    const created = await occurrenceRepository.create({
      reservation: { connect: { id: payload.reservationId } },
      type: payload.type,
      description: payload.description,
      reportedBy: { connect: { id: userId } },
    });

    await registerAudit({ userId, action: "CRIAR", entity: "Occurrence", entityId: created.id, after: created });
    return created;
  },

  listByReservation: (reservationId: string) => occurrenceRepository.listByReservation(reservationId),
  listAll: () => occurrenceRepository.listAll(),
};
