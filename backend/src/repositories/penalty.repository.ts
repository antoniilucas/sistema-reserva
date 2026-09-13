import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const penaltyRepository = {
  create: (data: Prisma.PenaltyCreateInput) => prisma.penalty.create({ data }),
  listByUser: (userId: string) =>
    prisma.penalty.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  listAll: () =>
    prisma.penalty.findMany({
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  activeBlockForUser: (userId: string) =>
    prisma.penalty.findFirst({
      where: { userId, blockedUntil: { gt: new Date() } },
      orderBy: { blockedUntil: "desc" },
    }),
};
