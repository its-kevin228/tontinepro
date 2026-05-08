import { Router } from "express";
import {
  createPayment,
  getPayments,
  confirmPayment,
  rejectPayment,
} from "../controllers/payment.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Gestion des transactions et preuves de paiement
 */

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Récupérer l'historique des paiements de l'utilisateur
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.get("/", requireAuth, getPayments);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Enregistrer une preuve de paiement (Mobile Money, etc.)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cycleId
 *               - amount
 *               - reference
 *             properties:
 *               cycleId:
 *                 type: string
 *               amount:
 *                 type: number
 *               reference:
 *                 type: string
 *               method:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paiement enregistré en attente de validation
 */
router.post("/", requireAuth, createPayment);

/**
 * @swagger
 * /api/payments/{id}/confirm:
 *   patch:
 *     summary: Confirmer un paiement (Organisateur/Admin uniquement)
 *     tags: [Payments]
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
 *         description: Paiement confirmé
 */
router.patch("/:id/confirm", requireAuth, confirmPayment);

/**
 * @swagger
 * /api/payments/{id}/reject:
 *   patch:
 *     summary: Rejeter un paiement
 *     tags: [Payments]
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
 *         description: Paiement rejeté
 */
router.patch("/:id/reject", requireAuth, rejectPayment);

export default router;
