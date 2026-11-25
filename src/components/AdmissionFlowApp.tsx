"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bluetooth,
  BookmarkCheck,
  CalendarClock,
  Check,
  Clock,
  GraduationCap,
  Lock,
  MailCheck,
  Maximize2,
  Play,
  Send,
  Sparkles,
  Trophy,
  Volume2,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import type { EvaluatedEnrollmentStatus } from "@/lib/applications/store";
import {
  DIRECTION_TRACKS,
  GRADE_OPTIONS,
  type DirectionTrack,
  type GradeOption,
} from "@/lib/data/methodology";
import { findUniversityByRank, type UniversityItem } from "@/lib/data/universities";
import {
  LessonAudioEngine,
  listAudioOutputDevices,
  type AudioOutputDeviceOption,
  type AudioOutputMode,
} from "@/lib/voice/lesson-audio-engine";
import { CampusFooter, CampusNavbar, DynamicAmbientBackground } from "./layout/CampusChrome";
import { StepUniversitySelect } from "./steps/StepUniversitySelect";
import { StepGradeSelect } from "./steps/StepGradeSelect";
import { StepDirectionIdentify } from "./steps/StepDirectionIdentify";
import { FullscreenAiLesson } from "./steps/FullscreenAiLesson";
import {
  StepSubmitApplication,
  type SubmittedApplicationInfo,
} from "./steps/StepSubmitApplication";

type FlowStep = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS: Array<{ step: FlowStep; title: string; icon: typeof Trophy }> = [
  { step: 1, title: "Universitet", icon: Trophy },
  { step: 2, title: "Sinf", icon: GraduationCap },
  { step: 3, title: "Yo'nalish", icon: Sparkles },
  { step: 4, title: "AI Dars", icon: Maximize2 },
  { step: 5, title: "Tasdiqlash", icon: Send },
];

interface AdmissionFlowAppProps {
  user: SessionUser;
  existingStatus: EvaluatedEnrollmentStatus | null;
  initialUniversityRank?: number;
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function AdmissionFlowApp({
  user,
  existingStatus,
  initialUniversityRank,
}: AdmissionFlowAppProps) {
  const router = useRouter();
  const lockedEnrollment = existingStatus?.enrollment ?? null;

  const lockedUni = lockedEnrollment
    ? (findUniversityByRank(lockedEnrollment.universityRank) ?? null)
    : initialUniversityRank
      ? (findUniversityByRank(initialUniversityRank) ?? null)
      : null;

  const lockedGrade = lockedEnrollment
    ? (GRADE_OPTIONS.find((g) => g.id === lockedEnrollment.gradeId) ??
      GRADE_OPTIONS.find((g) => g.label === lockedEnrollment.grade) ??
      GRADE_OPTIONS[3]!)
    : null;

  const lockedDirection = lockedEnrollment
    ? (DIRECTION_TRACKS.find((d) => d.id === lockedEnrollment.directionId) ?? DIRECTION_TRACKS[0]!)
    : null;

  const [step, setStep] = useState<FlowStep>(lockedUni && !lockedEnrollment ? 2 : 1);
  const [inLockedFullscreen, setInLockedFullscreen] = useState(false);

  const [selectedUniversity, setSelectedUniversity] = useState<UniversityItem | null>(lockedUni);
  const [selectedGrade, setSelectedGrade] = useState<GradeOption | null>(lockedGrade);
  const [selectedDirection, setSelectedDirection] = useState<DirectionTrack | null>(
    lockedDirection,
  );

  const [lessonModuleIndex, setLessonModuleIndex] = useState<number>(
    lockedEnrollment?.currentModuleIndex ?? 0,
  );
  const [completedModuleIndices, setCompletedModuleIndices] = useState<number[]>(() => {
    const count = lockedEnrollment?.completedModules ?? 0;
    return Array.from({ length: Math.min(7, count) }, (_, i) => i);
  });
  const [submittedInfo, setSubmittedInfo] = useState<SubmittedApplicationInfo | null>(null);

  const [audioOutputMode, setAudioOutputMode] = useState<AudioOutputMode>("bluetooth");
  const [outputDevices, setOutputDevices] = useState<AudioOutputDeviceOption[]>([]);
  const [explicitSinkId, setExplicitSinkId] = useState("");
  const [testingAudio, setTestingAudio] = useState(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const previewEngineRef = useRef<LessonAudioEngine | null>(null);

  const [lessonStats, setLessonStats] = useState({
    completedModules: lockedEnrollment?.completedModules ?? 0,
    questionsAsked: 0,
  });

  useEffect(() => {
    void listAudioOutputDevices(false).then((list) => {
      setOutputDevices(list);
    });
    return () => {
      previewEngineRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!lockedEnrollment) return;
    const timer = setInterval(() => {
      const current = Date.now();
      setNowMs(current);
      const startMs = new Date(lockedEnrollment.nextLessonStartAt).getTime();
      const endMs = new Date(lockedEnrollment.nextLessonEndAt).getTime();
      if (current >= startMs && current < endMs && !existingStatus?.isLessonOpenNow) {
        void fetch("/api/cron/lesson-notifications").finally(() => {
          router.refresh();
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [existingStatus?.isLessonOpenNow, lockedEnrollment, router]);

  const syncModuleProgressToServer = useCallback(
    (nextIdx: number, completedCount: number) => {
      if (!lockedEnrollment) return;
      void fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentModuleIndex: nextIdx,
          completedModules: completedCount,
          finishTodayLesson: false,
        }),
      }).catch(() => {});
    },
    [lockedEnrollment],
  );

  const handleChangeModuleIndex = useCallback(
    (nextIdx: number) => {
      setLessonModuleIndex(nextIdx);
      syncModuleProgressToServer(nextIdx, completedModuleIndices.length);
    },
    [completedModuleIndices.length, syncModuleProgressToServer],
  );

  const handleMarkModuleCompleted = useCallback(
    (idx: number) => {
      setCompletedModuleIndices((prev) => {
        const next = prev.includes(idx) ? prev : [...prev, idx];
        syncModuleProgressToServer(lessonModuleIndex, next.length);
        return next;
      });
    },
    [lessonModuleIndex, syncModuleProgressToServer],
  );

  const handleSelectAudioMode = async (mode: AudioOutputMode) => {
    setAudioOutputMode(mode);
    setExplicitSinkId("");
    const refreshed = await listAudioOutputDevices(true);
    setOutputDevices(refreshed);
  };

  const handleTestAudioOutput = async () => {
    if (testingAudio) {
      previewEngineRef.current?.stopSpeech();
      setTestingAudio(false);
      return;
    }
    setTestingAudio(true);
    if (!previewEngineRef.current) {
      previewEngineRef.current = new LessonAudioEngine();
    }
    const { devices } = await previewEngineRef.current.configureOutput(
      audioOutputMode,
      explicitSinkId,
      true,
    );
    setOutputDevices(devices);

    const modePhrase =
      audioOutputMode === "bluetooth"
        ? "Salom! Bluetooth quloqchin orqali ovoz tiniq eshitilyapti!"
        : "Salom! Dinamik orqali ovoz tiniq eshitilyapti!";

    await previewEngineRef.current.speak(modePhrase, () => {
      setTestingAudio(false);
    });
  };

  const requestBrowserFullscreen = async () => {
    previewEngineRef.current?.stopSpeech();
    setTestingAudio(false);
    try {
      if (typeof document !== "undefined" && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen fallback gate in FullscreenAiLesson
    }
  };

  // ── MODE A: STUDENT ALREADY HAS THEIR SINGLE LOCKED UNIVERSITY TRACK ──
  if (lockedEnrollment && selectedUniversity && selectedGrade && selectedDirection) {
    const startMs = new Date(lockedEnrollment.nextLessonStartAt).getTime();
    const endMs = new Date(lockedEnrollment.nextLessonEndAt).getTime();
    const isLessonOpenLive = nowMs >= startMs && nowMs < endMs;
    const remainingSec = isLessonOpenLive ? Math.max(1, Math.floor((endMs - nowMs) / 1000)) : 0;
    const msUntilOpen = !isLessonOpenLive ? Math.max(0, startMs - nowMs) : 0;

    if (inLockedFullscreen && isLessonOpenLive) {
      return (
        <FullscreenAiLesson
          university={selectedUniversity}
          grade={selectedGrade}
          direction={selectedDirection}
          studentName={user.name}
          sessionRemainingSeconds={remainingSec}
          currentIndex={lessonModuleIndex}
          completedIndices={completedModuleIndices}
          onChangeCurrentIndex={handleChangeModuleIndex}
          onMarkModuleCompleted={handleMarkModuleCompleted}
          audioOutputMode={audioOutputMode}
          explicitSinkId={explicitSinkId}
          onChangeAudioOutputMode={(mode) => {
            setAudioOutputMode(mode);
            setExplicitSinkId("");
          }}
          onBackToSetup={() => setInLockedFullscreen(false)}
          onFinishAllModules={async (stats) => {
            setInLockedFullscreen(false);
            await fetch("/api/applications", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                currentModuleIndex: 0,
                completedModules: stats.completedModules,
                questionsAsked: stats.questionsAsked,
                finishTodayLesson: true,
              }),
            }).catch(() => {});
            router.push("/kabinet");
            router.refresh();
          }}
        />
      );
    }

    return (
      <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden">
        <DynamicAmbientBackground isAuthenticated={true} />
        <CampusNavbar user={user} />

        <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8 sm:px-6">
          <section className="glass-panel space-y-6 rounded-[1.75rem] p-6 sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/12 pb-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#c6f432]">
                  <Trophy className="h-3.5 w-3.5" />
                  YAGONA TANLANGAN YO&apos;NALISH · {lockedEnrollment.currentDayNumber}-KUN
                </span>
                <h1 className="text-xl font-black text-white sm:text-2xl">
                  #{selectedUniversity.rank} {selectedUniversity.name}
                </h1>
                <p className="text-xs text-zinc-400">
                  {selectedUniversity.country} · {selectedGrade.label} · {selectedDirection.title}
                </p>
              </div>

              <span className="glass-pill inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-zinc-200">
                <Lock className="h-3.5 w-3.5 text-[#c6f432]" />
                1 kunda 1 marta · 2 soat
              </span>
            </div>

            {isLessonOpenLive ? (
              <div className="space-y-5">
                <div className="glass-card-selected space-y-2 rounded-2xl p-5">
                  <span className="inline-flex items-center gap-2 font-mono text-xs font-black text-[#c6f432]">
                    <span className="h-2.5 w-2.5 animate-ping rounded-full bg-[#c6f432]" />
                    DARS BOSHLANDI · 2 SOATLIK DARS VAQTI OCHIQ
                  </span>
                  <p className="text-sm text-zinc-200">
                    Qolgan dars vaqti:{" "}
                    <strong className="font-mono text-white">
                      {formatCountdown(remainingSec * 1000)}
                    </strong>
                  </p>
                </div>

                {/* Audio Output Switcher */}
                <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
                  <span className="font-mono text-xs font-bold text-zinc-300">
                    OVOZ QURILMASI:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSelectAudioMode("bluetooth")}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        audioOutputMode === "bluetooth"
                          ? "bg-[#c6f432] text-[#0b0b0c]"
                          : "border border-white/15 bg-white/5 text-zinc-300"
                      }`}
                    >
                      <Bluetooth className="h-3.5 w-3.5" />
                      Bluetooth
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSelectAudioMode("speaker")}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        audioOutputMode === "speaker"
                          ? "bg-white text-[#0b0b0c]"
                          : "border border-white/15 bg-white/5 text-zinc-300"
                      }`}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      Dinamik
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleTestAudioOutput()}
                      className="glass-pill inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-[#c6f432]"
                    >
                      <Play className="h-3 w-3" />
                      {testingAudio ? "To'xtatish" : "Sinash"}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await requestBrowserFullscreen();
                    setInLockedFullscreen(true);
                  }}
                  className="btn-neon flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-extrabold sm:text-base"
                >
                  <Maximize2 className="h-5 w-5" />
                  <span>2 Soatlik Fullscreen AI Darsga Kirish</span>
                </button>
              </div>
            ) : (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c6f432]/45 bg-[#c6f432]/15 text-[#c6f432]">
                  <Clock className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white sm:text-3xl">
                    Keyingi darsga tayyorgarlik qiling
                  </h2>
                  <p className="mx-auto max-w-md text-sm text-zinc-400">
                    Bugungi 2 soatlik darsingiz yakunlangan. Tizim keyingi dars vaqtini avtomatik
                    belgiladi:
                  </p>
                </div>

                <div className="glass-card mx-auto max-w-md space-y-2 rounded-2xl p-4">
                  <div className="flex items-center justify-center gap-2 font-mono text-xs text-[#c6f432]">
                    <CalendarClock className="h-4 w-4" />
                    <span>{existingStatus?.formattedWindowLabel} (2 soat)</span>
                  </div>
                  <p className="font-mono text-2xl font-black text-white">
                    {formatCountdown(msUntilOpen)}
                  </p>
                  <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                    <MailCheck className="h-3.5 w-3.5 text-[#c6f432]" />
                    <span>
                      Vaqt bo&apos;lganda <strong className="text-zinc-200">{user.email}</strong> ga
                      &ldquo;Dars boshlandi&rdquo; xati boradi
                    </span>
                  </p>
                </div>

                <Link
                  href="/kabinet"
                  className="btn-neon inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold"
                >
                  <BookmarkCheck className="h-4 w-4" />
                  <span>Shaxsiy kabinet va tayyorgarlik vazifalari</span>
                </Link>
              </div>
            )}
          </section>
        </main>

        <CampusFooter />
      </div>
    );
  }

  // ── MODE B: FIRST-TIME SINGLE TRACK ONBOARDING (ONLY ONCE!) ──
  if (step === 4 && selectedUniversity && selectedGrade && selectedDirection) {
    return (
      <FullscreenAiLesson
        university={selectedUniversity}
        grade={selectedGrade}
        direction={selectedDirection}
        studentName={user.name}
        sessionRemainingSeconds={7200}
        currentIndex={lessonModuleIndex}
        completedIndices={completedModuleIndices}
        onChangeCurrentIndex={setLessonModuleIndex}
        onMarkModuleCompleted={(idx) =>
          setCompletedModuleIndices((prev) => (prev.includes(idx) ? prev : [...prev, idx]))
        }
        audioOutputMode={audioOutputMode}
        explicitSinkId={explicitSinkId}
        onChangeAudioOutputMode={(mode) => {
          setAudioOutputMode(mode);
          setExplicitSinkId("");
        }}
        onBackToSetup={() => setStep(3)}
        onFinishAllModules={(stats) => {
          setLessonStats(stats);
          setStep(5);
        }}
      />
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden">
      <DynamicAmbientBackground isAuthenticated={true} />
      <CampusNavbar user={user} />

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 space-y-3">
          <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 sm:px-5">
            <span className="font-mono text-xs font-bold text-zinc-300">
              OVOZ YO&apos;NALISHI:
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-white/12 bg-white/[0.04] p-1">
                <button
                  type="button"
                  onClick={() => void handleSelectAudioMode("bluetooth")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    audioOutputMode === "bluetooth"
                      ? "bg-[#c6f432] text-[#0b0b0c] shadow-[0_0_16px_rgba(198,244,50,0.4)]"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  <Bluetooth className="h-3.5 w-3.5" />
                  <span>Bluetooth</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleSelectAudioMode("speaker")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    audioOutputMode === "speaker"
                      ? "bg-white text-[#0b0b0c] shadow-[0_0_16px_rgba(255,255,255,0.3)]"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Dinamik</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => void handleTestAudioOutput()}
                className="glass-pill inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-[#c6f432]"
              >
                <Play className="h-3 w-3" />
                <span>{testingAudio ? "To'xtatish" : "Ovozni sinash"}</span>
              </button>

              {outputDevices.some((d) => !d.label.startsWith("Audio chiqish #")) && (
                <select
                  value={explicitSinkId}
                  onChange={(e) => setExplicitSinkId(e.target.value)}
                  aria-label="Aniq audio qurilmani tanlash"
                  className="glass-input max-w-[180px] truncate rounded-xl px-2.5 py-1.5 text-xs font-semibold text-white"
                >
                  <option value="" className="bg-[#0b0b0c] text-white">
                    Avto ({audioOutputMode === "bluetooth" ? "Bluetooth" : "Dinamik"})
                  </option>
                  {outputDevices.map((dev) => (
                    <option key={dev.deviceId} value={dev.deviceId} className="bg-[#0b0b0c] text-white">
                      {dev.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <nav
            aria-label="Qabul bosqichlari"
            className="glass-panel flex w-full items-center justify-between gap-1.5 rounded-full px-3 py-2 sm:px-5 sm:py-2.5"
          >
            {STEP_LABELS.map((item, idx) => {
              const Icon = item.icon;
              const isCurrent = step === item.step;
              const isCompleted = step > item.step;

              return (
                <div key={item.step} className="flex flex-1 items-center">
                  <div
                    className={`flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-bold transition sm:px-3.5 ${
                      isCurrent
                        ? "bg-[#c6f432] text-[#0b0b0c] shadow-[0_0_20px_rgba(198,244,50,0.4)]"
                        : isCompleted
                          ? "border border-[#c6f432]/45 bg-[#c6f432]/15 text-[#c6f432]"
                          : "text-zinc-400"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                        isCurrent
                          ? "bg-[#0b0b0c]/15 text-[#0b0b0c]"
                          : isCompleted
                            ? "bg-[#c6f432]/25 text-[#c6f432]"
                            : "bg-white/10 text-zinc-400"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : <Icon className="h-3 w-3" />}
                    </span>
                    <span className="hidden sm:inline">{item.title}</span>
                  </div>

                  {idx < STEP_LABELS.length - 1 && (
                    <div
                      className={`mx-1.5 h-px flex-1 transition-colors ${
                        step > item.step ? "bg-[#c6f432]/55" : "bg-white/12"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {step === 1 && (
          <StepUniversitySelect
            selectedUniversity={selectedUniversity}
            onSelect={(uni) => {
              if (uni.rank !== selectedUniversity?.rank) {
                setLessonModuleIndex(0);
                setCompletedModuleIndices([]);
              }
              setSelectedUniversity(uni);
            }}
            onNext={() => {
              if (selectedUniversity) setStep(2);
            }}
          />
        )}

        {step === 2 && selectedUniversity && (
          <StepGradeSelect
            university={selectedUniversity}
            selectedGrade={selectedGrade}
            onSelect={setSelectedGrade}
            onBack={() => setStep(1)}
            onNext={() => {
              if (selectedGrade) setStep(3);
            }}
          />
        )}

        {step === 3 && selectedUniversity && selectedGrade && (
          <StepDirectionIdentify
            university={selectedUniversity}
            grade={selectedGrade}
            selectedDirection={selectedDirection}
            onSelectDirection={setSelectedDirection}
            onBack={() => setStep(2)}
            onStartFullscreenLesson={async () => {
              if (selectedDirection) {
                await requestBrowserFullscreen();
                setStep(4);
              }
            }}
          />
        )}

        {step === 5 && selectedUniversity && selectedGrade && selectedDirection && (
          <StepSubmitApplication
            university={selectedUniversity}
            grade={selectedGrade}
            direction={selectedDirection}
            defaultName={user.name}
            userEmail={user.email}
            lessonStats={lessonStats}
            submittedInfo={submittedInfo}
            onSubmitted={(info) => {
              setSubmittedInfo(info);
              router.refresh();
            }}
            onRewatchLesson={
              submittedInfo
                ? undefined
                : async () => {
                    await requestBrowserFullscreen();
                    setStep(4);
                  }
            }
          />
        )}
      </main>

      <CampusFooter />
    </div>
  );
}
