import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { ensureCurriculumSeeded } from "@/lib/curriculum/ensure-seeded";
import { SEED_CURRICULUM } from "@/lib/curriculum/seed-content";
import { getHonorificTitle } from "@/lib/validations/auth";

function buildFallbackSubjects() {
  return SEED_CURRICULUM.map((s) => ({
    id: `seed-subj-${s.slug}`,
    slug: s.slug,
    nameUz: s.nameUz,
    descriptionUz: s.descriptionUz,
    color: s.color,
    topics: [
      {
        id: `seed-topic-${s.topic.slug}`,
        slug: s.topic.slug,
        titleUz: s.topic.titleUz,
        descriptionUz: s.topic.descriptionUz,
        level: s.topic.level,
        estHours: s.topic.estHours,
        lessons: [
          {
            id: `seed-lesson-${s.topic.lesson.slug}`,
            slug: s.topic.lesson.slug,
            titleUz: s.topic.lesson.titleUz,
            summaryUz: s.topic.lesson.summaryUz,
            estMinutes: s.topic.lesson.estMinutes,
            xpReward: s.topic.lesson.xpReward,
            _count: { questions: s.topic.lesson.questions.length },
          },
        ],
      },
    ],
  }));
}

export async function GET() {
  try {
    await ensureCurriculumSeeded();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      const subjects = await prisma.subject.findMany({
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
      });

      return NextResponse.json({
        honorific: "Bo'lajak Talaba",
        profile: null,
        subjects: subjects.length > 0 ? subjects : buildFallbackSubjects(),
        completedLessonIds: [],
        earnedBadges: [],
      });
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
      subjects: subjects.length > 0 ? subjects : buildFallbackSubjects(),
      completedLessonIds,
      earnedBadges: userBadges.map((ub) => ub.badge),
    });
  } catch {
    return NextResponse.json({
      honorific: "Bo'lajak Talaba",
      profile: null,
      subjects: buildFallbackSubjects(),
      completedLessonIds: [],
      earnedBadges: [],
    });
  }
}
