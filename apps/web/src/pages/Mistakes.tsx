import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { Mistake, MistakesResponse } from "../lib/types";
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

export default function Mistakes() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<MistakesResponse>("/api/content/mistakes?limit=50")
      .then((data) => {
        if (!cancelled) {
          setItems(data.items);
          setDrafts(
            Object.fromEntries(data.items.map((m) => [m.id, m.reflection ?? ""]))
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Xatolar yuklanmadi");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveReflection = useCallback(
    async (id: string) => {
      setSavingId(id);
      setError("");
      try {
        const res = await api<{ reflection: { body: string } }>(
          `/api/content/questions/${encodeURIComponent(id)}/reflection`,
          {
            method: "PUT",
            body: JSON.stringify({ body: drafts[id] ?? "" }),
          }
        );
        const body = res.reflection.body;
        setItems((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, reflection: body || undefined } : m
          )
        );
        setSavedId(id);
        window.setTimeout(
          () => setSavedId((cur) => (cur === id ? null : cur)),
          2000
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Tahlil saqlanmadi");
      } finally {
        setSavingId(null);
      }
    },
    [drafts]
  );

  const skills = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      if (!seen.has(item.skill)) seen.set(item.skill, item.skillName);
    }
    return [...seen.entries()].map(([slug, name]) => ({ slug, name }));
  }, [items]);

  const visible = skillFilter
    ? items.filter((m) => m.skill === skillFilter)
    : items;

  const toggleReveal = useCallback((id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const practiceSkills = useMemo(() => {
    const source = skillFilter ? [skillFilter] : skills.map((s) => s.slug);
    return source.join(",");
  }, [skillFilter, skills]);

  return (
    <AppShell
      title="Xatolar daftari"
      subtitle={
        <>{loading ? "Yuklanmoqda…" : `${items.length} ta takrorlanmagan xato`}</>
      }
      maxWidth="max-w-2xl"
    >
      <section className="space-y-3 rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Bu — hali to‘g‘rilanmagan xatolar. Avval o‘zingiz qayta yechib
          ko‘ring, keyin javobni tekshiring. Har bir xato uchun qisqa "xato
          tahlili" yozing: nega xato bo‘ldi va to‘g‘ri yondashuv nima? Xatoni
          tan olish, tushuntirish va tuzatish — o‘rganishning eng kuchli
          usullaridan biri (self-explanation).
        </p>
        {items.length > 0 ? (
          <button
            onClick={() =>
              navigate(`/practice?skills=${encodeURIComponent(practiceSkills)}`)
            }
            className="btn-primary"
          >
            Shu xatolarni mashq qilish
          </button>
        ) : null}
      </section>

      {error ? <p className="alert-error">{error}</p> : null}

      {skills.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSkillFilter(null)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              skillFilter === null
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-secondary"
            }`}
          >
            Barchasi
          </button>
          {skills.map((s) => (
            <button
              key={s.slug}
              onClick={() => setSkillFilter(s.slug)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                skillFilter === s.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:bg-secondary"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-secondary" aria-hidden="true" />
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Hozircha takrorlanmagan xato yo‘q. Mashqlarni davom ettiring — xatolar
          shu yerda to‘planadi.
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((m) => {
            const shown = revealed.has(m.id);
            return (
              <li
                key={m.id}
                className="space-y-3 rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
                    {m.skillName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(m.answeredAt)}
                  </span>
                </div>

                {m.passage ? (
                  <p className="whitespace-pre-wrap rounded-lg border bg-background/50 p-3 text-sm text-muted-foreground">
                    {m.passage}
                  </p>
                ) : null}

                <p className="font-medium">{m.prompt}</p>

                {m.options.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {m.options.map((o, i) => (
                      <li
                        key={i}
                        className="rounded-lg border bg-background/50 px-3 py-1.5"
                      >
                        {o.label}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => toggleReveal(m.id)}
                    className="btn-secondary text-sm"
                  >
                    {shown ? "Javobni yashirish" : "Javobni ko‘rsatish"}
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/practice?skill=${encodeURIComponent(m.skill)}`)
                    }
                    className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    Mavzuni mashq qilish
                  </button>
                </div>

                {shown ? (
                  <div className="space-y-1 rounded-lg border bg-background/50 p-3 text-sm">
                    <p className="text-red-700">
                      Sizning javobingiz: {m.given || "—"}
                    </p>
                    <p className="text-emerald-700">
                      To‘g‘ri javob: {m.correctAnswer || "—"}
                    </p>
                  </div>
                ) : null}

                <div className="space-y-2 border-t pt-3">
                  <label
                    htmlFor={`reflection-${m.id}`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Xato tahlili — nega xato bo‘ldi va to‘g‘ri yondashuv nima?
                  </label>
                  <textarea
                    id={`reflection-${m.id}`}
                    value={drafts[m.id] ?? ""}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))
                    }
                    disabled={savingId === m.id}
                    rows={2}
                    placeholder="Masalan: shoshilib o‘qidim va 'NOT' so‘zini o‘tkazib yubordim."
                    className="field min-h-[64px] resize-y text-sm"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => saveReflection(m.id)}
                      disabled={savingId === m.id}
                      className="btn-secondary text-sm"
                    >
                      {savingId === m.id ? "Saqlanmoqda…" : "Tahlilni saqlash"}
                    </button>
                    {savedId === m.id ? (
                      <span role="status" className="text-xs text-emerald-600">
                        Saqlandi
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
