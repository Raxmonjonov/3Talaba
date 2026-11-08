/**
 * TALABA AI — TABIIY INSONIY OVOZ (NEURAL TTS + WEB SPEECH API) VA MIKROFON (STT) TIZIMI
 * --------------------------------------------------------------------------------------
 * 1. Server-side Neural TTS (`/api/tts` — OpenAI `tts-1`, ElevenLabs `eleven_multilingual_v2`
 *    yoki neyro-audio oqimi) orqali ravon, insoniy ovozda o'qiydi.
 * 2. Agar tashqi TTS ulanmagan yoki oflayn bo'lsa, `window.speechSynthesis` orqali
 *    gaplarni harfma-harf bo'lmasdan, to'liq va ravon gap sifatida (`rate = 1.0`, `pitch = 1.0`)
 *    eng sifatli `uz-UZ` yoki ko'p tilli neyro ovozda o'qiydi.
 */

export interface JarvisVoiceState {
  isSpeaking: boolean;
  isPaused: boolean;
  isListening: boolean;
  supported: boolean;
  voiceName: string;
  currentText: string;
}

type VoiceListener = (state: JarvisVoiceState) => void;

/**
 * Matn va matematik formulalarni ovozli o'qishda insondek tabiiy eshitilishi uchun
 * fonetik va matematik normallashtirish funksiyasi.
 * MUHIM: O'zbekcha qo'shma so'zlardagi ("ketma-ket", "yo'l-yo'riq", "o'z-o'zidan", "1-qadam")
 * defislarni HECH QACHON "ayiruv" deb o'qimaydi!
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return "";

  return (
    text
      // 1. LaTeX bloklari va inline belgilarini ochish
      .replace(/\$\$(.*?)\$\$/g, " $1 ")
      .replace(/\$(.*?)\$/g, " $1 ")
      // 2. Markdown formatlash belgilarini tozalash (matnni buzmasdan)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[\*\#`_~>]/g, "")
      .replace(/•/g, ". ")
      // 3. O'zbekcha tartib sonlar: "1-qadam" -> "1-chi qadam", "2-bosqich" -> "2-chi bosqich"
      .replace(
        /\b(\d+)\s*-\s*(qadam|bosqich|usul|qoida|shart|misol|mashq|savol|modul|dars|qism|band)\b/gi,
        "$1-chi $2"
      )
      // 4. O'zbek lotin yozuvidagi o', g' va tutuq belgilarini yagona standartga keltirish
      .replace(/[ʻʼ‘’`´]/g, "'")
      // 5. Keng tarqalgan funksiya va indeksli o'zgaruvchilar
      .replace(/\bf\s*\(\s*x\s*\)/gi, "f iks")
      .replace(/\bg\s*\(\s*x\s*\)/gi, "g iks")
      .replace(/\bP\s*\(\s*A\s*\)/g, "P A ehtimollik")
      .replace(/\b(\d+|m|a|b|k)x\b/g, "$1 iks")
      .replace(/\bx_?1\b/g, "iks bir")
      .replace(/\bx_?2\b/g, "iks ikki")
      .replace(/\by_?1\b/g, "y bir")
      .replace(/\by_?2\b/g, "y ikki")
      .replace(/\bm_?1\b/g, "m bir")
      .replace(/\bm_?2\b/g, "m ikki")
      .replace(/\bb_?1\b/g, "b bir")
      .replace(/\bb_?2\b/g, "b ikki")
      .replace(/\ba_?1\b/g, "a bir")
      .replace(/\ba_?2\b/g, "a ikki")
      // 6. Darajalar va ildizlar
      .replace(/([a-zA-Z0-9\)]+)\s*\^\s*2\b/g, "$1 kvadrat")
      .replace(/([a-zA-Z0-9\)]+)\s*\^\s*3\b/g, "$1 kub")
      .replace(/([a-zA-Z0-9\)]+)²/g, "$1 kvadrat")
      .replace(/([a-zA-Z0-9\)]+)³/g, "$1 kub")
      .replace(/\^\s*°/g, " gradus")
      .replace(/°/g, " gradus ")
      .replace(/√\s*([0-9a-zA-Z\(]+)/g, "ildiz ostida $1")
      // 7. Matematik amallar (faqat haqiqiy matematik kontekstda!)
      .replace(/≠/g, " teng emas ")
      .replace(/≈/g, " taxminan teng ")
      .replace(/≤|⩽/g, " kichik yoki teng ")
      .replace(/≥|⩾/g, " katta yoki teng ")
      .replace(/±/g, " plyus minus ")
      .replace(/×|⋅|·/g, " ko'paytiruv ")
      .replace(/÷/g, " bo'luv ")
      .replace(/\+/g, " qo'shuv ")
      .replace(/=/g, " teng ")
      // Haqiqiy minus belgisi (Unicode −) yoki ikki tomonida bo'sh joy bo'lgan " - " matematik ayiruv:
      .replace(/−/g, " ayiruv ")
      .replace(/(\d|[a-zA-Z\)])\s+-\s+(\d|[a-zA-Z\(])/g, "$1 ayiruv $2")
      // Manfiy sonlar (masalan: "= -1", "(-b)"):
      .replace(/(teng|\()\s*-(\d|[a-zA-Z])/g, "$1 minus $2")
      // Kasr chizig'i "/" — matematik ifodalarda "taqsim", so'zlar orasida "yoki":
      .replace(/(\)|[0-9a-zA-Z])\s*\/\s*(\(|[0-9a-zA-Z])/g, "$1 taqsim $2")
      // 8. Foiz va valyuta
      .replace(/(\d+)\s*%/g, "$1 foiz")
      // 9. Qavslarni yumshoq vergul-pauzaga aylantirish (gap ohangini buzmaslik uchun)
      .replace(/\(\s*/g, ", ")
      .replace(/\s*\)/g, ", ")
      // 10. Emoji va ortiqcha belgilarni olib tashlash
      .replace(
        /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
        ""
      )
      .replace(/\s*,\s*,+/g, ", ")
      .replace(/\.\s*\./g, ".")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Matnni so'zma-so'z yoki bo'g'inlab EMAS, balki to'liq va ravon gaplar bo'yicha ajratish.
 * Qisqa va o'rta gaplar yaxlit holda bitta `SpeechSynthesisUtterance` ga uzatiladi.
 */
export function splitIntoNaturalSentences(text: string): string[] {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return [];

  // Agar matn 240 belgigacha bo'lsa, uni umuman bo'lmasdan bitta butun nutq sifatida qaytaramiz
  if (cleaned.length <= 240) {
    return [cleaned];
  }

  // Uzun matnlarni faqat tugallangan gap chegaralaridan (. ! ?) bo'lamiz
  const rawSentences =
    cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [
      cleaned,
    ];

  const merged: string[] = [];
  let buffer = "";

  for (const sentence of rawSentences) {
    if (!buffer) {
      buffer = sentence;
    } else if ((buffer + " " + sentence).length <= 220) {
      // Qisqa gaplarni birlashtiramiz — shunda gaplar orasida sun'iy uzilish bo'lmaydi
      buffer = `${buffer} ${sentence}`;
    } else {
      merged.push(buffer);
      buffer = sentence;
    }
  }

  if (buffer) {
    merged.push(buffer);
  }

  return merged;
}

class JarvisVoiceEngine {
  private listeners: Set<VoiceListener> = new Set();
  private recognition: any = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private activeAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map();
  private ttsEndpointAvailable: boolean | null = null;
  private utteranceQueue: string[] = [];
  private activeSessionId = 0;

  public state: JarvisVoiceState = {
    isSpeaking: false,
    isPaused: false,
    isListening: false,
    supported: false,
    voiceName: "Talaba AI Neural",
    currentText: "",
  };

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private init() {
    const hasTTS = "speechSynthesis" in window;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    this.state.supported = hasTTS || Boolean(SpeechRecognition);

    if (hasTTS) {
      this.selectJarvisVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.selectJarvisVoice();
      }
    }

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = "uz-UZ";
      } catch {
        // Brauzerda SpeechRecognition cheklangan bo'lsa
      }
    }
  }

  /**
   * Brauzerdagi mavjud ovozlar ichidan eng tabiiy (Neural / Natural / Multilingual) ovozni tanlash.
   * Tartib:
   * 1) O'zbek tilidagi Neural / Online (Natural) ovoz (`uz-UZ-SardorNeural`, `uz-UZ-MadinaNeural`)
   * 2) Har qanday `uz-UZ` ovozi
   * 3) Ko'p tilli (Multilingual) Neural ovoz (`AndrewMultilingual`, `BrianMultilingual`, `AvaMultilingual`, `Google`)
   * 4) Qardosh turkiy (`tr-TR`) Neural ovoz (o'zbek lotin harflarini ingliz tilidek buzmasdan, fonetik to'g'ri o'qiydi)
   * 5) Boshqa Natural / Neural ovoz
   */
  private selectJarvisVoice() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    const isNeural = (v: SpeechSynthesisVoice) =>
      /natural|neural|online|multilingual|google|wavenet|premium/i.test(v.name);

    const uzNeural = voices.find(
      (v) =>
        (v.lang.toLowerCase().startsWith("uz") ||
          /uzbek|o'zbek|sardor|madina/i.test(v.name)) &&
        isNeural(v)
    );

    const uzStandard = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("uz") ||
        /uzbek|o'zbek|sardor|madina/i.test(v.name)
    );

    const multilingualNeural = voices.find((v) =>
      /multilingual/i.test(v.name)
    );

    const trNeural = voices.find(
      (v) =>
        (v.lang.toLowerCase().startsWith("tr") || /turkish|ahmet|emel/i.test(v.name)) &&
        isNeural(v)
    );

    const trStandard = voices.find((v) => v.lang.toLowerCase().startsWith("tr"));

    const anyNeural = voices.find((v) => isNeural(v));

    this.selectedVoice =
      uzNeural ||
      uzStandard ||
      multilingualNeural ||
      trNeural ||
      trStandard ||
      anyNeural ||
      voices[0] ||
      null;

    if (this.selectedVoice) {
      this.state.voiceName = this.selectedVoice.name;
      this.notify();
    }
  }

  public subscribe(listener: VoiceListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  /**
   * 1-bosqich: Serverdagi `/api/tts` (OpenAI `tts-1` / ElevenLabs / Edge Neural TTS) orqali
   * haqiqiy insoniy audio oqimini olib o'ynatishga urinadi.
   * Agar kalit o'rnatilmagan yoki tarmoq oflayn bo'lsa, `false` qaytarib Web Speech API ga o'tadi.
   */
  private async tryPlayNeuralAudio(
    cleanedText: string,
    sessionId: number,
    onEnd?: () => void
  ): Promise<boolean> {
    if (typeof window === "undefined" || typeof Audio === "undefined") {
      return false;
    }

    if (this.ttsEndpointAvailable === false) {
      return false;
    }

    try {
      let audioUrl = this.audioCache.get(cleanedText);

      if (!audioUrl) {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleanedText,
            speed: 1.0,
          }),
        });

        if (sessionId !== this.activeSessionId) return true;

        const contentType = res.headers.get("content-type") || "";
        if (!res.ok || !contentType.includes("audio/")) {
          // Server fallback haqida xabar berdi — keyingi safar to'g'ridan-to'g'ri Web Speech ishlatamiz
          this.ttsEndpointAvailable = false;
          return false;
        }

        const blob = await res.blob();
        if (!blob || blob.size < 128) {
          this.ttsEndpointAvailable = false;
          return false;
        }

        this.ttsEndpointAvailable = true;
        audioUrl = URL.createObjectURL(blob);
        this.audioCache.set(cleanedText, audioUrl);
      }

      if (sessionId !== this.activeSessionId) return true;

      const audio = new Audio(audioUrl);
      audio.playbackRate = 1.0;
      this.activeAudio = audio;

      audio.onplay = () => {
        if (sessionId !== this.activeSessionId) return;
        this.state.isSpeaking = true;
        this.state.isPaused = false;
        this.notify();
      };

      audio.onended = () => {
        if (sessionId !== this.activeSessionId) return;
        this.activeAudio = null;
        this.state.isSpeaking = false;
        this.state.isPaused = false;
        this.state.currentText = "";
        this.notify();
        onEnd?.();
      };

      audio.onerror = () => {
        if (sessionId !== this.activeSessionId) return;
        this.activeAudio = null;
        // Audio xato bersa, Web Speech API orqali davom ettiramiz
        this.speakWithWebSpeech(cleanedText, sessionId, onEnd);
      };

      await audio.play();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 2-bosqich (Web Speech API): To'liq gaplarni `rate = 1.0`, `pitch = 1.0` bilan
   * hech qanday harfma-harf uzilishsiz, silliq ketma-ketlikda o'qish.
   */
  private speakWithWebSpeech(
    cleanedText: string,
    sessionId: number,
    onEnd?: () => void
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      this.state.isSpeaking = false;
      this.state.isPaused = false;
      this.notify();
      onEnd?.();
      return;
    }

    if (!this.selectedVoice) {
      this.selectJarvisVoice();
    }

    const sentences = splitIntoNaturalSentences(cleanedText);
    if (sentences.length === 0) {
      this.state.isSpeaking = false;
      this.state.isPaused = false;
      this.notify();
      onEnd?.();
      return;
    }

    this.utteranceQueue = [...sentences];

    const playNextSentence = () => {
      if (sessionId !== this.activeSessionId) return;

      const nextSentence = this.utteranceQueue.shift();
      if (!nextSentence) {
        this.state.isSpeaking = false;
        this.state.isPaused = false;
        this.state.currentText = "";
        this.notify();
        onEnd?.();
        return;
      }

      const utter = new SpeechSynthesisUtterance(nextSentence);

      if (this.selectedVoice) {
        utter.voice = this.selectedVoice;
        utter.lang = this.selectedVoice.lang || "uz-UZ";
      } else {
        utter.lang = "uz-UZ";
      }

      // Talabga binoan tabiiy tezlik va tembr: rate = 1.0, pitch = 1.0
      utter.rate = 1.0;
      utter.pitch = 1.0;
      utter.volume = 1.0;

      utter.onstart = () => {
        if (sessionId !== this.activeSessionId) return;
        this.state.isSpeaking = true;
        this.state.isPaused = false;
        this.notify();
      };

      utter.onend = () => {
        if (sessionId !== this.activeSessionId) return;
        if (this.utteranceQueue.length > 0) {
          playNextSentence();
        } else {
          this.state.isSpeaking = false;
          this.state.isPaused = false;
          this.state.currentText = "";
          this.notify();
          onEnd?.();
        }
      };

      utter.onerror = () => {
        if (sessionId !== this.activeSessionId) return;
        if (this.utteranceQueue.length > 0) {
          playNextSentence();
        } else {
          this.state.isSpeaking = false;
          this.state.isPaused = false;
          this.state.currentText = "";
          this.notify();
          onEnd?.();
        }
      };

      window.speechSynthesis.speak(utter);
    };

    playNextSentence();
  }

  /**
   * Matnni ravon, insoniy ovozda o'qib berish
   */
  public speak(text: string, onEnd?: () => void) {
    this.stop();

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) {
      onEnd?.();
      return;
    }

    const sessionId = ++this.activeSessionId;
    this.state.currentText = text;
    this.state.isSpeaking = true;
    this.state.isPaused = false;
    this.notify();

    void this.tryPlayNeuralAudio(cleaned, sessionId, onEnd).then((playedNeural) => {
      if (!playedNeural && sessionId === this.activeSessionId) {
        this.speakWithWebSpeech(cleaned, sessionId, onEnd);
      }
    });
  }

  public pause() {
    if (this.activeAudio && !this.activeAudio.paused) {
      this.activeAudio.pause();
      this.state.isPaused = true;
      this.notify();
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      this.state.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.activeAudio && this.activeAudio.paused) {
      void this.activeAudio.play();
      this.state.isPaused = false;
      this.notify();
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      this.state.isPaused = false;
      this.notify();
    }
  }

  public stop() {
    this.activeSessionId += 1;
    this.utteranceQueue = [];

    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.activeAudio = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    this.state.isSpeaking = false;
    this.state.isPaused = false;
    this.state.currentText = "";
    this.notify();
  }

  /**
   * Mikrofon orqali o'quvchi savolini eshitish (Speech-to-Text)
   */
  public startListening(
    onResult: (transcript: string) => void,
    onError?: (err: string) => void
  ) {
    if (!this.recognition) {
      onError?.("Brauzeringiz ovozli qidiruvni qo'llab-quvvatlamaydi.");
      return;
    }

    this.stop();

    try {
      this.state.isListening = true;
      this.notify();

      this.recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        this.state.isListening = false;
        this.notify();
        if (transcript.trim()) {
          onResult(transcript.trim());
        }
      };

      this.recognition.onerror = () => {
        this.state.isListening = false;
        this.notify();
        onError?.("Ovozni aniqlab bo'lmadi, qaytadan urinib ko'ring.");
      };

      this.recognition.onend = () => {
        this.state.isListening = false;
        this.notify();
      };

      this.recognition.start();
    } catch {
      this.state.isListening = false;
      this.notify();
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.state.isListening = false;
    this.notify();
  }
}

export const jarvisVoice = new JarvisVoiceEngine();
