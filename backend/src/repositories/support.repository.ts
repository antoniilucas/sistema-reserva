import { prisma } from "../config/prisma";
import { Prisma, SupportStatus } from "@prisma/client";

export const supportRepository = {
  create: (data: Prisma.SupportRequestCreateInput) => prisma.supportRequest.create({ data }),
  list: (filters: { status?: SupportStatus; requestedById?: string }) =>
    prisma.supportRequest.findMany({
      where: { status: filters.status, requestedById: filters.requestedById },
      include: {
        reservation: { include: { environment: true } },
        requestedBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  update: (id: string, data: Prisma.SupportRequestUpdateInput) =>
    prisma.supportRequest.update({ where: { id }, data }),
};
