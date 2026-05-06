import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// ─── Mon profil ─────────────────────────────────────────────────────────────
export async function getMe(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      image: true,
      createdAt: true,
      kycRequest: { select: { status: true, createdAt: true } },
      memberships: {
        select: {
          id: true,
          role: true,
          order: true,
          joinedAt: true,
          circle: { select: { id: true, name: true, status: true, amount: true, frequency: true } },
        },
      },
    },
  });

  res.json({ user });
}

// ─── Modifier mon profil ────────────────────────────────────────────────────
export async function updateMe(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { name, image } = req.body;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(image && { image }),
    },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  res.json({ message: "Profil mis à jour", user: updated });
}

// ─── Soumettre une demande KYC ──────────────────────────────────────────────
export async function submitKyc(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { documentUrl } = req.body;

  if (!documentUrl) {
    res.status(400).json({ error: "documentUrl est requis" });
    return;
  }

  const existing = await prisma.kycRequest.findUnique({ where: { userId } });

  if (existing && existing.status === "PENDING") {
    res.status(400).json({ error: "Une demande KYC est déjà en attente" });
    return;
  }

  if (existing && existing.status === "APPROVED") {
    res.status(400).json({ error: "Votre KYC est déjà approuvé" });
    return;
  }

  const kyc = await prisma.kycRequest.upsert({
    where: { userId },
    update: { documentUrl, status: "PENDING", reviewedAt: null, reviewNote: null },
    create: { userId, documentUrl },
  });

  res.status(201).json({ message: "Demande KYC soumise avec succès", kyc });
}
