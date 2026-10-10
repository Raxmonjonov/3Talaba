import { Suspense, lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { ProgressResponse, ReviewsResponse, Session, SettingsResponse, User } from "../lib/types";
import { set3DEnabled } from "../lib/featureFlags";
import { useAchievements } from "../lib/useAchievements";
import { use3DEnabled } from "@/components/3d/hooks/usePerfFlags";
import { ProgressStairs3D } from "@/components/3d/elements/ProgressStairs3D";
import { MedalsShelf } from "@/components/3d/elements/MedalsShelf";
import { ConfettiBurst } from "@/components/3d/elements/ConfettiBurst";

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
}: {
  user: User;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const [focusMode, setFocusMode] = useState(user.focusMode);
  const [softConfirm, setSoftConfirm] = useState(user.softConfirm);
  const [title, setTitle] = useState(user.preferredTitle ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [starting, setStarting] = useState(false);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [statsError, setStatsError] = useState("");
  const [openSession, setOpenSession] = useState<Session | null>(null);
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [error, setError] = useState("");
  const threeDEnabled = use3DEnabled();
  const {
    items: achievements,
    fresh,
    celebration,
    loading: achievementsLoading,
  } = useAchievements();

  useEffect(() => {
    let cancelled = false;
    api<ProgressResponse>("/api/learning/progress?days=14")
      .then((data) => {
        if (!cancelled) setProgress(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setStatsError(
            err instanceof Error
              ? err.message
              : "Statistika yuklanmadi. Keyinroq urinib ko‘ring."
          );
        }
      });
    api<Session[]>("/api/chat/sessions")
      .then((list) => {
        if (cancelled) return;
        const open = list.find((s) => !s.endedAt) ?? null;
        setOpenSession(open);
      })
      .catch(() => {
        /* resume is optional — a fresh session still works */
      });
    api<ReviewsResponse>("/api/content/reviews")
      .then((data) => {
        if (!cancelled) setReviews(data);
      })
      .catch(() => {
        /* review counts are optional */
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
            {openSession ? (
              <button
                onClick={() => navigate(`/study/${openSession.id}`)}
                disabled={starting}
                className="btn-primary"
              >
                O‘tagan darsni davom ettirish
              </button>
            ) : null}
            <button
              onClick={startStudy}
              disabled={starting}
              className={openSession ? "btn-secondary" : "btn-primary"}
            >
              {starting ? "Tayyorlanmoqda…" : "Yangi dars"}
            </button>
            <button onClick={() => navigate("/placement")} className="btn-secondary">
              Darajani tekshirish
            </button>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold">Takrorlash</h3>
            <span className="text-xs text-muted-foreground">
              {reviews
                ? reviews.summary.dueNow > 0
                  ? `${reviews.summary.dueNow} savol navbatda`
                  : "Hozircha navbat yo‘q"
                : "Yuklanmoqda…"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Xatolar va zaif mavzular qisqa fursatdan keyin qayta keladi.
            {reviews && reviews.summary.totalCards > 0
              ? ` Jami ${reviews.summary.totalCards} karta mashqda.`
              : ""}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button onClick={() => navigate("/practice")} className="btn-secondary">
              {reviews && reviews.summary.dueNow > 0
                ? "Navbatdagi savollarni mashq qilish"
                : "Mashqni boshlash"}
            </button>
          </div>
          {reviews && reviews.summary.weakSkills.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              E’tibor:{" "}
              {reviews.summary.weakSkills
                .slice(0, 3)
                .map((s) => s.skill)
                .join(", ")}
            </p>
          ) : null}
        </section>

        <section className="space-y-3 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold">Yo‘lingiz</h3>
            <span className="text-xs text-muted-foreground">
              Tepada maqsadingiz
            </span>
          </div>

          <ProgressStairs3D level={user.currentLevel} />

          <p className="text-xs text-muted-foreground">
            Har bir pog‘ona — bir daraja. Hozir {levelText}. Orqadagi
            pog‘onalar yonib turadi, oldindagilar tinchoq kutmoqda.
          </p>
        </section>

        <section
          className="relative space-y-3 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm"
          aria-busy={achievementsLoading}
        >
          <ConfettiBurst trigger={celebration} />
          {fresh.length > 0 ? (
            <p
              role="status"
              className="rounded-lg border border-[#ffd166]/40 bg-[#ffd166]/10 px-3 py-2 text-sm text-foreground"
            >
              Yangi yutuq: {fresh.map((item) => item.title).join(", ")}
            </p>
          ) : null}
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold">Yutuqlar</h3>
            <span className="text-xs text-muted-foreground">
              {achievementsLoading
                ? "Yuklanmoqda…"
                : `${achievements.filter((a) => a.earnedAt !== null).length} / ${achievements.length} ochilgan`}
            </span>
          </div>
          {achievementsLoading ? (
            <div
              className="h-28 animate-pulse rounded-xl bg-secondary"
              aria-hidden="true"
            />
          ) : (
            <MedalsShelf items={achievements} />
          )}
          <p className="text-xs text-muted-foreground">
            Medallar daraja, vaqt va faollikka qarab ochiladi. Har biri
            sizning mehnatingizning belgisi.
          </p>
        </section>

        <section className="space-y-3">
          {statsError ? (
            <p
              role="status"
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {statsError}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="subject-scene">
              <div className="subject-plate h-full space-y-1 rounded-2xl border bg-card p-5 shadow-sm">
                <p className="text-xs text-muted-foreground">Jami vaqt</p>
                <p className="text-xl font-semibold">
                  {progress ? formatMinutes(progress.totals.minutes) : statsError ? "—" : formatMinutes(0)}
                </p>
              </div>
            </div>
            <div className="subject-scene">
              <div className="subject-plate h-full space-y-1 rounded-2xl border bg-card p-5 shadow-sm">
                <p className="text-xs text-muted-foreground">Faol kunlar</p>
                <p className="text-xl font-semibold">
                  {progress ? progress.totals.activeDays : statsError ? "—" : 0}
                </p>
              </div>
            </div>
            <div className="subject-scene">
              <div className="subject-plate h-full space-y-1 rounded-2xl border bg-card p-5 shadow-sm">
                <p className="text-xs text-muted-foreground">Tuzilgan savollar</p>
                <p className="text-xl font-semibold">
                  {progress ? progress.totals.completed : statsError ? "—" : 0}
                </p>
              </div>
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

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={!threeDEnabled}
              onChange={(e) => set3DEnabled(!e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">
                3D effektlarni o‘chirish
              </span>
              <span className="block text-xs text-muted-foreground">
                Sahnalar oddiy ko‘rinishga o‘tadi. Darslar, test va barcha
                funksiyalar o‘z joyida qoladi. Bu sozlama shu qurilmada
                saqlanadi.
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