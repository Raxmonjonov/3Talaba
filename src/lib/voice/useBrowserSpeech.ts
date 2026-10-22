"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface SpeechSettings {
  rate: number;
  pitch: number;
  voiceGender: "female" | "male" | "auto";
}

/**
 * Matnni o'zbek tilida tabiiy va ravon o'qilishi uchun fonetik tozalash.
 * Qisqartmalar, formulalar va belgilarni insoniy nutqqa moslashtiradi.
 */
export function preprocessUzbekText(text: string): string {
  if (!text) return "";

  let cleaned = text
    // Markdown va maxsus belgilar
    .replace(/[*#_`>~]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // linklar matnini qoldirish
    // Qisqartmalar va belgilarni o'zbekcha yozilishi
    .replace(/\bSAT\b/gi, "Sat")
    .replace(/\bIELTS\b/gi, "Ayelts")
    .replace(/\bCEFR\b/gi, "Sefer")
    .replace(/\bXP\b/gi, "Iks Pi")
    .replace(/\bAI\b/gi, "Ey Ay")
    .replace(/\bvs\b/gi, "va")
    .replace(/\bAPI\b/gi, "Ey Pi Ay")
    .replace(/(\d+)\s*%/g, "$1 foiz")
    .replace(/(\d+)\s*\$/g, "$1 dollar")
    .replace(/\$/g, "dollar")
    .replace(/&/g, " va ")
    .replace(/=/g, " teng ")
    .replace(/\+/g, " qo'shilgan ")
    // Ko'p nuqta yoki chiziqchalarni bitta pauzaga aylantirish
    .replace(/\.{2,}/g, ".")
    .replace(/--+/g, ", ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

/**
 * Matnni tabiiy gaplar va iboralarga bo'lish (WebSpeech to'xtab qolmasligi va
 * har bir gap orasida tabiiy insoniy nafas/pauza bo'lishi uchun).
 */
export function splitIntoSentences(text: string): string[] {
  const normalized = preprocessUzbekText(text);
  if (!normalized) return [];

  // Nuqta, undov, so'roq belgilari bo'yicha bo'lish
  const rawChunks = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [normalized];
  const chunks: string[] = [];

  for (const chunk of rawChunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    // Agar gap juda uzun bo'lsa (140 belgidan ko'p), vergul bo'yicha ajratish
    if (trimmed.length > 140) {
      const subParts = trimmed.split(/,\s*/);
      let buffer = "";
      for (const part of subParts) {
        if ((buffer + ", " + part).length < 120) {
          buffer = buffer ? `${buffer}, ${part}` : part;
        } else {
          if (buffer) chunks.push(buffer);
          buffer = part;
        }
      }
      if (buffer) chunks.push(buffer);
    } else {
      chunks.push(trimmed);
    }
  }

  return chunks;
}

export function useBrowserSpeech(lang = "uz-UZ") {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [settings, setSettings] = useState<SpeechSettings>({
    rate: 0.95, // Tabiiy inson tezligi (1.0 ko'pincha robotdek tez tuyuladi)
    pitch: 1.02, // Bir oz jonliroq tembr
    voiceGender: "female",
  });

  const recognitionRef = useRef<any>(null);
  const queueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const onEndCallbackRef = useRef<(() => void) | undefined>(undefined);

  // Ovozlar ro'yxatini yuklash
  const loadVoices = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      setAvailableVoices(voices);

      // Eng mos va sifatli ovozni avtomatik tanlash
      // 1. O'zbek tili tabiiy/online ovozlar (Edge, Chrome)
      const uzNatural = voices.find(
        (v) =>
          (v.lang.startsWith("uz") || v.name.toLowerCase().includes("uzbek") || v.name.toLowerCase().includes("o'zbek")) &&
          (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Neural"))
      );

      const uzAny = voices.find(
        (v) =>
          v.lang.startsWith("uz") ||
          v.name.toLowerCase().includes("uzbek") ||
          v.name.toLowerCase().includes("o'zbek")
      );

      // 2. Qardosh turkiy tillardagi tabiiy ovozlar (o'zbekcha so'zlarni 99% to'g'ri o'qiydi)
      const trNatural = voices.find(
        (v) =>
          (v.lang.startsWith("tr") || v.name.toLowerCase().includes("turkish")) &&
          (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Neural") || v.name.includes("Google"))
      );

      // 3. Ruscha yoki Xalqaro tabiiy ovoz
      const ruNatural = voices.find(
        (v) =>
          v.lang.startsWith("ru") &&
          (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Neural"))
      );

      const bestVoice = uzNatural || uzAny || trNatural || ruNatural || voices[0];
      if (bestVoice) {
        setSelectedVoiceName(bestVoice.name);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSpeech = "speechSynthesis" in window;
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      setSupported(hasSpeech);

      loadVoices();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = lang;

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);
        recognition.onerror = () => setListening(false);
        recognition.onresult = (event: any) => {
          const text = event.results?.[0]?.[0]?.transcript || "";
          setTranscript(text);
        };
        recognitionRef.current = recognition;
      }
    }
  }, [lang, loadVoices]);

  // Tanlangan jins va sifatga ko'ra ovoz obyektini aniqlash
  const resolveBestVoice = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    if (selectedVoiceName) {
      const found = voices.find((v) => v.name === selectedVoiceName);
      if (found) return found;
    }

    // Jins bo'yicha filter
    const isFemale = settings.voiceGender === "female";
    const genderKeywords = isFemale ? ["madina", "dilara", "zira", "female", "ayol", "woman", "anna", "daria"] : ["sardor", "ahmet", "david", "male", "erkak", "man", "dmitry"];

    // 1-daraja: O'zbek tili
    const uzVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const isUz = v.lang.startsWith("uz") || name.includes("uzbek") || name.includes("o'zbek");
      return isUz && genderKeywords.some((g) => name.includes(g));
    }) || voices.find((v) => v.lang.startsWith("uz") || v.name.toLowerCase().includes("uzbek"));

    if (uzVoice) return uzVoice;

    // 2-daraja: Turkcha tabiiy (o'zbekchaga eng yaqin fonetika)
    const trVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const isTr = v.lang.startsWith("tr") || name.includes("turkish");
      return isTr && (name.includes("natural") || name.includes("neural") || name.includes("google"));
    }) || voices.find((v) => v.lang.startsWith("tr"));

    if (trVoice) return trVoice;

    // 3-daraja: Standart
    return voices[0] || null;
  }, [selectedVoiceName, settings.voiceGender]);

  // Navbatdagi gapni o'qish (sentence by sentence playback)
  const playNextChunk = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      isPlayingRef.current = false;
      setSpeaking(false);
      onEndCallbackRef.current?.();
      return;
    }

    if (queueRef.current.length === 0) {
      isPlayingRef.current = false;
      setSpeaking(false);
      onEndCallbackRef.current?.();
      return;
    }

    const chunk = queueRef.current.shift();
    if (!chunk || !chunk.trim()) {
      playNextChunk();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk.trim());
    const voice = resolveBestVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || lang;
    } else {
      utterance.lang = lang;
    }

    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    utterance.onstart = () => {
      setSpeaking(true);
    };

    utterance.onend = () => {
      // Gaplar orasida qisqa insoniy pauza (120ms)
      setTimeout(() => {
        if (isPlayingRef.current) {
          playNextChunk();
        }
      }, 120);
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis chunk error:", e);
      if (isPlayingRef.current) {
        playNextChunk();
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [lang, resolveBestVoice, settings.pitch, settings.rate]);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();
      onEndCallbackRef.current = onEnd;

      const chunks = splitIntoSentences(text);
      if (chunks.length === 0) {
        onEnd?.();
        return;
      }

      queueRef.current = chunks;
      isPlayingRef.current = true;
      setSpeaking(true);

      playNextChunk();
    },
    [playNextChunk]
  );

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    queueRef.current = [];
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const startListening = useCallback(
    (onResultText?: (text: string) => void) => {
      if (!recognitionRef.current) return;
      try {
        if (onResultText) {
          recognitionRef.current.onresult = (event: any) => {
            const text = event.results?.[0]?.[0]?.transcript || "";
            setTranscript(text);
            onResultText(text);
          };
        }
        recognitionRef.current.start();
      } catch {
        // already started
      }
    },
    []
  );

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
    setListening(false);
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
