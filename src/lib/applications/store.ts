import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { isPostgresConfigured } from "@/lib/env";
import { sendLessonStartedEmail } from "@/lib/email/mailer";

export const LESSON_DURATION_MINUTES = 120; // 2 hours
export const LESSON_DURATION_MS = LESSON_DURATION_MINUTES * 60 * 1000;

export interface StoredApplicationRecord {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  fullName: string;
  phone: string;
  universityRank: number;
  universityName: string;
  country: string;
  gradeId: string;
  grade: string;
  directionId: string;
  directionTitle: string;
  completedModules: number;
  currentModuleIndex: number;
  currentDayNumber: number;
  dailySlotHour: number;
  lessonDurationMinutes: number;
  nextLessonStartAt: string;
  nextLessonEndAt: string;
  lastCompletedAt: string | null;
  lastNotifiedStartIso: string | null;
  questionsAsked: number;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluatedEnrollmentStatus {
  enrollment: StoredApplicationRecord;
  isLessonOpenNow: boolean;
  remainingLessonSeconds: number;
  msUntilNextLesson: number;
  statusMessage: string;
  formattedWindowLabel: string;
}

/**
 * Tizim o'quvchining sinfiga qarab kunlik 2 soatlik dars vaqtini AVTOMATIK belgilaydi
 * (o'quvchi o'zi vaqt tanlamaydi!).
 */
export function computeAutoSlotHour(gradeId: string): number {
  if (gradeId === "5-sinf" || gradeId === "6-sinf" || gradeId === "7-sinf") {
    return 17; // 17:00 - 19:00
  }
  if (gradeId === "litsey-bitiruvchi") {
    return 19; // 19:00 - 21:00
  }
  return 18; // 18:00 - 20:00 (8-11-sinflar uchun optimal kechki vaqt)
}

/**
 * Bugungi dars tugagandan keyin ERTANGI (yoki keyingi kunning) avto-belgilangan
 * 2 soatlik dars oynasini hisoblaydi (1 kunda faqat 1 marta!).
 */
export function computeNextDayWindow(
  fromDate: Date,
  slotHour: number,
): { start: Date; end: Date } {
  const nextStart = new Date(fromDate);
  nextStart.setDate(nextStart.getDate() + 1);
  nextStart.setHours(slotHour, 0, 0, 0);
  const nextEnd = new Date(nextStart.getTime() + LESSON_DURATION_MS);
  return { start: nextStart, end: nextEnd };
}

/**
 * Agar avvalgi belgilangan 2 soatlik oyna o'tib ketgan bo'lsa,
 * eng yaqin navbatdagi kunlik 2 soatlik oynaga suradi.
 */
export function rollForwardExpiredWindowIfNeeded(
  record: StoredApplicationRecord,
  now: Date = new Date(),
): { updated: StoredApplicationRecord; changed: boolean } {
  const endMs = new Date(record.nextLessonEndAt).getTime();
  if (now.getTime() < endMs) {
    return { updated: record, changed: false };
  }

  // Check today's fixed slot first (if student didn't already finish a lesson today)
  const completedToday =
    record.lastCompletedAt &&
    new Date(record.lastCompletedAt).toDateString() === now.toDateString();

  const candidateStart = new Date(now);
  candidateStart.setHours(record.dailySlotHour, 0, 0, 0);
  let candidateEnd = new Date(candidateStart.getTime() + LESSON_DURATION_MS);

  if (completedToday || now.getTime() >= candidateEnd.getTime()) {
    const tomorrow = computeNextDayWindow(now, record.dailySlotHour);
    candidateStart.setTime(tomorrow.start.getTime());
    candidateEnd = tomorrow.end;
  }

  return {
    changed: true,
    updated: {
      ...record,
      nextLessonStartAt: candidateStart.toISOString(),
      nextLessonEndAt: candidateEnd.toISOString(),
      updatedAt: now.toISOString(),
    },
  };
}

export function formatUzbekLessonWindow(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentyabr",
    "oktyabr",
    "noyabr",
    "dekabr",
  ];
  const datePart = `${start.getDate()}-${months[start.getMonth()] ?? ""}`;
  const timePart = `${pad(start.getHours())}:${pad(start.getMinutes())} – ${pad(end.getHours())}:${pad(end.getMinutes())}`;
  return `${datePart}, soat ${timePart}`;
}

export function evaluateEnrollmentStatus(
  rawRecord: StoredApplicationRecord,
  now: Date = new Date(),
): EvaluatedEnrollmentStatus {
  const { updated } = rollForwardExpiredWindowIfNeeded(rawRecord, now);
  const startMs = new Date(updated.nextLessonStartAt).getTime();
  const endMs = new Date(updated.nextLessonEndAt).getTime();
  const nowMs = now.getTime();

  const isLessonOpenNow = nowMs >= startMs && nowMs < endMs;
  const remainingLessonSeconds = isLessonOpenNow
    ? Math.max(0, Math.floor((endMs - nowMs) / 1000))
    : 0;
  const msUntilNextLesson = isLessonOpenNow ? 0 : Math.max(0, startMs - nowMs);

  return {
    enrollment: updated,
    isLessonOpenNow,
    remainingLessonSeconds,
    msUntilNextLesson,
    statusMessage: isLessonOpenNow
      ? "Dars boshlandi — 2 soatlik jonli AI dars ochiq"
      : "Keyingi darsga tayyorgarlik qiling",
    formattedWindowLabel: formatUzbekLessonWindow(
      updated.nextLessonStartAt,
      updated.nextLessonEndAt,
    ),
  };
}

// ── Storage Layer (Strictly 1 Enrollment per User!) ──

function hydrateLegacyRecord(raw: Partial<StoredApplicationRecord>): StoredApplicationRecord {
  const now = new Date();
  const gradeId = raw.gradeId || "8-sinf";
  const slotHour = raw.dailySlotHour ?? computeAutoSlotHour(gradeId);
  const completedModules = raw.completedModules ?? 0;

  // If legacy record already completed 7/7 modules, mark it as completed today and schedule tomorrow
  const nextWindow =
    completedModules >= 7 && !raw.nextLessonStartAt
      ? computeNextDayWindow(now, slotHour)
      : {
          start: raw.nextLessonStartAt ? new Date(raw.nextLessonStartAt) : now,
          end: raw.nextLessonEndAt
            ? new Date(raw.nextLessonEndAt)
            : new Date(now.getTime() + LESSON_DURATION_MS),
        };

  return {
    id: raw.id || randomUUID(),
    userId: raw.userId ?? null,
    userEmail: raw.userEmail ?? null,
    fullName: raw.fullName || "O'quvchi",
    phone: raw.phone || "",
    universityRank: raw.universityRank || 1,
    universityName: raw.universityName || "Massachusetts Institute of Technology (MIT)",
    country: raw.country || "AQSH",
    gradeId,
    grade: raw.grade || "8-sinf",
    directionId: raw.directionId || "cs-ai",
    directionTitle: raw.directionTitle || "Dasturlash va Sun'iy Intellekt (IT & AI)",
    completedModules,
    currentModuleIndex:
      raw.currentModuleIndex ?? (completedModules >= 7 ? 0 : Math.min(6, completedModules)),
    currentDayNumber: raw.currentDayNumber ?? (completedModules >= 7 ? 2 : 1),
    dailySlotHour: slotHour,
    lessonDurationMinutes: LESSON_DURATION_MINUTES,
    nextLessonStartAt: nextWindow.start.toISOString(),
    nextLessonEndAt: nextWindow.end.toISOString(),
    lastCompletedAt:
      raw.lastCompletedAt ?? (completedModules >= 7 ? now.toISOString() : null),
    lastNotifiedStartIso: raw.lastNotifiedStartIso ?? null,
    questionsAsked: raw.questionsAsked ?? 0,
    createdAt: raw.createdAt || now.toISOString(),
    updatedAt: raw.updatedAt || now.toISOString(),
  };
}

async function readAllFallbackRecords(): Promise<StoredApplicationRecord[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "applications.json");
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Deduplicate strictly: at most 1 record per userId!
    // Prefer the record with the highest completedModules (e.g., #1 MIT 7/7) so duplicates vanish cleanly
    const byUser = new Map<string, StoredApplicationRecord>();
    const anonymous: StoredApplicationRecord[] = [];

    for (const item of parsed) {
      const hydrated = hydrateLegacyRecord(item);
      if (!hydrated.userId) {
        anonymous.push(hydrated);
        continue;
      }
      const existing = byUser.get(hydrated.userId);
      if (!existing || hydrated.completedModules > existing.completedModules) {
        byUser.set(hydrated.userId, hydrated);
      }
    }

    const deduped = [...byUser.values(), ...anonymous];
    if (deduped.length !== parsed.length) {
      await writeAllFallbackRecords(deduped);
    }
    return deduped;
  } catch {
    return [];
  }
}

async function writeAllFallbackRecords(records: StoredApplicationRecord[]): Promise<void> {
  const dir = path.join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "applications.json"), JSON.stringify(records, null, 2), "utf8");
}

function mapDbRowToRecord(r: {
  id: string;
  userId: string | null;
  userEmail: string | null;
  fullName: string;
  phone: string;
  universityRank: number;
  universityName: string;
  country: string;
  gradeId: string;
  grade: string;
  directionId: string;
  directionTitle: string;
  completedModules: number;
  currentModuleIndex: number;
  currentDayNumber: number;
  dailySlotHour: number;
  lessonDurationMinutes: number;
  nextLessonStartAt: Date;
  nextLessonEndAt: Date;
  lastCompletedAt: Date | null;
  lastNotifiedStartIso: string | null;
  questionsAsked: number;
  createdAt: Date;
  updatedAt: Date;
}): StoredApplicationRecord {
  return {
    id: r.id,
    userId: r.userId,
    userEmail: r.userEmail,
    fullName: r.fullName,
    phone: r.phone,
    universityRank: r.universityRank,
    universityName: r.universityName,
    country: r.country,
    gradeId: r.gradeId,
    grade: r.grade,
    directionId: r.directionId,
    directionTitle: r.directionTitle,
    completedModules: r.completedModules,
    currentModuleIndex: r.currentModuleIndex,
    currentDayNumber: r.currentDayNumber,
    dailySlotHour: r.dailySlotHour,
    lessonDurationMinutes: r.lessonDurationMinutes,
    nextLessonStartAt: r.nextLessonStartAt.toISOString(),
    nextLessonEndAt: r.nextLessonEndAt.toISOString(),
    lastCompletedAt: r.lastCompletedAt ? r.lastCompletedAt.toISOString() : null,
    lastNotifiedStartIso: r.lastNotifiedStartIso,
    questionsAsked: r.questionsAsked,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function getSingleUserEnrollment(
  userId: string,
): Promise<StoredApplicationRecord | null> {
  if (isPostgresConfigured()) {
    try {
      const row = await db.admissionApplication.findUnique({ where: { userId } });
      if (!row) return null;
      const mapped = mapDbRowToRecord(row);
      const { updated, changed } = rollForwardExpiredWindowIfNeeded(mapped);
      if (changed) {
        await db.admissionApplication.update({
          where: { id: row.id },
          data: {
            nextLessonStartAt: new Date(updated.nextLessonStartAt),
            nextLessonEndAt: new Date(updated.nextLessonEndAt),
          },
        });
      }
      return updated;
    } catch {
      // fallback below
    }
  }

  const all = await readAllFallbackRecords();
  const found = all.find((item) => item.userId === userId) ?? null;
  if (!found) return null;

  const { updated, changed } = rollForwardExpiredWindowIfNeeded(found);
  if (changed) {
    const nextList = all.map((r) => (r.id === updated.id ? updated : r));
    try {
      await writeAllFallbackRecords(nextList);
    } catch {
      // ignore
    }
  }
  return updated;
}

/**
 * O'quvchi tanlovini saqlaydi:
 * - Agar bu o'quvchida allaqachon tanlangan universitet bo'lsa, BOSHQA UNIVERSITET QO'SHILMAYDI!
 *   Faqat shu bitta yozuvning telefon/progress va keyingi dars jadvali yangilanadi.
 * - Agar birinchi marta ro'yxatdan o'tayotgan bo'lsa:
 *   - finishToday=false bo'lsa: bugungi birinchi 2 soatlik dars HOZIR ochiladi va emailga "Dars boshlandi" xati ketadi!
 *   - finishToday=true bo'lsa: bugungi dars tugatilib, ERTANGI avto-vaqtga 2 soatlik keyingi dars belgilanadi!
 */
export async function enrollOrUpdateSingleTrack(params: {
  userId: string;
  userEmail: string;
  fullName: string;
  phone: string;
  universityRank: number;
  universityName: string;
  country: string;
  gradeId: string;
  grade: string;
  directionId: string;
  directionTitle: string;
  completedModules?: number;
  currentModuleIndex?: number;
  questionsAsked?: number;
  finishTodayLesson?: boolean;
}): Promise<{ storage: "postgresql" | "local-store"; application: StoredApplicationRecord }> {
  const now = new Date();
  const existing = await getSingleUserEnrollment(params.userId);
  const slotHour = existing?.dailySlotHour ?? computeAutoSlotHour(params.gradeId);

  if (existing) {
    // LOCKED SINGLE UNIVERSITY: never overwrite university/grade/direction with a 2nd track!
    const nextSchedule = params.finishTodayLesson
      ? computeNextDayWindow(now, slotHour)
      : {
          start: new Date(existing.nextLessonStartAt),
          end: new Date(existing.nextLessonEndAt),
        };

    const updatedRecord: StoredApplicationRecord = {
      ...existing,
      userEmail: params.userEmail || existing.userEmail,
      fullName: params.fullName.trim() || existing.fullName,
      phone: params.phone.trim() || existing.phone,
      completedModules: Math.max(
        existing.completedModules,
        params.completedModules ?? existing.completedModules,
      ),
      currentModuleIndex: params.finishTodayLesson
        ? 0
        : (params.currentModuleIndex ?? existing.currentModuleIndex),
      currentDayNumber: params.finishTodayLesson
        ? existing.currentDayNumber + 1
        : existing.currentDayNumber,
      nextLessonStartAt: nextSchedule.start.toISOString(),
      nextLessonEndAt: nextSchedule.end.toISOString(),
      lastCompletedAt: params.finishTodayLesson
        ? now.toISOString()
        : existing.lastCompletedAt,
      questionsAsked: existing.questionsAsked + (params.questionsAsked ?? 0),
      updatedAt: now.toISOString(),
    };

    if (isPostgresConfigured()) {
      try {
        const saved = await db.admissionApplication.update({
          where: { userId: params.userId },
          data: {
            userEmail: updatedRecord.userEmail,
            fullName: updatedRecord.fullName,
            phone: updatedRecord.phone,
            completedModules: updatedRecord.completedModules,
            currentModuleIndex: updatedRecord.currentModuleIndex,
            currentDayNumber: updatedRecord.currentDayNumber,
            nextLessonStartAt: new Date(updatedRecord.nextLessonStartAt),
            nextLessonEndAt: new Date(updatedRecord.nextLessonEndAt),
            lastCompletedAt: updatedRecord.lastCompletedAt
              ? new Date(updatedRecord.lastCompletedAt)
              : null,
            questionsAsked: updatedRecord.questionsAsked,
          },
        });
        return { storage: "postgresql", application: mapDbRowToRecord(saved) };
      } catch {
        // fallback below
      }
    }

    const all = await readAllFallbackRecords();
    const nextList = all.map((r) => (r.userId === params.userId ? updatedRecord : r));
    try {
      await writeAllFallbackRecords(nextList);
    } catch {
      // ignore
    }
    return { storage: "local-store", application: updatedRecord };
  }

  // Brand-new single enrollment for this student!
  const window = params.finishTodayLesson
    ? computeNextDayWindow(now, slotHour)
    : {
        start: now,
        end: new Date(now.getTime() + LESSON_DURATION_MS),
      };

  const startIso = window.start.toISOString();
  const endIso = window.end.toISOString();
  const shouldNotifyImmediateStart = !params.finishTodayLesson && Boolean(params.userEmail);

  const createdRecord: StoredApplicationRecord = {
    id: randomUUID(),
    userId: params.userId,
    userEmail: params.userEmail,
    fullName: params.fullName.trim(),
    phone: params.phone.trim(),
    universityRank: params.universityRank,
    universityName: params.universityName,
    country: params.country,
    gradeId: params.gradeId,
    grade: params.grade,
    directionId: params.directionId,
    directionTitle: params.directionTitle,
    completedModules: params.completedModules ?? 0,
    currentModuleIndex: params.finishTodayLesson ? 0 : (params.currentModuleIndex ?? 0),
    currentDayNumber: params.finishTodayLesson ? 2 : 1,
    dailySlotHour: slotHour,
    lessonDurationMinutes: LESSON_DURATION_MINUTES,
    nextLessonStartAt: startIso,
    nextLessonEndAt: endIso,
    lastCompletedAt: params.finishTodayLesson ? now.toISOString() : null,
    lastNotifiedStartIso: shouldNotifyImmediateStart ? startIso : null,
    questionsAsked: params.questionsAsked ?? 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  if (shouldNotifyImmediateStart && params.userEmail) {
    void sendLessonStartedEmail({
      toEmail: params.userEmail,
      studentName: createdRecord.fullName,
      universityRank: createdRecord.universityRank,
      universityName: createdRecord.universityName,
      directionTitle: createdRecord.directionTitle,
      dayNumber: 1,
      windowLabel: formatUzbekLessonWindow(startIso, endIso),
    });
  }

  if (isPostgresConfigured()) {
    try {
      const saved = await db.admissionApplication.create({
        data: {
          userId: createdRecord.userId,
          userEmail: createdRecord.userEmail,
          fullName: createdRecord.fullName,
          phone: createdRecord.phone,
          universityRank: createdRecord.universityRank,
          universityName: createdRecord.universityName,
          country: createdRecord.country,
          gradeId: createdRecord.gradeId,
          grade: createdRecord.grade,
          directionId: createdRecord.directionId,
          directionTitle: createdRecord.directionTitle,
          completedModules: createdRecord.completedModules,
          currentModuleIndex: createdRecord.currentModuleIndex,
          currentDayNumber: createdRecord.currentDayNumber,
          dailySlotHour: createdRecord.dailySlotHour,
          lessonDurationMinutes: createdRecord.lessonDurationMinutes,
          nextLessonStartAt: new Date(createdRecord.nextLessonStartAt),
          nextLessonEndAt: new Date(createdRecord.nextLessonEndAt),
          lastCompletedAt: createdRecord.lastCompletedAt
            ? new Date(createdRecord.lastCompletedAt)
            : null,
          lastNotifiedStartIso: createdRecord.lastNotifiedStartIso,
          questionsAsked: createdRecord.questionsAsked,
        },
      });
      return { storage: "postgresql", application: mapDbRowToRecord(saved) };
    } catch {
      // fallback below
    }
  }

  const all = await readAllFallbackRecords();
  const filtered = all.filter((r) => r.userId !== params.userId);
  filtered.unshift(createdRecord);
  try {
    await writeAllFallbackRecords(filtered);
  } catch {
    // ignore
  }
  return { storage: "local-store", application: createdRecord };
}

export async function updateLessonModuleProgress(params: {
  userId: string;
  currentModuleIndex: number;
  completedModules: number;
}): Promise<void> {
  const existing = await getSingleUserEnrollment(params.userId);
  if (!existing) return;

  const nextCompleted = Math.max(existing.completedModules, params.completedModules);
  if (isPostgresConfigured()) {
    try {
      await db.admissionApplication.update({
        where: { userId: params.userId },
        data: {
          currentModuleIndex: params.currentModuleIndex,
          completedModules: nextCompleted,
        },
      });
      return;
    } catch {
      // fallback below
    }
  }

  const all = await readAllFallbackRecords();
  const nextList = all.map((r) =>
    r.userId === params.userId
      ? {
          ...r,
          currentModuleIndex: params.currentModuleIndex,
          completedModules: nextCompleted,
          updatedAt: new Date().toISOString(),
        }
      : r,
  );
  try {
    await writeAllFallbackRecords(nextList);
  } catch {
    // ignore
  }
}

/**
 * Barcha o'quvchilarning dars vaqti kelganligini tekshiradi va dars boshlangan zahoti
 * email manziliga "Dars boshlandi!" xabarini yuboradi (har bir 2 soatlik dars uchun 1 marta).
 */
export async function dispatchDueLessonStartEmails(now: Date = new Date()): Promise<number> {
  let sentCount = 0;
  const nowMs = now.getTime();

  if (isPostgresConfigured()) {
    try {
      const dueRows = await db.admissionApplication.findMany({
        where: {
          userEmail: { not: null },
          nextLessonStartAt: { lte: now },
          nextLessonEndAt: { gt: now },
        },
        take: 50,
      });

      for (const row of dueRows) {
        const startIso = row.nextLessonStartAt.toISOString();
        if (row.lastNotifiedStartIso === startIso || !row.userEmail) continue;

        await sendLessonStartedEmail({
          toEmail: row.userEmail,
          studentName: row.fullName,
          universityRank: row.universityRank,
          universityName: row.universityName,
          directionTitle: row.directionTitle,
          dayNumber: row.currentDayNumber,
          windowLabel: formatUzbekLessonWindow(startIso, row.nextLessonEndAt.toISOString()),
        });

        await db.admissionApplication.update({
          where: { id: row.id },
          data: { lastNotifiedStartIso: startIso },
        });
        sentCount += 1;
      }
      return sentCount;
    } catch {
      // fallback below
    }
  }

  const all = await readAllFallbackRecords();
  let mutated = false;

  for (let i = 0; i < all.length; i++) {
    const rolled = rollForwardExpiredWindowIfNeeded(all[i]!, now);
    if (rolled.changed) {
      all[i] = rolled.updated;
      mutated = true;
    }
    const item = all[i]!;
    if (!item.userEmail) continue;

    const startMs = new Date(item.nextLessonStartAt).getTime();
    const endMs = new Date(item.nextLessonEndAt).getTime();
    if (nowMs >= startMs && nowMs < endMs && item.lastNotifiedStartIso !== item.nextLessonStartAt) {
      await sendLessonStartedEmail({
        toEmail: item.userEmail,
        studentName: item.fullName,
        universityRank: item.universityRank,
        universityName: item.universityName,
        directionTitle: item.directionTitle,
        dayNumber: item.currentDayNumber,
        windowLabel: formatUzbekLessonWindow(item.nextLessonStartAt, item.nextLessonEndAt),
      });
      all[i] = {
        ...item,
        lastNotifiedStartIso: item.nextLessonStartAt,
        updatedAt: now.toISOString(),
      };
      mutated = true;
      sentCount += 1;
    }
  }

  if (mutated) {
    try {
      await writeAllFallbackRecords(all);
    } catch {
      // ignore
    }
  }

  return sentCount;
}
