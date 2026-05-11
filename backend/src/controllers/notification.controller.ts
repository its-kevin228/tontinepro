import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { addConnection, removeConnection } from "../lib/sse.js";

// ─── Stream SSE — connexion temps réel ─────────────────────────────────────
export async function streamNotifications(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  // Headers SSE obligatoires
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // désactive le buffering nginx
  res.flushHeaders();

  // Enregistrer la connexion
  addConnection(userId, res);

  // Envoyer l'état initial immédiatement
  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });
  res.write(`data: ${JSON.stringify({ type: "init", unreadCount })}\n\n`);

  // Heartbeat toutes les 25s pour garder la connexion vivante
  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  // Nettoyage quand le client se déconnecte
  req.on("close", () => {
    clearInterval(heartbeat);
    removeConnection(userId, res);
  });
}
// ─── Mes notifications ──────────────────────────────────────────────────────
export async function getNotifications(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  res.json({ notifications, unreadCount });
}

// ─── Marquer une notification comme lue ────────────────────────────────────
export async function markAsRead(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.id;

  const notification = await prisma.notification.findUnique({ where: { id } });

  if (!notification || notification.userId !== userId) {
    res.status(404).json({ error: "Notification introuvable" });
    return;
  }

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  res.json({ message: "Notification marquée comme lue" });
}

// ─── Marquer toutes comme lues ──────────────────────────────────────────────
export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  res.json({ message: "Toutes les notifications marquées comme lues" });
}
