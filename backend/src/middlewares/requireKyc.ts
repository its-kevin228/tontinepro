import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

/**
 * Vérifie que l'utilisateur a un KYC approuvé avant de créer un cercle.
 * Utilisé uniquement sur POST /api/circles.
 */
export async function requireKyc(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user!.id;

  // Super Admin est exempté
  if (req.user!.role === "SUPER_ADMIN") {
    next();
    return;
  }

  const kyc = await prisma.kycRequest.findUnique({
    where: { userId },
    select: { status: true },
  });

  if (!kyc) {
    res.status(403).json({
      error: "KYC requis",
      code: "KYC_MISSING",
      message: "Vous devez soumettre et faire approuver votre identité avant de créer un cercle.",
    });
    return;
  }

  if (kyc.status === "PENDING") {
    res.status(403).json({
      error: "KYC en attente",
      code: "KYC_PENDING",
      message: "Votre demande KYC est en cours de vérification. Vous serez notifié dès qu'elle sera traitée.",
    });
    return;
  }

  if (kyc.status === "REJECTED") {
    res.status(403).json({
      error: "KYC rejeté",
      code: "KYC_REJECTED",
      message: "Votre demande KYC a été rejetée. Veuillez soumettre de nouveaux documents.",
    });
    return;
  }

  // KYC approuvé → on continue
  next();
}
