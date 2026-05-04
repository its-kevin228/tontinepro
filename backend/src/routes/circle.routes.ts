import { Router } from "express";
import { createCircle, getCircles, getCircleById, joinCircle } from "../controllers/circle.controller";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";
import { UserRole } from "@prisma/client";

const router = Router();

// Routes publiques
router.get("/", getCircles);
router.get("/:id", getCircleById);

// Routes protégées
router.post("/", requireAuth, requireRole(UserRole.ORGANISATEUR, UserRole.SUPER_ADMIN), createCircle);
router.post("/:id/join", requireAuth, joinCircle);

export default router;