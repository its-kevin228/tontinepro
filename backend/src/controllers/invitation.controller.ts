import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { InvitationStatus, MembershipRole } from "@prisma/client";

const createInvitationSchema = z.object({
  email: z.string().email("Email invalide").optional(),
  expiresInDays: z.number().int().min(1).max(30).default(7),
});

// POST /api/circles/:circleId/invitations
export async function createInvitation(req: Request, res: Response): Promise<void> {
  const { circleId } = req.params;
  const { email, expiresInDays } = createInvitationSchema.parse(req.body);
  const userId = req.user!.id;

  try {
    // 1. Vérifier si l'utilisateur est l'organisateur du cercle
    const membership = await prisma.membership.findUnique({
      where: {
        userId_circleId: { userId, circleId },
      },
    });

    if (!membership || membership.role !== MembershipRole.ORGANISATEUR) {
      res.status(403).json({ error: "Seul l'organisateur peut créer des invitations" });
      return;
    }

    // 2. Créer l'invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const invitation = await prisma.invitation.create({
      data: {
        circleId,
        email,
        expiresAt,
      },
    });

    res.status(201).json({ invitation });
  } catch (error) {
    console.error("Erreur création invitation:", error);
    res.status(500).json({ error: "Erreur lors de la création de l'invitation" });
  }
}

// GET /api/invitations/:token — Vérifier un lien d'invitation
export async function verifyInvitation(req: Request, res: Response): Promise<void> {
  const { token } = req.params;

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        circle: {
          include: {
            memberships: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!invitation) {
      res.status(404).json({ error: "Invitation introuvable" });
      return;
    }

    // Vérifier l'expiration
    if (invitation.status === InvitationStatus.PENDING && invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      res.json({ invitation: { ...invitation, status: "EXPIRED" }, circle: invitation.circle });
      return;
    }

    res.json({ invitation, circle: invitation.circle });
  } catch (error) {
    console.error("Erreur vérification invitation:", error);
    res.status(500).json({ error: "Erreur lors de la vérification" });
  }
}

// POST /api/invitations/:token/accept
export async function acceptInvitation(req: Request, res: Response): Promise<void> {
  const { token } = req.params;
  const userId = req.user!.id;

  try {
    // 1. Trouver l'invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { circle: true },
    });

    if (!invitation) {
      res.status(404).json({ error: "Invitation non trouvée" });
      return;
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      res.status(400).json({ error: "Cette invitation n'est plus valide" });
      return;
    }

    if (invitation.expiresAt < new Date()) {
      res.status(400).json({ error: "Cette invitation est expirée" });
      return;
    }

    // 2. Ajouter l'utilisateur au cercle
    await prisma.$transaction([
      prisma.membership.create({
        data: {
          userId,
          circleId: invitation.circleId,
          role: MembershipRole.MEMBRE,
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.ACCEPTED },
      }),
    ]);

    res.json({ message: "Invitation acceptée avec succès", circleId: invitation.circleId, membership: { circleId: invitation.circleId } });
  } catch (error) {
    console.error("Erreur acceptation invitation:", error);
    res.status(500).json({ error: "Erreur lors de l'acceptation de l'invitation" });
  }
}
