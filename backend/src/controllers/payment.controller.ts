import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { PaymentMethod, PaymentStatus, MembershipRole } from "@prisma/client";
import { getPlatformFees } from "../lib/fees.js";
import { sendPaymentConfirmationEmail } from "../lib/mail.js";
import { notifyUser } from "../lib/sse.js";

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
      status: PaymentStatus.CONFIRMED,
      confirmedAt: new Date(),
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
    include: {
      cycle: {
        include: {
          circle: { select: { name: true } },
        },
      },
    },
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

  // Notification in-app + SSE au membre
  await notifyUser(
    payment.userId,
    "Paiement confirmé ✅",
    `Votre paiement de ${payment.amount} FCFA a été confirmé.`
  );

  // Email de confirmation
  const member = await prisma.user.findUnique({
    where: { id: payment.userId },
    select: { name: true, email: true },
  });

  if (member) {
    await sendPaymentConfirmationEmail({
      name: member.name,
      email: member.email,
      circleName: payment.cycle.circle.name,
      cycleNumber: payment.cycle.number,
      amount: payment.amount,
      method: payment.method,
      confirmedAt: new Date(),
    });
  }

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

  // Notification in-app + SSE au membre
  await notifyUser(
    payment.userId,
    "Paiement rejeté ❌",
    `Votre paiement de ${payment.amount} FCFA a été rejeté. Contactez votre organisateur.`
  );

  res.json({ message: "Paiement rejeté", payment: updated });
}

// ─── Générer un reçu PDF ────────────────────────────────────────────────────
export async function generateReceipt(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      cycle: {
        include: {
          circle: { select: { name: true, amount: true, frequency: true } },
        },
      },
    },
  });

  if (!payment) {
    res.status(404).json({ error: "Paiement introuvable" });
    return;
  }

  if (payment.userId !== userId && userRole !== "SUPER_ADMIN") {
    res.status(403).json({ error: "Accès refusé" });
    return;
  }

  if (payment.status !== PaymentStatus.CONFIRMED) {
    res.status(400).json({ error: "Le reçu n'est disponible que pour les paiements confirmés" });
    return;
  }

  const PDFDocument = (await import("pdfkit")).default;

  const W = 595.28; // A4 width en points
  const H = 841.89; // A4 height en points
  const MARGIN = 48;
  const CONTENT_W = W - MARGIN * 2;

  // Formatage sans espace insécable (remplace \u202f et \u00a0 par espace normal)
  const fmt = (n: number) =>
    n.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");

  const METHOD_LABELS: Record<string, string> = {
    CASH: "Espèces",
    VIREMENT: "Virement bancaire",
    MOBILE_MONEY: "Mobile Money",
  };

  const confirmedDate = payment.confirmedAt
    ? new Date(payment.confirmedAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const receiptRef = `TP-${id.slice(-8).toUpperCase()}`;

  const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: `Reçu TontinePro ${receiptRef}` } });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="recu-${receiptRef}.pdf"`);
  doc.pipe(res);

  // ── 1. FOND GÉNÉRAL ───────────────────────────────────────────────────────
  doc.rect(0, 0, W, H).fill("#f8fafc");

  // ── 2. BANDE SUPÉRIEURE ───────────────────────────────────────────────────
  doc.rect(0, 0, W, 160).fill("#272343");

  // Accent jaune gauche
  doc.rect(0, 0, 6, 160).fill("#ffd803");

  // Logo textuel : "Tontine" blanc + "Pro" jaune
  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor("#ffffff")
    .text("Tontine", MARGIN, 44, { continued: true })
    .fillColor("#ffd803")
    .text("Pro");

  // Sous-titre
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("rgba(255,255,255,0.55)")
    .text("Reçu de paiement officiel", MARGIN, 84);

  // Référence à droite
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#ffd803")
    .text(receiptRef, W - MARGIN - 120, 44, { width: 120, align: "right" });

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("rgba(255,255,255,0.4)")
    .text("Référence", W - MARGIN - 120, 62, { width: 120, align: "right" });

  // Date en haut à droite
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("rgba(255,255,255,0.55)")
    .text(confirmedDate, W - MARGIN - 120, 84, { width: 120, align: "right" });

  // ── 3. CARTE CENTRALE ─────────────────────────────────────────────────────
  const cardX = MARGIN;
  const cardY = 130;
  const cardW = CONTENT_W;
  const cardH = 490;
  const radius = 16;

  // Ombre simulée
  doc.rect(cardX + 3, cardY + 3, cardW, cardH).fill("rgba(39,35,67,0.08)");

  // Fond blanc de la carte
  doc.roundedRect(cardX, cardY, cardW, cardH, radius).fill("#ffffff");

  // ── 3a. Montant principal ─────────────────────────────────────────────────
  const amountBandY = cardY + 28;
  doc
    .roundedRect(cardX + 24, amountBandY, cardW - 48, 72, 12)
    .fill("#272343");

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("rgba(255,255,255,0.45)")
    .text("MONTANT PAYÉ", cardX + 40, amountBandY + 14);

  doc
    .font("Helvetica-Bold")
    .fontSize(30)
    .fillColor("#ffd803")
    .text(`${fmt(payment.amount)} FCFA`, cardX + 40, amountBandY + 30);

  // ── 3b. Lignes de détail ──────────────────────────────────────────────────
  const rows: [string, string][] = [
    ["Bénéficiaire", payment.user.name],
    ["Email", payment.user.email],
    ["Cercle", payment.cycle.circle.name],
    ["Cycle", `Cycle #${payment.cycle.number}`],
    ["Méthode de paiement", METHOD_LABELS[payment.method] ?? payment.method],
    ["Statut", "✓  Confirmé"],
    ["Date de confirmation", confirmedDate],
  ];

  const rowStartY = amountBandY + 72 + 24;
  const rowH = 38;
  const labelX = cardX + 24;
  const valueX = cardX + cardW / 2;

  rows.forEach(([label, value], i) => {
    const y = rowStartY + i * rowH;

    // Séparateur (sauf première ligne)
    if (i > 0) {
      doc
        .moveTo(labelX, y)
        .lineTo(cardX + cardW - 24, y)
        .strokeColor("#f0f4f8")
        .lineWidth(0.5)
        .stroke();
    }

    // Label
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#a7a9be")
      .text(label.toUpperCase(), labelX, y + 10, { width: cardW / 2 - 24 });

    // Valeur — "Confirmé" en vert
    const isStatus = label === "Statut";
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(isStatus ? "#42c88f" : "#272343")
      .text(value, valueX, y + 8, { width: cardW / 2 - 24, align: "right" });
  });

  // ── 3c. Ligne de bas de carte ─────────────────────────────────────────────
  const dividerY = cardY + cardH - 56;
  doc
    .moveTo(cardX + 24, dividerY)
    .lineTo(cardX + cardW - 24, dividerY)
    .strokeColor("#f0f4f8")
    .lineWidth(1)
    .stroke();

  // Texte légal bas de carte
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#c0c8d8")
    .text(
      "Ce document constitue une preuve de paiement valide. Conservez-le pour vos archives.",
      cardX + 24,
      dividerY + 12,
      { width: cardW - 48, align: "center" }
    );

  // ── 4. PIED DE PAGE ───────────────────────────────────────────────────────
  const footerY = cardY + cardH + 28;

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#272343")
    .text("TontinePro", MARGIN, footerY, { continued: true })
    .font("Helvetica")
    .fillColor("#a7a9be")
    .text("  ·  Plateforme de gestion de tontines");

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#c0c8d8")
    .text(
      `Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
      MARGIN,
      footerY + 16
    );

  // Référence répétée en bas à droite
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor("#dfe5f2")
    .text(receiptRef, W - MARGIN - 100, footerY, { width: 100, align: "right" });

  doc.end();
}

// ─── Initier un paiement Mobile Money (mock — à remplacer par vraie API) ───
//
// Flow simulé :
//   1. Le membre soumet son numéro de téléphone + le cycleId
//   2. Le système crée un paiement PENDING avec method=MOBILE_MONEY
//   3. Un délai simulé de 3s puis confirmation automatique (mock)
//   4. En production : remplacer le setTimeout par un webhook Flooz/T-Money
//
export async function initMobileMoneyPayment(req: Request, res: Response): Promise<void> {
  const { cycleId, phone } = req.body;
  const userId = req.user!.id;

  if (!cycleId || !phone) {
    res.status(400).json({ error: "cycleId et phone sont requis" });
    return;
  }

  // Valider le format du numéro (Togo : +228 XX XX XX XX)
  const phoneRegex = /^(\+228|00228)?[0-9]{8}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
    res.status(400).json({ error: "Numéro de téléphone invalide (format Togo attendu)" });
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

  // Vérifier que l'utilisateur est membre du cercle
  const membership = await prisma.membership.findUnique({
    where: { userId_circleId: { userId, circleId: cycle.circleId } },
  });

  if (!membership) {
    res.status(403).json({ error: "Vous n'êtes pas membre de ce cercle" });
    return;
  }

  // Vérifier qu'il n'y a pas déjà un paiement CONFIRMED ou PENDING pour ce cycle
  const existingPayment = await prisma.payment.findFirst({
    where: {
      cycleId,
      userId,
      status: { in: [PaymentStatus.CONFIRMED, PaymentStatus.PENDING] },
    },
  });

  if (existingPayment) {
    res.status(400).json({
      error:
        existingPayment.status === PaymentStatus.CONFIRMED
          ? "Vous avez déjà payé pour ce cycle"
          : "Un paiement est déjà en cours de traitement",
    });
    return;
  }

  // Lire les frais de transaction
  const { transactionFee } = await getPlatformFees();
  const baseAmount = cycle.circle.amount;
  const totalAmount = baseAmount + transactionFee;

  // Créer le paiement en PENDING
  const payment = await prisma.payment.create({
    data: {
      userId,
      cycleId,
      membershipId: membership.id,
      amount: baseAmount,
      method: PaymentMethod.MOBILE_MONEY,
      status: PaymentStatus.PENDING,
    },
  });

  // ── MOCK : confirmation automatique après 3 secondes ─────────────────────
  // TODO: Remplacer ce bloc par l'appel à l'API Flooz/T-Money
  // et traiter la confirmation via webhook POST /api/payments/webhook/mobile-money
  setTimeout(async () => {
    try {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.CONFIRMED, confirmedAt: new Date() },
      });

      await notifyUser(
        userId,
        "Paiement Mobile Money confirmé ✅",
        `Votre cotisation de ${baseAmount.toLocaleString("fr-FR")} FCFA${transactionFee > 0 ? ` (+ ${transactionFee} FCFA de frais)` : ""} a été confirmée.`
      );
    } catch (err) {
      console.error("[MockMobileMoney] Erreur confirmation:", err);
    }
  }, 3000);

  res.status(202).json({
    message: "Paiement Mobile Money initié. Confirmation dans quelques secondes.",
    payment: {
      id: payment.id,
      status: "PENDING",
      baseAmount,
      transactionFee,
      totalCharged: totalAmount,
      phone,
    },
    mock: true, // ← retirer en production
  });
}
