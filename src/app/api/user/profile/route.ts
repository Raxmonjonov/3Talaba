import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { getHonorificTitle } from "@/lib/validations/auth";

const updateProfileSchema = z.object({
  reduceMotion: z.boolean().optional(),
  theme: z.enum(["dark", "light"]).optional(),
  dailyGoalMinutes: z.number().int().min(15).max(600).optional(),
  gender: z.enum(["FEMALE", "MALE"]).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      streak: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    guardianShareCode: user.guardianShareCode,
    honorific: getHonorificTitle(user.profile?.gender),
    profile: user.profile,
    streak: user.streak,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Sozlamalar noto'g'ri" }, { status: 400 });
  }

  const updated = await prisma.profile.update({
    where: { userId: session.user.id },
    data: parsed.data,
  });

  return NextResponse.json({ profile: updated });
}
