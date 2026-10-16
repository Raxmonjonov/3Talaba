import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { register, login, me } from "../controllers/auth.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Production keeps a tight brute-force ceiling. The e2e suite registers a fresh
// student for nearly every test, which legitimately exceeds 30 in one window, so
// dev/test use a much higher ceiling (matching prisma.ts's NODE_ENV check).
const isProduction = process.env.NODE_ENV === "production";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 30 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Juda ko'p urinish. Biroz kuting." },
  // In serverless (Netlify Functions) request.ip can be undefined when the
  // proxy chain isn't fully trusted yet — fall back to a per-instance key
  // instead of throwing.
  keyGenerator: (req) => req.ip || req.headers["x-forwarded-for"]?.toString() || "anonymous",
  // Skip validations that fire inside serverless runtimes.
  validate: false,
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", requireAuth, me);
export default router;
