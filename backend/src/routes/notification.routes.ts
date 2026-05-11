import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  streamNotifications,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { verifyToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import { Request, Response, NextFunction } from "express";

// Middleware SSE spécial : accepte le token en query param (?token=...)
// car EventSource ne supporte pas les headers Authorization
async function requireAuthSSE(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = (req.query.token as string) || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).end();
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).end();
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  if (!user || user.status === "BANNED" || user.status === "SUSPENDED") {
    res.status(403).end();
    return;
  }

  req.user = user;
  next();
}

const router = Router();

// Stream SSE — token en query param
router.get("/stream", requireAuthSSE, streamNotifications);

router.get("/", requireAuth, getNotifications);
router.patch("/read-all", requireAuth, markAllAsRead);
router.patch("/:id/read", requireAuth, markAsRead);

export default router;
