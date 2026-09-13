import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const occurrenceRepository = {
  create: (data: Prisma.OccurrenceCreateInput) => prisma.occurrence.create({ data }),
  listByReservation: (reservationId: string) =>
    prisma.occurrence.findMany({ where: { reservationId }, orderBy: { createdAt: "desc" } }),
  listAll: () =>
    prisma.occurrence.findMany({
      include: { reservation: true, reportedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
};
