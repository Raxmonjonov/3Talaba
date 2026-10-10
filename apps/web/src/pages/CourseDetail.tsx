import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { CourseDetail, EnrollResponse } from "../lib/types";
import { subjectLabel } from "@/lib/subjects";

export default function CourseDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCourse(await api<CourseDetail>(`/api/content/courses/${slug}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kurs topilmadi");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    load().catch(() => {
      if (!cancelled) setError("Kurs topilmadi");
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function enroll() {
    setEnrolling(true);
    setError("");
    try {
      await api<EnrollResponse>(`/api/content/courses/${slug}/enroll`, {
        method: "POST",
      });
      setCourse((prev) => (prev ? { ...prev, enrolled: true } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yozilmadi");
    } finally {
      setEnrolling(false);
    }
  }

  function openNext() {
    if (course?.nextLessonSlug) {
      navigate(`/lessons/${course.nextLessonSlug}`);
      return;
    }
    const first = course?.modules.flatMap((m) => m.lessons)[0];
    if (first) navigate(`/lessons/${first.slug}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-card/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">
              {loading ? "Yuklanmoqda…" : (course?.title ?? "Kurs")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {course
                ? `${course.moduleCount} modul · ${course.lessonCount} dars`
                : ""}
            </p>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Kurslar
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-5 py-8">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-secondary" aria-hidden="true" />
        ) : course ? (
          <>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{course.description}</p>
              <p className="text-xs text-muted-foreground">
                {subjectLabel(course.subject)}
              </p>
              <div className="flex flex-wrap gap-3">
                {course.enrolled ? (
                  <>
                    <button onClick={openNext} className="btn-primary">
                      {course.nextLessonTitle
                        ? `Davom: ${course.nextLessonTitle}`
                        : "Birinchi darsni ochish"}
                    </button>
                    <span
                      role="status"
                      className="inline-flex items-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                    >
                      Kursga yozilgansiz
                    </span>
                  </>
                ) : (
                  <button
                    onClick={enroll}
                    disabled={enrolling}
                    className="btn-primary"
                  >
                    {enrolling ? "Yozilmoqda…" : "Kursga yozilish"}
                  </button>
                )}
              </div>
            </div>
            {typeof course.progressPct === "number" ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {course.completedCount ?? 0}/{course.lessonCount} dars ·{" "}
                  {course.progressPct}%
                </p>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-secondary"
                  role="progressbar"
                  aria-valuenow={course.progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Kurs progressi"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${course.progressPct}%` }}
                  />
                </div>
              </div>
            ) : null}

            {course.modules.map((mod) => (
              <section key={mod.slug} className="space-y-3">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">{mod.title}</h2>
                  <p className="text-sm text-muted-foreground">{mod.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Daraja {mod.levelRange} · {mod.lessons.length} dars
                  </p>
                </div>
                <ul className="space-y-2">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.slug}>
                      <button
                        onClick={() => navigate(`/lessons/${lesson.slug}`)}
                        className="w-full rounded-xl border bg-card p-4 text-left shadow-sm hover:bg-secondary/60"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <p className="font-medium">
                              {lesson.completed ? (
                                <span aria-hidden="true" className="mr-1 text-primary">
                                  ✓
                                </span>
                              ) : null}
                              {lesson.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {lesson.summary}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ~{lesson.estMinutes} daqiqa · {lesson.blockCount} blok ·{" "}
                              {lesson.xpReward} XP
                              {lesson.completed ? " · yakunlangan" : ""}
                            </p>
                          </div>
                          <span
                            aria-hidden="true"
                            className="mt-1 text-muted-foreground"
                          >
                            →
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        ) : null}
      </main>
    </div>
  );
}
