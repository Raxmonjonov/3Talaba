"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Edit3,
  Layers,
  PlusCircle,
  Settings,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";

interface AdminQuestionItem {
  id: string;
  subjectSlug: string;
  subjectNameUz: string;
  topicTitleUz: string;
  difficulty: number;
  promptUz: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: "A" | "B" | "C" | "D";
  explanationUz: string;
}

interface AdminPayload {
  stats: {
    totalUsers: number;
    totalSubjects: number;
    totalLessons: number;
    totalQuestions: number;
    totalAttempts: number;
    avgAccuracyPct: number;
    totalPlatformXp: number;
  };
  subjects: Array<{
    id: string;
    slug: string;
    nameUz: string;
  }>;
  questions: AdminQuestionItem[];
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    gender: string;
    honorific: string;
    region: string;
    grade: string;
    xpTotal: number;
    streakDays: number;
    guardianShareCode: string;
  }>;
  lessons: Array<{
    id: string;
    slug: string;
    titleUz: string;
    subjectNameUz: string;
    topicTitleUz: string;
    estMinutes: number;
    xpReward: number;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminPayload | null>(null);
  const [activeTab, setActiveTab] = useState<"questions" | "users" | "lessons">(
    "questions"
  );

  // Savol qo'shish / tahrirlash formasi
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [subjectSlug, setSubjectSlug] = useState("sat-math");
  const [difficulty, setDifficulty] = useState(2);
  const [promptUz, setPromptUz] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState<"A" | "B" | "C" | "D">("B");
  const [explanationUz, setExplanationUz] = useState("");
  const [hintUz, setHintUz] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [accessError, setAccessError] = useState<string | null>(null);

  const loadAdminData = async () => {
    const res = await fetch("/api/admin");
    if (res.ok) {
      const payload = (await res.json()) as AdminPayload;
      setData(payload);
      setAccessError(null);
    } else {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setAccessError(body.error ?? "Admin panelni yuklab bo'lmadi");
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleEditClick = (q: AdminQuestionItem) => {
    setEditingId(q.id);
    setSubjectSlug(q.subjectSlug);
    setDifficulty(q.difficulty);
    setPromptUz(q.promptUz);
    setOptionA(q.options.find((o) => o.id === "A")?.text ?? "");
    setOptionB(q.options.find((o) => o.id === "B")?.text ?? "");
    setOptionC(q.options.find((o) => o.id === "C")?.text ?? "");
    setOptionD(q.options.find((o) => o.id === "D")?.text ?? "");
    setCorrectAnswer(q.correctAnswer);
    setExplanationUz(q.explanationUz);
    setStatusMessage(null);
  };

  const resetForm = () => {
    setEditingId(undefined);
    setPromptUz("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setExplanationUz("");
    setHintUz("");
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          subjectSlug,
          difficulty: Number(difficulty),
          promptUz,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer,
          explanationUz,
          hintUz,
        }),
      });

      if (res.ok) {
        const result = (await res.json()) as { message: string };
        setStatusMessage(result.message);
        resetForm();
        await loadAdminData();
      }
    } finally {
      setSaving(false);
    }
  };

  if (accessError) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4">
        <div id="admin-access-denied" className="glass-card w-full p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-gold" />
          <h1 className="mt-3 text-xl font-extrabold text-fg">Ruxsat yo&apos;q</h1>
          <p className="mt-2 text-sm text-fg-muted">{accessError}</p>
          <Link href="/learn" className="btn-neon mt-5 inline-flex px-5 py-2.5 text-xs font-bold">
            Darslarga qaytish
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-fg-muted">Admin panel yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Yuqori Sarlavha va Statistikalar */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-3.5 py-1 text-xs font-bold text-gold">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>3TALAB BOSHQARUV MARKAZI • ADMIN PANEL</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">
              Foydalanuvchilar, Savollar Banki va Kontent Boshqaruvi
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-fg hover:border-neon"
            >
              <Settings className="h-4 w-4 text-neon" />
              <span>Eslatmalar & Sozlamalar</span>
            </Link>
            <Link
              href="/guardian"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold-soft px-4 py-2.5 text-xs font-bold text-gold"
            >
              <Users className="h-4 w-4" />
              <span>Ota-ona/Ustoz Ko&apos;rinishi</span>
            </Link>
          </div>
        </div>

        {/* 5 ta statistika kartasi */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <span className="text-xs font-bold text-fg-muted">Jami O&apos;quvchilar</span>
            <div className="mt-1 font-mono text-2xl font-extrabold text-neon">
              {data.stats.totalUsers}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <span className="text-xs font-bold text-fg-muted">Savollar Banki</span>
            <div
              id="admin-total-questions-count"
              className="mt-1 font-mono text-2xl font-extrabold text-gold"
            >
              {data.stats.totalQuestions} ta
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <span className="text-xs font-bold text-fg-muted">Darslar va Fanlar</span>
            <div className="mt-1 font-mono text-2xl font-extrabold text-fg">
              {data.stats.totalLessons} / {data.stats.totalSubjects}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <span className="text-xs font-bold text-fg-muted">O&apos;rtacha Aniqlik</span>
            <div className="mt-1 font-mono text-2xl font-extrabold text-neon">
              {data.stats.avgAccuracyPct}%
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <span className="text-xs font-bold text-fg-muted">Jami Platforma XP</span>
            <div className="mt-1 font-mono text-2xl font-extrabold text-gold">
              {data.stats.totalPlatformXp} XP
            </div>
          </div>
        </div>

        {/* Bo'limlar tablari */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
          <button
            type="button"
            data-admin-tab="questions"
            onClick={() => setActiveTab("questions")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "questions"
                ? "bg-neon text-canvas shadow-neon"
                : "border border-border bg-surface text-fg-muted hover:text-fg"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Savollar Banki ({data.questions.length})</span>
          </button>
          <button
            type="button"
            data-admin-tab="users"
            onClick={() => setActiveTab("users")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-neon text-canvas shadow-neon"
                : "border border-border bg-surface text-fg-muted hover:text-fg"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Foydalanuvchilar ({data.users.length})</span>
          </button>
          <button
            type="button"
            data-admin-tab="lessons"
            onClick={() => setActiveTab("lessons")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "lessons"
                ? "bg-neon text-canvas shadow-neon"
                : "border border-border bg-surface text-fg-muted hover:text-fg"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Dars Kontenti ({data.lessons.length})</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          1-BO'LIM: SAVOLLAR BANKI (QO'SHISH VA TAHRIRLASH)
          ==================================================================== */}
      {activeTab === "questions" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Chap: Yangi savol qo'shish / tahrirlash formasi */}
          <form
            id="admin-question-form"
            onSubmit={handleSaveQuestion}
            className="glass-card space-y-4 p-6 lg:col-span-5"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-fg">
                <PlusCircle className="h-5 w-5 text-neon" />
                <span>
                  {editingId
                    ? "Savolni Tahrirlash"
                    : "Yangi Savol Qo'shish (Bankka)"}
                </span>
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-bold text-gold hover:underline"
                >
                  Bekor qilish
                </button>
              )}
            </div>

            {statusMessage && (
              <div
                id="admin-save-status"
                className="flex items-center gap-2 rounded-xl border border-neon bg-neon-soft/20 p-3 text-xs font-bold text-neon"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-fg-muted">
                  Fan:
                </label>
                <select
                  id="admin-q-subject"
                  value={subjectSlug}
                  onChange={(e) => setSubjectSlug(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-fg"
                >
                  {data.subjects.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.nameUz}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-fg-muted">
                  Qiyinlik (1..4):
                </label>
                <select
                  id="admin-q-difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-fg"
                >
                  <option value={1}>1 - Noldan</option>
                  <option value={2}>2 - Boshlang&apos;ich</option>
                  <option value={3}>3 - O&apos;rta</option>
                  <option value={4}>4 - Yuqori</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-fg-muted">
                Savol sharti (O&apos;zbek tilida):
              </label>
              <textarea
                id="admin-q-prompt"
                required
                rows={3}
                value={promptUz}
                onChange={(e) => setPromptUz(e.target.value)}
                placeholder="Masalan: Agar 5x + 15 = 45 bo'lsa, x + 3 ifodaning qiymatini toping."
                className="w-full rounded-xl border border-border bg-surface p-3 text-xs text-fg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-fg-muted">
                  A variant:
                </label>
                <input
                  id="admin-q-opt-a"
                  required
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  placeholder="6"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-fg"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-fg-muted">
                  B variant:
                </label>
                <input
                  id="admin-q-opt-b"
                  required
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  placeholder="9"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-fg"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-fg-muted">
                  C variant:
                </label>
                <input
                  id="admin-q-opt-c"
                  required
                  type="text"
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  placeholder="12"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-fg"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-fg-muted">
                  D variant:
                </label>
                <input
                  id="admin-q-opt-d"
                  required
                  type="text"
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  placeholder="15"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-fg"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-fg-muted">
                To&apos;g&apos;ri javob:
              </label>
              <select
                id="admin-q-correct"
                value={correctAnswer}
                onChange={(e) =>
                  setCorrectAnswer(e.target.value as "A" | "B" | "C" | "D")
                }
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-neon"
              >
                <option value="A">A variant</option>
                <option value="B">B variant</option>
                <option value="C">C variant</option>
                <option value="D">D variant</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-fg-muted">
                Yechim tushuntirishi:
              </label>
              <textarea
                id="admin-q-explanation"
                required
                rows={2}
                value={explanationUz}
                onChange={(e) => setExplanationUz(e.target.value)}
                placeholder="5x + 15 = 5(x + 3) = 45 -> x + 3 = 45 / 5 = 9."
                className="w-full rounded-xl border border-border bg-surface p-3 text-xs text-fg"
              />
            </div>

            <button
              type="submit"
              id="admin-save-question-btn"
              disabled={saving}
              className="btn-neon w-full py-3 text-xs font-bold sm:text-sm"
            >
              {saving
                ? "Saqlanmoqda..."
                : editingId
                  ? "O'zgarishlarni Saqlash"
                  : "Savolni Bankka Qo'shish"}
            </button>
          </form>

          {/* O'ng: Mavjud savollar ro'yxati */}
          <div className="glass-card p-6 lg:col-span-7">
            <h2 className="border-b border-border pb-3 text-base font-extrabold text-fg">
              Savollar Bankidagi Oxirgi Savollar ({data.questions.length} ta)
            </h2>

            <div className="mt-4 max-h-[600px] space-y-3 overflow-y-auto pr-1">
              {data.questions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-border bg-surface p-4 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-lg bg-elevated px-2.5 py-1 font-bold text-neon">
                      {q.subjectNameUz} • {q.difficulty}-daraja
                    </span>
                    <button
                      type="button"
                      data-edit-question-id={q.id}
                      onClick={() => handleEditClick(q)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gold/40 bg-gold-soft px-2.5 py-1 font-bold text-gold hover:bg-gold hover:text-canvas"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Tahrirlash</span>
                    </button>
                  </div>

                  <p className="mt-2.5 font-bold text-fg">{q.promptUz}</p>
                  <p className="mt-1 text-fg-muted">
                    <strong className="text-neon">
                      To&apos;g&apos;ri javob ({q.correctAnswer}):
                    </strong>{" "}
                    {q.explanationUz}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          2-BO'LIM: FOYDALANUVCHILAR RO'YXATI
          ==================================================================== */}
      {activeTab === "users" && (
        <div id="admin-users-table" className="glass-card p-6">
          <h2 className="border-b border-border pb-3 text-lg font-extrabold text-fg">
            Ro&apos;yxatdan O&apos;tgan O&apos;quvchilar ({data.users.length})
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.users.map((u) => (
              <div
                key={u.id}
                className="rounded-2xl border border-border bg-surface p-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-fg">{u.name}</span>
                  <span className="rounded-md bg-gold-soft px-2 py-0.5 font-bold text-gold">
                    {u.honorific}
                  </span>
                </div>
                <p className="mt-1 text-fg-muted">
                  {u.region} • {u.grade}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 font-mono">
                  <span className="font-bold text-neon">{u.xpTotal} XP</span>
                  <Link
                    href={`/guardian?code=${u.guardianShareCode}`}
                    className="text-gold hover:underline"
                  >
                    Ota-ona kodi: {u.guardianShareCode.slice(0, 8)} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
          3-BO'LIM: DARSLAR VA KONTENT RO'YXATI
          ==================================================================== */}
      {activeTab === "lessons" && (
        <div id="admin-lessons-list" className="glass-card p-6">
          <h2 className="border-b border-border pb-3 text-lg font-extrabold text-fg">
            Platforma Darslari va Modullari ({data.lessons.length})
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.lessons.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 text-xs"
              >
                <div>
                  <span className="font-bold text-neon">{l.subjectNameUz}</span>
                  <h3 className="mt-1 font-extrabold text-fg">{l.titleUz}</h3>
                  <p className="mt-0.5 text-fg-muted">
                    {l.estMinutes} daqiqa • +{l.xpReward} XP
                  </p>
                </div>
                <Link
                  href={`/learn/${l.slug}`}
                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-elevated px-3 py-2 font-bold text-fg hover:border-neon"
                >
                  <Sparkles className="h-3.5 w-3.5 text-neon" />
                  <span>Ochish</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
