import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middlewares/requireAuth";
import crypto from "crypto";

const router = Router();
const prisma = new PrismaClient();

// Générer un lien d'invitation
router.post("/generate", requireAuth, async (req: any, res: any) => {
  const { circleId, maxUses, expiresAt } = req.body;
  const userId = req.user.id;

  try {
    // Vérifier que le cercle appartient à l'organisateur
    const circle = await prisma.circle.findFirst({
      where: { id: circleId, creatorId: userId }
    });

    if (!circle) {
      return res.status(403).json({ message: "Vous n'êtes pas l'organisateur de ce cercle." });
    }

    const token = crypto.randomBytes(16).toString("hex");

    const invitation = await prisma.invitation.create({
      data: {
        token,
        circleId,
        maxUses: maxUses || 10,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours par défaut
      }
    });

    res.json({ 
      message: "Invitation générée avec succès", 
      token: invitation.token,
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join/${invitation.token}`
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la génération de l'invitation", error });
  }
});

// Récupérer les détails d'une invitation (Public)
router.get("/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        circle: {
          select: {
            name: true,
            amount: true,
            frequency: true,
            creator: { select: { name: true } }
          }
        }
      }
    });

    if (!invitation) return res.status(404).json({ message: "Invitation invalide." });
    if (invitation.expiresAt < new Date()) return res.status(410).json({ message: "L'invitation a expiré." });
    if (invitation.uses >= invitation.maxUses) return res.status(410).json({ message: "L'invitation a atteint son nombre maximum d'utilisations." });

    res.json({ invitation });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

export default router;
