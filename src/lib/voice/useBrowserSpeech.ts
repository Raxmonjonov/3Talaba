"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cleanTextForSpeech,
  filterNaturalVoices,
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
  const [paused, setPaused] = useState(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [currentSentence, setCurrentSentence] = useState<string>("");
  const [sentenceIndex, setSentenceIndex] = useState<number>(0);
  const [totalSentences, setTotalSentences] = useState<number>(0);

  // Talab bo'yicha standart sozlamalar: rate = 0.95, pitch = 1.0
  const [settings, setSettings] = useState<SpeechSettings>({
    rate: 0.95,
    pitch: 1.0,
    voiceGender: "auto",
  });

  useEffect(() => {
    jarvisVoice.speechRate = settings.rate;
    jarvisVoice.speechPitch = settings.pitch;
    jarvisVoice.setVoiceGender(settings.voiceGender);
  }, [settings]);

  useEffect(() => {
    const unsub = jarvisVoice.subscribe((s) => {
      setSpeaking(s.isSpeaking && !s.isPaused);
      setPaused(s.isPaused);
      setListening(s.isListening);
      setSupported(s.supported);
      setCurrentSentence(s.currentSentence || "");
      setSentenceIndex(s.sentenceIndex || 0);
      setTotalSentences(s.totalSentences || 0);
      if (s.voiceName) {
        setSelectedVoiceName(s.voiceName);
      }
    });

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        const list = window.speechSynthesis.getVoices();
        if (list.length > 0) {
          // Eng sifatli Natural va qolgan ovozlarni tartiblab qo'yamiz
          const natural = filterNaturalVoices(list);
          const others = list.filter((v) => !natural.includes(v));
          setAvailableVoices([...natural, ...others]);
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

  const play = useCallback((text?: string, onEnd?: () => void) => {
    void jarvisVoice.play(text, onEnd);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    jarvisVoice.speak(text, onEnd);
  }, []);

  const pause = useCallback(() => {
    jarvisVoice.pause();
  }, []);

  const resume = useCallback(() => {
    jarvisVoice.resume();
  }, []);

  const stop = useCallback(() => {
    jarvisVoice.stop();
  }, []);

  const handleSelectVoice = useCallback((name: string) => {
    setSelectedVoiceName(name);
    jarvisVoice.setVoiceByName(name);
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
    paused,
    listening,
    supported,
    transcript,
    currentSentence,
    sentenceIndex,
    totalSentences,
    play,
    speak,
    pause,
    resume,
    stop,
    startListening,
    stopListening,
    settings,
    setSettings,
    availableVoices,
    selectedVoiceName,
    setSelectedVoiceName: handleSelectVoice,
  };
}
