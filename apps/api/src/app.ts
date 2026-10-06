import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import userRoutes from "./routes/user.js";
import learningRoutes from "./routes/learning.js";
import catalogRoutes from "./routes/catalog.js";

export const app = express();

const ORIGIN = process.env.SITE_URL || "http://localhost:5173";

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "3talab-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/content", catalogRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Topilmadi" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Server xatosi" });
});