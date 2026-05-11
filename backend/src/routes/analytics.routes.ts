import { Router } from "express";
import { UserRole } from "@prisma/client";
import { getOrganizerAnalytics } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

router.get(
  "/analytics",
  requireAuth,
  requireRole(UserRole.ORGANISATEUR, UserRole.SUPER_ADMIN),
  getOrganizerAnalytics
);

export default router;
