import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}