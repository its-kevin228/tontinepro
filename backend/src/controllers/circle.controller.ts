import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { Frequency, MembershipRole, CircleStatus, CycleStatus } from "@prisma/client";

const createCircleSchema = z.object({
  name: z.string().min(3, "Le nom doit faire au moins 3 caractères"),
  description: z.string().optional(),
  amount: z.number().positive("Le montant doit être positif"),
  frequency: z.nativeEnum(Frequency),
  maxMembers: z.number().int().min(2, "Il faut au moins 2 membres"),
  isPublic: z.boolean().default(false),
});

// POST /api/circles
export async function createCircle(req: Request, res: Response): Promise<void> {
  const parsed = createCircleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { name, description, amount, frequency, maxMembers, isPublic } = parsed.data;
  const userId = req.user!.id;

  try {
    const circle = await prisma.circle.create({
      data: {
        name,
        description,
        amount,
        frequency,
        maxMembers,
        isPublic,
        // On crée automatiquement le membership de l'organisateur
        memberships: {
          create: {
            userId: userId,
            role: MembershipRole.ORGANISATEUR,
          },
        },
      },
      include: {
        memberships: true,
      },
    });

    res.status(201).json({ circle });
  } catch (error) {
    console.error("Erreur création cercle:", error);
    res.status(500).json({ error: "Erreur lors de la création du cercle" });
  }
}

// GET /api/circles
export async function getCircles(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;

  // Si connecté → mes cercles (via memberships)
  if (userId) {
    const circles = await prisma.circle.findMany({
      where: {
        memberships: { some: { userId } },
      },
      include: {
        _count: { select: { memberships: true } },
        memberships: {
          where: { userId },
          select: { role: true, order: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ circles });
    return;
  }

  // Sinon → cercles publics
  const circles = await prisma.circle.findMany({
    where: { isPublic: true, status: "ACTIVE" },
    include: {
      _count: { select: { memberships: true } },
    },
  });

  res.json({ circles });
}

// GET /api/circles/:id
export async function getCircleById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const circle = await prisma.circle.findUnique({
    where: { id },
    include: {
      memberships: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
      _count: {
        select: { cycles: true },
      },
    },
  });

  if (!circle) {
    res.status(404).json({ error: "Cercle non trouvé" });
    return;
  }

  res.json({ circle });
}

// POST /api/circles/:id/join
export async function joinCircle(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    // 1. Vérifier si le cercle existe
    const circle = await prisma.circle.findUnique({
      where: { id },
      include: {
        _count: {
          select: { memberships: true },
        },
      },
    });

    if (!circle) {
      res.status(404).json({ error: "Cercle non trouvé" });
      return;
    }

    // 2. Vérifier si la limite de membres est atteinte
    if (circle._count.memberships >= circle.maxMembers) {
      res.status(400).json({ error: "Ce cercle est déjà complet" });
      return;
    }

    // 3. Vérifier si l'utilisateur est déjà membre
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_circleId: { userId, circleId: id },
      },
    });

    if (existingMembership) {
      res.status(400).json({ error: "Vous êtes déjà membre de ce cercle" });
      return;
    }

    // 4. Créer l'adhésion
    const membership = await prisma.membership.create({
      data: {
        userId,
        circleId: id,
        role: MembershipRole.MEMBRE,
      },
    });

    res.status(201).json({ membership });
  } catch (error) {
    console.error("Erreur adhésion cercle:", error);
    res.status(500).json({ error: "Erreur lors de l'adhésion au cercle" });
  }
}

// POST /api/circles/:id/activate (Tirage au sort et démarrage)
export async function activateCircle(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    // 1. Vérifier si l'utilisateur est l'organisateur
    const circle = await prisma.circle.findUnique({
      where: { id },
      include: {
        memberships: true,
      },
    });

    if (!circle) {
      res.status(404).json({ error: "Cercle non trouvé" });
      return;
    }

    const userMembership = circle.memberships.find(m => m.userId === userId);
    if (!userMembership || userMembership.role !== MembershipRole.ORGANISATEUR) {
      res.status(403).json({ error: "Seul l'organisateur peut activer le cercle" });
      return;
    }

    if (circle.status !== CircleStatus.PENDING) {
      res.status(400).json({ error: "Le cercle est déjà activé ou fermé" });
      return;
    }

    if (circle.memberships.length < 2) {
      res.status(400).json({ error: "Il faut au moins 2 membres pour démarrer" });
      return;
    }

    // 2. Algorithme de Tirage au sort (Randomisation de l'ordre de passage)
    const shuffledMemberships = [...circle.memberships].sort(() => Math.random() - 0.5);

    // 3. Mise à jour de l'ordre en base et activation du cercle
    await prisma.$transaction(async (tx) => {
      // Mettre à jour l'ordre de chaque membre
      for (let i = 0; i < shuffledMemberships.length; i++) {
        await tx.membership.update({
          where: { id: shuffledMemberships[i].id },
          data: { order: i + 1 },
        });
      }

      // Activer le cercle
      await tx.circle.update({
        where: { id },
        data: { status: CircleStatus.ACTIVE },
      });

      // Créer le premier cycle (Cycle 1)
      const startDate = new Date();
      const endDate = new Date();
      if (circle.frequency === Frequency.WEEKLY) endDate.setDate(endDate.getDate() + 7);
      else endDate.setMonth(endDate.getMonth() + 1);

      await tx.cycle.create({
        data: {
          circleId: id,
          number: 1,
          startDate,
          endDate,
          status: CycleStatus.OPEN,
          // Le premier de la liste est le bénéficiaire
          beneficiary: shuffledMemberships[0].userId,
        },
      });
    });

    res.json({ message: "Cercle activé et tirage au sort effectué avec succès" });
  } catch (error) {
    console.error("Erreur activation cercle:", error);
    res.status(500).json({ error: "Erreur lors de l'activation du cercle" });
  }
}


