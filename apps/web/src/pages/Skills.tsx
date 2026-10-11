import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { SkillMapItem } from "../lib/types";
import { subjectLabel } from "@/lib/subjects";
import { AppShell } from "@/components/AppShell";

function masteryPercent(mastery: number | null): number | null {
  if (mastery === null) return null;
  return Math.round(mastery * 100);
}

export default function Skills() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<SkillMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onlyWeak, setOnlyWeak] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSkills(await api<SkillMapItem[]>("/api/content/skills"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mavzular yuklanmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    load().catch(() => {
      if (!cancelled) setError("Mavzular yuklanmadi");
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const weak = useMemo(
    () =>
      skills.filter(
        (s) => s.mastery !== null && s.mastery < 0.7 && s.attempts >= 3,
      ),
    [skills],
  );

  const visible = onlyWeak ? weak : skills;
  const bySubject = useMemo(() => {
    const map = new Map<string, SkillMapItem[]>();
    for (const s of visible) {
      const list = map.get(s.subject) ?? [];
      list.push(s);
      map.set(s.subject, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const am = a.mastery ?? 1;
        const bm = b.mastery ?? 1;
        return am - bm;
      });
    }
    return map;
  }, [visible]);

  return (
    <AppShell
      title="Mavzular"
      subtitle={
        <>
          {skills.length} ta mavzu · {weak.length} ta zaif
        </>
      }
    >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setOnlyWeak(false)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              !onlyWeak
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-secondary"
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setOnlyWeak(true)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              onlyWeak
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-secondary"
            }`}
          >
            Zaiflar
          </button>
          <button
            onClick={() => navigate("/practice")}
            className="rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-sm hover:bg-primary/20"
          >
            Umumiy mashq
          </button>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-secondary" aria-hidden="true" />
        ) : bySubject.size === 0 ? (
          <p className="text-sm text-muted-foreground">
            {onlyWeak
              ? "Hozircha zaif mavzu yo‘q — mashqni davom ettiring."
              : "Mavzu topilmadi."}
          </p>
        ) : (
          Array.from(bySubject.entries()).map(([subject, list]) => (
            <section key={subject} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">
                  {subjectLabel(subject)}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      navigate(`/placement?subject=${encodeURIComponent(subject)}`)
                    }
                    className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    Daraja testi
                  </button>
                  <button
                    onClick={() => navigate(`/practice?subject=${encodeURIComponent(subject)}`)}
                    className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    {subjectLabel(subject)} mashqi
                  </button>
                </div>
              </div>
              <ul className="space-y-2">
                {list.map((skill) => {
                  const pct = masteryPercent(skill.mastery);
                  return (
                    <li
                      key={skill.slug}
                      className="rounded-xl border bg-card p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {skill.questionCount} savol · {skill.attempts} javob
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              pct !== null && pct < 70 ? "text-amber-600" : "text-emerald-600"
                            }`}
                          >
                            {pct === null ? "—" : `${pct}%`}
                          </span>
                          <button
                            onClick={() =>
                              navigate(`/practice?skill=${encodeURIComponent(skill.slug)}`)
                            }
                            className="btn-secondary text-sm"
                          >
                            Mashq
                          </button>
                        </div>
                      </div>
                      <div
                        className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"
                        role="progressbar"
                        aria-valuenow={pct ?? 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${skill.name} ustunlik`}
                      >
                        <div
                          className={`h-full rounded-full ${
                            pct !== null && pct < 70 ? "bg-amber-500" : "bg-primary"
                          }`}
                          style={{ width: `${pct ?? 0}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
    </AppShell>
  );
}
