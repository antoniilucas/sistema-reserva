import { prisma } from "../config/prisma";
import { Prisma, RoleName, UserStatus } from "@prisma/client";

export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  list: (filters: { role?: RoleName; status?: UserStatus; search?: string }) =>
    prisma.user.findMany({
      where: {
        role: filters.role,
        status: filters.status,
        OR: filters.search
          ? [
              { name: { contains: filters.search, mode: "insensitive" } },
              { email: { contains: filters.search, mode: "insensitive" } },
            ]
          : undefined,
      },
      orderBy: { createdAt: "desc" },
    }),
  create: (data: Prisma.UserCreateInput) => prisma.user.create({ data }),
  update: (id: string, data: Prisma.UserUpdateInput) =>
    prisma.user.update({ where: { id }, data }),
};
