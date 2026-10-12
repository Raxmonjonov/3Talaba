import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  getAchievements,
  updateSettings,
  updateProfile,
  changePassword,
} from "../controllers/user.js";

const router = Router();

router.get("/achievements", requireAuth, getAchievements);
router.patch("/settings", requireAuth, updateSettings);
router.patch("/profile", requireAuth, updateProfile);
router.post("/password", requireAuth, changePassword);

export default router;
