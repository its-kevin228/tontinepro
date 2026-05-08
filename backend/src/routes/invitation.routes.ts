import { Router } from "express";
import { createInvitation, verifyInvitation, acceptInvitation } from "../controllers/invitation.controller";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: Gestion des invitations aux cercles
 */

/**
 * @swagger
 * /api/circles/{circleId}/invitations:
 *   post:
 *     summary: Créer une invitation pour un cercle
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: circleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxUses:
 *                 type: integer
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Invitation créée
 */
router.post("/circles/:circleId/invitations", requireAuth, createInvitation);

/**
 * @swagger
 * /api/invitations/{token}:
 *   get:
 *     summary: Vérifier la validité d'une invitation
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'invitation
 */
router.get("/invitations/:token", verifyInvitation);

/**
 * @swagger
 * /api/invitations/{token}/accept:
 *   post:
 *     summary: Accepter une invitation et rejoindre le cercle
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation acceptée
 */
router.post("/invitations/:token/accept", requireAuth, acceptInvitation);

export default router;