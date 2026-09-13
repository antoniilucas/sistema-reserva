import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const resourceRepository = {
  list: (activeOnly = false) =>
    prisma.resource.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { name: "asc" },
    }),
  findById: (id: string) => prisma.resource.findUnique({ where: { id } }),
  create: (data: Prisma.ResourceCreateInput) => prisma.resource.create({ data }),
  update: (id: string, data: Prisma.ResourceUpdateInput) =>
    prisma.resource.update({ where: { id }, data }),
  linkToEnvironment: (environmentId: string, resourceId: string, mandatory: boolean) =>
    prisma.environmentResource.upsert({
      where: { environmentId_resourceId: { environmentId, resourceId } },
      create: { environmentId, resourceId, mandatory },
      update: { mandatory },
    }),
  unlinkFromEnvironment: (environmentId: string, resourceId: string) =>
    prisma.environmentResource.delete({
      where: { environmentId_resourceId: { environmentId, resourceId } },
    }),
};
