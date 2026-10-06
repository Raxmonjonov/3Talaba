import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  startSession,
  chat,
  listSessions,
  getSession,
  endSession,
} from "../controllers/chat.js";

const router = Router();

router.post("/start", requireAuth, startSession);
router.post("/message", requireAuth, chat);
router.post("/sessions/:id/end", requireAuth, endSession);
router.get("/sessions", requireAuth, listSessions);
router.get("/sessions/:id", requireAuth, getSession);

export default router;