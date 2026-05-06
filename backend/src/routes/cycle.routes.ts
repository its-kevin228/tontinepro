import { Router } from "express";
import { createCycle, getCycles, closeCycle } from "../controllers/cycle.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router({ mergeParams: true }); // pour accéder à :id du parent

// GET  /api/circles/:id/cycles       — Lister les cycles d'un cercle
router.get("/", requireAuth, getCycles);

// POST /api/circles/:id/cycles       — Démarrer un nouveau cycle
router.post("/", requireAuth, createCycle);

// PATCH /api/cycles/:id/close        — Clôturer un cycle (monté séparément)
export const closeCycleRoute = Router();
closeCycleRoute.patch("/:id/close", requireAuth, closeCycle);

export default router;
