import { Router } from "express";
import { getMe, updateMe, submitKyc } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// GET  /api/users/me      — Mon profil
router.get("/me", requireAuth, getMe);

// PATCH /api/users/me     — Modifier mon profil
router.patch("/me", requireAuth, updateMe);

// POST /api/users/kyc     — Soumettre une demande KYC
router.post("/kyc", requireAuth, submitKyc);

export default router;
