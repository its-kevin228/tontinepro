import { Router } from "express";
import {
  createCircle,
  getCircles,
  getCircleById,
  getJoinedCircles,
  setMemberOrder,
  getCircleWithOrder,
  activateCircle,
  updateCircle,
} from "../controllers/circle.controller";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);

router.post("/", createCircle);
router.get("/", getCircles);
router.get("/joined", getJoinedCircles);
router.get("/:id", getCircleWithOrder);
router.patch("/:id/order", setMemberOrder);
router.patch("/:id/activate", activateCircle);
router.patch("/:id", updateCircle);

export default router;
