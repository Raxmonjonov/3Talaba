/**
 * 3Talab — Haqiqiy JARVIS AI Ovoz Dvigateli (MARK XXXIX)
 *
 * JARVIS-OS-V.2 tizimidagi original ovoz arxitekturasi:
 * - Ovoz xarakteri: British AI baritone (Paul Bettany / Ryan / Guy tembri)
 * - O'zbekcha ravon talaffuz rejimi (Mahalliy toza nutq)
 * - Pitch & Rate: Chuqur vazmin rezonans
 */

export type VoiceMode = "jarvis-original" | "uzbek-native";

export interface JarvisVoiceState {
  isSpeaking: boolean;
  isPaused: boolean;
  isListening: boolean;
  currentText: string;
  voiceName: string;
  mode: VoiceMode;
}

export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[\*\_#`]/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/\$\$(.*?)\$\$/g, "$1")
    .replace(/\$(.*?)\$/g, "$1")
    .replace(/x\^2/g, "x kvadrat")
    .replace(/a\^2/g, "a kvadrat")
    .replace(/b\^2/g, "b kvadrat")
    .replace(/c\^2/g, "c kvadrat")
    .replace(/r\^2/g, "r kvadrat")
    .replace(/√/g, "ildiz ostida ")
    .replace(/≠/g, "teng emas ")
    .replace(/≤/g, "kichik yoki teng ")
    .replace(/≥/g, "katta yoki teng ")
    .replace(/±/g, "plyus minus ")
    .replace(/π/g, "pi soni ")
    .replace(/\+/g, " qo'shuv ")
    .replace(/−|-/g, " ayiruv ")
    .replace(/·|\*/g, " ko'paytuv ")
    .replace(/=/g, " teng ")
    .replace(/\s+/g, " ")
    .trim();
}

class JarvisVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<(state: JarvisVoiceState) => void> = new Set();
  private recognition: any = null;

  public state: JarvisVoiceState = {
    isSpeaking: false,
    isPaused: false,
    isListening: false,
    currentText: "",
    voiceName: "JARVIS British Baritone",
    mode: "jarvis-original",
  };

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          const v = this.selectVoice(this.state.mode);
          if (v) this.state.voiceName = v.name;
          this.notify();
        };
      }
    }
  }

  public setMode(mode: VoiceMode) {
    this.state.mode = mode;
    const v = this.selectVoice(mode);
    if (v) this.state.voiceName = v.name;
    this.notify();
  }

  public subscribe(callback: (state: JarvisVoiceState) => void) {
    this.listeners.add(callback);
    callback(this.state);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    for (const cb of this.listeners) {
      cb({ ...this.state });
    }
  }

  public selectVoice(mode: VoiceMode = this.state.mode): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (voices.length === 0) return null;

    if (mode === "uzbek-native") {
      const uzVoice = voices.find(
        (v) => v.lang.startsWith("uz") || v.name.toLowerCase().includes("uzbek") || v.name.toLowerCase().includes("sardor")
      );
      if (uzVoice) return uzVoice;
    }

    // Original JARVIS (British AI baritone)
    const jarvisKeywords = [
      "google uk english male",
      "en-gb",
      "ryan",
      "guy",
      "george",
      "daniel",
      "david",
      "arthur",
      "male",
    ];

    for (const kw of jarvisKeywords) {
      const match = voices.find((v) => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        return name.includes(kw) || (kw === "en-gb" && lang.startsWith("en-gb"));
      });
      if (match) return match;
    }

    return voices[0] || null;
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) return;

    this.stop();

    const spokenText = cleanTextForSpeech(text);
    if (!spokenText) return;

    const utter = new SpeechSynthesisUtterance(spokenText);
    const voice = this.selectVoice(this.state.mode);
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
      this.state.voiceName = voice.name;
    }

    if (this.state.mode === "jarvis-original") {
      utter.pitch = 0.84; // Chuqur vazmin AI bariton
      utter.rate = 0.92;
    } else {
      utter.pitch = 1.0;
      utter.rate = 1.0;
    }
    utter.volume = 1.0;

    utter.onstart = () => {
      this.state.isSpeaking = true;
      this.state.isPaused = false;
      this.state.currentText = text;
      this.notify();
    };

    utter.onend = () => {
      this.state.isSpeaking = false;
      this.state.isPaused = false;
      this.state.currentText = "";
      this.notify();
      if (onEnd) onEnd();
    };

    utter.onerror = () => {
      this.state.isSpeaking = false;
      this.state.isPaused = false;
      this.state.currentText = "";
      this.notify();
    };

    this.currentUtterance = utter;
    this.synth.speak(utter);
  }

  public pause() {
    if (this.synth && this.state.isSpeaking) {
      this.synth.pause();
      this.state.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.synth && this.state.isPaused) {
      this.synth.resume();
      this.state.isPaused = false;
      this.notify();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.state.isSpeaking = false;
      this.state.isPaused = false;
      this.state.currentText = "";
      this.notify();
    }
  }

  public startListening(
    onResult: (transcript: string) => void,
    onError?: (err: string) => void
  ) {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (onError) onError("Brauzeringiz ovozli kiritishni qo'llab-quvvatlamaydi.");
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = "uz-UZ";
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.state.isListening = true;
        this.notify();
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript ?? "";
        this.state.isListening = false;
        this.notify();
        onResult(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.state.isListening = false;
        this.notify();
        if (onError) onError(event.error);
      };

      this.recognition.onend = () => {
        this.state.isListening = false;
        this.notify();
      };

      this.recognition.start();
    } catch (e: any) {
      this.state.isListening = false;
      this.notify();
      if (onError) onError(e?.message ?? "Mikrofonni yoqishda xatolik");
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.state.isListening = false;
      this.notify();
    }
  }
}

export const jarvisVoice = new JarvisVoiceEngine();
