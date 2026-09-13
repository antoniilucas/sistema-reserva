import { prisma } from "../config/prisma";

export const auditRepository = {
  list: (filters: { userId?: string; entity?: string; entityId?: string; from?: Date; to?: Date }) =>
    prisma.auditLog.findMany({
      where: {
        userId: filters.userId,
        entity: filters.entity,
        entityId: filters.entityId,
        createdAt: { gte: filters.from, lte: filters.to },
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
};
