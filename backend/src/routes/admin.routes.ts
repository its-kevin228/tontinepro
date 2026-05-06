import { Router } from "express";
import {
  getDashboard,
  getUsers,
  banUser,
  unbanUser,
  getKycRequests,
  reviewKyc,
  getSettings,
  updateSetting,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { UserRole } from "@prisma/client";

const router = Router();
const adminOnly = [requireAuth, requireRole(UserRole.SUPER_ADMIN)];

// GET  /api/admin/dashboard          — Statistiques globales
router.get("/dashboard", ...adminOnly, getDashboard);

// GET  /api/admin/users              — Liste tous les utilisateurs
router.get("/users", ...adminOnly, getUsers);

// PATCH /api/admin/users/:id/ban     — Bannir un utilisateur
router.patch("/users/:id/ban", ...adminOnly, banUser);

// PATCH /api/admin/users/:id/unban   — Débannir un utilisateur
router.patch("/users/:id/unban", ...adminOnly, unbanUser);

// GET  /api/admin/kyc                — Lister les demandes KYC
router.get("/kyc", ...adminOnly, getKycRequests);

// PATCH /api/admin/kyc/:id           — Approuver / Rejeter un KYC
router.patch("/kyc/:id", ...adminOnly, reviewKyc);

// GET  /api/admin/settings           — Paramètres plateforme
router.get("/settings", ...adminOnly, getSettings);

// PATCH /api/admin/settings          — Modifier un paramètre
router.patch("/settings", ...adminOnly, updateSetting);

export default router;
