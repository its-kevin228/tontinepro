import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Alertes et messages système pour l'utilisateur
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Lister les notifications de l'utilisateur
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 */
router.get("/", requireAuth, getNotifications);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Marquer toutes les notifications comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 */
router.patch("/read-all", requireAuth, markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marquer une notification spécifique comme lue
 *     tags: [Notifications]
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
 *         description: Notification mise à jour
 */
router.patch("/:id/read", requireAuth, markAsRead);

export default router;
