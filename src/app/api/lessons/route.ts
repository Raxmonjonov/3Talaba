import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { ensureCurriculumSeeded } from "@/lib/curriculum/ensure-seeded";
import { getHonorificTitle } from "@/lib/validations/auth";

export async function GET() {
  await ensureCurriculumSeeded();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const [profile, subjects, attempts, userBadges] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.subject.findMany({
      orderBy: { order: "asc" },
      include: {
        topics: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                _count: { select: { questions: true } },
              },
            },
          },
        },
      },
    }),
    prisma.attempt.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: { badge: true },
    }),
  ]);

  const completedLessonIds = Array.from(
    new Set(attempts.filter((a) => a.lessonId).map((a) => a.lessonId as string)),
  );

  return NextResponse.json({
    honorific: getHonorificTitle(profile?.gender),
    profile,
    subjects,
    completedLessonIds,
    earnedBadges: userBadges.map((ub) => ub.badge),
  });
}
