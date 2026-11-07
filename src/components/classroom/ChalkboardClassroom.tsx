"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eraser,
  Pause,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Volume2,
  X,
} from "lucide-react";
import type { ChalkboardSlideData } from "@/lib/learning/chalkboard-builder";
import {
  explainFormulaSimply,
  useLearningAdaptation,
} from "@/lib/learning/easy-adaptation";
import { jarvisVoice } from "@/lib/voice/jarvis-speech";
import { JarvisMicButton } from "@/components/voice/JarvisVoiceAgent";

export type ChalkZoneIndex = 0 | 1 | 2 | 3;

interface ChalkboardClassroomProps {
  /** Hozirgi faol doska mavzusi */
  slide: ChalkboardSlideData;
  /** Agar bir nechta mavzular bo'lsa, faqat doskadagi mavzuni joyida almashtirish uchun */
  availableSlides?: ChalkboardSlideData[];
  onSelectSlide?: (slideId: string) => void;
  honorific?: string;
  lessonSlug?: string;
  onProceedNext?: () => void;
  proceedLabel?: string;
}

/**
 * Ustozning o'ng qo'li qaysi doska hududiga ishora qilish burchaklari (gradusda)
 */
const ARM_POINT_ANGLES: Record<ChalkZoneIndex, number> = {
  0: -32, // Yuqori formula qismiga ishora
  1: -14, // Chap-o'rta asosiy tushunchaga ishora
  2: -6,  // O'ng oltin qoidaga ishora
  3: 8,   // Pastki kursiv xossalarga ishora
};

export function ChalkboardClassroom({
  slide,
  availableSlides,
  onSelectSlide,
  honorific = "Bo'lajak Talaba",
  lessonSlug,
  onProceedNext,
  proceedLabel = "2-Bosqich: Namunaviy Misollarga O'tish",
}: ChalkboardClassroomProps) {
  const { pace, setPace, activeOption, options } = useLearningAdaptation();

  // Doska animatsiyasi holatlari
  const [isErasing, setIsErasing] = useState(false);
  const [revealedStep, setRevealedStep] = useState<number>(4); // 1..4 qancha qism yozilgani
  const [activeZone, setActiveZone] = useState<ChalkZoneIndex>(0);
  const [isAutoTeaching, setIsAutoTeaching] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liveSubtitle, setLiveSubtitle] = useState<string>("");

  // AI Ustozga jonli savol-javob holati (doskada bo'r bilan javob ko'rsatadi)
  const [studentQuestion, setStudentQuestion] = useState("");
  const [askingAi, setAskingAi] = useState(false);
  const [boardAiAnswer, setBoardAiAnswer] = useState<string | null>(null);

  const prevSlideIdRef = useRef<string>(slide.id);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const autoTeachAbortRef = useRef<boolean>(false);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Jarvis ovoz dvigatelini kuzatish (og'iz qimirlashi va ovoz to'lqini uchun)
  useEffect(() => {
    return jarvisVoice.subscribe((s) => {
      setIsSpeaking(s.isSpeaking && !s.isPaused);
    });
  }, []);

  useEffect(() => {
    return () => {
      autoTeachAbortRef.current = true;
      clearAllTimers();
      jarvisVoice.stop();
    };
  }, [clearAllTimers]);

  // Bo'r bilan ketma-ket yozilish animatsiyasi
  const runChalkWriteSequence = useCallback(
    (withEraserSweep: boolean) => {
      autoTeachAbortRef.current = true;
      setIsAutoTeaching(false);
      jarvisVoice.stop();
      clearAllTimers();
      setBoardAiAnswer(null);

      const startWriting = () => {
        setIsErasing(false);
        setRevealedStep(1);
        setActiveZone(0);
        setLiveSubtitle(slide.teacherNarration[pace][0]);

        const t1 = setTimeout(() => {
          setRevealedStep(2);
          setActiveZone(1);
        }, 420);
        const t2 = setTimeout(() => {
          setRevealedStep(3);
          setActiveZone(2);
        }, 860);
        const t3 = setTimeout(() => {
          setRevealedStep(4);
          setActiveZone(0);
        }, 1300);

        timersRef.current.push(t1, t2, t3);
      };

      if (withEraserSweep) {
        setIsErasing(true);
        const eraseTimer = setTimeout(startWriting, 480);
        timersRef.current.push(eraseTimer);
      } else {
        startWriting();
      }
    },
    [clearAllTimers, pace, slide.teacherNarration]
  );

  // Mavzu o'zgarganda: faqat doska o'chirg'ich bilan tozalanib, yangi mavzu yoziladi!
  useEffect(() => {
    const changed = prevSlideIdRef.current !== slide.id;
    prevSlideIdRef.current = slide.id;
    runChalkWriteSequence(changed);
  }, [slide.id, runChalkWriteSequence]);

  // Daraja (SODDA / STANDART / TEZKOR) o'zgarganda subtitrni moslash
  useEffect(() => {
    if (!boardAiAnswer) {
      setLiveSubtitle(slide.teacherNarration[pace][activeZone]);
    }
  }, [pace, activeZone, slide.teacherNarration, boardAiAnswer]);

  // Bitta qismni ovozli va ko'rsatkich qo'l bilan tushuntirish
  const explainSingleZone = useCallback(
    (zone: ChalkZoneIndex) => {
      autoTeachAbortRef.current = true;
      setIsAutoTeaching(false);
      clearAllTimers();
      setBoardAiAnswer(null);
      setRevealedStep(4);
      setActiveZone(zone);

      const script = slide.teacherNarration[pace][zone];
      setLiveSubtitle(script);
      setIsSpeaking(true);

      const hasSynth =
        typeof window !== "undefined" && "speechSynthesis" in window;
      if (hasSynth) {
        jarvisVoice.speak(script, () => {
          setIsSpeaking(false);
        });
      } else {
        const fallbackTimer = setTimeout(() => setIsSpeaking(false), 4500);
        timersRef.current.push(fallbackTimer);
      }
    },
    [clearAllTimers, pace, slide.teacherNarration]
  );

  // To'liq 4 bosqichli avtomatik AI Ustoz darsi (yozadi + qo'li bilan ko'rsatadi + ovozda tushuntiradi)
  const startAutoLecture = useCallback(() => {
    clearAllTimers();
    jarvisVoice.stop();
    autoTeachAbortRef.current = false;
    setBoardAiAnswer(null);
    setIsAutoTeaching(true);
    setRevealedStep(1);

    const playStep = (stepIdx: ChalkZoneIndex) => {
      if (autoTeachAbortRef.current) return;
      setRevealedStep(stepIdx + 1);
      setActiveZone(stepIdx);
      const text = slide.teacherNarration[pace][stepIdx];
      setLiveSubtitle(text);
      setIsSpeaking(true);

      const advance = () => {
        if (autoTeachAbortRef.current) return;
        if (stepIdx < 3) {
          const nextTimer = setTimeout(
            () => playStep((stepIdx + 1) as ChalkZoneIndex),
            450
          );
          timersRef.current.push(nextTimer);
        } else {
          setIsSpeaking(false);
          setIsAutoTeaching(false);
        }
      };

      const hasSynth =
        typeof window !== "undefined" && "speechSynthesis" in window;
      if (hasSynth) {
        // Agar brauzerda TTS ovoz kechiksa ham osilib qolmasligi uchun zaxira taymer
        const estDurationMs = Math.min(14000, Math.max(4200, text.length * 68));
        let advanced = false;
        const safeAdvance = () => {
          if (advanced) return;
          advanced = true;
          advance();
        };
        const safetyTimer = setTimeout(safeAdvance, estDurationMs);
        timersRef.current.push(safetyTimer);
        jarvisVoice.speak(text, safeAdvance);
      } else {
        const simTimer = setTimeout(
          advance,
          Math.min(7000, Math.max(3200, text.length * 45))
        );
        timersRef.current.push(simTimer);
      }
    };

    playStep(0);
  }, [clearAllTimers, pace, slide.teacherNarration]);

  const stopLecture = useCallback(() => {
    autoTeachAbortRef.current = true;
    clearAllTimers();
    jarvisVoice.stop();
    setIsAutoTeaching(false);
    setIsSpeaking(false);
    setRevealedStep(4);
  }, [clearAllTimers]);

  // AI Ustozga savol berish — javobni doskaga yozib va ovozda tushuntirib beradi
  const handleAskTeacher = async (presetPrompt?: string) => {
    const raw = (presetPrompt ?? studentQuestion).trim();
    if (!raw || askingAi) return;

    stopLecture();
    if (!presetPrompt) setStudentQuestion("");
    setAskingAi(true);
    setActiveZone(0);
    setLiveSubtitle("Doskaga yechim va tushuntirishni yozyapman...");

    const modeForPace =
      pace === "TEZKOR"
        ? "FAST_SOLUTION"
        : pace === "SODDA"
          ? "STEP_BY_STEP"
          : "SOCRATIC_TUTOR";

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${activeOption.aiPromptPrefix}[Doskadagi mavzu: ${slide.topicTitle}]. O'quvchi savoli: ${raw}`,
          mode: modeForPace,
          lessonSlug,
        }),
      });

      let cleanReply = "";
      if (res.ok) {
        const payload = (await res.json()) as {
          assistantMessage?: { content?: string };
        };
        cleanReply = (payload.assistantMessage?.content ?? "")
          .replace(/[\*\#`]/g, "")
          .replace(/\$\$(.*?)\$\$/g, "$1")
          .replace(/\$(.*?)\$/g, "$1")
          .trim();
      }

      if (!cleanReply) {
        cleanReply = `${honorific}, «${slide.topicTitle}» mavzusida eng muhim nuqta: ${slide.teacherNarration[pace][1]} ${slide.teacherNarration[pace][2]}`;
      }

      setBoardAiAnswer(cleanReply);
      setLiveSubtitle(cleanReply.slice(0, 220) + (cleanReply.length > 220 ? "..." : ""));
      setIsSpeaking(true);
      jarvisVoice.speak(cleanReply, () => setIsSpeaking(false));
    } catch {
      const fallback = `${honorific}, keling buni doskada sodda qilib ko'ramiz: ${slide.teacherNarration.SODDA[1]}`;
      setBoardAiAnswer(fallback);
      setLiveSubtitle(fallback);
      setIsSpeaking(true);
      jarvisVoice.speak(fallback, () => setIsSpeaking(false));
    } finally {
      setAskingAi(false);
    }
  };

  // Mavzular ro'yxatida oldingi / keyingi mavzuga o'tish
  const currentSlideIdx = useMemo(() => {
    if (!availableSlides?.length) return -1;
    return availableSlides.findIndex((s) => s.id === slide.id);
  }, [availableSlides, slide.id]);

  const canSwitchSlides = Boolean(
    availableSlides && availableSlides.length > 1 && onSelectSlide
  );

  const goPrevSlide = () => {
    if (!canSwitchSlides || !availableSlides || !onSelectSlide) return;
    const prevIdx =
      (currentSlideIdx - 1 + availableSlides.length) % availableSlides.length;
    onSelectSlide(availableSlides[prevIdx]!.id);
  };

  const goNextSlide = () => {
    if (!canSwitchSlides || !availableSlides || !onSelectSlide) return;
    const nextIdx = (currentSlideIdx + 1) % availableSlides.length;
    onSelectSlide(availableSlides[nextIdx]!.id);
  };

  const armAngle = ARM_POINT_ANGLES[activeZone];

  return (
    <div className="space-y-4">
      {/* ====================================================================
          YUQORI BOSHQARUV PANELI: Mavzu almashtirgich + Daraja + Jonli Ustoz
          ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c6f432]/35 bg-[#0b0b0c] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#c6f432] px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#0b0b0c]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Jonli Doska &amp; AI Ustoz</span>
          </span>

          {/* Faqat doskadagi mavzuni joyida almashtirish */}
          {canSwitchSlides && availableSlides && onSelectSlide && (
            <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] p-1">
              <button
                type="button"
                onClick={goPrevSlide}
                title="Oldingi mavzu"
                className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-[#c6f432] hover:text-[#0b0b0c]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <select
                aria-label="Doskadagi mavzuni tanlash"
                value={slide.id}
                onChange={(e) => onSelectSlide(e.target.value)}
                className="max-w-[210px] sm:max-w-[290px] truncate bg-[#0b0b0c] px-2.5 py-1 text-xs font-extrabold text-white outline-none cursor-pointer"
              >
                {availableSlides.map((s, idx) => (
                  <option key={s.id} value={s.id} className="bg-[#0b0b0c] text-white">
                    {idx + 1}. {s.topicTitle} ({s.subjectBadge})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={goNextSlide}
                title="Keyingi mavzu"
                className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-[#c6f432] hover:text-[#0b0b0c]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Tushuntirish uslubi (0 dan Sodda / Bosqichma-Bosqich / 10 Soniyalik) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] p-1">
            {options.map((opt) => {
              const active = pace === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPace(opt.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition-all ${
                    active
                      ? "bg-[#c6f432] text-[#0b0b0c]"
                      : "text-white/75 hover:text-white"
                  }`}
                >
                  {opt.title}
                </button>
              );
            })}
          </div>

          {isAutoTeaching || isSpeaking ? (
            <button
              type="button"
              onClick={stopLecture}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#c6f432] bg-[#c6f432]/20 px-3.5 py-2 text-xs font-extrabold text-[#c6f432] transition-all hover:bg-[#c6f432] hover:text-[#0b0b0c]"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>To&apos;xtatish</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startAutoLecture}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#c6f432] px-4 py-2 text-xs font-black text-[#0b0b0c] shadow-[0_0_22px_rgba(198,244,50,0.4)] transition-transform hover:scale-[1.02]"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>AI Ustoz Tushuntirsin</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => runChalkWriteSequence(true)}
            title="Doskani o'chirib qayta bo'r bilan yozish"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/85 transition-all hover:border-[#c6f432] hover:text-[#c6f432]"
          >
            <Eraser className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Qayta yozish</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          ASOSIY SINFXONA SAHNASI: Yog'och ramkali yashil doska + AI Ustoz + Bo'r
          ==================================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-[#050506] via-[#0b0b0c] to-[#11192c] p-3 sm:p-5 lg:p-7 shadow-[0_28px_70px_rgba(0,0,0,0.85)]">
        {/* Sinfxona sahnasi konteyneri */}
        <div className="relative mx-auto w-full max-w-[1260px] pl-0 sm:pl-14 lg:pl-20 pb-6 sm:pb-4">
          {/* YOG'OCH RAMKALI YASHIL SINF DOSKASI */}
          <div
            className="relative min-h-[540px] sm:min-h-[570px] lg:min-h-[600px] rounded-[6px] border-[12px] sm:border-[18px] border-[#d1870c] shadow-[inset_0_4px_26px_rgba(0,0,0,0.65),0_20px_50px_rgba(0,0,0,0.75)]"
            style={{
              background:
                "radial-gradient(ellipse at 52% 42%, #1d4a10 0%, #163a0b 58%, #102b08 100%)",
            }}
          >
            {/* Bo'r changi teksturasi */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.22) 1px, transparent 0), radial-gradient(rgba(255,255,255,0.12) 1px, transparent 0)",
                backgroundSize: "34px 34px, 19px 19px",
                backgroundPosition: "0 0, 11px 15px",
              }}
            />

            {/* Mavzu almashganda harakatlanuvchi Doska O'chirg'ich (Wipe animatsiyasi) */}
            {isErasing && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[#163a0b]/85 backdrop-blur-[2px] transition-opacity duration-300"
              >
                <div className="flex flex-col items-center gap-3 animate-pulse">
                  <div className="h-12 w-32 rounded-t-xl bg-[#db3b38] border-b-[14px] border-b-[#111111] shadow-2xl -rotate-6" />
                  <span className="font-serif text-sm italic tracking-wide text-white/90">
                    Doska tozalanib, yangi mavzu yozilmoqda...
                  </span>
                </div>
              </div>
            )}

            {/* DOSKADAGI YOZUVLAR MAYDONI */}
            <div
              className={`relative z-10 flex h-full min-h-[515px] sm:min-h-[534px] flex-col justify-between p-5 sm:p-8 lg:px-12 lg:py-9 text-[#f7faf5] transition-opacity duration-300 ${
                isErasing ? "opacity-0" : "opacity-100"
              }`}
            >
              {/* 1-BLOK: MAVZU SARLAVHASI VA ASOSIY FORMULALAR */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => explainSingleZone(0)}
                onKeyDown={(e) => e.key === "Enter" && explainSingleZone(0)}
                title="Bosib AI Ustozdan shu formulani tinglang"
                className={`cursor-pointer rounded-xl p-2 transition-all duration-500 ${
                  revealedStep >= 1
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0"
                } ${
                  activeZone === 0
                    ? "ring-1 ring-[#c6f432]/60 bg-white/[0.04]"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-serif text-xl sm:text-3xl lg:text-[34px] leading-snug tracking-tight text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
                    <span className="font-normal text-white/95">mavzu :</span>
                    <span className="font-bold">{slide.topicTitle}</span>
                  </h2>
                  <span className="rounded-md border border-white/25 bg-black/25 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#c6f432]">
                    {slide.subjectBadge}
                  </span>
                </div>

                {/* Markaziy Bo'r Formulalar */}
                <div className="mt-4 sm:mt-6 sm:pl-14 lg:pl-24 space-y-1.5 text-center sm:text-left">
                  {slide.formulas.map((formula, fIdx) => (
                    <p
                      key={fIdx}
                      className="font-serif text-lg sm:text-2xl lg:text-[27px] font-bold tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                    >
                      {formula}
                    </p>
                  ))}
                  {pace === "SODDA" && slide.formulas[0] && (
                    <p className="pt-1 font-sans text-xs font-semibold text-[#c6f432]">
                      💡 Sodda izoh: {explainFormulaSimply(slide.formulas[0])}
                    </p>
                  )}
                </div>
              </div>

              {/* AGAR O'QUVCHI SAVOL BERGAN BO'LSA — DOSKADA USTOZ JAVOBI */}
              {boardAiAnswer ? (
                <div className="my-4 mx-auto w-full max-w-3xl rounded-2xl border-2 border-dashed border-[#c6f432]/70 bg-[#0f2907]/95 p-5 sm:p-6 shadow-2xl">
                  <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-2.5">
                    <span className="font-serif text-sm sm:text-base font-bold text-[#c6f432]">
                      ✍️ AI Ustozning Doskadagi Tushuntirishi:
                    </span>
                    <button
                      type="button"
                      onClick={() => setBoardAiAnswer(null)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-2.5 py-1 text-xs font-bold text-white/85 hover:border-[#c6f432] hover:text-[#c6f432]"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Asosiy doskaga qaytish</span>
                    </button>
                  </div>
                  <p className="mt-3 whitespace-pre-line font-serif text-sm sm:text-base leading-relaxed text-white">
                    {boardAiAnswer}
                  </p>
                </div>
              ) : (
                <>
                  {/* 2-BLOK (CHAP) VA 3-BLOK (O'NG): ASOSIY QOIDA + OLTIN QOIDA */}
                  <div className="mt-4 grid gap-5 lg:grid-cols-12 lg:items-start">
                    {/* 2-BLOK: Chap-o'rta nazariy tushuncha */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => explainSingleZone(1)}
                      onKeyDown={(e) => e.key === "Enter" && explainSingleZone(1)}
                      title="Bosib AI Ustozdan asosiy qoidani tinglang"
                      className={`cursor-pointer rounded-xl p-3 lg:col-span-7 sm:pl-16 lg:pl-20 transition-all duration-500 ${
                        revealedStep >= 2
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                      } ${
                        activeZone === 1
                          ? "ring-1 ring-[#c6f432]/60 bg-white/[0.05]"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      {slide.leftConcept.paragraphs.map((p, idx) => (
                        <p
                          key={idx}
                          className="text-center font-serif text-xs sm:text-sm lg:text-[15px] font-semibold leading-relaxed text-white/95"
                        >
                          {p}
                        </p>
                      ))}

                      {slide.leftConcept.bullets.length > 0 && (
                        <ul className="mt-2.5 space-y-2 font-serif text-xs sm:text-sm lg:text-[14.5px] leading-relaxed text-white/95">
                          {slide.leftConcept.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2 text-center sm:text-left">
                              <span className="mt-0.5 font-bold text-[#c6f432]">•</span>
                              <span className="flex-1">{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* 3-BLOK: O'ng-o'rta Imtihon Oltin Qoidasi */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => explainSingleZone(2)}
                      onKeyDown={(e) => e.key === "Enter" && explainSingleZone(2)}
                      title="Bosib AI Ustozdan oltin qoidani tinglang"
                      className={`cursor-pointer rounded-xl p-3 lg:col-span-5 lg:mt-16 transition-all duration-500 ${
                        revealedStep >= 3
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                      } ${
                        activeZone === 2
                          ? "ring-1 ring-[#c6f432]/60 bg-white/[0.05]"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      {slide.rightGoldenRule.heading && (
                        <h3 className="text-center font-serif text-xs sm:text-sm lg:text-[15px] font-bold text-[#c6f432] sm:text-white">
                          {slide.rightGoldenRule.heading}
                        </h3>
                      )}
                      {slide.rightGoldenRule.paragraphs.map((p, idx) => (
                        <p
                          key={idx}
                          className="mt-1.5 text-center font-serif text-xs sm:text-[13.5px] leading-relaxed text-white/95"
                        >
                          {p}
                        </p>
                      ))}
                      {slide.rightGoldenRule.bullets.length > 0 && (
                        <ul className="mt-2 space-y-1 font-serif text-xs leading-relaxed text-white/90">
                          {slide.rightGoldenRule.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="text-center">
                              • {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* 4-BLOK: PASTKI MARKAZIY KURSIV QOIDA (Ustoz va O'chirg'ich o'rtasida) */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => explainSingleZone(3)}
                    onKeyDown={(e) => e.key === "Enter" && explainSingleZone(3)}
                    title="Bosib AI Ustozdan yakuniy xossalarni tinglang"
                    className={`mt-5 mb-8 sm:mb-4 sm:px-24 lg:px-36 cursor-pointer rounded-xl p-3 text-center font-serif italic transition-all duration-500 ${
                      revealedStep >= 4
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    } ${
                      activeZone === 3
                        ? "ring-1 ring-[#c6f432]/60 bg-white/[0.05]"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {slide.bottomSpecialRule.heading && (
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        {slide.bottomSpecialRule.heading}
                      </h4>
                    )}
                    {slide.bottomSpecialRule.paragraphs.map((p, idx) => (
                      <p
                        key={idx}
                        className="mt-1 text-xs sm:text-sm leading-relaxed text-white/95"
                      >
                        {p}
                      </p>
                    ))}
                    {slide.bottomSpecialRule.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-1 text-xs sm:text-sm leading-relaxed text-white/95">
                        {slide.bottomSpecialRule.bullets.map((b, idx) => (
                          <li key={idx}>• {b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* O'NG PASTKI DOSKA TOKCHASI: Qizil-Qora O'chirg'ich va 2 ta Oq Bo'r */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-[18px] right-4 sm:right-8 z-20 flex flex-col items-end"
            >
              <div className="flex items-end gap-2 px-3">
                {/* Qizil-qora klassik o'chirg'ich */}
                <div
                  className={`transition-transform duration-500 ${
                    isErasing ? "-translate-y-36 -translate-x-44 -rotate-12 scale-110" : ""
                  }`}
                >
                  <div className="h-5 sm:h-6 w-20 sm:w-24 rounded-t-lg bg-[#db3b38] shadow-md" />
                  <div className="h-3 sm:h-3.5 w-20 sm:w-24 rounded-b-[3px] bg-[#111111]" />
                </div>
                {/* 2 ta oq bo'r */}
                <div className="flex items-end -space-x-2 pb-0.5">
                  <div className="h-2.5 w-11 rounded-full bg-white shadow-sm" />
                  <div className="h-2.5 w-11 origin-left -rotate-[18deg] rounded-full bg-[#f1f5f9] shadow-sm" />
                </div>
              </div>
              {/* Yog'och tokcha va tirgaklar */}
              <div className="h-2.5 w-44 sm:w-52 rounded-sm bg-[#b97409] shadow-md" />
              <div className="flex w-40 sm:w-48 justify-between px-3">
                <div className="h-4 w-2.5 bg-[#9e6206]" />
                <div className="h-4 w-2.5 bg-[#9e6206]" />
              </div>
            </div>
          </div>

          {/* ==================================================================
              CHAP PASTKI BURCHAK: ANIMATSIYALI PROFESSOR AI USTOZ VA KITOBLAR
              ================================================================== */}
          <div className="relative mt-3 sm:mt-0 sm:absolute sm:-bottom-3 sm:left-0 z-30 flex items-end gap-3">
            <button
              type="button"
              onClick={() =>
                isSpeaking || isAutoTeaching ? stopLecture() : startAutoLecture()
              }
              title={
                isSpeaking
                  ? "Ustoz nutqini to'xtatish"
                  : "Bosib AI Ustoz tushuntirishini tinglang"
              }
              className="group relative block w-[150px] sm:w-[185px] lg:w-[210px] shrink-0 select-none text-left focus:outline-none"
            >
              {/* Ovoz to'lqini indikatori (Ustoz gapirayotganda yonadi) */}
              {isSpeaking && (
                <span className="absolute -top-3 left-16 z-30 inline-flex items-center gap-1 rounded-full border border-[#c6f432] bg-[#0b0b0c]/95 px-2.5 py-1 text-[10px] font-extrabold text-[#c6f432] shadow-[0_0_16px_rgba(198,244,50,0.5)]">
                  <Volume2 className="h-3 w-3 animate-pulse" />
                  <span>Tushuntiryapti</span>
                </span>
              )}

              {/* Yuqori detallashgan Animatsiyali Professor AI Ustoz + Kitoblar SVG */}
              <svg
                viewBox="0 0 230 270"
                className="h-auto w-full drop-shadow-[0_14px_24px_rgba(0,0,0,0.85)]"
                aria-label="AI Ustoz"
              >
                <defs>
                  <linearGradient id="blazerGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3c5c86" />
                    <stop offset="100%" stopColor="#233957" />
                  </linearGradient>
                  <linearGradient id="shirtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f7f5ef" />
                    <stop offset="100%" stopColor="#dedad0" />
                  </linearGradient>
                </defs>

                {/* O'ng ko'rsatkich qo'l va oq bo'r (doskadagi faol qismga qarab buriladi!) */}
                <g
                  style={{
                    transformOrigin: "126px 136px",
                    transform: `rotate(${armAngle}deg)`,
                    transition: "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  {/* Kostyum yengi */}
                  <path
                    d="M120 128 L168 106 L177 122 L130 148 Z"
                    fill="url(#blazerGrad)"
                    stroke="#18283e"
                    strokeWidth="2"
                  />
                  {/* Ustoz kafti va ko'rsatkich barmog'i */}
                  <path
                    d="M168 107 C176 101, 188 97, 194 99 C197 101, 193 107, 186 111 C190 113, 188 119, 181 120 L173 121 Z"
                    fill="#eab896"
                    stroke="#9c6b4e"
                    strokeWidth="1.4"
                  />
                  {/* Qo'ldagi oq bo'r */}
                  <rect
                    x="191"
                    y="92"
                    width="15"
                    height="4.2"
                    rx="2"
                    transform="rotate(-24 191 92)"
                    fill="#ffffff"
                  />
                </g>

                {/* Tana va Kostyum (nafas olish harakati bilan) */}
                <g
                  className={
                    isSpeaking ? "animate-[pulse_2.2s_ease-in-out_infinite]" : ""
                  }
                >
                  {/* Shim va kamar */}
                  <path d="M52 222 L126 222 L130 258 L48 258 Z" fill="#2a2927" />
                  <rect x="54" y="216" width="70" height="8" rx="2" fill="#1b1918" />
                  <rect
                    x="86"
                    y="216"
                    width="11"
                    height="8"
                    rx="1.5"
                    fill="none"
                    stroke="#d4af37"
                    strokeWidth="2"
                  />

                  {/* Oq ko'ylak */}
                  <path
                    d="M62 114 L116 114 L120 218 L58 218 Z"
                    fill="url(#shirtGrad)"
                  />
                  <line
                    x1="91"
                    y1="126"
                    x2="91"
                    y2="216"
                    stroke="#cbc6ba"
                    strokeWidth="1.5"
                  />

                  {/* Ko'k-kulrang klassik pidjak */}
                  <path
                    d="M58 114 L34 162 L44 232 L72 226 L75 130 Z"
                    fill="url(#blazerGrad)"
                    stroke="#1b2c44"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M116 114 L138 148 L132 226 L108 224 L104 130 Z"
                    fill="url(#blazerGrad)"
                    stroke="#1b2c44"
                    strokeWidth="1.8"
                  />
                  {/* Pidjak yoqasi (lapels) */}
                  <path d="M74 112 L62 154 L76 158 Z" fill="#243a59" />
                  <path d="M104 112 L115 154 L102 158 Z" fill="#243a59" />

                  {/* Chap qo'l (nutq vaqtida jonli imo-ishora qiladi) */}
                  <g
                    style={{
                      transformOrigin: "48px 168px",
                      transform: isSpeaking ? "rotate(-6deg)" : "rotate(0deg)",
                      transition: "transform 350ms ease",
                    }}
                  >
                    <path
                      d="M36 154 L26 196 L64 198 L66 181 L48 178 Z"
                      fill="url(#blazerGrad)"
                      stroke="#1b2c44"
                      strokeWidth="1.6"
                    />
                    <ellipse
                      cx="73"
                      cy="189"
                      rx="11"
                      ry="8"
                      fill="#eab896"
                      stroke="#9c6b4e"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M68 182 L75 176"
                      stroke="#eab896"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Bo'yin va Ko'ylak yoqasi */}
                  <rect x="79" y="96" width="21" height="22" rx="6" fill="#e2ab87" />
                  <path d="M74 108 L89 124 L82 128 L69 115 Z" fill="#ffffff" />
                  <path d="M105 108 L90 124 L97 128 L110 115 Z" fill="#ffffff" />

                  {/* Ustoz Boshi */}
                  <g
                    style={{
                      transformOrigin: "90px 76px",
                      transform: isSpeaking ? "rotate(2deg)" : "rotate(0deg)",
                      transition: "transform 400ms ease",
                    }}
                  >
                    {/* Quloqlar */}
                    <circle cx="66" cy="74" r="6" fill="#e2ab87" />
                    <circle cx="114" cy="74" r="6" fill="#e2ab87" />

                    {/* Yuz shakli */}
                    <path
                      d="M67 52 C67 34, 113 34, 113 52 L112 82 C112 98, 99 106, 90 106 C81 106, 68 98, 68 82 Z"
                      fill="#ecc09e"
                      stroke="#9e6d50"
                      strokeWidth="1.4"
                    />

                    {/* Sochlar (oqargan viqorli professor sochi) */}
                    <path
                      d="M64 64 C59 42, 72 26, 92 27 C111 26, 121 41, 115 64 C112 50, 105 44, 90 44 C75 44, 68 51, 64 64 Z"
                      fill="#3b3a39"
                    />
                    <path
                      d="M66 56 C65 48, 70 39, 78 36"
                      stroke="#9ca3af"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M113 56 C114 48, 109 39, 102 36"
                      stroke="#9ca3af"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Qoshlar */}
                    <path
                      d="M74 60 Q81 57 86 60"
                      stroke="#333230"
                      strokeWidth="2.4"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M95 60 Q101 57 107 60"
                      stroke="#333230"
                      strokeWidth="2.4"
                      fill="none"
                      strokeLinecap="round"
                    />

                    {/* Ko'zoynak va Ko'zlar */}
                    <rect
                      x="72"
                      y="63"
                      width="15"
                      height="11"
                      rx="3"
                      fill="rgba(255,255,255,0.18)"
                      stroke="#222"
                      strokeWidth="2"
                    />
                    <rect
                      x="94"
                      y="63"
                      width="15"
                      height="11"
                      rx="3"
                      fill="rgba(255,255,255,0.18)"
                      stroke="#222"
                      strokeWidth="2"
                    />
                    <line x1="87" y1="68" x2="94" y2="68" stroke="#222" strokeWidth="2" />
                    <circle cx="80" cy="68.5" r="2.1" fill="#1e293b" />
                    <circle cx="101" cy="68.5" r="2.1" fill="#1e293b" />

                    {/* Burun */}
                    <path
                      d="M90 68 L88 79 L93 80"
                      stroke="#9e6d50"
                      strokeWidth="1.6"
                      fill="none"
                      strokeLinecap="round"
                    />

                    {/* Soqol va Mo'ylov */}
                    <path
                      d="M69 80 C70 96, 80 106, 90 106 C100 106, 110 96, 111 80 C106 88, 100 91, 90 91 C80 91, 74 88, 69 80 Z"
                      fill="#4b4a48"
                    />
                    <path
                      d="M79 85 Q90 81 101 85"
                      stroke="#383736"
                      strokeWidth="3.2"
                      fill="none"
                      strokeLinecap="round"
                    />

                    {/* Og'iz (Ustoz gapirayotganda jonli ochilib-yopiladi!) */}
                    {isSpeaking ? (
                      <ellipse
                        cx="90"
                        cy="89"
                        rx="5.5"
                        ry="3.8"
                        fill="#7f1d1d"
                        className="animate-ping"
                        style={{ animationDuration: "0.45s" }}
                      />
                    ) : (
                      <path
                        d="M84 88 Q90 92 96 88"
                        stroke="#f8fafc"
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                      />
                    )}
                  </g>
                </g>

                {/* Ustoz oldidagi stol burchagi va ustma-ust kitoblar (rasmdagidek!) */}
                <g transform="translate(4, 224)">
                  {/* Stol taxtasi */}
                  <polygon points="0,34 156,34 172,46 0,46" fill="#6b4423" />
                  {/* Chap kitoblar to'plami */}
                  <polygon points="8,18 62,14 72,22 16,26" fill="#65a34e" stroke="#2d4a22" strokeWidth="1" />
                  <polygon points="8,26 62,22 72,30 16,34" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
                  {/* O'ng kitob */}
                  <polygon points="68,16 122,12 134,23 78,28" fill="#c7831e" stroke="#6b4209" strokeWidth="1" />
                  <polygon points="68,24 122,20 134,31 78,35" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
                </g>
              </svg>
            </button>

            {/* Jonli Ustoz Subtitri + Bosqich Tanlagich (1..4) */}
            <div className="flex-1 rounded-2xl border border-white/15 bg-[#0b0b0c]/95 px-4 py-3 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-[#c6f432]">
                  <span>👨‍🏫 AI USTOZ IZOHI</span>
                  <span>•</span>
                  <span>QADAM {activeZone + 1} / 4</span>
                </span>

                <div className="flex items-center gap-1">
                  {(
                    [
                      { idx: 0 as ChalkZoneIndex, label: "1. Formula" },
                      { idx: 1 as ChalkZoneIndex, label: "2. Ta'rif" },
                      { idx: 2 as ChalkZoneIndex, label: "3. Oltin Qoida" },
                      { idx: 3 as ChalkZoneIndex, label: "4. Xossalar" },
                    ] as const
                  ).map((z) => (
                    <button
                      key={z.idx}
                      type="button"
                      onClick={() => explainSingleZone(z.idx)}
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold transition-all ${
                        activeZone === z.idx
                          ? "bg-[#c6f432] text-[#0b0b0c]"
                          : "bg-white/[0.06] text-white/75 hover:text-white"
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-white/90">
                {liveSubtitle || slide.teacherNarration[pace][activeZone]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          PASTKI AI AGENT SAVOL-JAVOB PANELI (Ovozda yoki matnda savol bering)
          ==================================================================== */}
      <div className="rounded-2xl border border-white/12 bg-[#0b0b0c] p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-white">
              Doskadagi mavzu bo&apos;yicha AI Ustozdan so&apos;rang:
            </span>
            <button
              type="button"
              disabled={askingAi}
              onClick={() =>
                void handleAskTeacher(
                  `«${slide.topicTitle}» mavzusini mutlaqo 0 dan boshlagan o'quvchiga hayotiy o'xshatish bilan juda sodda qilib tushuntirib ber.`
                )
              }
              className="rounded-lg border border-[#c6f432]/40 bg-[#c6f432]/10 px-2.5 py-1 text-[11px] font-bold text-[#c6f432] transition-all hover:bg-[#c6f432] hover:text-[#0b0b0c] disabled:opacity-50"
            >
              🪜 0 dan sodda tushuntir
            </button>
            <button
              type="button"
              disabled={askingAi}
              onClick={() =>
                void handleAskTeacher(
                  `«${slide.topicTitle}» mavzusidan doskada 1 ta oson misol yozib, qadamma-qadam yechib ko'rsat.`
                )
              }
              className="rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-white/85 transition-all hover:border-[#c6f432] hover:text-[#c6f432] disabled:opacity-50"
            >
              ✏️ Doskada 1 ta misol yechib ko&apos;rsat
            </button>
            <button
              type="button"
              disabled={askingAi}
              onClick={() =>
                void handleAskTeacher(
                  `«${slide.topicTitle}» mavzusida imtihonda 5 soniyada javob topish siri qanday?`
                )
              }
              className="rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-white/85 transition-all hover:border-[#c6f432] hover:text-[#c6f432] disabled:opacity-50"
            >
              ⚡ 5 soniyalik imtihon siri
            </button>
          </div>

          {onProceedNext && (
            <button
              type="button"
              onClick={onProceedNext}
              className="btn-neon inline-flex items-center gap-2 px-4 py-2 text-xs font-black"
            >
              <span>{proceedLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleAskTeacher();
          }}
          className="flex items-center gap-2"
        >
          <JarvisMicButton
            onTranscript={(t) => {
              setStudentQuestion(t);
              void handleAskTeacher(t);
            }}
          />
          <input
            type="text"
            value={studentQuestion}
            onChange={(e) => setStudentQuestion(e.target.value)}
            placeholder={`${honorific}, tushunmagan joyingizni yozing yoki mikrofonda so'rang — AI Ustoz doskada tushuntiradi...`}
            className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/45 outline-none focus:border-[#c6f432]"
          />
          <button
            type="submit"
            disabled={askingAi || !studentQuestion.trim()}
            className="btn-neon inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-black disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{askingAi ? "Yozmoqda..." : "So'rash"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
