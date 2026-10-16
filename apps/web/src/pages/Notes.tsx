import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { NotesResponse } from "../lib/types";
import { AppShell } from "@/components/AppShell";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("uz-UZ", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export default function Notes() {
  const navigate = useNavigate();
  const [data, setData] = useState<NotesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<NotesResponse>("/api/content/notes")
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Konspektlar yuklanmadi");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = data?.items ?? [];

  return (
    <AppShell
      title="Konspektlar"
      subtitle={
        <>{loading ? "Yuklanmoqda…" : `${items.length} ta xulosa`}</>
      }
      maxWidth="max-w-2xl"
    >
      <section className="space-y-3 rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Har bir darsdan keyin yozgan qisqa xulosalaringiz. Ularni vaqti-vaqti
          bilan qayta o‘qib chiqish — mustahkamlashning (spaced review) oson
          yo‘li. Xulosani tahrirlash uchun darsni oching.
        </p>
      </section>

      {error ? <p className="alert-error">{error}</p> : null}

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-secondary" aria-hidden="true" />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Hozircha konspekt yo‘q. Istalgan dars sahifasida “Konspekt” bo‘limiga
          qisqa xulosa yozib qoldiring.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((note) => (
            <li
              key={note.lessonSlug}
              className="space-y-2 rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/lessons/${note.lessonSlug}`)}
                  className="text-left font-medium underline underline-offset-4 hover:text-primary"
                >
                  {note.lessonTitle}
                </button>
                <span className="text-xs text-muted-foreground">
                  {formatDate(note.updatedAt)}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground/90">
                {note.body}
              </p>
              <button
                onClick={() => navigate(`/lessons/${note.lessonSlug}`)}
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Darsni ochish
              </button>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
