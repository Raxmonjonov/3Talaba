"use client";

import { useState } from "react";
import { ArrowRight, Brain, CheckCircle2, XCircle, Zap } from "lucide-react";
import { JarvisVoiceButton } from "@/components/voice/JarvisVoiceAgent";
import { BRAND, SECTION_IDS } from "@/lib/site-config";

type OptionId = "A" | "B" | "C" | "D";

interface QuickQuizQuestion {
  id: string;
  subject: string;
  prompt: string;
  options: { id: OptionId; text: string }[];
  correct: OptionId;
  /** Talaba AI tomonidan ko'rsatiladigan qisqa yechim qadamlari */
  solution: string[];
}

const QUIZ_QUESTIONS: QuickQuizQuestion[] = [
  {
    id: "q-1",
    subject: "Digital SAT Matematika",
    prompt: "Agar 3x + 7 = 22 bo'lsa, 6x + 5 nechiga teng?",
    options: [
      { id: "A", text: "30" },
      { id: "B", text: "35" },
      { id: "C", text: "25" },
      { id: "D", text: "40" },
    ],
    correct: "B",
    solution: ["3x = 15", "6x = 30", "30 + 5 = 35"],
  },
  {
    id: "q-2",
    subject: "Geometriya (Pifagor)",
    prompt: "To'g'ri burchakli uchburchakning katetlari 9 va 12 ga teng. Gipotenuzani toping:",
    options: [
      { id: "A", text: "14" },
      { id: "B", text: "15" },
      { id: "C", text: "16" },
      { id: "D", text: "18" },
    ],
    correct: "B",
    solution: ["9² + 12² = 81 + 144", "c² = 225", "c = 15"],
  },
  {
    id: "q-3",
    subject: "SAT Reading & Writing",
    prompt: "Qaysi bog'lovchi ikki qarama-qarshi fikrni bog'lash uchun to'g'ri ishlatiladi?",
    options: [
      { id: "A", text: "Furthermore" },
      { id: "B", text: "Consequently" },
      { id: "C", text: "However" },
      { id: "D", text: "Moreover" },
    ],
    correct: "C",
    solution: ["However = ammo, biroq", "Ziddiyatni ifodalaydi", "Furthermore/Moreover fikrni kuchaytiradi"],
  },
];

export function DailyPracticeSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [chosen, setChosen] = useState<OptionId | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const question = QUIZ_QUESTIONS[activeIdx];
  const answered = chosen !== null;
  const isCorrectAnswer = chosen === question.correct;
  const correctOption = question.options.find((opt) => opt.id === question.correct);

  const handleChoose = (optionId: OptionId) => {
    if (answered) return;
    setChosen(optionId);
    if (optionId === question.correct) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setChosen(null);
    setActiveIdx((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
  };

  return (
    <section
      id={SECTION_IDS.practice}
      className="glass-card scroll-mt-28 p-6 sm:p-8"
      aria-labelledby="practice-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Zap className="h-4 w-4 text-emerald-400" /> KUNLIK TEZKOR MASHQ
          </span>
          <h2 id="practice-title" className="mt-1 text-xl font-black text-white sm:text-2xl">
            {question.subject}: Bilimingizni sinab ko&apos;ring
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <JarvisVoiceButton
            text={`${question.prompt}. Variantlar: ${question.options.map((o) => `${o.id}: ${o.text}`).join(". ")}`}
            label="Savolni tinglash"
          />
          <span className="glass-pill rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-amber-300">
            Savol {activeIdx + 1} / {QUIZ_QUESTIONS.length}
          </span>
          <span className="glass-pill rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-emerald-300">
            ✓ {correctCount}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <p className="text-lg font-bold text-white sm:text-xl">{question.prompt}</p>

        <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Javob variantlari">
          {question.options.map((opt) => {
            const isChosen = chosen === opt.id;
            const isCorrect = opt.id === question.correct;

            let optionClass =
              "border-white/15 bg-white/5 text-white hover:border-emerald-400/50 hover:bg-white/10";
            if (answered) {
              if (isCorrect) {
                optionClass =
                  "border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_20px_rgba(198,244,50,0.3)]";
              } else if (isChosen) {
                optionClass = "border-red-400 bg-red-500/20 text-red-300";
              } else {
                optionClass = "border-white/5 bg-white/[0.02] text-slate-400 opacity-60";
              }
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={answered}
                aria-pressed={isChosen}
                onClick={() => handleChoose(opt.id)}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all disabled:cursor-default ${optionClass}`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 font-mono text-xs font-extrabold text-emerald-400">
                  {opt.id}
                </span>
                <span className="text-base font-semibold">{opt.text}</span>
                {answered && isCorrect && <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-400" />}
                {answered && isChosen && !isCorrect && <XCircle className="ml-auto h-5 w-5 text-red-400" />}
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            aria-live="polite"
            className={`mt-4 space-y-4 rounded-2xl border p-4 backdrop-blur-xl sm:p-5 ${
              isCorrectAnswer ? "border-emerald-400/40 bg-emerald-500/10" : "border-red-400/40 bg-red-500/10"
            }`}
          >
            <div className="flex items-center gap-2">
              {isCorrectAnswer ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-extrabold text-emerald-300">To&apos;g&apos;ri! Ajoyib natija.</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-400" />
                  <span className="text-sm font-extrabold text-red-300">
                    Noto&apos;g&apos;ri. To&apos;g&apos;ri javob: {question.correct}) {correctOption?.text}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Brain className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-white">{BRAND.aiName} yechimi</span>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm text-slate-200">
                  {question.solution.map((step, idx) => (
                    <span key={step} className="inline-flex items-center gap-2">
                      {idx > 0 && <ArrowRight className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />}
                      <span>{step}</span>
                    </span>
                  ))}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleNext}
                className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
              >
                <span>Keyingi savol</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
