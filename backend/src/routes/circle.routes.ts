import { Router } from "express";
import { createCircle, getCircles, getCircleById, joinCircle, activateCircle } from "../controllers/circle.controller";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";
import { UserRole } from "@prisma/client";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Circles
 *   description: Gestion des cercles de tontine
 */

/**
 * @swagger
 * /api/circles:
 *   get:
 *     summary: Récupérer la liste des cercles de l'utilisateur
 *     tags: [Circles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des cercles récupérée
 */
router.get("/", requireAuth, getCircles);

/**
 * @swagger
 * /api/circles/{id}:
 *   get:
 *     summary: Récupérer un cercle par son ID
 *     tags: [Circles]
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
 *         description: Détails du cercle
 */
router.get("/:id", requireAuth, getCircleById);

/**
 * @swagger
 * /api/circles:
 *   post:
 *     summary: Créer un nouveau cercle (Organisateur uniquement)
 *     tags: [Circles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - amount
 *               - frequency
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               frequency:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY]
 *     responses:
 *       201:
 *         description: Cercle créé
 */
router.post("/", requireAuth, requireRole(UserRole.ORGANISATEUR, UserRole.SUPER_ADMIN), createCircle);

/**
 * @swagger
 * /api/circles/{id}/join:
 *   post:
 *     summary: Rejoindre un cercle via une invitation ou publiquement
 *     tags: [Circles]
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
 *         description: Cercle rejoint avec succès
 */
router.post("/:id/join", requireAuth, joinCircle);

/**
 * @swagger
 * /api/circles/{id}/activate:
 *   post:
 *     summary: Activer un cercle pour démarrer les cycles (Organisateur uniquement)
 *     tags: [Circles]
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
 *         description: Cercle activé
 */
router.post("/:id/activate", requireAuth, activateCircle);

export default router;