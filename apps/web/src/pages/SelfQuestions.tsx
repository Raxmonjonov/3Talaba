import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { SelfQuestionItem, SelfQuestionsResponse } from "../lib/types";
import { AppShell } from "@/components/AppShell";

const MAX_PROMPT = 500;
const MAX_ANSWER = 2000;

export default function SelfQuestions() {
  const [items, setItems] = useState<SelfQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<SelfQuestionsResponse>("/api/content/self-questions")
      .then((res) => {
        if (!cancelled) setItems(res.items);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Savollar yuklanmadi");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function addQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || !answer.trim()) {
      setFormError("Savol va javobni to‘ldiring");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const res = await api<{ item: SelfQuestionItem }>(
        "/api/content/self-questions",
        {
          method: "POST",
          body: JSON.stringify({ prompt, answer }),
        }
      );
      setItems((prev) => [res.item, ...prev]);
      setPrompt("");
      setAnswer("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Saqlanmadi");
    } finally {
      setSaving(false);
    }
  }

  async function removeQuestion(id: string) {
    setDeletingId(id);
    try {
      await api(`/api/content/self-questions/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "O‘chirilmadi");
    } finally {
      setDeletingId(null);
    }
  }

  function toggleReveal(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <AppShell
      title="Mening savollarim"
      subtitle={loading ? "Yuklanmoqda…" : `${items.length} ta savol`}
      maxWidth="max-w-2xl"
    >
      <section className="space-y-3 rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          O‘zingiz savol tuzing va javobini yozing. Keyin “Javobni ko‘rsatish”
          bilan o‘zingizni sinab ko‘ring — o‘z savolingizni yaratish materialni
          eslab qolishni kuchaytiradi (generatsiya effekti).
        </p>
      </section>

      <form
        onSubmit={addQuestion}
        className="space-y-3 rounded-2xl border bg-card p-6 shadow-sm"
      >
        <h2 className="text-base font-semibold">Yangi savol</h2>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="sq-prompt">
            Savol
          </label>
          <input
            id="sq-prompt"
            value={prompt}
            maxLength={MAX_PROMPT}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Masalan: Present Perfect qachon ishlatiladi?"
            className="field"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="sq-answer">
            Javob
          </label>
          <textarea
            id="sq-answer"
            value={answer}
            maxLength={MAX_ANSWER}
            rows={3}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Javobni o‘z so‘zlaringiz bilan yozing"
            className="field"
          />
        </div>
        {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saqlanmoqda…" : "Savolni saqlash"}
        </button>
      </form>

      {error ? <p className="alert-error">{error}</p> : null}

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-secondary" aria-hidden="true" />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Hozircha o‘z savollaringiz yo‘q. Yuqoridagi shakldan birinchi savolni
          qo‘shing.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const isOpen = revealed.has(item.id);
            return (
              <li
                key={item.id}
                className="space-y-2 rounded-xl border bg-card p-4 shadow-sm"
              >
                <p className="font-medium">{item.prompt}</p>
                {isOpen ? (
                  <p className="whitespace-pre-wrap text-sm text-foreground/90">
                    {item.answer}
                  </p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    Javob yashirilgan — avval yoddan eslashga urinib ko‘ring.
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => toggleReveal(item.id)}
                    className="btn-secondary text-sm"
                  >
                    {isOpen ? "Yashirish" : "Javobni ko‘rsatish"}
                  </button>
                  <button
                    onClick={() => removeQuestion(item.id)}
                    disabled={deletingId === item.id}
                    className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    {deletingId === item.id ? "O‘chirilmoqda…" : "O‘chirish"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
