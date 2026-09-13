import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const blockRepository = {
  list: (environmentId?: string) =>
    prisma.scheduleBlock.findMany({
      where: { environmentId },
      include: { environment: true, createdBy: { select: { id: true, name: true } } },
      orderBy: { startDateTime: "desc" },
    }),
  create: (data: Prisma.ScheduleBlockCreateInput) => prisma.scheduleBlock.create({ data }),
  findConflicting: (environmentId: string, start: Date, end: Date) =>
    prisma.scheduleBlock.findMany({
      where: {
        environmentId,
        startDateTime: { lt: end },
        endDateTime: { gt: start },
      },
    }),
  delete: (id: string) => prisma.scheduleBlock.delete({ where: { id } }),
};
