import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

/**
 * Admin huquqini tekshirish.
 * Rol har safar bazadan o'qiladi (JWT ichidagi eski rolga ishonilmaydi).
 * Admin bo'lish yo'llari:
 *  1) User.role === "ADMIN" (bazada)
 *  2) Email `ADMIN_EMAILS` (vergul bilan ajratilgan) ro'yxatida bo'lsa
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export type AdminCheckResult =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; error: string };

export async function requireAdmin(): Promise<AdminCheckResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, status: 401, error: "Avtorizatsiya talab qilinadi" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true },
  });

  if (!user) {
    return { ok: false, status: 401, error: "Foydalanuvchi topilmadi" };
  }

  if (user.role !== "ADMIN" && !isAdminEmail(user.email)) {
    return {
      ok: false,
      status: 403,
      error: "Bu bo'lim faqat administratorlar uchun",
    };
  }

  return { ok: true, userId: user.id };
}
