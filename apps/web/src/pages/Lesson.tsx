import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { CompleteLessonResponse, LessonDetail } from "../lib/types";
import { AppShell } from "@/components/AppShell";

const KIND_LABELS: Record<string, string> = {
  theory: "Nazariya",
  example: "Misol",
  practice: "Amaliyot",
  review: "Takrorlash",
  quiz: "Test",
};

export default function LessonPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeInfo, setCompleteInfo] = useState<{
    alreadyDone: boolean;
    xpAwarded: number;
    xpTotal: number;
  } | null>(null);
  const [nextSlug, setNextSlug] = useState<string | null>(null);
  const [nextTitle, setNextTitle] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<LessonDetail>(`/api/content/lessons/${slug}`);
      setLesson(data);
      setNextSlug(data.nextLessonSlug ?? null);
      setNextTitle(data.nextLessonTitle ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dars topilmadi");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    load().catch(() => {
      if (!cancelled) setError("Dars topilmadi");
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function openInTutor() {
    setStarted(true);
    try {
      const session = await api<{ id: string }>("/api/chat/start", {
        method: "POST",
        body: JSON.stringify({ lessonSlug: lesson?.slug }),
      });
      navigate(`/study/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Darsni ochib bo'lmadi");
      setStarted(false);
    }
  }

  async function markComplete() {
    if (!lesson || completing) return;
    setCompleting(true);
    try {
      const data = await api<CompleteLessonResponse>(
        `/api/content/lessons/${lesson.slug}/complete`,
        { method: "POST" }
      );
      setCompleteInfo({
        alreadyDone: data.alreadyDone,
        xpAwarded: data.xpAwarded,
        xpTotal: data.xpTotal,
      });
      setLesson((prev) =>
        prev ? { ...prev, completed: true, completedAt: new Date().toISOString() } : prev
      );
      try {
        const refreshed = await api<LessonDetail>(
          `/api/content/lessons/${lesson.slug}`
        );
        setNextSlug(refreshed.nextLessonSlug ?? null);
        setNextTitle(refreshed.nextLessonTitle ?? null);
      } catch {
        /* next-lesson CTA is optional after completion */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Darsni yakunlab bo'lmadi");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <AppShell
      title={loading ? "Yuklanmoqda…" : (lesson?.title ?? "Dars")}
      subtitle={
        lesson
          ? `Daraja ${lesson.levelRange} · ~${lesson.estMinutes} daq`
          : undefined
      }
      backTo={lesson ? `/courses/${lesson.courseSlug}` : "/courses"}
      backLabel="Kursga qaytish"
    >
        {error ? (
          <p className="alert-error">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-secondary" aria-hidden="true" />
        ) : lesson ? (
          <>
            <section className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
              <p className="text-sm text-muted-foreground">{lesson.summary}</p>
              {lesson.objectives.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {lesson.objectives.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              ) : null}
              {lesson.skills && lesson.skills.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">Mavzular:</span>
                  {lesson.skills.map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        navigate(`/practice?skill=${encodeURIComponent(s)}`)
                      }
                      className="rounded-full border bg-background px-2.5 py-0.5 text-xs hover:bg-secondary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={openInTutor}
                  disabled={started}
                  className="btn-secondary"
                >
                  {started ? "Tayyorlanmoqda…" : "Tutordan boshlash"}
                </button>
                {lesson.completed ? (
                  <span
                    role="status"
                    className="inline-flex items-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                  >
                    Yakunlandi · +{lesson.xpReward} XP
                  </span>
                ) : (
                  <button
                    onClick={markComplete}
                    disabled={completing}
                    className="btn-primary"
                  >
                    {completing ? "Saqlanmoqda…" : "Darsni yakunladim"}
                  </button>
                )}
              </div>
              {completeInfo ? (
                <p role="status" className="text-sm text-muted-foreground">
                  {completeInfo.alreadyDone
                    ? "Bu dars oldin yakunlangan edi."
                    : `+${completeInfo.xpAwarded} XP · jami ${completeInfo.xpTotal} XP`}
                </p>
              ) : null}
              {lesson.completed && (lesson.skills?.length ?? 0) > 0 ? (
                <div className="pt-1">
                  <button
                    onClick={() =>
                      navigate(
                        `/practice?skills=${encodeURIComponent((lesson.skills ?? []).join(","))}`
                      )
                    }
                    className="btn-secondary"
                  >
                    Bu dars mavzulari bo‘yicha mashq
                  </button>
                </div>
              ) : null}
              {lesson.completed && nextSlug && nextTitle ? (
                <div className="pt-1">
                  <button
                    onClick={() => navigate(`/lessons/${nextSlug}`)}
                    className="btn-secondary"
                  >
                    Keyingi dars: {nextTitle}
                  </button>
                </div>
              ) : null}
            </section>

            <section className="space-y-4">
              {lesson.blocks.map((block, i) => (
                <article
                  key={`${block.kind}-${i}`}
                  className="rounded-2xl border bg-card p-5 shadow-sm space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">
                      {KIND_LABELS[block.kind] ?? block.kind}
                    </span>
                    <span className="text-muted-foreground">
                      {block.minMinutes} daqiqa
                    </span>
                  </div>
                  <h2 className="text-base font-semibold">{block.title}</h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {block.content}
                  </p>
                </article>
              ))}
            </section>
          </>
        ) : null}
    </AppShell>
  );
}
