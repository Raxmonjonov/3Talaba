import jwt, { SignOptions } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error(
    "JWT_SECRET is not set. Refusing to start with an insecure default."
  );
}
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface TokenPayload {
  userId: string;
  role: string;
  /** Seconds-since-epoch when the password was last changed (revocation). */
  pwdAt?: number;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET!, {
    expiresIn: EXPIRES_IN,
  } as SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET!) as TokenPayload;
}
