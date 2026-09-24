import { prisma } from "../config/prisma";

export const reportService = {
  overview: async () => {
    const [
      totalReservations,
      pending,
      approved,
      rejected,
      cancelled,
      noShow,
      inUse,
      closed,
      activeEnvironments,
      occurrencesCount,
      penaltiesCount,
    ] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: { in: ["PENDENTE_APROVACAO", "PENDENTE_ANALISE_TECNICA"] } } }),
      prisma.reservation.count({ where: { status: "APROVADA" } }),
      prisma.reservation.count({ where: { status: "RECUSADA" } }),
      prisma.reservation.count({ where: { status: "CANCELADA" } }),
      prisma.reservation.count({ where: { status: "NO_SHOW" } }),
      prisma.reservation.count({ where: { status: "EM_USO" } }),
      prisma.reservation.count({ where: { status: "ENCERRADA" } }),
      prisma.environment.count({ where: { active: true } }),
      prisma.occurrence.count(),
      prisma.penalty.count(),
    ]);

    const byEnvironment = await prisma.reservation.groupBy({
      by: ["environmentId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const environments = await prisma.environment.findMany({
      where: { id: { in: byEnvironment.map((b) => b.environmentId) } },
    });

    const mostUsedEnvironments = byEnvironment.map((b) => ({
      environment: environments.find((e) => e.id === b.environmentId),
      total: b._count.id,
    }));

    const byStatus = await prisma.reservation.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    return {
      totalReservations,
      pending,
      approved,
      rejected,
      cancelled,
      noShow,
      inUse,
      closed,
      activeEnvironments,
      occurrencesCount,
      penaltiesCount,
      occupancyRate:
        totalReservations > 0 ? Number((((approved + inUse + closed) / totalReservations) * 100).toFixed(1)) : 0,
      mostUsedEnvironments,
      byStatus: byStatus.map((s) => ({ status: s.status, total: s._count.id })),
    };
  },
};