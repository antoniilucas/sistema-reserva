import { AppError } from "../utils/AppError";
import { resourceRepository } from "../repositories/resource.repository";
import { registerAudit } from "../utils/audit";

export const resourceService = {
  list: (activeOnly = false) => resourceRepository.list(activeOnly),

  create: async (userId: string, data: any) => {
    const created = await resourceRepository.create(data);
    await registerAudit({ userId, action: "CRIAR", entity: "Resource", entityId: created.id, after: created });
    return created;
  },

  update: async (userId: string, id: string, data: any) => {
    const existing = await resourceRepository.findById(id);
    if (!existing) throw new AppError("Recurso não encontrado", 404);
    const updated = await resourceRepository.update(id, data);
    await registerAudit({ userId, action: "ATUALIZAR", entity: "Resource", entityId: id, before: existing, after: updated });
    return updated;
  },

  deactivate: async (userId: string, id: string) => {
    const existing = await resourceRepository.findById(id);
    if (!existing) throw new AppError("Recurso não encontrado", 404);
    const updated = await resourceRepository.update(id, { active: false });
    await registerAudit({ userId, action: "DESATIVAR", entity: "Resource", entityId: id, before: existing, after: updated });
    return updated;
  },

  linkToEnvironment: (environmentId: string, resourceId: string, mandatory = false) =>
    resourceRepository.linkToEnvironment(environmentId, resourceId, mandatory),

  unlinkFromEnvironment: (environmentId: string, resourceId: string) =>
    resourceRepository.unlinkFromEnvironment(environmentId, resourceId),
};
