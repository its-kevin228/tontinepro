import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { PaymentMethod, PaymentStatus, MembershipRole } from "@prisma/client";

// ─── Enregistrer un paiement (par l'organisateur) ──────────────────────────
export async function createPayment(req: Request, res: Response): Promise<void> {
  const { cycleId, memberId, amount, method } = req.body;
  const userId = req.user!.id;

  if (!cycleId || !memberId || !amount) {
    res.status(400).json({ error: "cycleId, memberId et amount sont requis" });
    return;
  }

  const cycle = await prisma.cycle.findUnique({
    where: { id: cycleId },
    include: { circle: true },
  });

  if (!cycle || cycle.status !== "OPEN") {
    res.status(400).json({ error: "Cycle introuvable ou non ouvert" });
    return;
  }

  // Vérifier que le demandeur est organisateur du cercle
  const callerMembership = await prisma.membership.findUnique({
    where: { userId_circleId: { userId, circleId: cycle.circleId } },
  });

  if (!callerMembership || callerMembership.role !== MembershipRole.ORGANISATEUR) {
    res.status(403).json({ error: "Seul l'organisateur peut enregistrer un paiement" });
    return;
  }

  // Récupérer le membership du membre payeur
  const memberMembership = await prisma.membership.findUnique({
    where: { userId_circleId: { userId: memberId, circleId: cycle.circleId } },
  });

  if (!memberMembership) {
    res.status(400).json({ error: "Ce membre ne fait pas partie du cercle" });
    return;
  }

  // Vérifier qu'il n'y a pas déjà un paiement CONFIRMED pour ce cycle
  const existingPayment = await prisma.payment.findFirst({
    where: {
      cycleId,
      userId: memberId,
      status: PaymentStatus.CONFIRMED,
    },
  });

  if (existingPayment) {
    res.status(400).json({ error: "Ce membre a déjà un paiement confirmé pour ce cycle" });
    return;
  }

  const payment = await prisma.payment.create({
    data: {
      userId: memberId,
      cycleId,
      membershipId: memberMembership.id,
      amount: parseFloat(amount),
      method: (method as PaymentMethod) ?? PaymentMethod.CASH,
      status: PaymentStatus.PENDING,
    },
  });

  res.status(201).json({ message: "Paiement enregistré", payment });
}

// ─── Historique des paiements ───────────────────────────────────────────────
export async function getPayments(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { cycleId, status, circleId } = req.query;

  const user = req.user!;
  const isAdmin = user.role === "SUPER_ADMIN";

  // Un membre voit ses propres paiements, un admin voit tout
  const whereClause: Record<string, unknown> = isAdmin ? {} : { userId };

  if (cycleId) whereClause.cycleId = cycleId as string;
  if (status) whereClause.status = status as PaymentStatus;
  if (circleId) {
    whereClause.cycle = { circleId: circleId as string };
  }

  const payments = await prisma.payment.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      cycle: { select: { id: true, number: true, circleId: true } },
    },
  });

  res.json({ payments });
}

// ─── Confirmer un paiement ──────────────────────────────────────────────────
export async function confirmPayment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.id;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { cycle: { include: { circle: true } } },
  });

  if (!payment) {
    res.status(404).json({ error: "Paiement introuvable" });
    return;
  }

  if (payment.status !== PaymentStatus.PENDING) {
    res.status(400).json({ error: "Seul un paiement en attente peut être confirmé" });
    return;
  }

  // Vérifier que l'appelant est organisateur du cercle
  const membership = await prisma.membership.findUnique({
    where: { userId_circleId: { userId, circleId: payment.cycle.circleId } },
  });

  if (!membership || membership.role !== MembershipRole.ORGANISATEUR) {
    res.status(403).json({ error: "Seul l'organisateur peut confirmer un paiement" });
    return;
  }

  const updated = await prisma.payment.update({
    where: { id },
    data: { status: PaymentStatus.CONFIRMED, confirmedAt: new Date() },
  });

  // Notification au membre
  await prisma.notification.create({
    data: {
      userId: payment.userId,
      title: "Paiement confirmé ✅",
      body: `Votre paiement de ${payment.amount} FCFA a été confirmé.`,
    },
  });

  res.json({ message: "Paiement confirmé", payment: updated });
}

// ─── Rejeter un paiement ────────────────────────────────────────────────────
export async function rejectPayment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.id;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { cycle: { include: { circle: true } } },
  });

  if (!payment) {
    res.status(404).json({ error: "Paiement introuvable" });
    return;
  }

  if (payment.status !== PaymentStatus.PENDING) {
    res.status(400).json({ error: "Seul un paiement en attente peut être rejeté" });
    return;
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_circleId: { userId, circleId: payment.cycle.circleId } },
  });

  if (!membership || membership.role !== MembershipRole.ORGANISATEUR) {
    res.status(403).json({ error: "Seul l'organisateur peut rejeter un paiement" });
    return;
  }

  const updated = await prisma.payment.update({
    where: { id },
    data: { status: PaymentStatus.REJECTED },
  });

  // Notification au membre
  await prisma.notification.create({
    data: {
      userId: payment.userId,
      title: "Paiement rejeté ❌",
      body: `Votre paiement de ${payment.amount} FCFA a été rejeté. Contactez votre organisateur.`,
    },
  });

  res.json({ message: "Paiement rejeté", payment: updated });
}
