import { penaltyRepository } from "../repositories/penalty.repository";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../utils/AppError";
import { registerAudit } from "../utils/audit";

export const penaltyService = {
  create: async (appliedById: string, payload: any) => {
    const user = await userRepository.findById(payload.userId);
    if (!user) throw new AppError("Usuário não encontrado", 404);

    const created = await penaltyRepository.create({
      user: { connect: { id: payload.userId } },
      reservation: payload.reservationId ? { connect: { id: payload.reservationId } } : undefined,
      reason: payload.reason,
      description: payload.description,
      blockedUntil: payload.blockedUntil ? new Date(payload.blockedUntil) : undefined,
      appliedBy: { connect: { id: appliedById } },
    });

    await registerAudit({
      userId: appliedById,
      action: "APLICAR_PENALIDADE",
      entity: "Penalty",
      entityId: created.id,
      after: created,
    });
    return created;
  },

  listByUser: (userId: string) => penaltyRepository.listByUser(userId),
  listAll: () => penaltyRepository.listAll(),
};
