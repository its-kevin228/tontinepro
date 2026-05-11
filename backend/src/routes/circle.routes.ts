import { Router } from "express";
import {
  createCircle,
  getCircles,
  getCircleById,
  getJoinedCircles,
  setMemberOrder,
  getCircleWithOrder,
} from "../controllers/circle.controller";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);

router.post("/", createCircle);
router.get("/", getCircles);
router.get("/joined", getJoinedCircles);
router.get("/:id", getCircleWithOrder);       // remplace getCircleById — inclut user.id + cycles complets
router.patch("/:id/order", setMemberOrder);   // définir l'ordre de passage

export default router;
