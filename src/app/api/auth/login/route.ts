import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateUserAccount,
  createSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().trim().email("Email manzilni to'g'ri kiriting"),
  password: z.string().min(1, "Parolni kiriting"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ma'lumot formati xato" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Email va parolni tekshiring" },
      { status: 400 },
    );
  }

  const result = await authenticateUserAccount(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  const token = createSessionToken(result.user);
  const res = NextResponse.json({ ok: true, user: result.user }, { status: 200 });
  res.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
  return res;
}
