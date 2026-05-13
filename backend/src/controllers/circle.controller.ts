import { Request, Response } from "express";
import { PrismaClient, MembershipRole } from "@prisma/client";

const prisma = new PrismaClient();

export const createCircle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, amount, frequency, maxMembers } = req.body;
    const creatorId = (req as any).user.id;

    const circle = await prisma.circle.create({
      data: {
        name,
        description,
        amount: parseFloat(amount),
        frequency,
        maxMembers: parseInt(maxMembers),
        creatorId,
        status: "ACTIVE", // Actif dès la création — l'organisateur peut démarrer des cycles immédiatement
        memberships: {
          create: {
            userId: creatorId,
            role: "ORGANISATEUR",
          }
        }
      },
      include: {
        memberships: true
      }
    });

    res.status(201).json({ message: "Cercle créé avec succès", circle });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du cercle", error });
  }
};

export const getCircles = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    // Super Admin voit tous les cercles, les autres voient uniquement les leurs
    const where = userRole === "SUPER_ADMIN"
      ? {}
      : { creatorId: userId };

    const circles = await prisma.circle.findMany({
      where,
      include: {
        memberships: true,
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ circles });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des cercles", error });
  }
};

export const getJoinedCircles = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const circles = await prisma.circle.findMany({
      where: {
        memberships: {
          some: {
            userId: userId
          }
        },
        NOT: {
          creatorId: userId // On exclut ceux dont il est l'organisateur pour la vue membre pure
        }
      },
      include: {
        memberships: true,
        creator: {
          select: { name: true }
        }
      }
    });
    res.json({ circles });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des cercles rejoints", error });
  }
};

export const getCircleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const circle = await prisma.circle.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        creator: {
          select: { name: true, email: true }
        },
        cycles: {
          where: { status: "OPEN" },
          include: {
            payments: true
          }
        }
      }
    });

    if (!circle) {
      res.status(404).json({ message: "Cercle non trouvé" });
      return;
    }

    res.json({ circle });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du cercle", error });
  }
};

// PATCH /api/circles/:id/order — Définir l'ordre de passage des membres
export const setMemberOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: circleId } = req.params;
    const userId = (req as any).user.id;
    // orders: [{ userId: string, order: number }]
    const { orders } = req.body as { orders: { userId: string; order: number }[] };

    if (!Array.isArray(orders) || orders.length === 0) {
      res.status(400).json({ error: "Le tableau orders est requis" });
      return;
    }

    // Vérifier que l'appelant est organisateur du cercle
    const membership = await prisma.membership.findUnique({
      where: { userId_circleId: { userId, circleId } },
    });

    if (!membership || membership.role !== MembershipRole.ORGANISATEUR) {
      res.status(403).json({ error: "Seul l'organisateur peut définir l'ordre de passage" });
      return;
    }

    // Vérifier que tous les userId appartiennent bien au cercle
    const circleMembers = await prisma.membership.findMany({
      where: { circleId },
      select: { userId: true },
    });
    const memberIds = new Set(circleMembers.map((m) => m.userId));

    for (const { userId: uid } of orders) {
      if (!memberIds.has(uid)) {
        res.status(400).json({ error: `L'utilisateur ${uid} n'est pas membre de ce cercle` });
        return;
      }
    }

    // Mettre à jour les ordres en transaction
    await prisma.$transaction(
      orders.map(({ userId: uid, order }) =>
        prisma.membership.update({
          where: { userId_circleId: { userId: uid, circleId } },
          data: { order },
        })
      )
    );

    res.json({ message: "Ordre de passage mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'ordre", error });
  }
};

// GET /api/circles/:id — version enrichie avec user.id dans les memberships
export const getCircleWithOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const circle = await prisma.circle.findUnique({
      where: { id },
      include: {
        memberships: {
          orderBy: { order: "asc" },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        creator: { select: { id: true, name: true, email: true } },
        cycles: {
          orderBy: { number: "desc" },
          include: { payments: true },
        },
      },
    });

    if (!circle) {
      res.status(404).json({ message: "Cercle non trouvé" });
      return;
    }

    res.json({ circle });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du cercle", error });
  }
};

// PATCH /api/circles/:id/activate — Activer un cercle PENDING
export const activateCircle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const membership = await prisma.membership.findUnique({
      where: { userId_circleId: { userId, circleId: id } },
    });

    if (!membership || membership.role !== MembershipRole.ORGANISATEUR) {
      res.status(403).json({ error: "Seul l'organisateur peut activer le cercle" });
      return;
    }

    const circle = await prisma.circle.findUnique({ where: { id } });
    if (!circle) {
      res.status(404).json({ error: "Cercle introuvable" });
      return;
    }

    if (circle.status === "ACTIVE") {
      res.status(400).json({ error: "Le cercle est déjà actif" });
      return;
    }

    const updated = await prisma.circle.update({
      where: { id },
      data: { status: "ACTIVE" },
    });

    res.json({ message: "Cercle activé avec succès", circle: updated });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'activation", error });
  }
};

// PATCH /api/circles/:id — Mettre à jour le statut du cercle (fermeture)
export const updateCircle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { status } = req.body;

    if (!["ACTIVE", "CLOSED"].includes(status)) {
      res.status(400).json({ error: "Statut invalide. Utilisez ACTIVE ou CLOSED." });
      return;
    }

    const membership = await prisma.membership.findUnique({
      where: { userId_circleId: { userId, circleId: id } },
    });

    if (!membership || membership.role !== MembershipRole.ORGANISATEUR) {
      res.status(403).json({ error: "Seul l'organisateur peut modifier le cercle" });
      return;
    }

    // Vérifier qu'il n'y a pas de cycle ouvert avant de fermer
    if (status === "CLOSED") {
      const openCycle = await prisma.cycle.findFirst({
        where: { circleId: id, status: "OPEN" },
      });
      if (openCycle) {
        res.status(400).json({ error: "Clôturez le cycle en cours avant de fermer le cercle" });
        return;
      }
    }

    const updated = await prisma.circle.update({
      where: { id },
      data: { status },
    });

    res.json({ message: `Cercle ${status === "CLOSED" ? "fermé" : "mis à jour"}`, circle: updated });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
  }
};
