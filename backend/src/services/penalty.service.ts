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

  update: async (appliedById: string, id: string, payload: any) => {
    const existing = await penaltyRepository.findById(id);
    if (!existing) throw new AppError("Penalidade não encontrada", 404);
    if (existing.cancelledAt) throw new AppError("Não é possível editar uma penalidade cancelada", 400);
    if (payload.userId && payload.userId !== existing.userId && !(await userRepository.findById(payload.userId))) {
      throw new AppError("Usuário não encontrado", 404);
    }
    const updated = await penaltyRepository.update(id, {
      user: payload.userId ? { connect: { id: payload.userId } } : undefined,
      reason: payload.reason,
      description: payload.description,
      blockedUntil: payload.blockedUntil === undefined ? undefined : payload.blockedUntil ? new Date(payload.blockedUntil) : null,
    });
    await registerAudit({ userId: appliedById, action: "EDITAR_PENALIDADE", entity: "Penalty", entityId: id, before: existing, after: updated });
    return updated;
  },

  cancel: async (appliedById: string, id: string) => {
    const existing = await penaltyRepository.findById(id);
    if (!existing) throw new AppError("Penalidade não encontrada", 404);
    if (existing.cancelledAt) throw new AppError("Esta penalidade já foi cancelada", 400);
    const updated = await penaltyRepository.update(id, { cancelledAt: new Date() });
    await registerAudit({ userId: appliedById, action: "CANCELAR_PENALIDADE", entity: "Penalty", entityId: id, before: existing, after: updated });
    return updated;
  },

  listByUser: (userId: string) => penaltyRepository.listByUser(userId),
  listAll: () => penaltyRepository.listAll(),
};
