import { prisma } from "../config/prisma";
import { Prisma, EnvironmentType } from "@prisma/client";

export const environmentRepository = {
  list: (filters: { type?: EnvironmentType; active?: boolean; search?: string }) =>
    prisma.environment.findMany({
      where: {
        type: filters.type,
        active: filters.active,
        OR: filters.search
          ? [
              { name: { contains: filters.search, mode: "insensitive" } },
              { code: { contains: filters.search, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: { rules: true, resources: { include: { resource: true } } },
      orderBy: { name: "asc" },
    }),
  findById: (id: string) =>
    prisma.environment.findUnique({
      where: { id },
      include: { rules: true, resources: { include: { resource: true } } },
    }),
  create: (data: Prisma.EnvironmentCreateInput) => prisma.environment.create({ data }),
  update: (id: string, data: Prisma.EnvironmentUpdateInput) =>
    prisma.environment.update({ where: { id }, data }),
};
