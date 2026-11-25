"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Award,
  Bluetooth,
  Check,
  Feather,
  Globe,
  GraduationCap,
  Maximize2,
  Mic,
  MicOff,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Sparkles,
  Target,
  Users,
  Volume2,
} from "lucide-react";
import {
  buildPersonalizedLessonModules,
  type DirectionTrack,
  type GradeOption,
  type PillarIconKey,
} from "@/lib/data/methodology";
import type { UniversityItem } from "@/lib/data/universities";
import {
  LessonAudioEngine,
  type AudioOutputMode,
} from "@/lib/voice/lesson-audio-engine";

interface FullscreenAiLessonProps {
  university: UniversityItem;
  grade: GradeOption;
  direction: DirectionTrack;
  studentName?: string;
  sessionRemainingSeconds?: number;
  currentIndex: number;
  completedIndices: number[];
  onChangeCurrentIndex: (nextIndex: number) => void;
  onMarkModuleCompleted: (moduleIndex: number) => void;
  audioOutputMode: AudioOutputMode;
  explicitSinkId?: string;
  onChangeAudioOutputMode: (mode: AudioOutputMode) => void;
  onBackToSetup: () => void;
  onFinishAllModules: (stats: { completedModules: number; questionsAsked: number }) => void;
}

type MentorVisualState = "SPEAKING" | "LISTENING" | "THINKING" | "PAUSED" | "READY" | "MIC_ERROR";

interface ConversationTurn {
  role: "student" | "mentor";
  text: string;
}

const PILLAR_ICONS: Record<PillarIconKey, typeof GraduationCap> = {
  graduation: GraduationCap,
  globe: Globe,
  target: Target,
  sparkles: Sparkles,
  users: Users,
  feather: Feather,
  award: Award,
};

export function FullscreenAiLesson({
  university,
  grade,
  direction,
  studentName,
  sessionRemainingSeconds = 7200,
  currentIndex,
  completedIndices,
  onChangeCurrentIndex,
  onMarkModuleCompleted,
  audioOutputMode,
  explicitSinkId = "",
  onChangeAudioOutputMode,
  onBackToSetup,
  onFinishAllModules,
}: FullscreenAiLessonProps) {
  const modules = useMemo(
    () =>
      buildPersonalizedLessonModules({
        university,
        grade,
        direction,
        studentName,
      }),
    [university, grade, direction, studentName],
  );

  const completedSet = useMemo(() => new Set(completedIndices), [completedIndices]);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [visualState, setVisualState] = useState<MentorVisualState>("READY");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() =>
    typeof document !== "undefined" ? Boolean(document.fullscreenElement) : true,
  );

  const engineRef = useRef<LessonAudioEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spaceHeldRef = useRef(false);
  const historyRef = useRef<ConversationTurn[]>([]);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIndexRef = useRef(currentIndex);
  const isFullscreenRef = useRef(isFullscreen);
  const moduleInterruptedRef = useRef(false);

  const isLastModule = currentIndex >= modules.length - 1;
  const allModulesDone = completedSet.size >= modules.length;

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    isFullscreenRef.current = isFullscreen;
  }, [isFullscreen]);

  const clearAutoTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const playModuleAtIndex = useCallback(
    (idx: number) => {
      const engine = engineRef.current;
      const targetModule = modules[idx];
      if (!engine || !targetModule || !isFullscreenRef.current) return;

      clearAutoTimer();
      moduleInterruptedRef.current = false;
      setVisualState("SPEAKING");

      void engine.speak(targetModule.spokenScript, () => {
        if (spaceHeldRef.current || moduleInterruptedRef.current) return;

        onMarkModuleCompleted(idx);

        if (idx + 1 < modules.length) {
          setVisualState("READY");
          autoAdvanceTimerRef.current = setTimeout(() => {
            if (!spaceHeldRef.current && isFullscreenRef.current) {
              onChangeCurrentIndex(idx + 1);
            }
          }, 1100);
        } else {
          setVisualState("READY");
        }
      });
    },
    [clearAutoTimer, modules, onChangeCurrentIndex, onMarkModuleCompleted],
  );

  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const engine = new LessonAudioEngine();
    engineRef.current = engine;
    void engine.configureOutput(audioOutputMode, explicitSinkId, false);

    return () => {
      clearAutoTimer();
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearAutoTimer]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    void engine.configureOutput(audioOutputMode, explicitSinkId, false);
  }, [audioOutputMode, explicitSinkId]);

  useEffect(() => {
    const syncFullscreen = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active) {
        clearAutoTimer();
        void engineRef.current?.pauseSpeech();
        setVisualState("PAUSED");
      }
    };

    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
    };
  }, [clearAutoTimer]);

  // 2-hour (7200s) strict session auto-completion timer
  useEffect(() => {
    if (sessionRemainingSeconds <= 0) return;
    const timeoutId = setTimeout(() => {
      clearAutoTimer();
      engineRef.current?.stopSpeech();
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {});
      }
      onFinishAllModules({
        completedModules: Math.max(completedSet.size, currentIndexRef.current + 1),
        questionsAsked,
      });
    }, sessionRemainingSeconds * 1000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionRemainingSeconds]);

  useEffect(() => {
    if (!isFullscreen) return;
    playModuleAtIndex(currentIndex);
  }, [currentIndex, isFullscreen, playModuleAtIndex]);

  useEffect(() => {
    let rafId = 0;
    let smoothLevel = 0;
    let phase = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const rawLevel = engineRef.current?.getAudioLevel() ?? 0;
          smoothLevel += (rawLevel - smoothLevel) * 0.22;
          phase += 0.032 + smoothLevel * 0.09;

          const w = canvas.width;
          const h = canvas.height;
          const cx = w / 2;
          const cy = h / 2;
          ctx.clearRect(0, 0, w, h);

          const baseRadius = Math.min(w, h) * 0.27;

          const palette =
            visualState === "LISTENING"
              ? ["rgba(198, 244, 50, 0.75)", "rgba(214, 247, 102, 0.42)", "rgba(255, 255, 255, 0.28)"]
              : visualState === "THINKING"
                ? ["rgba(255, 255, 255, 0.62)", "rgba(198, 244, 50, 0.42)", "rgba(255, 255, 255, 0.2)"]
                : visualState === "MIC_ERROR"
                  ? ["rgba(239, 68, 68, 0.6)", "rgba(255, 255, 255, 0.25)", "rgba(239, 68, 68, 0.2)"]
                  : ["rgba(198, 244, 50, 0.56)", "rgba(255, 255, 255, 0.32)", "rgba(198, 244, 50, 0.2)"];

          for (let ring = 0; ring < 3; ring++) {
            ctx.beginPath();
            const ringOffset = ring * 18;
            const amp = (8 + smoothLevel * 44) * (1 - ring * 0.22);
            const freq = 5 + ring * 2;

            for (let angle = 0; angle <= Math.PI * 2 + 0.05; angle += 0.05) {
              const wave =
                Math.sin(angle * freq + phase * (ring % 2 === 0 ? 1 : -1.2)) * amp * 0.55 +
                Math.cos(angle * (freq - 2) - phase * 0.8) * amp * 0.45;
              const r = baseRadius + ringOffset + wave;
              const x = cx + Math.cos(angle) * r;
              const y = cy + Math.sin(angle) * r;
              if (angle === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }

            ctx.closePath();
            ctx.strokeStyle = palette[ring] ?? palette[0];
            ctx.lineWidth = 2.3 - ring * 0.4;
            ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [visualState]);

  const beginListening = useCallback(async () => {
    if (!isFullscreenRef.current || spaceHeldRef.current) return;
    const engine = engineRef.current;
    if (!engine) return;

    spaceHeldRef.current = true;
    moduleInterruptedRef.current = true;
    clearAutoTimer();
    setVisualState("LISTENING");

    const ok = await engine.startPushToTalk();
    if (!ok) {
      spaceHeldRef.current = false;
      setVisualState("MIC_ERROR");
      void engine.speak(
        "Mikrofonga ruxsat berilmagan ko'rinadi. Brauzer tepasidagi mikrofon belgisini yoqib, probelni qaytadan bosib gapiring.",
        () => {
          setVisualState("READY");
        },
      );
    }
  }, [clearAutoTimer]);

  const finishListeningAndAskAi = useCallback(async () => {
    if (!spaceHeldRef.current) return;
    spaceHeldRef.current = false;

    const engine = engineRef.current;
    if (!engine) return;

    const recorded = await engine.stopPushToTalk();

    if (recorded.durationMs < 240 && !recorded.browserTranscript) {
      playModuleAtIndex(currentIndexRef.current);
      return;
    }

    setVisualState("THINKING");

    try {
      const formData = new FormData();
      if (recorded.audioBlob && recorded.audioBlob.size > 0) {
        const ext = recorded.audioBlob.type.includes("mp4") ? "mp4" : "webm";
        formData.append("audio", recorded.audioBlob, `question.${ext}`);
      }
      formData.append("browserTranscript", recorded.browserTranscript);
      formData.append("universityRank", String(university.rank));
      formData.append("gradeId", grade.id);
      formData.append("directionId", direction.id);
      formData.append("currentModuleIndex", String(currentIndexRef.current));
      formData.append("history", JSON.stringify(historyRef.current.slice(-6)));

      const res = await fetch("/api/ai/voice-turn", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as {
        ok?: boolean;
        transcript?: string;
        reply?: string;
      };

      const replyText =
        data.reply?.trim() || "Savolingizni eshitdim. Keling, shu joyini yana davom ettiramiz.";

      if (data.transcript) {
        historyRef.current.push({ role: "student", text: data.transcript });
      }
      historyRef.current.push({ role: "mentor", text: replyText });
      setQuestionsAsked((q) => q + 1);

      if (!isFullscreenRef.current) {
        setVisualState("PAUSED");
        return;
      }

      setVisualState("SPEAKING");
      await engine.speak(replyText, () => {
        if (spaceHeldRef.current || !isFullscreenRef.current) return;
        setVisualState("READY");
        autoAdvanceTimerRef.current = setTimeout(() => {
          if (!spaceHeldRef.current && isFullscreenRef.current && !allModulesDone) {
            playModuleAtIndex(currentIndexRef.current);
          }
        }, 1800);
      });
    } catch {
      if (!isFullscreenRef.current) return;
      setVisualState("SPEAKING");
      await engine.speak(
        "Internet sal uzilib qoldi shekilli, probelni bosib savolingizni yana bitta qaytarib yuboring.",
        () => {
          setVisualState("READY");
        },
      );
    }
  }, [allModulesDone, direction.id, grade.id, playModuleAtIndex, university.rank]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (!e.repeat && isFullscreenRef.current) {
          void beginListening();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (spaceHeldRef.current) {
          void finishListeningAndAskAi();
        }
      }
    };

    const onWindowBlur = () => {
      if (spaceHeldRef.current) {
        void finishListeningAndAskAi();
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp, { passive: false });
    window.addEventListener("blur", onWindowBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [beginListening, finishListeningAndAskAi]);

  const handleToggleOutputDevice = async () => {
    const nextMode: AudioOutputMode = audioOutputMode === "bluetooth" ? "speaker" : "bluetooth";
    onChangeAudioOutputMode(nextMode);
    await engineRef.current?.configureOutput(nextMode, "", true);
  };

  const handleReEnterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      await engineRef.current?.unlock();
      playModuleAtIndex(currentIndexRef.current);
    } catch {
      setIsFullscreen(true);
      await engineRef.current?.unlock();
      playModuleAtIndex(currentIndexRef.current);
    }
  };

  const handleTogglePlayPause = async () => {
    const engine = engineRef.current;
    if (!engine || !isFullscreen) return;

    if (visualState === "SPEAKING") {
      clearAutoTimer();
      await engine.pauseSpeech();
      setVisualState("PAUSED");
    } else if (visualState === "PAUSED") {
      await engine.resumeSpeech();
      setVisualState("SPEAKING");
    } else {
      playModuleAtIndex(currentIndex);
    }
  };

  // Checkmark button: on modules 1..6 it marks current module done & advances to next module!
  // Only on the 7th (final) module does it finish the course and proceed to the final step!
  const handleCheckButtonPress = async () => {
    clearAutoTimer();
    onMarkModuleCompleted(currentIndex);

    if (currentIndex + 1 < modules.length) {
      onChangeCurrentIndex(currentIndex + 1);
      return;
    }

    engineRef.current?.stopSpeech();
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore
      }
    }
    const uniqueDoneCount = new Set([...completedIndices, currentIndex]).size;
    onFinishAllModules({
      completedModules: uniqueDoneCount,
      questionsAsked,
    });
  };

  const handleBack = async () => {
    clearAutoTimer();
    engineRef.current?.stopSpeech();
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore
      }
    }
    onBackToSetup();
  };

  const activeModule = modules[currentIndex] ?? modules[0];
  const ActivePillarIcon = PILLAR_ICONS[activeModule.iconKey];

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen select-none flex-col items-center justify-between overflow-hidden bg-[#0b0b0c] p-6 sm:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,244,50,0.06)_1px,transparent_1px)] bg-[size:36px_36px] opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-all duration-1000"
        style={{
          background: `
            radial-gradient(circle at 50% 45%, ${
              visualState === "LISTENING"
                ? "rgba(198, 244, 50, 0.28)"
                : visualState === "THINKING"
                  ? "rgba(255, 255, 255, 0.14)"
                  : "rgba(198, 244, 50, 0.16)"
            } 0%, transparent 55%),
            radial-gradient(circle at 18% 82%, rgba(255, 255, 255, 0.06) 0%, transparent 48%),
            radial-gradient(circle at 82% 18%, rgba(198, 244, 50, 0.1) 0%, transparent 45%)
          `,
        }}
      />

      {!isFullscreen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b0b0c]/85 backdrop-blur-3xl">
          <div className="glass-panel flex items-center gap-6 rounded-[2.5rem] p-8">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Orqaga qaytish"
              className="glass-card flex h-16 w-16 items-center justify-center rounded-full text-zinc-200"
            >
              <ArrowLeft className="h-7 w-7" />
            </button>

            <button
              type="button"
              onClick={handleReEnterFullscreen}
              aria-label="To'liq ekranda darsni davom ettirish"
              className="btn-neon flex h-28 w-28 animate-pulse items-center justify-center rounded-full shadow-[0_0_60px_rgba(198,244,50,0.55)]"
            >
              <Maximize2 className="h-12 w-12" />
            </button>
          </div>
        </div>
      )}

      <header className="relative z-10 flex w-full max-w-4xl items-center justify-between gap-2 sm:gap-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Tanlov bosqichiga qaytish"
          className="glass-card flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="glass-panel flex flex-1 items-center justify-around rounded-full px-3 py-2.5 sm:px-6">
          {modules.map((mod, idx) => {
            const Icon = PILLAR_ICONS[mod.iconKey];
            const isActive = idx === currentIndex;
            const isDone = completedSet.has(idx);
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  if (!isFullscreen) return;
                  onChangeCurrentIndex(idx);
                }}
                aria-label={`Modul ${idx + 1}`}
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 sm:h-12 sm:w-12 ${
                  isActive
                    ? "scale-115 bg-[#c6f432] text-[#0b0b0c] shadow-[0_0_28px_rgba(198,244,50,0.65)]"
                    : isDone
                      ? "border border-[#c6f432]/55 bg-[#c6f432]/18 text-[#c6f432]"
                      : "border border-white/15 bg-white/[0.05] text-zinc-400 hover:border-white/35 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleToggleOutputDevice}
          aria-label={
            audioOutputMode === "bluetooth"
              ? "Bluetooth ovoz rejimi yoqilgan (Dinamikka o'tkazish)"
              : "Dinamik ovoz rejimi yoqilgan (Bluetooth ga o'tkazish)"
          }
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all ${
            audioOutputMode === "bluetooth"
              ? "border-[#c6f432]/65 bg-[#c6f432]/20 text-[#c6f432] shadow-[0_0_22px_rgba(198,244,50,0.35)]"
              : "border-white/50 bg-white/20 text-white shadow-[0_0_22px_rgba(255,255,255,0.25)]"
          }`}
        >
          {audioOutputMode === "bluetooth" ? (
            <Bluetooth className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center">
        <canvas
          ref={canvasRef}
          width={520}
          height={520}
          className="pointer-events-none h-[340px] w-[340px] sm:h-[460px] sm:w-[460px]"
        />

        <div
          className={`pointer-events-none absolute flex h-44 w-44 items-center justify-center rounded-full backdrop-blur-3xl transition-all duration-500 sm:h-56 sm:w-56 ${
            visualState === "LISTENING"
              ? "scale-110 border-2 border-[#c6f432] bg-gradient-to-br from-[#c6f432]/35 via-[#c6f432]/12 to-white/10 shadow-[inset_0_2px_16px_rgba(255,255,255,0.55),0_0_85px_rgba(198,244,50,0.6)]"
              : visualState === "THINKING"
                ? "scale-105 border-2 border-white/70 bg-gradient-to-br from-white/25 via-[#c6f432]/12 to-transparent shadow-[inset_0_2px_16px_rgba(255,255,255,0.5),0_0_70px_rgba(255,255,255,0.35)]"
                : visualState === "MIC_ERROR"
                  ? "border-2 border-red-400/70 bg-gradient-to-br from-red-500/30 via-transparent to-transparent shadow-[0_0_65px_rgba(239,68,68,0.45)]"
                  : "border border-[#c6f432]/50 bg-gradient-to-br from-white/18 via-[#c6f432]/10 to-[#121214]/80 shadow-[inset_0_2px_18px_rgba(255,255,255,0.45),0_0_70px_rgba(198,244,50,0.34)]"
          }`}
        >
          <div className="absolute left-5 top-4 h-14 w-24 -rotate-12 rounded-full bg-gradient-to-b from-white/40 to-transparent blur-[2px]" />

          {visualState === "THINKING" && (
            <div className="animate-spin-slow absolute inset-3 rounded-full border-2 border-dashed border-[#c6f432]/75" />
          )}

          {visualState === "LISTENING" ? (
            <Mic className="h-16 w-16 animate-pulse text-[#c6f432] drop-shadow-[0_0_24px_rgba(198,244,50,0.95)] sm:h-20 sm:w-20" />
          ) : visualState === "MIC_ERROR" ? (
            <MicOff className="h-16 w-16 text-red-300 sm:h-20 sm:w-20" />
          ) : (
            <ActivePillarIcon className="h-16 w-16 text-[#c6f432] drop-shadow-[0_0_24px_rgba(198,244,50,0.75)] transition-transform duration-500 sm:h-20 sm:w-20" />
          )}
        </div>
      </div>

      <footer className="relative z-10 flex items-center justify-center gap-3 sm:gap-5">
        <button
          type="button"
          disabled={currentIndex === 0 || !isFullscreen}
          onClick={() => onChangeCurrentIndex(Math.max(0, currentIndex - 1))}
          aria-label="Oldingi element"
          className="glass-card flex h-12 w-12 items-center justify-center rounded-full text-zinc-200 disabled:opacity-30 sm:h-14 sm:w-14"
        >
          <SkipBack className="h-5 w-5" />
        </button>

        <button
          type="button"
          disabled={!isFullscreen}
          onClick={handleTogglePlayPause}
          aria-label="To'xtatish yoki davom ettirish"
          className="glass-card flex h-12 w-12 items-center justify-center rounded-full text-white disabled:opacity-30 sm:h-14 sm:w-14"
        >
          {visualState === "SPEAKING" ? (
            <Pause className="h-5 w-5 text-[#c6f432]" />
          ) : (
            <Play className="h-5 w-5 translate-x-0.5 text-[#c6f432]" />
          )}
        </button>

        <button
          type="button"
          disabled={!isFullscreen}
          onPointerDown={(e) => {
            e.preventDefault();
            void beginListening();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            void finishListeningAndAskAi();
          }}
          onPointerCancel={() => {
            if (spaceHeldRef.current) {
              void finishListeningAndAskAi();
            }
          }}
          aria-label="Probelni bosib turib gapiring"
          className={`relative flex h-14 w-48 items-center justify-center gap-3 rounded-2xl transition-all duration-150 sm:h-16 sm:w-64 ${
            visualState === "LISTENING"
              ? "translate-y-1 scale-[0.98] border-2 border-[#c6f432] bg-[#c6f432]/25 text-[#c6f432] shadow-[inset_0_2px_12px_rgba(255,255,255,0.45),0_0_42px_rgba(198,244,50,0.65)]"
              : "glass-panel hover:border-[#c6f432]/65 active:translate-y-1"
          }`}
        >
          <span
            className={`h-1.5 w-8 rounded-full transition-all ${
              visualState === "LISTENING" ? "w-12 bg-[#c6f432]" : "bg-white/30"
            }`}
          />
          <Mic
            className={`h-5 w-5 transition-transform ${
              visualState === "LISTENING" ? "scale-125 text-[#c6f432]" : "text-[#c6f432]"
            }`}
          />
          <span
            className={`h-1.5 w-8 rounded-full transition-all ${
              visualState === "LISTENING" ? "w-12 bg-[#c6f432]" : "bg-white/30"
            }`}
          />
        </button>

        <button
          type="button"
          disabled={currentIndex >= modules.length - 1 || !isFullscreen}
          onClick={() => onChangeCurrentIndex(Math.min(modules.length - 1, currentIndex + 1))}
          aria-label="Keyingi element"
          className="glass-card flex h-12 w-12 items-center justify-center rounded-full text-zinc-200 disabled:opacity-30 sm:h-14 sm:w-14"
        >
          <SkipForward className="h-5 w-5" />
        </button>

        <button
          type="button"
          disabled={!isFullscreen}
          onClick={() => void handleCheckButtonPress()}
          aria-label={
            isLastModule
              ? "Barcha darslarni yakunlash"
              : "Shu bo'limni tugatib keyingi bo'limga o'tish"
          }
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all sm:h-14 sm:w-14 ${
            isLastModule
              ? "btn-neon shadow-[0_0_32px_rgba(198,244,50,0.7)]"
              : "glass-card border-[#c6f432]/45 text-[#c6f432] hover:bg-[#c6f432]/20"
          }`}
        >
          <Check className="h-5 w-5" />
        </button>
      </footer>
    </div>
  );
}
