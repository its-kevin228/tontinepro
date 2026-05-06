import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { KycStatus, UserStatus } from "@prisma/client";

// ─── Dashboard global ───────────────────────────────────────────────────────
export async function getDashboard(_req: Request, res: Response): Promise<void> {
  const [
    totalUsers,
    activeCircles,
    totalPayments,
    pendingKyc,
    confirmedPaymentsAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.circle.count({ where: { status: "ACTIVE" } }),
    prisma.payment.count(),
    prisma.kycRequest.count({ where: { status: KycStatus.PENDING } }),
    prisma.payment.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { amount: true },
    }),
  ]);

  res.json({
    totalUsers,
    activeCircles,
    totalPayments,
    pendingKyc,
    totalVolume: confirmedPaymentsAgg._sum.amount ?? 0,
  });
}

// ─── Lister tous les utilisateurs ──────────────────────────────────────────
export async function getUsers(_req: Request, res: Response): Promise<void> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      kycRequest: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ users });
}

// ─── Bannir un utilisateur ──────────────────────────────────────────────────
export async function banUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }

  if (user.role === "SUPER_ADMIN") {
    res.status(403).json({ error: "Impossible de bannir un Super Admin" });
    return;
  }

  await prisma.user.update({
    where: { id },
    data: { status: UserStatus.BANNED },
  });

  res.json({ message: `Utilisateur ${user.name} banni avec succès` });
}

// ─── Débannir un utilisateur ────────────────────────────────────────────────
export async function unbanUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }

  await prisma.user.update({
    where: { id },
    data: { status: UserStatus.ACTIVE },
  });

  res.json({ message: `Utilisateur ${user.name} réactivé` });
}

// ─── Lister les demandes KYC ────────────────────────────────────────────────
export async function getKycRequests(req: Request, res: Response): Promise<void> {
  const { status } = req.query;

  const requests = await prisma.kycRequest.findMany({
    where: status ? { status: status as KycStatus } : {},
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ requests });
}

// ─── Approuver / Rejeter une demande KYC ───────────────────────────────────
export async function reviewKyc(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { action, note } = req.body; // action: "approve" | "reject"

  if (!["approve", "reject"].includes(action)) {
    res.status(400).json({ error: "Action invalide. Utilisez 'approve' ou 'reject'" });
    return;
  }

  const kyc = await prisma.kycRequest.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!kyc) {
    res.status(404).json({ error: "Demande KYC introuvable" });
    return;
  }

  if (kyc.status !== KycStatus.PENDING) {
    res.status(400).json({ error: "Cette demande a déjà été traitée" });
    return;
  }

  const newStatus = action === "approve" ? KycStatus.APPROVED : KycStatus.REJECTED;

  await prisma.kycRequest.update({
    where: { id },
    data: { status: newStatus, reviewedAt: new Date(), reviewNote: note ?? null },
  });

  // Si approuvé → passer le rôle de l'utilisateur à ORGANISATEUR
  if (newStatus === KycStatus.APPROVED) {
    await prisma.user.update({
      where: { id: kyc.userId },
      data: { role: "ORGANISATEUR" },
    });
  }

  // Notification à l'utilisateur
  await prisma.notification.create({
    data: {
      userId: kyc.userId,
      title: newStatus === KycStatus.APPROVED ? "KYC approuvé ✅" : "KYC rejeté ❌",
      body:
        newStatus === KycStatus.APPROVED
          ? "Votre identité a été vérifiée. Vous pouvez maintenant créer des cercles."
          : `Votre demande KYC a été rejetée. ${note ?? ""}`,
    },
  });

  res.json({ message: `KYC ${action === "approve" ? "approuvé" : "rejeté"}` });
}

// ─── Lire les paramètres plateforme ────────────────────────────────────────
export async function getSettings(_req: Request, res: Response): Promise<void> {
  const settings = await prisma.platformSetting.findMany();
  const result = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  res.json({ settings: result });
}

// ─── Mettre à jour un paramètre plateforme ─────────────────────────────────
export async function updateSetting(req: Request, res: Response): Promise<void> {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    res.status(400).json({ error: "key et value sont requis" });
    return;
  }

  const setting = await prisma.platformSetting.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  });

  res.json({ message: "Paramètre mis à jour", setting });
}
