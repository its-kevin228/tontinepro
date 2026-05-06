import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// GET  /api/notifications              — Mes notifications
router.get("/", requireAuth, getNotifications);

// PATCH /api/notifications/read-all   — Tout marquer comme lu
router.patch("/read-all", requireAuth, markAllAsRead);

// PATCH /api/notifications/:id/read   — Marquer une notification comme lue
router.patch("/:id/read", requireAuth, markAsRead);

export default router;
