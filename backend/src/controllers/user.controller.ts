import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import path from "path";

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
      kycRequest: { select: { status: true, createdAt: true, reviewNote: true } },
      notificationPreference: true,
      memberships: {
        select: {
          id: true,
          role: true,
          order: true,
          joinedAt: true,
          circle: { select: { id: true, name: true, status: true, amount: true, frequency: true } },
        },
      },
      createdCircles: { select: { id: true } },
    },
  });

  res.json({ user });
}

// ─── Modifier mon profil ────────────────────────────────────────────────────
export async function updateMe(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { name, image, phone, currentPassword, newPassword } = req.body;

  // Si changement de mot de passe demandé
  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ error: "Le mot de passe actuel est requis" });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: "Le nouveau mot de passe doit faire au moins 8 caractères" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
    if (!user) { res.status(404).json({ error: "Utilisateur introuvable" }); return; }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      res.status(400).json({ error: "Mot de passe actuel incorrect" });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name?.trim() && { name: name.trim() }),
      ...(image && { image }),
    },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  res.json({ message: "Profil mis à jour", user: updated });
}

// ─── Préférences de notification ────────────────────────────────────────────
export async function getNotifPrefs(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const prefs = await prisma.notificationPreference.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  res.json({ preferences: prefs });
}

export async function updateNotifPrefs(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { emailReminders, emailPayment, emailKyc, inAppAll } = req.body;

  const prefs = await prisma.notificationPreference.upsert({
    where: { userId },
    update: {
      ...(emailReminders !== undefined && { emailReminders }),
      ...(emailPayment !== undefined && { emailPayment }),
      ...(emailKyc !== undefined && { emailKyc }),
      ...(inAppAll !== undefined && { inAppAll }),
    },
    create: {
      userId,
      emailReminders: emailReminders ?? true,
      emailPayment: emailPayment ?? true,
      emailKyc: emailKyc ?? true,
      inAppAll: inAppAll ?? true,
    },
  });

  res.json({ message: "Préférences mises à jour", preferences: prefs });
}

// ─── Soumettre une demande KYC ──────────────────────────────────────────────
export async function submitKyc(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  // Récupérer l'URL du fichier uploadé OU l'URL externe fournie
  let documentUrl: string | undefined;

  if (req.file) {
    // Fichier uploadé via multer → construire l'URL publique
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
    documentUrl = `${baseUrl}/uploads/kyc/${req.file.filename}`;
  } else if (req.body.documentUrl) {
    // URL externe (fallback)
    documentUrl = req.body.documentUrl;
  }

  if (!documentUrl) {
    res.status(400).json({ error: "Un document est requis (fichier ou URL)" });
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
    update: { documentUrl, status: "PENDING", reviewedAt: null, reviewNote: null, ocrText: null, ocrConfidence: null, ocrAutoApproved: false },
    create: { userId, documentUrl },
  });

  // Lancer l'analyse OCR en arrière-plan (non bloquant)
  // On utilise setImmediate pour ne pas bloquer la réponse HTTP
  setImmediate(() => {
    import("../jobs/kyc-ocr.job.js")
      .then(({ processKycOcr }) => processKycOcr(kyc.id))
      .catch((err) => console.error("[KYC] Erreur job OCR:", err));
  });

  res.status(201).json({ message: "Demande KYC soumise. Analyse en cours…", kyc });
}
