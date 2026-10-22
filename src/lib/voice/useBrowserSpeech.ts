"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useBrowserSpeech(lang = "uz-UZ") {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSpeech = "speechSynthesis" in window;
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      setSupported(hasSpeech);

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
  }, [lang]);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();
      const clean = text
        .replace(/[*#_`>]/g, "")
        .replace(/\n+/g, " ")
        .trim();

      if (!clean) {
        onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = lang;
      utterance.rate = 1.0;

      // Select voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice =
        voices.find((v) => v.lang.startsWith("uz")) ||
        voices.find((v) => v.lang.startsWith("tr")) ||
        voices.find((v) => v.lang.startsWith("ru")) ||
        voices[0];

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setSpeaking(false);
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [lang]
  );

  const stop = useCallback(() => {
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
  };
}
