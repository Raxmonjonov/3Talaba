import { prisma } from "../config/prisma.js";

/** Hard cap on a single note so a runaway paste cannot bloat the row. */
export const MAX_NOTE_CHARS = 4000;

/**
 * Careful note-taking helper: trims surrounding whitespace and clamps the
 * length. An empty result means "no summary" (the note is cleared).
 */
export function normalizeNoteBody(body: string): string {
  return body.trim().slice(0, MAX_NOTE_CHARS);
}

export interface Note {
  lessonSlug: string;
  body: string;
  updatedAt: Date;
}

export interface NoteListItem {
  lessonSlug: string;
  lessonTitle: string;
  courseSlug: string;
  body: string;
  updatedAt: Date;
}

async function lessonIdBySlug(slug: string): Promise<string | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    select: { id: true },
  });
  return lesson?.id ?? null;
}

/** The student's own summary of a lesson, or null when none was written. */
export async function getNote(
  userId: string,
  slug: string
): Promise<Note | null> {
  const lessonId = await lessonIdBySlug(slug);
  if (!lessonId) return null;
  const note = await prisma.lessonNote.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { body: true, updatedAt: true },
  });
  return note ? { lessonSlug: slug, ...note } : null;
}

/**
 * Upserts the lesson summary. An empty body clears the note (returns an empty
 * summary) so students can delete their draft. `null` means the lesson is
 * unknown.
 */
export async function saveNote(
  userId: string,
  slug: string,
  body: string
): Promise<Note | null> {
  const lessonId = await lessonIdBySlug(slug);
  if (!lessonId) return null;

  const clean = normalizeNoteBody(body);
  if (!clean) {
    await prisma.lessonNote.deleteMany({ where: { userId, lessonId } });
    return { lessonSlug: slug, body: "", updatedAt: new Date() };
  }

  const note = await prisma.lessonNote.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, body: clean },
    update: { body: clean },
    select: { body: true, updatedAt: true },
  });
  return { lessonSlug: slug, ...note };
}

/** Every summary the student has written, newest first. */
export async function listNotes(
  userId: string,
  locale: "uz" | "en"
): Promise<NoteListItem[]> {
  const isEn = locale === "en";
  const rows = await prisma.lessonNote.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      body: true,
      updatedAt: true,
      lesson: {
        select: {
          slug: true,
          titleUz: true,
          titleEn: true,
          module: { select: { course: { select: { slug: true } } } },
        },
      },
    },
  });

  return rows.map((row) => ({
    lessonSlug: row.lesson.slug,
    lessonTitle: isEn ? row.lesson.titleEn : row.lesson.titleUz,
    courseSlug: row.lesson.module.course.slug,
    body: row.body,
    updatedAt: row.updatedAt,
  }));
}
