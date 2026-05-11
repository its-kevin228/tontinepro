import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { MembershipRole, PaymentStatus, UserRole } from "@prisma/client";

export async function getOrganizerAnalytics(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const circleIds: string[] =
    userRole === UserRole.SUPER_ADMIN
      ? (await prisma.circle.findMany({ select: { id: true } })).map((c) => c.id)
      : (
          await prisma.membership.findMany({
            where: { userId, role: MembershipRole.ORGANISATEUR },
            select: { circleId: true },
          })
        ).map((m) => m.circleId);

  if (circleIds.length === 0) {
    res.json({
      stats: {
        totalVolume: 0,
        activeMembers: 0,
        collectionRate: null,
        paymentsThisMonth: { confirmed: 0, total: 0 },
      },
      cashflow: [],
      nextPayout: null,
      topMembers: [],
    });
    return;
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    totalVolumeAgg,
    activeMembers,
    paymentsThisMonthTotal,
    paymentsThisMonthConfirmed,
    nextCycle,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.CONFIRMED,
        cycle: { circleId: { in: circleIds } },
      },
      _sum: { amount: true },
    }),
    prisma.membership.count({
      where: { circleId: { in: circleIds }, role: MembershipRole.MEMBRE },
    }),
    prisma.payment.count({
      where: {
        createdAt: { gte: startOfMonth, lt: startOfNextMonth },
        cycle: { circleId: { in: circleIds } },
      },
    }),
    prisma.payment.count({
      where: {
        createdAt: { gte: startOfMonth, lt: startOfNextMonth },
        status: PaymentStatus.CONFIRMED,
        cycle: { circleId: { in: circleIds } },
      },
    }),
    prisma.cycle.findFirst({
      where: {
        circleId: { in: circleIds },
        status: "OPEN",
        endDate: { not: null, gte: now },
      },
      orderBy: { endDate: "asc" },
      include: { circle: { select: { id: true, name: true } } },
    }),
  ]);

  const startOfRange = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const rawPayments = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.CONFIRMED,
      createdAt: { gte: startOfRange },
      cycle: { circleId: { in: circleIds } },
    },
    select: { amount: true, createdAt: true },
  });

  const monthKeys: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthKeys.push(key);
  }

  const cashflowTotals: Record<string, number> = {};
  for (const payment of rawPayments) {
    const key = `${payment.createdAt.getFullYear()}-${String(payment.createdAt.getMonth() + 1).padStart(2, "0")}`;
    cashflowTotals[key] = (cashflowTotals[key] ?? 0) + payment.amount;
  }

  const cashflow = monthKeys.map((key) => ({
    month: key,
    total: cashflowTotals[key] ?? 0,
  }));

  // Top membres par nombre de paiements confirmés
  const allPayments = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.CONFIRMED,
      cycle: { circleId: { in: circleIds } },
    },
    select: { userId: true },
  });

  const countByUser: Record<string, number> = {};
  for (const p of allPayments) {
    countByUser[p.userId] = (countByUser[p.userId] ?? 0) + 1;
  }

  const topUserIds = Object.entries(countByUser)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([uid]) => uid);

  const topUsers = await prisma.user.findMany({
    where: { id: { in: topUserIds } },
    select: { id: true, name: true },
  });

  const topUsersById = new Map(topUsers.map((u) => [u.id, u.name]));
  const topMembers = topUserIds.map((uid) => ({
    userId: uid,
    name: topUsersById.get(uid) ?? "Utilisateur",
    paymentsCount: countByUser[uid],
  }));

  const collectionRate = paymentsThisMonthTotal
    ? Math.round((paymentsThisMonthConfirmed / paymentsThisMonthTotal) * 100)
    : null;

  const nextPayout = nextCycle?.endDate
    ? {
        circleId: nextCycle.circle.id,
        circleName: nextCycle.circle.name,
        date: nextCycle.endDate,
        daysLeft: Math.ceil(
          (nextCycle.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        ),
      }
    : null;

  res.json({
    stats: {
      totalVolume: totalVolumeAgg._sum.amount ?? 0,
      activeMembers,
      collectionRate,
      paymentsThisMonth: {
        confirmed: paymentsThisMonthConfirmed,
        total: paymentsThisMonthTotal,
      },
    },
    cashflow,
    nextPayout,
    topMembers,
  });
}
