import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { MockExamListItem } from "../lib/types";

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} daqiqa`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} soat` : `${h} soat ${m} daqiqa`;
}

export default function MockExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<MockExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setExams(await api<MockExamListItem[]>("/api/content/mock-exams"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imtihonlar yuklanmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    load().catch(() => {
      if (!cancelled) setError("Imtihonlar yuklanmadi");
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-card/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold">Namunaviy imtihonlar</h1>
            <p className="text-xs text-muted-foreground">
              {exams.length} ta imtihon · vaqt chegarasi bilan
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

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-5 py-8">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-secondary" aria-hidden="true" />
        ) : exams.length === 0 ? (
          <p className="text-sm text-muted-foreground">Imtihon topilmadi.</p>
        ) : (
          exams.map((exam) => (
            <button
              key={exam.slug}
              onClick={() => navigate(`/mock-exams/${exam.slug}`)}
              className="w-full rounded-2xl border bg-card p-6 text-left shadow-sm transition-colors hover:border-primary/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                    {exam.exam}
                  </span>
                  <h2 className="text-lg font-semibold">{exam.title}</h2>
                  <p className="text-sm text-muted-foreground">{exam.description}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{formatMinutes(exam.durationMin)}</p>
                  <p>{exam.itemCount} savol</p>
                  <p>{exam.maxPoints} ball</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Bo‘limlar: {exam.sections.join(" · ")}
              </p>
            </button>
          ))
        )}
      </main>
    </div>
  );
}
