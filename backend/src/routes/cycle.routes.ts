import { Router } from "express";
import { createCycle, getCycles, closeCycle } from "../controllers/cycle.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router({ mergeParams: true }); // pour accéder à :id du parent

/**
 * @swagger
 * tags:
 *   name: Cycles
 *   description: Gestion des cycles de tontine (rounds de collecte)
 */

/**
 * @swagger
 * /api/circles/{id}/cycles:
 *   get:
 *     summary: Lister les cycles d'un cercle
 *     tags: [Cycles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des cycles
 */
router.get("/", requireAuth, getCycles);

/**
 * @swagger
 * /api/circles/{id}/cycles:
 *   post:
 *     summary: Démarrer un nouveau cycle (Organisateur uniquement)
 *     tags: [Cycles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Cycle démarré
 */
router.post("/", requireAuth, createCycle);

/**
 * @swagger
 * /api/cycles/{id}/close:
 *   patch:
 *     summary: Clôturer un cycle manuellement
 *     tags: [Cycles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cycle clôturé
 */
export const closeCycleRoute = Router();
closeCycleRoute.patch("/:id/close", requireAuth, closeCycle);

export default router;
