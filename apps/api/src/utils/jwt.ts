import jwt, { SignOptions } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, SECRET, {
    expiresIn: EXPIRES_IN,
  } as SignOptions);
}

export function verifyToken(token: string): { userId: string; role: string } {
  return jwt.verify(token, SECRET) as { userId: string; role: string };
}