import { Router } from "express";
import { getMe, updateMe, submitKyc, getNotifPrefs, updateNotifPrefs } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateMe);
router.post("/kyc", requireAuth, submitKyc);
router.get("/me/notification-preferences", requireAuth, getNotifPrefs);
router.patch("/me/notification-preferences", requireAuth, updateNotifPrefs);

export default router;
