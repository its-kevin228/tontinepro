import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  acceptInvitation,
  createInvitation,
  verifyInvitation,
  revokeInvitation,
} from "../controllers/invitation.controller";

const router = Router();

// Générer une invitation depuis un cercle
router.post("/circles/:circleId/invitations", requireAuth, createInvitation);

// Vérifier une invitation (public)
router.get("/invitations/:token", verifyInvitation);

// Accepter une invitation (auth)
router.post("/invitations/:token/accept", requireAuth, acceptInvitation);

// Révoquer une invitation (organisateur uniquement)
router.patch("/invitations/:token/revoke", requireAuth, revokeInvitation);

export default router;
