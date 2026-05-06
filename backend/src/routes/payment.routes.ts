import { Router } from "express";
import {
  createPayment,
  getPayments,
  confirmPayment,
  rejectPayment,
} from "../controllers/payment.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// GET  /api/payments                  — Historique des paiements
router.get("/", requireAuth, getPayments);

// POST /api/payments                  — Enregistrer un paiement
router.post("/", requireAuth, createPayment);

// PATCH /api/payments/:id/confirm     — Confirmer un paiement
router.patch("/:id/confirm", requireAuth, confirmPayment);

// PATCH /api/payments/:id/reject      — Rejeter un paiement
router.patch("/:id/reject", requireAuth, rejectPayment);

export default router;
