import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { LessonDetail } from "../lib/types";

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

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setLesson(await api<LessonDetail>(`/api/content/lessons/${slug}`));
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
      });
      navigate(`/study/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Darsni ochib bo'lmadi");
      setStarted(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-card/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">
              {loading ? "Yuklanmoqda…" : (lesson?.title ?? "Dars")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {lesson ? `Daraja ${lesson.levelRange} · ~${lesson.estMinutes} daq` : ""}
            </p>
          </div>
          <button
            onClick={() =>
              navigate(lesson ? `/courses/${lesson.courseSlug}` : "/courses")
            }
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Kursga qaytish
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-5 py-8">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
              <button
                onClick={openInTutor}
                disabled={started}
                className="btn-primary"
              >
                {started ? "Tayyorlanmoqda…" : "Tutordan boshlash"}
              </button>
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
      </main>
    </div>
  );
}
