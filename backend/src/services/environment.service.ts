import { AppError } from "../utils/AppError";
import { environmentRepository } from "../repositories/environment.repository";
import { registerAudit } from "../utils/audit";

export const environmentService = {
  list: (filters: any) => environmentRepository.list(filters),

  getById: async (id: string) => {
    const env = await environmentRepository.findById(id);
    if (!env) throw new AppError("Ambiente não encontrado", 404);
    return env;
  },

  create: async (userId: string, data: any) => {
    const { rule, ...envData } = data;
    const created = await environmentRepository.create({
      ...envData,
      rules: rule
        ? {
            create: [
              {
                minAdvanceMinutes: rule.minAdvanceMinutes ?? 60,
                maxAdvanceDays: rule.maxAdvanceDays ?? 60,
                maxDurationMinutes: rule.maxDurationMinutes ?? 240,
                requiresApproval: rule.requiresApproval ?? true,
                requiresTechnicalReview: rule.requiresTechnicalReview ?? false,
                allowedRoles: rule.allowedRoles ?? [],
              },
            ],
          }
        : undefined,
    });
    await registerAudit({ userId, action: "CRIAR", entity: "Environment", entityId: created.id, after: created });
    return created;
  },

  update: async (userId: string, id: string, data: any) => {
    const existing = await environmentService.getById(id);
    const { rule, ...envData } = data;
    const updated = await environmentRepository.update(id, envData);

    await registerAudit({
      userId,
      action: "ATUALIZAR",
      entity: "Environment",
      entityId: id,
      before: existing,
      after: updated,
    });
    return updated;
  },

  deactivate: async (userId: string, id: string) => {
    const existing = await environmentService.getById(id);
    const updated = await environmentRepository.update(id, { active: false });
    await registerAudit({
      userId,
      action: "DESATIVAR",
      entity: "Environment",
      entityId: id,
      before: existing,
      after: updated,
    });
    return updated;
  },
};
