"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cleanTextForSpeech,
  jarvisVoice,
  splitIntoNaturalSentences,
} from "@/lib/voice/jarvis-speech";

export interface SpeechSettings {
  rate: number;
  pitch: number;
  voiceGender: "female" | "male" | "auto";
}

/**
 * Matnni o'zbek tilida tabiiy va ravon o'qilishi uchun fonetik tozalash.
 */
export function preprocessUzbekText(text: string): string {
  return cleanTextForSpeech(text);
}

/**
 * Matnni to'liq, tabiiy gaplarga ajratish (so'zma-so'z yoki bo'g'inlab uzilmasligi uchun).
 */
export function splitIntoSentences(text: string): string[] {
  return splitIntoNaturalSentences(text);
}

export function useBrowserSpeech(_lang = "uz-UZ") {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [settings, setSettings] = useState<SpeechSettings>({
    rate: 1.0,
    pitch: 1.0,
    voiceGender: "auto",
  });

  useEffect(() => {
    const unsub = jarvisVoice.subscribe((s) => {
      setSpeaking(s.isSpeaking && !s.isPaused);
      setListening(s.isListening);
      setSupported(s.supported || typeof Audio !== "undefined");
      if (s.voiceName) {
        setSelectedVoiceName(s.voiceName);
      }
    });

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        const list = window.speechSynthesis.getVoices();
        if (list.length > 0) {
          setAvailableVoices(list);
        }
      };
      updateVoices();
      window.speechSynthesis.addEventListener?.("voiceschanged", updateVoices);
      return () => {
        unsub();
        window.speechSynthesis.removeEventListener?.("voiceschanged", updateVoices);
      };
    }

    return unsub;
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    jarvisVoice.speak(text, onEnd);
  }, []);

  const stop = useCallback(() => {
    jarvisVoice.stop();
  }, []);

  const startListening = useCallback((onResultText?: (text: string) => void) => {
    jarvisVoice.startListening((resText) => {
      setTranscript(resText);
      onResultText?.(resText);
    });
  }, []);

  const stopListening = useCallback(() => {
    jarvisVoice.stopListening();
  }, []);

  return {
    speaking,
    listening,
    supported,
    transcript,
    speak,
    stop,
    startListening,
    stopListening,
    settings,
    setSettings,
    availableVoices,
    selectedVoiceName,
    setSelectedVoiceName,
  };
}
