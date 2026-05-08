import { Router } from "express";
import { getMe, updateMe, submitKyc } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Profil utilisateur et conformité (KYC)
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Récupérer mes informations détaillées
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Détails du compte
 */
router.get("/me", requireAuth, getMe);

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: Mettre à jour mes informations de profil
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.patch("/me", requireAuth, updateMe);

/**
 * @swagger
 * /api/users/kyc:
 *   post:
 *     summary: Soumettre des documents KYC pour vérification
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idType
 *               - idNumber
 *               - idImageUrl
 *             properties:
 *               idType:
 *                 type: string
 *               idNumber:
 *                 type: string
 *               idImageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Demande KYC soumise
 */
router.post("/kyc", requireAuth, submitKyc);

export default router;
