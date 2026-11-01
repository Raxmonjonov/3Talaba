"use client";

import React, { useEffect, useState } from "react";
import {
  Mic,
  MicOff,
  Pause,
  Play,
  Square,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";
import { jarvisVoice, type JarvisVoiceState } from "@/lib/voice/jarvis-speech";

export function JarvisVoiceButton({
  text,
  label = "Jarvis ovozida tinglash",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [voiceState, setVoiceState] = useState<JarvisVoiceState>(jarvisVoice.state);

  useEffect(() => {
    return jarvisVoice.subscribe((s) => setVoiceState(s));
  }, []);

  const isCurrent = voiceState.currentText === text;
  const isPlaying = isCurrent && voiceState.isSpeaking && !voiceState.isPaused;
  const isPaused = isCurrent && voiceState.isPaused;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      jarvisVoice.pause();
    } else if (isPaused) {
      jarvisVoice.resume();
    } else {
      jarvisVoice.speak(text);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    jarvisVoice.stop();
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
          isPlaying
            ? "border-neon bg-neon-soft text-neon shadow-neon animate-pulse"
            : isPaused
              ? "border-gold bg-gold-soft text-gold"
              : "border-white/10 bg-surface/80 text-fg-muted hover:border-neon hover:text-neon"
        }`}
        title={isPlaying ? "Vaqtincha to'xtatish" : "Jarvis ovozida tinglash"}
      >
        {isPlaying ? (
          <>
            <Pause className="h-3.5 w-3.5" />
            <span>Pauza</span>
            {/* Audio to'lqin nishoni */}
            <span className="flex items-center gap-0.5 ml-1">
              <span className="h-2.5 w-0.5 bg-neon animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-3.5 w-0.5 bg-neon animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-0.5 bg-neon animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          </>
        ) : isPaused ? (
          <>
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Davom etish</span>
          </>
        ) : (
          <>
            <Volume2 className="h-3.5 w-3.5" />
            <span>{label}</span>
          </>
        )}
      </button>

      {isCurrent && (voiceState.isSpeaking || voiceState.isPaused) && (
        <button
          type="button"
          onClick={handleStop}
          className="rounded-xl border border-white/10 bg-surface p-1.5 text-fg-muted hover:text-danger"
          title="To'xtatish"
        >
          <Square className="h-3.5 w-3.5 fill-current" />
        </button>
      )}
    </div>
  );
}

export function JarvisMicButton({
  onTranscript,
  className = "",
}: {
  onTranscript: (text: string) => void;
  className?: string;
}) {
  const [listening, setListening] = useState(false);

  useEffect(() => {
    return jarvisVoice.subscribe((s) => setListening(s.isListening));
  }, []);

  const toggleMic = () => {
    if (listening) {
      jarvisVoice.stopListening();
    } else {
      jarvisVoice.startListening(
        (transcript) => {
          onTranscript(transcript);
        },
        () => {
          setListening(false);
        }
      );
    }
  };

  return (
    <button
      type="button"
      onClick={toggleMic}
      className={`relative inline-flex items-center justify-center rounded-2xl p-3 transition-all ${
        listening
          ? "border border-danger bg-danger/20 text-danger shadow-lg animate-pulse"
          : "border border-white/10 bg-surface/80 text-fg-muted hover:border-neon hover:text-neon"
      } ${className}`}
      title={listening ? "Eshitilmoqda... To'xtatish uchun bosing" : "Ovoz bilan gapirish (Mikrofon)"}
    >
      {listening ? (
        <>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-danger" />
          </span>
          <Mic className="h-5 w-5" />
        </>
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </button>
  );
}
