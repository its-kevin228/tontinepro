import jwt from "jsonwebtoken";
import { UserRole, UserStatus } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

// Génère un token JWT signé
export function signToken(payload: JwtPayload): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET manquant dans les variables d'environnement");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

// Vérifie et décode un token — renvoie null si invalide/expiré
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}