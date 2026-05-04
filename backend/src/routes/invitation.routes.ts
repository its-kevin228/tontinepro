import { Router } from "express";
import { createInvitation, acceptInvitation } from "../controllers/invitation.controller";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// Créer une invitation (Organisateur seulement, vérifié dans le contrôleur)
router.post("/circles/:circleId/invitations", requireAuth, createInvitation);

// Accepter une invitation
router.post("/invitations/:token/accept", requireAuth, acceptInvitation);

export default router;