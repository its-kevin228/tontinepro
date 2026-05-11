import { Router } from "express";
import {
  getDashboard,
  getUsers,
  banUser,
  unbanUser,
  getKycRequests,
  reviewKyc,
  getSettings,
  updateSetting,
  getBanLogs,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { UserRole } from "@prisma/client";

const router = Router();
const adminOnly = [requireAuth, requireRole(UserRole.SUPER_ADMIN)];

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administration globale de la plateforme (Super Admin uniquement)
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Statistiques globales du système
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données statistiques
 */
router.get("/dashboard", ...adminOnly, getDashboard);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Liste de tous les utilisateurs inscrits
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get("/users", ...adminOnly, getUsers);

/**
 * @swagger
 * /api/admin/users/{id}/ban:
 *   patch:
 *     summary: Bannir un utilisateur
 *     tags: [Admin]
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
 *         description: Utilisateur banni
 */
router.patch("/users/:id/ban", ...adminOnly, banUser);

/**
 * @swagger
 * /api/admin/users/{id}/unban:
 *   patch:
 *     summary: lever le bannissement d'un utilisateur
 *     tags: [Admin]
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
 *         description: Utilisateur débanni
 */
router.patch("/users/:id/unban", ...adminOnly, unbanUser);

/**
 * @swagger
 * /api/admin/kyc:
 *   get:
 *     summary: Lister toutes les demandes KYC en attente
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes KYC
 */
router.get("/kyc", ...adminOnly, getKycRequests);

/**
 * @swagger
 * /api/admin/kyc/{id}:
 *   patch:
 *     summary: Approuver ou rejeter une demande KYC
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Décision KYC enregistrée
 */
router.patch("/kyc/:id", ...adminOnly, reviewKyc);

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Voir les paramètres globaux de la plateforme
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paramètres actuels
 */
router.get("/settings", ...adminOnly, getSettings);

/**
 * @swagger
 * /api/admin/settings:
 *   patch:
 *     summary: Mettre à jour un paramètre système
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paramètre mis à jour
 */
router.patch("/settings", ...adminOnly, updateSetting);

router.get("/ban-logs", ...adminOnly, getBanLogs);

export default router;
