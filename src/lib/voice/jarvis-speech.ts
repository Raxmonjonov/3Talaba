/**
 * 3Talab — JARVIS AI Ovozli Agenti (TTS & STT Dvigateli)
 *
 * JARVIS-OS-V.2 arxitekturasi asosida:
 * - Ovoz tembri: Chuqur, jiddiy, intellektual va samimiy ohang (Pitch: 0.92, Rate: 0.98)
 * - Afzal ko'rilgan ovozlar: Microsoft Guy / Sardor / David / Google UK Male / Onyx-style
 * - Matematik formulalar va Markdown belgilarini toza o'zbekcha talaffuzga moslash
 */

export interface JarvisVoiceState {
  isSpeaking: boolean;
  isPaused: boolean;
  isListening: boolean;
  currentText: string;
}

/**
 * Matndagi LaTeX, formulalar va markdown belgilarini audio talaffuzga moslaydi.
 */
export function cleanTextForSpeech(text: string): string {
  let cleaned = text
    .replace(/[\*\_#`]/g, "") // Markdown formatlash belgilarini olib tashlash
    .replace(/\[.*?\]\(.*?\)/g, "") // Havolalarni tozalash
    .replace(/\$\$(.*?)\$\$/g, "$1") // LaTeX bloklari
    .replace(/\$(.*?)\$/g, "$1") // LaTeX inline
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

  return cleaned;
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
  };

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
    }
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

  /**
   * JARVIS uslubidagi eng yaxshi mos keluvchi ovozni tanlaydi
   */
  private selectJarvisVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (voices.length === 0) return null;

    // 1. Agar o'zbekcha ovoz bo'lsa
    const uzVoice = voices.find((v) => v.lang.startsWith("uz") || v.name.toLowerCase().includes("uzbek"));
    if (uzVoice) return uzVoice;

    // 2. Microsoft Guy / Sardor / David / Google UK Male / Natural erkak ovozlari
    const jarvisKeywords = [
      "guy",
      "sardor",
      "david",
      "george",
      "male",
      "natural",
      "richard",
      "james",
    ];

    for (const kw of jarvisKeywords) {
      const match = voices.find((v) => v.name.toLowerCase().includes(kw));
      if (match) return match;
    }

    // 3. Inglizcha default
    return voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
  }

  /**
   * Matnni JARVIS ovozida gapiradi
   */
  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) return;

    this.stop();

    const spokenText = cleanTextForSpeech(text);
    if (!spokenText) return;

    const utter = new SpeechSynthesisUtterance(spokenText);
    const voice = this.selectJarvisVoice();
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    }

    // JARVIS ovoz parametrlari:
    utter.pitch = 0.92; // Chuqur, jiddiy va intellektual tembr
    utter.rate = 0.98; // Sokin, ravon va tushunarli tezlik
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
      onEnd?.();
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

  /**
   * O'quvchi ovozini mikrofon orqali matnga aylantirish (Speech-to-Text)
   */
  public startListening(onResult: (transcript: string) => void, onError?: () => void) {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Brauzeringizda ovozni tanish (SpeechRecognition) qo'llab-quvvatlanmaydi.");
      onError?.();
      return;
    }

    try {
      this.stopListening();
      const rec = new SpeechRecognition();
      rec.lang = "uz-UZ";
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        this.state.isListening = true;
        this.notify();
      };

      rec.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onResult(transcript);
        }
      };

      rec.onerror = () => {
        this.state.isListening = false;
        this.notify();
        onError?.();
      };

      rec.onend = () => {
        this.state.isListening = false;
        this.notify();
      };

      this.recognition = rec;
      rec.start();
    } catch {
      this.state.isListening = false;
      this.notify();
      onError?.();
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
      this.state.isListening = false;
      this.notify();
    }
  }
}

export const jarvisVoice = new JarvisVoiceEngine();
