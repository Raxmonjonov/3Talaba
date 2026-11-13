"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { jarvisVoice } from "@/lib/voice/jarvis-speech";

export interface UsePushToTalkOptions {
  onTranscript?: (text: string) => void;
  onStartListening?: () => void;
  onStopListening?: () => void;
  enabled?: boolean;
}

/**
 * Space (probel) tugmasi bosilganda ovozli dinlanishni boshlaydi,
 * qo'ng'iroq bo'lganda to'xtatadi (push-to-talk).
 * Web Speech API SpeechRecognition orqali mikrofon orqali savolni qabul qiladi.
 */
export function usePushToTalk({
  onTranscript,
  onStartListening,
  onStopListening,
  enabled = true,
}: UsePushToTalkOptions = {}) {
  const [listening, setListening] = useState(false);
  const spacePressed = useRef(false);

  const start = useCallback(() => {
    if (!enabled || listening || spacePressed.current) return;
    spacePressed.current = true;
    jarvisVoice.startListening(
      (transcript) => {
        if (transcript.trim()) {
          onTranscript?.(transcript.trim());
        }
      },
      () => {
        setListening(false);
        spacePressed.current = false;
        onStopListening?.();
      },
    );
    setListening(true);
    onStartListening?.();
  }, [enabled, listening, onTranscript, onStartListening, onStopListening]);

  const stop = useCallback(() => {
    if (!listening || !spacePressed.current) return;
    spacePressed.current = false;
    jarvisVoice.stopListening();
    setListening(false);
    onStopListening?.();
  }, [listening, onStopListening]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === " " || e.code === "Space") && !e.repeat) {
        e.preventDefault();
        start();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        stop();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      spacePressed.current = false;
      if (listening) {
        jarvisVoice.stopListening();
        setListening(false);
      }
    };
  }, [enabled, listening, start, stop]);

  return { listening, start, stop };
}
