import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  getPlacementQuestions,
  submitPlacement,
  getProgress,
  logProgress,
} from "../controllers/learning.js";

const router = Router();

router.get("/placement", requireAuth, getPlacementQuestions);
router.post("/placement", requireAuth, submitPlacement);
router.get("/progress", requireAuth, getProgress);
router.post("/progress", requireAuth, logProgress);

export default router;