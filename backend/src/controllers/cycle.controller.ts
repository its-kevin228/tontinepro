import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { CycleStatus, MembershipRole } from "@prisma/client";

// ─── Démarrer un cycle ──────────────────────────────────────────────────────
export async function createCycle(req: Request, res: Response): Promise<void> {
  const { id: circleId } = req.params;
  const userId = req.user!.id;

  // Vérifier que l'utilisateur est organisateur du cercle
  const membership = await prisma.membership.findUnique({
    where: { userId_circleId: { userId, circleId } },
  });

  if (!membership || membership.role !== MembershipRole.ORGANISATEUR) {
    res.status(403).json({ error: "Seul l'organisateur peut démarrer un cycle" });
    return;
  }

  const circle = await prisma.circle.findUnique({ where: { id: circleId } });
  if (!circle || circle.status !== "ACTIVE") {
    res.status(400).json({ error: "Le cercle doit être actif pour démarrer un cycle" });
    return;
  }

  // Vérifier qu'il n'y a pas de cycle OPEN en cours
  const openCycle = await prisma.cycle.findFirst({
    where: { circleId, status: CycleStatus.OPEN },
  });

  if (openCycle) {
    res.status(400).json({ error: "Un cycle est déjà en cours. Clôturez-le avant d'en démarrer un nouveau." });
    return;
  }

  // Calculer le numéro du prochain cycle
  const lastCycle = await prisma.cycle.findFirst({
    where: { circleId },
    orderBy: { number: "desc" },
  });

  const nextNumber = (lastCycle?.number ?? 0) + 1;

  // Calculer la date de fin selon la fréquence
  const startDate = new Date();
  const endDate = new Date(startDate);
  if (circle.frequency === "WEEKLY") {
    endDate.setDate(endDate.getDate() + 7);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  const cycle = await prisma.cycle.create({
    data: {
      circleId,
      number: nextNumber,
      startDate,
      endDate,
      status: CycleStatus.OPEN,
    },
  });

  res.status(201).json({ message: "Cycle démarré avec succès", cycle });
}

// ─── Lister les cycles d'un cercle ─────────────────────────────────────────
export async function getCycles(req: Request, res: Response): Promise<void> {
  const { id: circleId } = req.params;

  const cycles = await prisma.cycle.findMany({
    where: { circleId },
    orderBy: { number: "desc" },
    include: {
      payments: {
        select: { id: true, status: true, amount: true, userId: true },
      },
    },
  });

  res.json({ cycles });
}

// ─── Clôturer un cycle ──────────────────────────────────────────────────────
export async function closeCycle(req: Request, res: Response): Promise<void> {
  const { id: cycleId } = req.params;
  const { beneficiaryId } = req.body;
  const userId = req.user!.id;

  const cycle = await prisma.cycle.findUnique({
    where: { id: cycleId },
    include: { circle: { include: { memberships: true } } },
  });

  if (!cycle) {
    res.status(404).json({ error: "Cycle introuvable" });
    return;
  }

  if (cycle.status !== CycleStatus.OPEN) {
    res.status(400).json({ error: "Ce cycle n'est pas ouvert" });
    return;
  }

  // Vérifier que l'appelant est organisateur du cercle
  const membership = cycle.circle.memberships.find(
    (m) => m.userId === userId && m.role === MembershipRole.ORGANISATEUR
  );

  if (!membership) {
    res.status(403).json({ error: "Seul l'organisateur peut clôturer un cycle" });
    return;
  }

  // Vérifier que le bénéficiaire est membre du cercle
  if (beneficiaryId) {
    const isMember = cycle.circle.memberships.some((m) => m.userId === beneficiaryId);
    if (!isMember) {
      res.status(400).json({ error: "Le bénéficiaire doit être membre du cercle" });
      return;
    }
  }

  const closedCycle = await prisma.cycle.update({
    where: { id: cycleId },
    data: {
      status: CycleStatus.CLOSED,
      endDate: new Date(),
      beneficiary: beneficiaryId ?? null,
    },
  });

  // Créer une notification pour tous les membres
  const memberIds = cycle.circle.memberships.map((m) => m.userId);
  await prisma.notification.createMany({
    data: memberIds.map((uid) => ({
      userId: uid,
      title: "Cycle clôturé",
      body: `Le cycle #${cycle.number} a été clôturé.`,
    })),
  });

  res.json({ message: "Cycle clôturé avec succès", cycle: closedCycle });
}
