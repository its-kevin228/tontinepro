import { Router } from "express";
import { createInvitation, verifyInvitation, acceptInvitation } from "../controllers/invitation.controller";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// Créer une invitation (Organisateur seulement, vérifié dans le contrôleur)
router.post("/circles/:circleId/invitations", requireAuth, createInvitation);

// Vérifier un lien d'invitation (public — pas besoin d'être connecté pour voir les infos)
router.get("/invitations/:token", verifyInvitation);

// Accepter une invitation
router.post("/invitations/:token/accept", requireAuth, acceptInvitation);

export default router;