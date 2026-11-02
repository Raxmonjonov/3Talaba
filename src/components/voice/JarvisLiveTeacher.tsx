"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioLines,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Sparkles,
  TriangleAlert,
  Volume2,
} from "lucide-react";
import { LIVE_TEACHER_TOOL_DECLARATIONS } from "@/lib/ai/live-teacher";

export type LiveTeacherStage = "THEORY" | "EXAMPLES" | "EXERCISES" | "ANALYSIS";
export type LiveTeacherAction = "theory" | "examples" | "exercises" | "hint";

type Status = "idle" | "connecting" | "live" | "error";

interface LiveTeacherConfig {
  token: string;
  expiresAt: string;
  wsUrl: string;
  model: string;
  voice: string;
  systemPrompt: string;
}

interface JarvisLiveTeacherProps {
  lessonSlug: string;
  stage: LiveTeacherStage;
  questionIndex?: number;
  onAction?: (action: LiveTeacherAction) => void;
  className?: string;
}

const STAGE_LABELS: Record<LiveTeacherStage, string> = {
  THEORY: "nazariya",
  EXAMPLES: "misollar",
  EXERCISES: "mashqlar",
  ANALYSIS: "tahlil",
};

const STATUS_LABELS: Record<Status, string> = {
  idle: "Tayyor",
  connecting: "Ulanmoqda...",
  live: "Jonli dars",
  error: "Xatolik",
};

/** Float32 PCM (har qanday sample rate) -> 16 kHz Int16 PCM. */
function downsampleTo16k(input: Float32Array, inputRate: number): Int16Array {
  const ratio = inputRate / 16_000;
  if (ratio <= 1) {
    const direct = new Int16Array(input.length);
    for (let i = 0; i < input.length; i += 1) {
      const s = Math.max(-1, Math.min(1, input[i]));
      direct[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return direct;
  }

  const length = Math.max(1, Math.floor(input.length / ratio));
  const output = new Int16Array(length);
  for (let i = 0; i < length; i += 1) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j += 1) sum += input[j];
    const sample = Math.max(-1, Math.min(1, sum / Math.max(1, end - start)));
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return output;
}

function int16ToBase64(pcm: Int16Array): string {
  const bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const view = new DataView(bytes.buffer);
  const samples = new Float32Array(Math.floor(bytes.length / 2));
  for (let i = 0; i < samples.length; i += 1) {
    const value = view.getInt16(i * 2, true);
    samples[i] = value < 0 ? value / 0x8000 : value / 0x7fff;
  }
  return samples;
}

interface ServerMessage {
  setupComplete?: Record<string, unknown>;
  serverContent?: {
    interrupted?: boolean;
    turnComplete?: boolean;
    inputTranscription?: { text?: string };
    outputTranscription?: { text?: string };
    modelTurn?: {
      parts?: Array<{
        text?: string;
        inlineData?: { mimeType?: string; data?: string };
      }>;
    };
  };
  toolCall?: {
    functionCalls?: Array<{
      id?: string;
      name?: string;
      args?: Record<string, unknown>;
    }>;
  };
  goAway?: { timeLeft?: string };
  error?: { message?: string; status?: string };
}

export function JarvisLiveTeacher({
  lessonSlug,
  stage,
  questionIndex,
  onAction,
  className = "",
}: JarvisLiveTeacherProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCaption, setUserCaption] = useState("");
  const [jarvisCaption, setJarvisCaption] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const captureCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const playbackGainRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextPlayTimeRef = useRef(0);
  const speakingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutedRef = useRef(false);
  const activeRef = useRef(false);
  const onActionRef = useRef(onAction);
  const lastStageRef = useRef(stage);
  const stageRef = useRef(stage);
  const questionIndexRef = useRef(questionIndex);
  const statusRef = useRef<Status>("idle");

  useEffect(() => {
    onActionRef.current = onAction;
  }, [onAction]);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    questionIndexRef.current = questionIndex;
  }, [questionIndex]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const clearSpeakingTimer = useCallback(() => {
    if (speakingTimerRef.current) {
      clearTimeout(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }
  }, []);

  const stopPlayback = useCallback(() => {
    clearSpeakingTimer();
    sourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // already stopped
      }
    });
    sourcesRef.current.clear();
    nextPlayTimeRef.current = 0;
    setSpeaking(false);
  }, [clearSpeakingTimer]);

  const ensurePlaybackContext = useCallback((): AudioContext => {
    if (playbackCtxRef.current && playbackCtxRef.current.state !== "closed") {
      if (playbackCtxRef.current.state === "suspended") {
        void playbackCtxRef.current.resume();
      }
      return playbackCtxRef.current;
    }
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor({ sampleRate: 24_000 });
    const gain = ctx.createGain();
    gain.gain.value = 1;
    gain.connect(ctx.destination);
    playbackCtxRef.current = ctx;
    playbackGainRef.current = gain;
    nextPlayTimeRef.current = 0;
    return ctx;
  }, []);

  const scheduleSpeakingReset = useCallback(() => {
    clearSpeakingTimer();
    const ctx = playbackCtxRef.current;
    const waitMs = ctx ? Math.max(0, (nextPlayTimeRef.current - ctx.currentTime) * 1000) + 180 : 180;
    speakingTimerRef.current = setTimeout(() => {
      if (sourcesRef.current.size === 0) setSpeaking(false);
    }, waitMs);
  }, [clearSpeakingTimer]);

  const playPcmChunk = useCallback(
    (base64: string) => {
      if (!base64) return;
      try {
        const ctx = ensurePlaybackContext();
        const samples = base64ToFloat32(base64);
        if (!samples.length) return;

        const buffer = ctx.createBuffer(1, samples.length, 24_000);
        buffer.getChannelData(0).set(samples);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(playbackGainRef.current ?? ctx.destination);

        const startAt = Math.max(ctx.currentTime + 0.02, nextPlayTimeRef.current);
        source.start(startAt);
        nextPlayTimeRef.current = startAt + buffer.duration;

        sourcesRef.current.add(source);
        source.onended = () => sourcesRef.current.delete(source);

        setSpeaking(true);
        clearSpeakingTimer();
        speakingTimerRef.current = setTimeout(() => {
          const active = playbackCtxRef.current;
          if (!active) return;
          if (nextPlayTimeRef.current - active.currentTime <= 0.02) setSpeaking(false);
        }, Math.max(240, (nextPlayTimeRef.current - ctx.currentTime) * 1000 + 200));
      } catch (err) {
        console.error("Talaba AI audio playback error", err);
      }
    },
    [clearSpeakingTimer, ensurePlaybackContext],
  );

  const teardown = useCallback(() => {
    activeRef.current = false;

    const ws = wsRef.current;
    wsRef.current = null;
    if (ws) {
      try {
        ws.close(1000);
      } catch {
        // ignore
      }
    }

    processorRef.current?.disconnect();
    processorRef.current = null;

    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;

    if (captureCtxRef.current && captureCtxRef.current.state !== "closed") {
      void captureCtxRef.current.close();
    }
    captureCtxRef.current = null;

    stopPlayback();
    if (playbackCtxRef.current && playbackCtxRef.current.state !== "closed") {
      void playbackCtxRef.current.close();
    }
    playbackCtxRef.current = null;
    playbackGainRef.current = null;
  }, [stopPlayback]);

  useEffect(() => {
    return () => {
      teardown();
    };
  }, [teardown]);

  const handleServerMessage = useCallback(
    (msg: ServerMessage) => {
      if (msg.setupComplete) {
        statusRef.current = "live";
        setStatus("live");
        return;
      }

      if (msg.error) {
        setError(msg.error.message || "Talaba AI sessiyasida xatolik yuz berdi.");
        setStatus("error");
        teardown();
        return;
      }

      if (msg.goAway) {
        setError("Seans muddati tugadi. Qaytadan boshlang.");
        setStatus("error");
        teardown();
        return;
      }

      const content = msg.serverContent;
      if (content) {
        if (content.interrupted) stopPlayback();

        if (content.inputTranscription?.text) {
          setUserCaption((prev) => (prev + content.inputTranscription!.text!).slice(-400));
        }

        if (content.outputTranscription?.text) {
          setJarvisCaption((prev) => (prev + content.outputTranscription!.text!).slice(-600));
        }

        for (const part of content.modelTurn?.parts ?? []) {
          const mime = part.inlineData?.mimeType || "";
          if (part.inlineData?.data && (mime.startsWith("audio/") || !mime)) {
            playPcmChunk(part.inlineData.data);
          } else if (part.text) {
            setJarvisCaption((prev) => (prev + part.text).slice(-600));
          }
        }

        if (content.turnComplete) scheduleSpeakingReset();
      }

      if (msg.toolCall?.functionCalls?.length) {
        const responses: Array<{ id?: string; name?: string; response: Record<string, unknown> }> = [];
        for (const call of msg.toolCall.functionCalls) {
          if (call.name === "lesson_control") {
            const rawAction = String(call.args?.action || "").toLowerCase();
            if (rawAction === "hint") {
              lastStageRef.current = "EXERCISES";
              onActionRef.current?.("hint");
            } else if (
              rawAction === "theory" ||
              rawAction === "examples" ||
              rawAction === "exercises"
            ) {
              lastStageRef.current = rawAction.toUpperCase() as LiveTeacherStage;
              onActionRef.current?.(rawAction);
            }
            responses.push({
              id: call.id,
              name: call.name,
              response: {
                result: "ok",
                action: rawAction,
                ui_stage: lastStageRef.current,
                question_index: questionIndexRef.current ?? null,
              },
            });
          } else {
            responses.push({
              id: call.id,
              name: call.name,
              response: { error: "Noma'lum funksiya" },
            });
          }
        }

        const ws = wsRef.current;
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ toolResponse: { functionResponses: responses } }));
        }
      }
    },
    [playPcmChunk, scheduleSpeakingReset, stopPlayback, teardown],
  );

  const startSession = useCallback(async () => {
    if (statusRef.current === "connecting" || statusRef.current === "live") return;

    setError(null);
    setUserCaption("");
    setJarvisCaption("");
    setStatus("connecting");
    statusRef.current = "connecting";
    lastStageRef.current = stage;

    try {
      const res = await fetch("/api/ai/live-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: lessonSlug,
          stage,
          questionIndex: questionIndexRef.current,
        }),
      });

      const payload = (await res.json().catch(() => null)) as
        | (LiveTeacherConfig & { error?: string })
        | null;

      if (!res.ok || !payload?.token) {
        throw new Error(payload?.error || "Talaba AI sessiyasini boshlab bo'lmadi.");
      }

      const config = payload;
      ensurePlaybackContext();
      activeRef.current = true;

      const wsUrl = `${config.wsUrl}?access_token=${encodeURIComponent(config.token)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            setup: {
              model: config.model,
              generationConfig: {
                responseModalities: ["AUDIO"],
                thinkingConfig: { thinkingBudget: 0 },
                speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voice } },
                },
              },
              systemInstruction: { parts: [{ text: config.systemPrompt }] },
              realtimeInputConfig: {
                automaticActivityDetection: {
                  silenceDurationMs: 650,
                  prefixPaddingMs: 120,
                },
              },
              inputAudioTranscription: {},
              outputAudioTranscription: {},
              contextWindowCompression: { slidingWindow: {} },
              tools: [{ functionDeclarations: LIVE_TEACHER_TOOL_DECLARATIONS }],
            },
          }),
        );
      };

      ws.onmessage = (event: MessageEvent) => {
        const handle = async () => {
          try {
            const raw =
              typeof event.data === "string"
                ? event.data
                : event.data instanceof Blob
                  ? await event.data.text()
                  : String(event.data);
            handleServerMessage(JSON.parse(raw) as ServerMessage);
          } catch (err) {
            console.error("Talaba AI message parse error", err);
          }
        };
        void handle();
      };

      ws.onerror = () => {
        if (!activeRef.current) return;
        setError("Talaba AI bilan aloqa uzildi. Internetni tekshirib, qayta urinib ko'ring.");
        setStatus("error");
        teardown();
      };

      ws.onclose = () => {
        if (!activeRef.current) return;
        teardown();
        setStatus("idle");
      };

      // Mikrofonni faqat WebSocket tayyor bo'lgach yoqamiz.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (!activeRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      micStreamRef.current = stream;

      const captureCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const captureCtx = new captureCtor();
      captureCtxRef.current = captureCtx;

      const source = captureCtx.createMediaStreamSource(stream);
      const processor = captureCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const sink = captureCtx.createGain();
      sink.gain.value = 0;

      processor.onaudioprocess = (audioEvent) => {
        const socket = wsRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        if (!activeRef.current || mutedRef.current) return;

        const input = audioEvent.inputBuffer.getChannelData(0);
        const pcm = downsampleTo16k(input, captureCtx.sampleRate);
        socket.send(
          JSON.stringify({
            realtimeInput: {
              audio: {
                data: int16ToBase64(pcm),
                mimeType: "audio/pcm;rate=16000",
              },
            },
          }),
        );
      };

      source.connect(processor);
      processor.connect(sink);
      sink.connect(captureCtx.destination);
    } catch (err) {
      teardown();
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Mikrofonga ruxsat berilmadi. Brauzer sozlamalaridan ruxsat bering."
          : err instanceof Error
            ? err.message
            : "Talaba AI sessiyasini boshlab bo'lmadi.";
      setError(message);
      setStatus("error");
    }
  }, [ensurePlaybackContext, handleServerMessage, lessonSlug, stage, teardown]);

  const endSession = useCallback(() => {
    teardown();
    statusRef.current = "idle";
    setStatus("idle");
  }, [teardown]);

  // O'quvchi bosqichni qo'lda o'zgartirsa, agentga xabar beramiz.
  useEffect(() => {
    if (statusRef.current !== "live") return;
    if (lastStageRef.current === stage) return;
    lastStageRef.current = stage;

    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          realtimeInput: {
            text: `[INTERFEYS] O'quvchi endi "${STAGE_LABELS[stage]}" bosqichiga o'tdi. Suhbatni shu bosqichga moslab davom ettir.`,
          },
        }),
      );
    }
  }, [stage]);

  const isActive = status === "connecting" || status === "live";
  const statusText =
    status === "live" && speaking
      ? "Talaba AI gapirmoqda..."
      : status === "live" && muted
        ? "Mikrofon o'chirilgan"
        : STATUS_LABELS[status];

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (isActive) {
            endSession();
          } else {
            void startSession();
          }
        }}
        aria-label={isActive ? "Talaba AI darsini yakunlash" : "Talaba AI jonli ustoz bilan darsni boshlash"}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
          isActive
            ? "border-neon bg-neon-soft text-neon shadow-neon"
            : "border-gold/50 bg-gold-soft text-gold hover:border-gold"
        } ${className}`}
      >
        {status === "live" ? (
          <Radio className="h-3.5 w-3.5 animate-pulse" />
        ) : status === "connecting" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        <span>{isActive ? "Talaba AI dars o'tmoqda" : "Talaba AI jonli ustoz"}</span>
      </button>

      {status !== "idle" && (
        <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-2xl border border-neon/40 bg-canvas/95 p-4 shadow-neon backdrop-blur-md sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[380px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-neon/50 bg-neon-soft">
                <AudioLines
                  className={`h-4 w-4 text-neon ${speaking ? "animate-pulse" : ""}`}
                />
              </span>
              <div>
                <p className="text-xs font-extrabold tracking-wide text-fg">Talaba AI</p>
                <p className="text-[10px] font-semibold text-neon">{statusText}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMuted((value) => !value)}
                aria-label={muted ? "Mikrofonni yoqish" : "Mikrofonni o'chirish"}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                  muted
                    ? "border-danger/50 bg-danger/10 text-danger"
                    : "border-border bg-elevated text-fg-muted hover:text-fg"
                }`}
              >
                {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={endSession}
                aria-label="Darsni yakunlash"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-elevated text-fg-muted transition-colors hover:border-danger/50 hover:text-danger"
              >
                <PhoneOff className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 p-2.5 text-[11px] leading-relaxed text-danger">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    void startSession();
                  }}
                  className="mt-1.5 font-bold underline underline-offset-2"
                >
                  Qayta urinish
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-1.5">
              <p className="min-h-[16px] line-clamp-2 text-[11px] leading-snug text-fg-muted">
                <span className="font-bold text-fg">Siz:</span>{" "}
                {userCaption || "…"}
              </p>
              <p className="min-h-[32px] line-clamp-3 text-[11px] leading-snug text-fg">
                <span className="inline-flex items-center gap-1 font-bold text-neon">
                  <Volume2 className="h-3 w-3" />
                  Talaba AI:
                </span>{" "}
                {jarvisCaption || "Dars boshlanmoqda..."}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
