import { Router } from "express";
import { getMe, updateMe, submitKyc, getNotifPrefs, updateNotifPrefs } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { uploadKyc } from "../lib/upload.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateMe);
// Multer gère le multipart/form-data — le fichier est dans req.file
router.post("/kyc", requireAuth, uploadKyc.single("document"), submitKyc);
router.get("/me/notification-preferences", requireAuth, getNotifPrefs);
router.patch("/me/notification-preferences", requireAuth, updateNotifPrefs);

export default router;
