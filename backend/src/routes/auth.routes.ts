import { Router } from "express";
import { register, login, me, updateMe } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// Routes publiques
router.post("/register", register);
router.post("/login", login);

// Routes protégées
router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, updateMe);

export default router;