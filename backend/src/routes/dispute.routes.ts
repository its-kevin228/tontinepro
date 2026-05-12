import { Router } from "express";
import {
  createDispute,
  getMyDisputes,
  getCircleDisputes,
  getAllDisputes,
  resolveDispute,
} from "../controllers/dispute.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { UserRole } from "@prisma/client";

const router = Router();

// Membre / Organisateur
router.post("/", requireAuth, createDispute);
router.get("/me", requireAuth, getMyDisputes);
router.get("/circle/:circleId", requireAuth, getCircleDisputes);

// Super Admin uniquement
router.get("/", requireAuth, requireRole(UserRole.SUPER_ADMIN), getAllDisputes);
router.patch("/:id", requireAuth, requireRole(UserRole.SUPER_ADMIN), resolveDispute);

export default router;
