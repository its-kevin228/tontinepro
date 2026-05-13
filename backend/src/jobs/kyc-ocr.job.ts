import path from "path";
import { prisma } from "../lib/prisma.js";
import { computeNameConfidence, AUTO_APPROVE_THRESHOLD } from "../lib/ocr.js";
import { notifyUser } from "../lib/sse.js";
import { sendKycStatusEmail, sendKycAdminAlert } from "../lib/mail.js";

/**
 * Traite un KYC en arrière-plan :
 * - Image locale → OCR → auto-approbation si score ≥ 75%, sinon alerte admin
 * - PDF / URL externe → alerte admin directement
 */
export async function processKycOcr(kycId: string): Promise<void> {
  const kyc = await prisma.kycRequest.findUnique({
    where: { id: kycId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!kyc || kyc.status !== "PENDING") return;

  console.log(`[KYC-OCR] Traitement pour ${kyc.user.name}...`);

  try {
    let ocrText = "";
    let confidence = -1; // -1 = non analysé

    const isLocalImage =
      kyc.documentUrl.includes("/uploads/kyc/") &&
      /\.(jpg|jpeg|png|webp)$/i.test(kyc.documentUrl);

    if (isLocalImage) {
      const filename = path.basename(kyc.documentUrl);
      const localPath = path.join(process.cwd(), "uploads", "kyc", filename);

      try {
        // Import dynamique pour isoler les erreurs Tesseract du reste du serveur
        const { extractTextFromImage } = await import("../lib/ocr.js");
        ocrText = await extractTextFromImage(localPath);
        confidence = computeNameConfidence(ocrText, kyc.user.name);
        console.log(`[KYC-OCR] Score: ${confidence}%`);
      } catch (ocrErr: any) {
        console.error(`[KYC-OCR] OCR échoué (non fatal): ${ocrErr.message}`);
        confidence = -1;
      }
    }

    // ── Décision ─────────────────────────────────────────────────────────
    if (confidence >= AUTO_APPROVE_THRESHOLD) {
      // ✅ Auto-approbation
      await prisma.$transaction([
        prisma.kycRequest.update({
          where: { id: kycId },
          data: {
            status: "APPROVED",
            ocrText,
            ocrConfidence: confidence,
            ocrAutoApproved: true,
            reviewedAt: new Date(),
            reviewNote: `Validé automatiquement (correspondance : ${confidence}%)`,
          },
        }),
        prisma.user.update({
          where: { id: kyc.userId },
          data: { role: "ORGANISATEUR" },
        }),
      ]);

      await notifyUser(
        kyc.userId,
        "KYC approuvé automatiquement ✅",
        `Votre identité a été vérifiée (score : ${confidence}%). Vous pouvez créer des cercles.`
      );
      await sendKycStatusEmail(kyc.user.email, kyc.user.name, "APPROVED");
      console.log(`[KYC-OCR] ✅ Auto-approuvé`);

    } else {
      // ⚠️ Score insuffisant ou OCR indisponible → alerte admin
      const reason =
        confidence === -1
          ? "Document PDF, URL externe ou OCR indisponible — vérification manuelle requise"
          : `Correspondance insuffisante (score : ${confidence}% < ${AUTO_APPROVE_THRESHOLD}%)`;

      await prisma.kycRequest.update({
        where: { id: kycId },
        data: {
          ocrText: ocrText || null,
          ocrConfidence: confidence >= 0 ? confidence : null,
          ocrAutoApproved: false,
          reviewNote: reason,
        },
      });

      const admins = await prisma.user.findMany({
        where: { role: "SUPER_ADMIN" },
        select: { id: true, email: true, name: true },
      });

      for (const admin of admins) {
        await notifyUser(
          admin.id,
          "⚠️ KYC à vérifier manuellement",
          `Le KYC de ${kyc.user.name} nécessite une vérification. ${reason}`
        );
        try {
          await sendKycAdminAlert(
            admin.email, admin.name,
            kyc.user.name, kyc.user.email,
            reason, confidence, kyc.documentUrl
          );
        } catch (mailErr) {
          console.error("[KYC-OCR] Erreur email admin:", mailErr);
        }
      }
      console.log(`[KYC-OCR] ⚠️ Envoyé à l'admin`);
    }

  } catch (error: any) {
    console.error(`[KYC-OCR] Erreur générale:`, error.message);
    try {
      await prisma.kycRequest.update({
        where: { id: kycId },
        data: {
          reviewNote: "Erreur d'analyse — vérification manuelle requise",
          ocrAutoApproved: false,
        },
      });
    } catch {}
  }
}
