import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { MockExamListItem } from "../lib/types";
import { AppShell } from "@/components/AppShell";

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
    <AppShell
      title="Namunaviy imtihonlar"
      subtitle={
        <>
          {exams.length} ta imtihon · vaqt chegarasi bilan
        </>
      }
    >
        {error ? (
          <p className="alert-error">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-secondary" aria-hidden="true" />
        ) : exams.length === 0 ? (
          <p className="text-sm text-muted-foreground">Imtihon topilmadi.</p>
        ) : (
          exams.map((exam) => (
            <div key={exam.slug} className="subject-scene">
              <button
                onClick={() => navigate(`/mock-exams/${exam.slug}`)}
                className="subject-plate w-full rounded-2xl border bg-card p-6 text-left shadow-sm"
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
                {typeof exam.bestScore === "number" && exam.bestScore !== null ? (
                  <p className="mt-2 text-xs font-medium">
                    Eng yaxshi natija: {exam.bestScore}
                    {typeof exam.bestMaxScore === "number" ? ` / ${exam.bestMaxScore}` : ""}
                  </p>
                ) : null}
              </button>
            </div>
          ))
        )}
    </AppShell>
  );
}
