import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

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
