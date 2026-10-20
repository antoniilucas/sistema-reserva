import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const penaltyRepository = {
  create: (data: Prisma.PenaltyCreateInput) => prisma.penalty.create({ data }),
  findById: (id: string) => prisma.penalty.findUnique({ where: { id }, include: { user: { select: { id: true, name: true } } } }),
  update: (id: string, data: Prisma.PenaltyUpdateInput) => prisma.penalty.update({ where: { id }, data, include: { user: { select: { id: true, name: true } } } }),
  listByUser: (userId: string) =>
    prisma.penalty.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  listAll: () =>
    prisma.penalty.findMany({
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  activeBlockForUser: (userId: string) =>
    prisma.penalty.findFirst({
      where: { userId, cancelledAt: null, blockedUntil: { gt: new Date() } },
      orderBy: { blockedUntil: "desc" },
    }),
};
