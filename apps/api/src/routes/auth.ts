import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { register, login, me } from "../controllers/auth.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Juda ko'p urinish. Biroz kuting." },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", requireAuth, me);
export default router;
