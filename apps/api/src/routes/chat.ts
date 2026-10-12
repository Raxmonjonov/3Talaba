import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { requireAuth } from "../middlewares/auth.js";
import {
  startSession,
  chat,
  listSessions,
  getSession,
  endSession,
} from "../controllers/chat.js";

const router = Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Juda ko'p xabar. Biroz kuting." },
});

router.post("/start", requireAuth, startSession);
router.post("/message", requireAuth, chatLimiter, chat);
router.post("/sessions/:id/end", requireAuth, endSession);
router.get("/sessions", requireAuth, listSessions);
router.get("/sessions/:id", requireAuth, getSession);

export default router;
