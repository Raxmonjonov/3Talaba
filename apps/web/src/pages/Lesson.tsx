import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type {
  CompleteLessonResponse,
  LessonDetail,
  LessonNote,
  PracticeAnswerResponse,
  ServedQuestion,
} from "../lib/types";
import { AppShell } from "@/components/AppShell";
import { QuestionBody } from "@/components/QuestionBody";
import { VerdictPanel } from "@/components/VerdictPanel";

const KIND_LABELS: Record<string, string> = {
  theory: "Nazariya",
  example: "Misol",
  practice: "Amaliyot",
  review: "Takrorlash",
  quiz: "Test",
};

export default function LessonPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeInfo, setCompleteInfo] = useState<{
    alreadyDone: boolean;
    xpAwarded: number;
    xpTotal: number;
  } | null>(null);
  const [nextSlug, setNextSlug] = useState<string | null>(null);
  const [nextTitle, setNextTitle] = useState<string | null>(null);
  // Pretesting: a single question answered *before* studying the lesson.
  const [pretestOpen, setPretestOpen] = useState(false);
  const [pretestLoading, setPretestLoading] = useState(false);
  const [pretestQuestion, setPretestQuestion] = useState<ServedQuestion | null>(
    null
  );
  const [pretestGiven, setPretestGiven] = useState("");
  const [pretestSubmitting, setPretestSubmitting] = useState(false);
  const [pretestVerdict, setPretestVerdict] = useState<"correct" | "wrong" | null>(
    null
  );
  const [pretestFeedback, setPretestFeedback] = useState<{
    explanation?: string;
    expected?: string;
  } | null>(null);
  const [pretestError, setPretestError] = useState("");
  // "Konspekt" — a short summary the student writes in their own words.
  const [noteBody, setNoteBody] = useState("");
  const [noteLoadedSlug, setNoteLoadedSlug] = useState<string | null>(null);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteError, setNoteError] = useState("");
  const noteLoaded = noteLoadedSlug === slug;
  // "Yoddan eslash" — read, cover, recall, check (active recall on lesson text).
  const [recallMode, setRecallMode] = useState(false);
  const [revealedBlocks, setRevealedBlocks] = useState<Set<number>>(new Set());

  function toggleRecallMode() {
    setRecallMode((v) => !v);
    setRevealedBlocks(new Set());
  }

  function revealBlock(index: number) {
    setRevealedBlocks((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<LessonDetail>(`/api/content/lessons/${slug}`);
      setLesson(data);
      setNextSlug(data.nextLessonSlug ?? null);
      setNextTitle(data.nextLessonTitle ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dars topilmadi");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    load().catch(() => {
      if (!cancelled) setError("Dars topilmadi");
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    api<{ note: LessonNote | null }>(`/api/content/lessons/${slug}/note`)
      .then((data) => {
        if (cancelled) return;
        setNoteBody(data.note?.body ?? "");
        setNoteLoadedSlug(slug);
      })
      .catch(() => {
        if (!cancelled) setNoteLoadedSlug(slug);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function openInTutor() {
    setStarted(true);
    try {
      const session = await api<{ id: string }>("/api/chat/start", {
        method: "POST",
        body: JSON.stringify({ lessonSlug: lesson?.slug }),
      });
      navigate(`/study/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Darsni ochib bo'lmadi");
      setStarted(false);
    }
  }

  /** Loads one pretest question from the lesson's first topic. */
  async function startPretest() {
    if (pretestQuestion || pretestLoading) return;
    const skill = lesson?.skills?.[0];
    if (!skill) return;
    setPretestLoading(true);
    setPretestError("");
    try {
      const data = await api<{ question: ServedQuestion | null }>(
        `/api/content/practice/next?skill=${encodeURIComponent(skill)}`
      );
      if (!data.question) {
        setPretestError("Bu mavzu uchun hozircha savol topilmadi.");
        return;
      }
      setPretestQuestion(data.question);
      setPretestOpen(true);
    } catch (err) {
      setPretestError(err instanceof Error ? err.message : "Savol yuklanmadi");
    } finally {
      setPretestLoading(false);
    }
  }

  async function answerPretest(given: string) {
    if (!pretestQuestion || pretestSubmitting || pretestVerdict) return;
    setPretestSubmitting(true);
    setPretestError("");
    try {
      const data = await api<PracticeAnswerResponse>(
        "/api/content/practice/answer",
        {
          method: "POST",
          body: JSON.stringify({ questionId: pretestQuestion.id, given }),
        }
      );
      setPretestVerdict(data.correct ? "correct" : "wrong");
      setPretestFeedback({
        explanation: data.explanation,
        expected: data.expected,
      });
    } catch (err) {
      setPretestError(err instanceof Error ? err.message : "Javob yuborilmadi");
    } finally {
      setPretestSubmitting(false);
    }
  }

  async function saveLessonNote() {
    if (noteSaving) return;
    setNoteSaving(true);
    setNoteError("");
    try {
      const data = await api<{ note: LessonNote }>(
        `/api/content/lessons/${slug}/note`,
        { method: "PUT", body: JSON.stringify({ body: noteBody }) }
      );
      setNoteBody(data.note.body);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : "Saqlanmadi");
    } finally {
      setNoteSaving(false);
    }
  }

  async function markComplete() {
    if (!lesson || completing) return;
    setCompleting(true);
    try {
      const data = await api<CompleteLessonResponse>(
        `/api/content/lessons/${lesson.slug}/complete`,
        { method: "POST" }
      );
      setCompleteInfo({
        alreadyDone: data.alreadyDone,
        xpAwarded: data.xpAwarded,
        xpTotal: data.xpTotal,
      });
      setLesson((prev) =>
        prev ? { ...prev, completed: true, completedAt: new Date().toISOString() } : prev
      );
      try {
        const refreshed = await api<LessonDetail>(
          `/api/content/lessons/${lesson.slug}`
        );
        setNextSlug(refreshed.nextLessonSlug ?? null);
        setNextTitle(refreshed.nextLessonTitle ?? null);
      } catch {
        /* next-lesson CTA is optional after completion */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Darsni yakunlab bo'lmadi");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <AppShell
      title={loading ? "Yuklanmoqda…" : (lesson?.title ?? "Dars")}
      subtitle={
        lesson
          ? `Daraja ${lesson.levelRange} · ~${lesson.estMinutes} daq`
          : undefined
      }
      backTo={lesson ? `/courses/${lesson.courseSlug}` : "/courses"}
      backLabel="Kursga qaytish"
    >
        {error ? (
          <p className="alert-error">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-secondary" aria-hidden="true" />
        ) : lesson ? (
          <>
            <section className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
              <p className="text-sm text-muted-foreground">{lesson.summary}</p>
              {lesson.objectives.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {lesson.objectives.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              ) : null}
              {lesson.skills && lesson.skills.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">Mavzular:</span>
                  {lesson.skills.map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        navigate(`/practice?skill=${encodeURIComponent(s)}`)
                      }
                      className="rounded-full border bg-background px-2.5 py-0.5 text-xs hover:bg-secondary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={openInTutor}
                  disabled={started}
                  className="btn-secondary"
                >
                  {started ? "Tayyorlanmoqda…" : "Tutordan boshlash"}
                </button>
                {lesson.completed ? (
                  <span
                    role="status"
                    className="inline-flex items-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                  >
                    Yakunlandi · +{lesson.xpReward} XP
                  </span>
                ) : (
                  <button
                    onClick={markComplete}
                    disabled={completing}
                    className="btn-primary"
                  >
                    {completing ? "Saqlanmoqda…" : "Darsni yakunladim"}
                  </button>
                )}
              </div>
              {completeInfo ? (
                <p role="status" className="text-sm text-muted-foreground">
                  {completeInfo.alreadyDone
                    ? "Bu dars oldin yakunlangan edi."
                    : `+${completeInfo.xpAwarded} XP · jami ${completeInfo.xpTotal} XP`}
                </p>
              ) : null}
              {lesson.completed && (lesson.skills?.length ?? 0) > 0 ? (
                <div className="pt-1">
                  <button
                    onClick={() =>
                      navigate(
                        `/practice?skills=${encodeURIComponent((lesson.skills ?? []).join(","))}`
                      )
                    }
                    className="btn-secondary"
                  >
                    Bu dars mavzulari bo‘yicha mashq
                  </button>
                </div>
              ) : null}
              {lesson.completed && nextSlug && nextTitle ? (
                <div className="pt-1">
                  <button
                    onClick={() => navigate(`/lessons/${nextSlug}`)}
                    className="btn-secondary"
                  >
                    Keyingi dars: {nextTitle}
                  </button>
                </div>
              ) : null}
            </section>

            {!lesson.completed && (lesson.skills?.length ?? 0) > 0 ? (
              <section className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold">Avval sinab ko‘ring</h2>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                    Pretesting
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Darsni o‘qishdan oldin bitta savolga javob bering. Xato qilsangiz
                  ham foydali — materialdan oldin urinish uni yaxshiroq eslab
                  qolishga yordam beradi (pretesting effekti).
                </p>
                {!pretestOpen ? (
                  <button
                    onClick={startPretest}
                    disabled={pretestLoading}
                    className="btn-secondary"
                  >
                    {pretestLoading ? "Yuklanmoqda…" : "Savolni ko‘rsatish"}
                  </button>
                ) : pretestQuestion ? (
                  <div className="space-y-4">
                    <QuestionBody
                      question={pretestQuestion}
                      value={pretestGiven}
                      onChange={setPretestGiven}
                      disabled={pretestSubmitting || Boolean(pretestVerdict)}
                      onChoose={answerPretest}
                    />
                    {pretestVerdict ? (
                      <VerdictPanel
                        verdict={pretestVerdict}
                        feedback={pretestFeedback}
                      />
                    ) : null}
                    {pretestVerdict ? (
                      <button
                        onClick={() => setPretestOpen(false)}
                        className="btn-secondary"
                      >
                        Darsni o‘qishga o‘tish
                      </button>
                    ) : null}
                  </div>
                ) : null}
                {pretestError ? (
                  <p className="text-sm text-red-700">{pretestError}</p>
                ) : null}
              </section>
            ) : null}

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {recallMode
                    ? "Har bir bo‘lim matni yashirilgan: avval yoddan aytib ko‘ring, so‘ng “Ko‘rsatish” bilan tekshiring."
                    : "O‘qib chiqqach, matnni yopib eslashni mashq qilishingiz mumkin."}
                </p>
                <button
                  onClick={toggleRecallMode}
                  className={`text-sm underline underline-offset-4 ${
                    recallMode ? "text-primary" : "text-muted-foreground"
                  }`}
                  title="O‘qib, yopib, yoddan aytib, tekshirish usuli (read, cover, recall, check)"
                >
                  Yoddan eslash: {recallMode ? "yoqilgan" : "o‘chiq"}
                </button>
              </div>
              {lesson.blocks.map((block, i) => {
                const hidden = recallMode && !revealedBlocks.has(i);
                return (
                  <article
                    key={`${block.kind}-${i}`}
                    className="rounded-2xl border bg-card p-5 shadow-sm space-y-2"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">
                        {KIND_LABELS[block.kind] ?? block.kind}
                      </span>
                      <span className="text-muted-foreground">
                        {block.minMinutes} daqiqa
                      </span>
                    </div>
                    <h2 className="text-base font-semibold">{block.title}</h2>
                    {hidden ? (
                      <div className="space-y-2">
                        <p className="text-sm italic text-muted-foreground">
                          Matn yashirilgan — mazmunini yoddan ayting, keyin
                          tekshiring.
                        </p>
                        <button
                          onClick={() => revealBlock(i)}
                          className="btn-secondary text-sm"
                        >
                          Ko‘rsatish
                        </button>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                        {block.content}
                      </p>
                    )}
                  </article>
                );
              })}
            </section>

            <section className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">Konspekt</h2>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                  Xulosa
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Darsni o‘qib bo‘lgach, asosiy fikrni o‘z so‘zlaringiz bilan qisqa
                yozib qo‘ying. O‘z so‘zingiz bilan xulosa qilish mavzuni eslab
                qolishni kuchaytiradi (summarization). Bu yozuv faqat sizga
                ko‘rinadi.
              </p>
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                disabled={!noteLoaded || noteSaving}
                placeholder="Masalan: bu darsda ... ni o‘rgandim. Asosiy qoida — ... ."
                className="field min-h-[120px] resize-y"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={saveLessonNote}
                  disabled={!noteLoaded || noteSaving}
                  className="btn-secondary"
                >
                  {noteSaving ? "Saqlanmoqda…" : "Konspektni saqlash"}
                </button>
                {noteSaved ? (
                  <span role="status" className="text-sm text-muted-foreground">
                    Saqlandi
                  </span>
                ) : null}
                {noteError ? (
                  <span className="text-sm text-red-700">{noteError}</span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Eslatma: maydonni bo‘shatib saqlasangiz, konspekt o‘chiriladi.
              </p>
            </section>
          </>
        ) : null}
    </AppShell>
  );
}
