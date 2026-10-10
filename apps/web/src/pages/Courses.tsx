import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { CourseListItem, EnrollResponse } from "../lib/types";

const SUBJECT_LABELS: Record<string, string> = {
  math: "Matematika",
  english: "Ingliz tili",
  physics: "Fizika",
  chemistry: "Kimyo",
  biology: "Biologiya",
  literature: "Adabiyot",
};

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [subject, setSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState<Record<string, boolean>>({});

  const load = useCallback(async (nextSubject: string | null) => {
    setLoading(true);
    setError("");
    try {
      const query = nextSubject ? `?subject=${encodeURIComponent(nextSubject)}` : "";
      const data = await api<CourseListItem[]>(`/api/content/courses${query}`);
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kurslar yuklanmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    load(subject).catch(() => {
      if (!cancelled) setError("Kurslar yuklanmadi");
    });
    return () => {
      cancelled = true;
    };
  }, [load, subject]);

  async function enroll(slug: string) {
    setEnrolling(slug);
    try {
      await api<EnrollResponse>(`/api/content/courses/${slug}/enroll`, {
        method: "POST",
      });
      setEnrolled((m) => ({ ...m, [slug]: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yozilmadi");
    } finally {
      setEnrolling(null);
    }
  }

  const subjects = Array.from(new Set(courses.map((c) => c.subject)));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-card/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold">Kurslar</h1>
            <p className="text-xs text-muted-foreground">
              {courses.length} ta kurs · {loading ? "Yuklanmoqda…" : "tayyor"}
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-5 py-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSubject(null)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              subject === null
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-secondary"
            }`}
          >
            Barchasi
          </button>
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                subject === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:bg-secondary"
              }`}
            >
              {SUBJECT_LABELS[s] ?? s}
            </button>
          ))}
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-secondary" aria-hidden="true" />
        ) : courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hozircha kurs yo‘q.</p>
        ) : (
          <ul className="space-y-3">
            {courses.map((course) => (
              <li
                key={course.slug}
                className="rounded-2xl border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {SUBJECT_LABELS[course.subject] ?? course.subject}
                    </p>
                    <button
                      onClick={() => navigate(`/courses/${course.slug}`)}
                      className="text-left text-lg font-semibold underline underline-offset-4 hover:text-primary"
                    >
                      {course.title}
                    </button>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.moduleCount} modul · {course.lessonCount} dars
                    </p>
                  </div>
                  <button
                    onClick={() => enroll(course.slug)}
                    disabled={enrolling === course.slug || enrolled[course.slug]}
                    className={enrolled[course.slug] ? "btn-secondary text-sm" : "btn-primary text-sm"}
                  >
                    {enrolled[course.slug]
                      ? "Yozildingiz"
                      : enrolling === course.slug
                        ? "Yozilmoqda…"
                        : "Yozilish"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
