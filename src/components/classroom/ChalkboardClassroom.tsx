"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Play,
  Send,
  Sparkles,
  Square,
  Volume2,
  X,
} from "lucide-react";
import type { ChalkboardSlideData } from "@/lib/learning/chalkboard-builder";
import { useLearningAdaptation } from "@/lib/learning/easy-adaptation";
import { jarvisVoice } from "@/lib/voice/jarvis-speech";
import { JarvisMicButton } from "@/components/voice/JarvisVoiceAgent";

export type ChalkZoneIndex = 0 | 1 | 2 | 3;

interface ChalkboardClassroomProps {
  /** Hozirgi faol doska mavzusi */
  slide: ChalkboardSlideData;
  /** Bir nechta mavzular bo'lsa, faqat doskadagi mavzuni joyida almashtirish uchun */
  availableSlides?: ChalkboardSlideData[];
  onSelectSlide?: (slideId: string) => void;
  honorific?: string;
  lessonSlug?: string;
  onProceedNext?: () => void;
  proceedLabel?: string;
}

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

  const [isErasing, setIsErasing] = useState(false);
  const [revealedStep, setRevealedStep] = useState<number>(4);
  const [activeZone, setActiveZone] = useState<ChalkZoneIndex>(0);
  const [isAutoTeaching, setIsAutoTeaching] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liveSubtitle, setLiveSubtitle] = useState<string>("");

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

  // Doskada bo'r bilan ketma-ket yozilish animatsiyasi
  const runChalkWriteSequence = useCallback(
    (withErase: boolean) => {
      autoTeachAbortRef.current = true;
      setIsAutoTeaching(false);
      jarvisVoice.stop();
      clearAllTimers();
      setBoardAiAnswer(null);

      if (withErase) {
        setIsErasing(true);
        const eraseTimer = setTimeout(() => {
          setIsErasing(false);
          setRevealedStep(1);
          setActiveZone(0);
          setLiveSubtitle(slide.teacherNarration[pace][0]);

          const t1 = setTimeout(() => {
            setRevealedStep(2);
            setActiveZone(1);
          }, 110);
          const t2 = setTimeout(() => {
            setRevealedStep(3);
            setActiveZone(2);
          }, 220);
          const t3 = setTimeout(() => {
            setRevealedStep(4);
            setActiveZone(0);
          }, 330);

          timersRef.current.push(t1, t2, t3);
        }, 140);
        timersRef.current.push(eraseTimer);
      } else {
        setIsErasing(false);
        setRevealedStep(4);
        setActiveZone(0);
        setLiveSubtitle(slide.teacherNarration[pace][0]);
      }
    },
    [clearAllTimers, pace, slide.teacherNarration]
  );

  // Mavzu almashganda faqat doskadagi yozuv o'chib, yangi mavzu yoziladi
  useEffect(() => {
    const changed = prevSlideIdRef.current !== slide.id;
    prevSlideIdRef.current = slide.id;
    runChalkWriteSequence(changed);
  }, [slide.id, runChalkWriteSequence]);

  useEffect(() => {
    if (!boardAiAnswer) {
      setLiveSubtitle(slide.teacherNarration[pace][activeZone]);
    }
  }, [pace, activeZone, slide.teacherNarration, boardAiAnswer]);

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

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        jarvisVoice.speak(script, () => setIsSpeaking(false));
      } else {
        const fallbackTimer = setTimeout(() => setIsSpeaking(false), 4500);
        timersRef.current.push(fallbackTimer);
      }
    },
    [clearAllTimers, pace, slide.teacherNarration]
  );

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
            420
          );
          timersRef.current.push(nextTimer);
        } else {
          setIsSpeaking(false);
          setIsAutoTeaching(false);
        }
      };

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const estDurationMs = Math.min(13000, Math.max(4000, text.length * 65));
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
          Math.min(6500, Math.max(3000, text.length * 42))
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
      setLiveSubtitle(cleanReply);
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

  const serifStyle: React.CSSProperties = {
    fontFamily: 'Georgia, "Times New Roman", Times, serif',
  };

  return (
    <div className="space-y-3">
      {/* ====================================================================
          1. YUQORI PANEL: Mavzuni almashtirish + AI Ustoz Ovozli Tushuntirish
          ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-[#c6f432]/35 bg-[#0b0b0c] px-4 py-2.5 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#c6f432] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#0b0b0c]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Jonli Doska</span>
          </span>

          {canSwitchSlides && availableSlides && onSelectSlide && (
            <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] p-0.5">
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
                className="max-w-[200px] sm:max-w-[290px] truncate bg-[#0b0b0c] px-2 py-1 text-xs font-extrabold text-white outline-none cursor-pointer"
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

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] p-0.5">
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#c6f432] bg-[#c6f432]/20 px-3.5 py-1.5 text-xs font-extrabold text-[#c6f432] transition-all hover:bg-[#c6f432] hover:text-[#0b0b0c]"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>To&apos;xtatish</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startAutoLecture}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#c6f432] px-3.5 py-1.5 text-xs font-black text-[#0b0b0c] shadow-[0_0_20px_rgba(198,244,50,0.4)] transition-transform hover:scale-[1.02]"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>AI Ustoz Tushuntirsin</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => runChalkWriteSequence(true)}
            title="Doskani qaytadan bo'r bilan yozish"
            className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] px-2.5 py-1.5 text-xs font-bold text-white/85 transition-all hover:border-[#c6f432] hover:text-[#c6f432]"
          >
            <Eraser className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Qayta yozish</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          2. AYNAN RASMDAGI 16:9 SINF DOSKASI VA HAQIQIY PROFESSOR SAHNASI
             (Hech qanday ortiqcha quti ustozni ham, o'chirg'ichni ham to'smaydi!)
          ==================================================================== */}
      <div
        className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.85)] select-none"
        style={{ containerType: "inline-size" }}
      >
        {/* Asl rasmdagi Professor, Kitoblar, Yog'och Ramka, Yashil Doska, O'chirg'ich va Bo'rlar */}
        <img
          src="/images/chalkboard-stage.png"
          alt="Sinf doskasi va AI Ustoz"
          className="pointer-events-none absolute inset-0 h-full w-full object-fill"
          draggable={false}
        />

        {/* DOSKADAGI BO'R YOZUVLARI (Faqat yashil doska ichida, rasmdagi aniq joylashuvda!) */}
        <div
          className={`absolute inset-0 z-10 text-white transition-opacity duration-300 ${
            isErasing ? "opacity-0" : "opacity-100"
          }`}
          style={serifStyle}
        >
          {/* 1-QISM (YUQORI CHAP): "mavzu :<Mavzu Nomi>" */}
          <div
            onClick={() => explainSingleZone(0)}
            title="Bosib AI Ustozdan formulani tinglang"
            className="cursor-pointer transition-all duration-300"
            style={{
              position: "absolute",
              left: "17.6%",
              top: "7.2%",
              width: "70%",
              opacity: revealedStep >= 1 ? 1 : 0,
              transform: revealedStep >= 1 ? "translateY(0)" : "translateY(4px)",
              textShadow:
                activeZone === 0 && isSpeaking
                  ? "0 0 12px rgba(255,255,255,0.65)"
                  : "0 1px 2px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(10px, 2.55cqw, 29px)",
                lineHeight: 1.18,
                letterSpacing: "-0.01em",
              }}
            >
              <span style={{ fontWeight: 400 }}>mavzu :</span>
              <span style={{ fontWeight: 700 }}>{slide.topicTitle}</span>
            </div>
          </div>

          {/* 1-QISM FORMULALARI */}
          <div
            onClick={() => explainSingleZone(0)}
            title="Bosib AI Ustozdan formulani tinglang"
            className="cursor-pointer text-center transition-all duration-300"
            style={{
              position: "absolute",
              left: "17.2%",
              top: "17.8%",
              width: "35.5%",
              opacity: revealedStep >= 1 ? 1 : 0,
              transform: revealedStep >= 1 ? "translateY(0)" : "translateY(4px)",
              fontSize: "clamp(8.5px, 1.80cqw, 20.5px)",
              fontWeight: 700,
              lineHeight: 1.28,
              textShadow:
                activeZone === 0 && isSpeaking
                  ? "0 0 12px rgba(255,255,255,0.65)"
                  : "0 1px 2px rgba(0,0,0,0.45)",
            }}
          >
            {slide.formulas.slice(0, 2).map((f, idx) => (
              <div key={idx}>{f}</div>
            ))}
          </div>

          {/* 2-QISM (O'RTA CHAP): Asosiy Tushuncha va parametrlar ta'rifi */}
          <div
            onClick={() => explainSingleZone(1)}
            title="Bosib AI Ustozdan asosiy qoidani tinglang"
            className="cursor-pointer text-center transition-all duration-300"
            style={{
              position: "absolute",
              left: "16.3%",
              top: "32.2%",
              width: "39.2%",
              opacity: revealedStep >= 2 ? 1 : 0,
              transform: revealedStep >= 2 ? "translateY(0)" : "translateY(4px)",
              fontSize: "clamp(6.5px, 1.12cqw, 13px)",
              fontWeight: 700,
              lineHeight: 1.24,
              textShadow:
                activeZone === 1 && isSpeaking
                  ? "0 0 12px rgba(255,255,255,0.65)"
                  : "0 1px 2px rgba(0,0,0,0.45)",
            }}
          >
            {slide.leftConcept.paragraphs.map((p, idx) => (
              <div key={idx}>{p}</div>
            ))}
            {slide.leftConcept.bullets.map((b, bIdx) => (
              <div key={bIdx} className="mt-[0.25cqw]">
                • {b}
              </div>
            ))}
          </div>

          {/* 3-QISM (O'RTA O'NG): Imtihondagi Oltin Qoida */}
          <div
            onClick={() => explainSingleZone(2)}
            title="Bosib AI Ustozdan oltin qoidani tinglang"
            className="cursor-pointer text-center transition-all duration-300"
            style={{
              position: "absolute",
              left: "52.2%",
              top: "52.5%",
              width: "36.2%",
              opacity: revealedStep >= 3 ? 1 : 0,
              transform: revealedStep >= 3 ? "translateY(0)" : "translateY(4px)",
              fontSize: "clamp(6.5px, 1.10cqw, 12.8px)",
              fontWeight: 700,
              lineHeight: 1.24,
              textShadow:
                activeZone === 2 && isSpeaking
                  ? "0 0 12px rgba(255,255,255,0.65)"
                  : "0 1px 2px rgba(0,0,0,0.45)",
            }}
          >
            {slide.rightGoldenRule.heading && (
              <div>{slide.rightGoldenRule.heading}</div>
            )}
            {slide.rightGoldenRule.paragraphs.map((p, idx) => (
              <div key={idx}>{p}</div>
            ))}
            {slide.rightGoldenRule.bullets.map((b, bIdx) => (
              <div key={bIdx}>• {b}</div>
            ))}
          </div>

          {/* 4-QISM (PASTKI MARKAZ — KURSIV): Muhim Xossalar */}
          <div
            onClick={() => explainSingleZone(3)}
            title="Bosib AI Ustozdan yakuniy xossalarni tinglang"
            className="cursor-pointer text-center italic transition-all duration-300"
            style={{
              position: "absolute",
              left: "18.0%",
              top: "67.2%",
              width: "50.5%",
              opacity: revealedStep >= 4 ? 1 : 0,
              transform: revealedStep >= 4 ? "translateY(0)" : "translateY(4px)",
              fontSize: "clamp(6.8px, 1.18cqw, 13.8px)",
              fontWeight: 700,
              lineHeight: 1.24,
              textShadow:
                activeZone === 3 && isSpeaking
                  ? "0 0 12px rgba(255,255,255,0.65)"
                  : "0 1px 2px rgba(0,0,0,0.45)",
            }}
          >
            {slide.bottomSpecialRule.heading && (
              <div>{slide.bottomSpecialRule.heading}</div>
            )}
            {slide.bottomSpecialRule.paragraphs.map((p, idx) => (
              <div key={idx}>{p}</div>
            ))}
            {slide.bottomSpecialRule.bullets.map((b, idx) => (
              <div key={idx}>• {b}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. DOSKA OSTIDAGI JONLI AI USTOZ NUTQI VA SAVOL-JAVOB PANELI
             (Doska rasmiga hech qachon xalaqit bermaydi!)
          ==================================================================== */}
      <div className="rounded-2xl border border-white/15 bg-[#0b0b0c] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-[#c6f432] mr-1">
              👨‍🏫 AI USTOZ NUTQI (BOSQICH {activeZone + 1}/4):
            </span>
            {(
              [
                { idx: 0 as ChalkZoneIndex, label: "1. Mavzu & Formula" },
                { idx: 1 as ChalkZoneIndex, label: "2. Asosiy Ta'rif" },
                { idx: 2 as ChalkZoneIndex, label: "3. Oltin Qoida" },
                { idx: 3 as ChalkZoneIndex, label: "4. Muhim Xossalar" },
              ] as const
            ).map((z) => (
              <button
                key={z.idx}
                type="button"
                onClick={() => explainSingleZone(z.idx)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition-all ${
                  activeZone === z.idx
                    ? "bg-[#c6f432] text-[#0b0b0c]"
                    : "bg-white/[0.06] text-white/75 hover:text-white"
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>

          {onProceedNext && (
            <button
              type="button"
              onClick={onProceedNext}
              className="btn-neon inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black"
            >
              <span>{proceedLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-white/90">
          {liveSubtitle || slide.teacherNarration[pace][activeZone]}
        </p>

        {/* Tezkor AI savol tugmalari + Matn/Mikrofon formasi */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
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
            className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-white/45 outline-none focus:border-[#c6f432]"
          />
          <button
            type="submit"
            disabled={askingAi || !studentQuestion.trim()}
            className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{askingAi ? "Yozmoqda..." : "So'rash"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
