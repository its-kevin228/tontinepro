import { Response } from "express";

// ─── Gestionnaire des connexions SSE actives ────────────────────────────────
// Map : userId → Set de Response (un user peut avoir plusieurs onglets ouverts)

const connections = new Map<string, Set<Response>>();

/** Enregistre une nouvelle connexion SSE pour un utilisateur */
export function addConnection(userId: string, res: Response): void {
  if (!connections.has(userId)) {
    connections.set(userId, new Set());
  }
  connections.get(userId)!.add(res);
}

/** Supprime une connexion SSE (déconnexion / fermeture d'onglet) */
export function removeConnection(userId: string, res: Response): void {
  const userConns = connections.get(userId);
  if (!userConns) return;
  userConns.delete(res);
  if (userConns.size === 0) {
    connections.delete(userId);
  }
}

/** Envoie un événement SSE à un utilisateur spécifique */
export function sendToUser(userId: string, payload: object): void {
  const userConns = connections.get(userId);
  if (!userConns || userConns.size === 0) return;

  const data = `data: ${JSON.stringify(payload)}\n\n`;

  for (const res of userConns) {
    try {
      res.write(data);
    } catch {
      // La connexion est morte — on la nettoie
      userConns.delete(res);
    }
  }
}

/** Nombre de connexions actives (utile pour le debug) */
export function getConnectionCount(): number {
  let total = 0;
  for (const set of connections.values()) {
    total += set.size;
  }
  return total;
}

// ─── Helper : créer une notification en base + push SSE ────────────────────
import { prisma } from "./prisma.js";

export async function notifyUser(
  userId: string,
  title: string,
  body: string
): Promise<void> {
  // 1. Persister en base
  const notification = await prisma.notification.create({
    data: { userId, title, body },
  });

  // 2. Compter les non lus
  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });

  // 3. Pousser via SSE si l'utilisateur est connecté
  sendToUser(userId, {
    type: "new",
    unreadCount,
    notification: {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      createdAt: notification.createdAt,
    },
  });
}

/** Version batch — notifie plusieurs utilisateurs */
export async function notifyUsers(
  userIds: string[],
  title: string,
  body: string
): Promise<void> {
  await Promise.all(userIds.map((uid) => notifyUser(uid, title, body)));
}
