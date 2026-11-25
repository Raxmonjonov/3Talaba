import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  getSessionCookieOptions,
  registerUserAccount,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ism kamida 2 ta harfdan iborat bo'lsin")
    .max(100, "Ism juda uzun"),
  email: z.string().trim().email("To'g'ri email manzil kiriting"),
  password: z
    .string()
    .min(6, "Parol kamida 6 ta belgidan iborat bo'lsin")
    .max(100, "Parol juda uzun"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ma'lumot formati xato" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ma'lumotlarni tekshiring" },
      { status: 400 },
    );
  }

  const result = await registerUserAccount(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const token = createSessionToken(result.user);
  const res = NextResponse.json({ ok: true, user: result.user }, { status: 201 });
  res.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
  return res;
}
