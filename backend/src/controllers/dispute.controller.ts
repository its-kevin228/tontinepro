import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { DisputeStatus, MembershipRole } from "@prisma/client";
import { notifyUser } from "../lib/sse.js";

// ─── Créer un litige ────────────────────────────────────────────────────────
export async function createDispute(req: Request, res: Response): Promise<void> {
  const reporterId = req.user!.id;
  const { circleId, subject, description, targetId } = req.body;

  if (!circleId || !subject || !description) {
    res.status(400).json({ error: "circleId, subject et description sont requis" });
    return;
  }

  // Vérifier que le reporter est membre du cercle
  const membership = await prisma.membership.findUnique({
    where: { userId_circleId: { userId: reporterId, circleId } },
  });
  if (!membership) {
    res.status(403).json({ error: "Vous devez être membre du cercle pour signaler un litige" });
    return;
  }

  const dispute = await prisma.dispute.create({
    data: { circleId, reporterId, subject, description, targetId: targetId ?? null },
    include: {
      circle: { select: { name: true } },
      reporter: { select: { name: true } },
    },
  });

  // Notifier le Super Admin (tous les admins)
  const admins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    select: { id: true },
  });
  await Promise.all(
    admins.map((a) =>
      notifyUser(a.id, "⚠️ Nouveau litige signalé", `${dispute.reporter.name} a signalé un litige dans "${dispute.circle.name}" : ${subject}`)
    )
  );

  res.status(201).json({ message: "Litige créé avec succès", dispute });
}

// ─── Mes litiges ────────────────────────────────────────────────────────────
export async function getMyDisputes(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const disputes = await prisma.dispute.findMany({
    where: { reporterId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      circle: { select: { id: true, name: true } },
    },
  });

  res.json({ disputes });
}

// ─── Litiges d'un cercle (organisateur) ────────────────────────────────────
export async function getCircleDisputes(req: Request, res: Response): Promise<void> {
  const { circleId } = req.params;
  const userId = req.user!.id;

  const membership = await prisma.membership.findUnique({
    where: { userId_circleId: { userId, circleId } },
  });
  if (!membership || membership.role !== MembershipRole.ORGANISATEUR) {
    res.status(403).json({ error: "Accès refusé" });
    return;
  }

  const disputes = await prisma.dispute.findMany({
    where: { circleId },
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
    },
  });

  res.json({ disputes });
}

// ─── Tous les litiges (admin) ───────────────────────────────────────────────
export async function getAllDisputes(req: Request, res: Response): Promise<void> {
  const { status } = req.query;

  const disputes = await prisma.dispute.findMany({
    where: status ? { status: status as DisputeStatus } : {},
    orderBy: { createdAt: "desc" },
    include: {
      circle: { select: { id: true, name: true } },
      reporter: { select: { id: true, name: true, email: true } },
    },
  });

  res.json({ disputes });
}

// ─── Résoudre un litige (admin) ─────────────────────────────────────────────
export async function resolveDispute(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { status, resolution } = req.body;
  const adminId = req.user!.id;

  if (!["IN_REVIEW", "RESOLVED", "CLOSED"].includes(status)) {
    res.status(400).json({ error: "Statut invalide" });
    return;
  }

  const dispute = await prisma.dispute.findUnique({ where: { id } });
  if (!dispute) {
    res.status(404).json({ error: "Litige introuvable" });
    return;
  }

  const updated = await prisma.dispute.update({
    where: { id },
    data: {
      status,
      resolution: resolution ?? null,
      resolvedBy: status === "RESOLVED" || status === "CLOSED" ? adminId : null,
      resolvedAt: status === "RESOLVED" || status === "CLOSED" ? new Date() : null,
    },
  });

  // Notifier le reporter
  if (status === "RESOLVED" || status === "CLOSED") {
    await notifyUser(
      dispute.reporterId,
      status === "RESOLVED" ? "✅ Litige résolu" : "Litige clôturé",
      resolution ?? "Votre litige a été traité par l'équipe TontinePro."
    );
  }

  res.json({ message: "Litige mis à jour", dispute: updated });
}
