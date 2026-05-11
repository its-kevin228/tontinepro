import { Router } from "express";
import {
  createPayment,
  getPayments,
  confirmPayment,
  rejectPayment,
  generateReceipt,
  initMobileMoneyPayment,
} from "../controllers/payment.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.get("/", requireAuth, getPayments);
router.post("/", requireAuth, createPayment);
router.patch("/:id/confirm", requireAuth, confirmPayment);
router.patch("/:id/reject", requireAuth, rejectPayment);
router.get("/:id/receipt", requireAuth, generateReceipt);

// Paiement Mobile Money initié par le membre (mock — à remplacer par vraie API)
router.post("/mobile-money", requireAuth, initMobileMoneyPayment);

export default router;
