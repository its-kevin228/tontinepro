import { Router } from "express";
import { createCircle, getCircles, getCircleById, joinCircle, activateCircle } from "../controllers/circle.controller";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";
import { UserRole } from "@prisma/client";

const router = Router();

// Routes protégées — l'utilisateur voit SES cercles
router.get("/", requireAuth, getCircles);
router.get("/:id", requireAuth, getCircleById);

// Routes protégées
router.post("/", requireAuth, requireRole(UserRole.ORGANISATEUR, UserRole.SUPER_ADMIN), createCircle);
router.post("/:id/join", requireAuth, joinCircle);
router.post("/:id/activate", requireAuth, activateCircle);

export default router;