import { AppError } from "../utils/AppError";
import { blockRepository } from "../repositories/block.repository";
import { environmentRepository } from "../repositories/environment.repository";
import { registerAudit } from "../utils/audit";

export const blockService = {
  list: (environmentId?: string) => blockRepository.list(environmentId),

  create: async (userId: string, payload: any) => {
    const environment = await environmentRepository.findById(payload.environmentId);
    if (!environment) throw new AppError("Ambiente não encontrado", 404);

    const start = new Date(payload.startDateTime);
    const end = new Date(payload.endDateTime);
    if (end <= start) throw new AppError("Data final deve ser maior que a inicial", 400);

    const created = await blockRepository.create({
      environment: { connect: { id: payload.environmentId } },
      reason: payload.reason,
      description: payload.description,
      startDateTime: start,
      endDateTime: end,
      createdBy: { connect: { id: userId } },
    });

    await registerAudit({ userId, action: "CRIAR", entity: "ScheduleBlock", entityId: created.id, after: created });
    return created;
  },

  remove: async (userId: string, id: string) => {
    await blockRepository.delete(id);
    await registerAudit({ userId, action: "REMOVER", entity: "ScheduleBlock", entityId: id });
  },
};
