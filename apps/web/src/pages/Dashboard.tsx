import { Suspense, lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { ProgressResponse, Session, SettingsResponse, User } from "../lib/types";

const HeroScene = lazy(() => import("@/components/landing/HeroScene"));

const TARGET_LABELS: Record<string, string> = {
  SAT: "SAT",
  IELTS: "IELTS",
  UNIVERSITY: "Oliygoh kirish",
  GENERAL: "Umumiy bilim",
};

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} daqiqa`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} soat` : `${h} soat ${m} daqiqa`;
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length === 0) return null;
  const max = Math.max(...points, 1);
  const width = 100;
  const height = 28;

  const path = points
    .map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * width;
      const y = height - (p / max) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-10 w-full"
      role="img"
      aria-label="O‘rganish grafigi"
    >
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function Dashboard({
  user,
  onLogout,
  onStartPlacement,
}: {
  user: User;
  onLogout: () => void;
  onStartPlacement: () => void;
}) {
  const navigate = useNavigate();
  const [focusMode, setFocusMode] = useState(user.focusMode);
  const [softConfirm, setSoftConfirm] = useState(user.softConfirm);
  const [title, setTitle] = useState(user.preferredTitle ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [starting, setStarting] = useState(false);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<ProgressResponse>("/api/learning/progress?days=14")
      .then((data) => {
        if (!cancelled) setProgress(data);
      })
      .catch(() => {
        /* stats are optional */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const address = user.preferredTitle || user.firstName;

  async function saveSettings() {
    setSaving(true);
    setError("");
    try {
      await api<SettingsResponse>("/api/user/settings", {
        method: "PATCH",
        body: JSON.stringify({ preferredTitle: title, focusMode, softConfirm }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saqlanmadi");
    } finally {
      setSaving(false);
    }
  }

  async function startStudy() {
    setStarting(true);
    setError("");
    try {
      const session = await api<Session>("/api/chat/start", { method: "POST" });
      navigate(`/study/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sessiya yaratilmadi");
      setStarting(false);
    }
  }

  const levelText =
    user.currentLevel === 0 ? "boshlang‘ich (0)" : `${user.currentLevel} / 10`;
  const spark = progress?.series.map((p) => p.minutes) ?? [];

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      <header className="sticky top-0 z-10 border-b bg-card/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold">3Talab</h1>
            <p className="text-xs text-muted-foreground">
              Xush kelibsiz, {address}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Chiqish
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl space-y-6 px-5 py-10">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <section className="auth-card space-y-4 rounded-2xl border bg-card p-8 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-semibold">O‘rganishni davom ettiramizmi?</h2>
            <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              Daraja {levelText}
            </span>
          </div>

          <p className="text-muted-foreground">
            {user.target ? (
              <>
                Maqsad:{" "}
                <span className="font-medium text-foreground">
                  {TARGET_LABELS[user.target] ?? user.target}
                </span>
                .{" "}
              </>
            ) : null}
            Agar daraja to‘g‘ri emas deb o‘ylasangiz, qisqa tekshiruvni qayta
            o‘tkazing — soatlar emas, to‘g‘ri boshlash muhim.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button onClick={startStudy} disabled={starting} className="btn-primary">
              {starting ? "Tayyorlanmoqda…" : "Darsni boshlash"}
            </button>
            <button onClick={onStartPlacement} className="btn-secondary">
              Darajani tekshirish
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="subject-scene">
            <div className="subject-plate h-full space-y-1 rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">Jami vaqt</p>
              <p className="text-xl font-semibold">
                {formatMinutes(progress?.totals.minutes ?? 0)}
              </p>
            </div>
          </div>
          <div className="subject-scene">
            <div className="subject-plate h-full space-y-1 rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">Faol kunlar</p>
              <p className="text-xl font-semibold">{progress?.totals.activeDays ?? 0}</p>
            </div>
          </div>
          <div className="subject-scene">
            <div className="subject-plate h-full space-y-1 rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">Tuzilgan savollar</p>
              <p className="text-xl font-semibold">{progress?.totals.completed ?? 0}</p>
            </div>
          </div>
        </section>

        {spark.length > 0 ? (
          <section className="space-y-2 rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">
              Oxirgi 14 kun
            </p>
            <div className="text-muted-foreground">
              <Sparkline points={spark} />
            </div>
          </section>
        ) : null}

        <section className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Sozlamalar</h3>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Sizni qanday murojaat qilay?
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                user.gender === "FEMALE"
                  ? "Malikam"
                  : user.gender === "MALE"
                    ? "Shag‘zodam"
                    : user.firstName
              }
              maxLength={40}
              className="field"
            />
            <p className="text-xs text-muted-foreground">
              Bo‘sh qoldirilsa, jinsingizga qarab avtomatik tanlanadi. Bu
              murojaat sizga yoqsa — majburlash emas.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={focusMode}
              onChange={(e) => setFocusMode(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">Fokus rejimi</span>
              <span className="block text-xs text-muted-foreground">
                Ortiqcha chalg‘ituvchilarni kamaytiradi. Butunlay ixtiyoriy.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={softConfirm}
              onChange={(e) => setSoftConfirm(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">Yumshoq eslatmalar</span>
              <span className="block text-xs text-muted-foreground">
                Dam olish vaqti kelganda yumshoq taklif qilamiz. Majburlamaymiz —
                o‘zingiz qaror qilasiz.
              </span>
            </span>
          </label>

          <div className="flex items-center gap-3">
            <button onClick={saveSettings} disabled={saving} className="btn-primary">
              {saving ? "Saqlanmoqda…" : "Saqlash"}
            </button>
            {saved ? (
              <span className="text-sm text-muted-foreground">Saqlandi</span>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}