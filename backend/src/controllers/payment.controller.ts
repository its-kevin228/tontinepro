import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { PaymentMethod, PaymentStatus, MembershipRole } from "@prisma/client";
import { getPlatformFees } from "../lib/fees.js";
import { sendPaymentConfirmationEmail } from "../lib/mail.js";

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

  // Notification in-app au membre
  await prisma.notification.create({
    data: {
      userId: payment.userId,
      title: "Paiement confirmé ✅",
      body: `Votre paiement de ${payment.amount} FCFA a été confirmé.`,
    },
  });

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
          circle: { select: { name: true, amount: true } },
        },
      },
    },
  });

  if (!payment) {
    res.status(404).json({ error: "Paiement introuvable" });
    return;
  }

  // Seul le membre concerné ou un admin peut télécharger le reçu
  if (payment.userId !== userId && userRole !== "SUPER_ADMIN") {
    res.status(403).json({ error: "Accès refusé" });
    return;
  }

  if (payment.status !== PaymentStatus.CONFIRMED) {
    res.status(400).json({ error: "Le reçu n'est disponible que pour les paiements confirmés" });
    return;
  }

  // Import dynamique pour éviter les problèmes ESM
  const PDFDocument = (await import("pdfkit")).default;
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="recu-tontinepro-${id.slice(0, 8)}.pdf"`
  );
  doc.pipe(res);

  // ── En-tête ──────────────────────────────────────────────────────────────
  doc
    .rect(0, 0, doc.page.width, 100)
    .fill("#272343");

  doc
    .fillColor("#ffd803")
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("TontinePro", 50, 30);

  doc
    .fillColor("#ffffff")
    .fontSize(11)
    .font("Helvetica")
    .text("Reçu de paiement officiel", 50, 62);

  doc
    .fillColor("#ffd803")
    .fontSize(10)
    .text(`N° ${id.slice(0, 8).toUpperCase()}`, doc.page.width - 150, 62, { align: "right", width: 100 });

  // ── Corps ─────────────────────────────────────────────────────────────────
  doc.moveDown(3);

  const lineY = doc.y;
  doc
    .moveTo(50, lineY)
    .lineTo(doc.page.width - 50, lineY)
    .strokeColor("#dfe5f2")
    .lineWidth(1)
    .stroke();

  doc.moveDown(1.5);

  const col1 = 50;
  const col2 = 220;
  const rowH = 28;

  const rows: [string, string][] = [
    ["Membre", payment.user.name],
    ["Email", payment.user.email],
    ["Cercle", payment.cycle.circle.name],
    ["Cycle", `#${payment.cycle.number}`],
    ["Montant", `${payment.amount.toLocaleString("fr-FR")} FCFA`],
    ["Méthode", payment.method],
    ["Statut", "CONFIRMÉ ✓"],
    [
      "Date de confirmation",
      payment.confirmedAt
        ? new Date(payment.confirmedAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "—",
    ],
  ];

  rows.forEach(([label, value], i) => {
    const y = doc.y + (i === 0 ? 0 : rowH * i - rowH);
    if (i % 2 === 0) {
      doc.rect(col1 - 10, y - 6, doc.page.width - 80, rowH).fill("#f8fafc");
    }
    doc
      .fillColor("#a7a9be")
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(label.toUpperCase(), col1, y + 2);
    doc
      .fillColor("#272343")
      .fontSize(11)
      .font("Helvetica")
      .text(value, col2, y + 2);
  });

  // ── Montant mis en valeur ─────────────────────────────────────────────────
  doc.moveDown(rows.length + 1);

  doc
    .rect(50, doc.y, doc.page.width - 100, 60)
    .fill("#272343");

  doc
    .fillColor("#a7a9be")
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("MONTANT TOTAL PAYÉ", 70, doc.y - 50);

  doc
    .fillColor("#ffd803")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text(`${payment.amount.toLocaleString("fr-FR")} FCFA`, 70, doc.y - 35);

  // ── Pied de page ──────────────────────────────────────────────────────────
  doc.moveDown(4);

  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .strokeColor("#dfe5f2")
    .stroke();

  doc.moveDown(1);
  doc
    .fillColor("#a7a9be")
    .fontSize(9)
    .font("Helvetica")
    .text(
      `Ce document est généré automatiquement par TontinePro. Conservez-le comme preuve de paiement.`,
      50,
      doc.y,
      { align: "center", width: doc.page.width - 100 }
    );

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

      await prisma.notification.create({
        data: {
          userId,
          title: "Paiement Mobile Money confirmé ✅",
          body: `Votre cotisation de ${baseAmount.toLocaleString("fr-FR")} FCFA${transactionFee > 0 ? ` (+ ${transactionFee} FCFA de frais)` : ""} a été confirmée.`,
        },
      });
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
