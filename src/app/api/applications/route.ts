import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  dispatchDueLessonStartEmails,
  enrollOrUpdateSingleTrack,
  evaluateEnrollmentStatus,
  getSingleUserEnrollment,
  updateLessonModuleProgress,
} from "@/lib/applications/store";
import { findUniversityByRank } from "@/lib/data/universities";
import { DIRECTION_TRACKS, GRADE_OPTIONS } from "@/lib/data/methodology";
import {
  applicationSubmitSchema,
  lessonProgressPatchSchema,
} from "@/lib/validations/application";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }
  await dispatchDueLessonStartEmails();
  const enrollment = await getSingleUserEnrollment(user.id);
  const status = enrollment ? evaluateEnrollmentStatus(enrollment) : null;
  return NextResponse.json({ ok: true, status });
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Avval tizimga kiring" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "So'rov ma'lumotlari formati noto'g'ri" },
      { status: 400 },
    );
  }

  const parsed = applicationSubmitSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Ma'lumotlarni tekshiring";
    return NextResponse.json({ error: firstIssue }, { status: 400 });
  }

  const {
    fullName,
    phone,
    universityRank,
    gradeId,
    directionId,
    completedModules,
    currentModuleIndex,
    questionsAsked,
    finishTodayLesson,
  } = parsed.data;

  const university = findUniversityByRank(universityRank);
  if (!university) {
    return NextResponse.json({ error: "Tanlangan universitet topilmadi" }, { status: 400 });
  }

  const grade = GRADE_OPTIONS.find((g) => g.id === gradeId);
  if (!grade) {
    return NextResponse.json({ error: "Tanlangan sinf topilmadi" }, { status: 400 });
  }

  const direction = DIRECTION_TRACKS.find((d) => d.id === directionId);
  if (!direction) {
    return NextResponse.json({ error: "Tanlangan yo'nalish topilmadi" }, { status: 400 });
  }

  const { storage, application } = await enrollOrUpdateSingleTrack({
    userId: currentUser.id,
    userEmail: currentUser.email,
    fullName,
    phone,
    universityRank: university.rank,
    universityName: university.name,
    country: university.country,
    gradeId: grade.id,
    grade: grade.label,
    directionId: direction.id,
    directionTitle: direction.title,
    completedModules,
    currentModuleIndex,
    questionsAsked,
    finishTodayLesson,
  });

  const status = evaluateEnrollmentStatus(application);

  return NextResponse.json(
    {
      ok: true,
      storage,
      application,
      status,
    },
    { status: 201 },
  );
}

export async function PATCH(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Avval tizimga kiring" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
  }

  const parsed = lessonProgressPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri" }, { status: 400 });
  }

  const existing = await getSingleUserEnrollment(currentUser.id);
  if (!existing) {
    return NextResponse.json({ error: "Tanlangan yo'nalish topilmadi" }, { status: 404 });
  }

  if (parsed.data.finishTodayLesson) {
    const { application } = await enrollOrUpdateSingleTrack({
      userId: currentUser.id,
      userEmail: currentUser.email,
      fullName: existing.fullName,
      phone: existing.phone,
      universityRank: existing.universityRank,
      universityName: existing.universityName,
      country: existing.country,
      gradeId: existing.gradeId,
      grade: existing.grade,
      directionId: existing.directionId,
      directionTitle: existing.directionTitle,
      completedModules: parsed.data.completedModules,
      currentModuleIndex: parsed.data.currentModuleIndex,
      questionsAsked: parsed.data.questionsAsked,
      finishTodayLesson: true,
    });
    return NextResponse.json({
      ok: true,
      status: evaluateEnrollmentStatus(application),
    });
  }

  await updateLessonModuleProgress({
    userId: currentUser.id,
    currentModuleIndex: parsed.data.currentModuleIndex,
    completedModules: parsed.data.completedModules,
  });

  const refreshed = await getSingleUserEnrollment(currentUser.id);
  return NextResponse.json({
    ok: true,
    status: refreshed ? evaluateEnrollmentStatus(refreshed) : null,
  });
}
