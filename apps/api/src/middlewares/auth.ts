import { Request, Response, NextFunction } from "express";
import { verifyToken, type TokenPayload } from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let payload: TokenPayload;
  try {
    payload = verifyToken(header.slice(7));
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Revocation: reject tokens issued before the last password change.
  void prisma.user
    .findUnique({ where: { id: payload.userId }, select: { passwordChangedAt: true } })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (
        user.passwordChangedAt &&
        payload.pwdAt &&
        payload.pwdAt < Math.floor(user.passwordChangedAt.getTime() / 1000)
      ) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = payload;
      next();
    })
    .catch(() => {
      res.status(500).json({ message: "Server xatosi" });
    });
}
