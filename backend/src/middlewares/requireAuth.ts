import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";

// Protège une route — vérifie le JWT dans le header Authorization: Bearer <token>
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token manquant ou mal formé" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: "Token invalide ou expiré" });
    return;
  }

  // Vérification en base — s'assure que le compte existe encore et n'est pas banni
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  if (!user) {
    res.status(401).json({ error: "Utilisateur introuvable" });
    return;
  }

  if (user.status === "BANNED" || user.status === "SUSPENDED") {
    res.status(403).json({ error: "Compte suspendu ou banni" });
    return;
  }

  req.user = user;
  next();
}