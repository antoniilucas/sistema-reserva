import { prisma } from "../config/prisma";

interface AuditParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
}

export const registerAudit = async (params: AuditParams) => {
  await prisma.auditLog.create({
    data: {
      userId: params.userId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      before: params.before === undefined ? undefined : (params.before as any),
      after: params.after === undefined ? undefined : (params.after as any),
    },
  });
};
