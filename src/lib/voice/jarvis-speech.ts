/**
 * TALABA AI — TABIIY INSONIY OVOZ VA O'QITUVCHI AUDIONAZORAT TIZIMI (SINGLETON CONTROLLER)
 * --------------------------------------------------------------------------------------
 * 1. Bo'laklangan (chunk) yoki bitta harfli matnlarni qabul qilmaydi va audioni uzib qo'ymaydi.
 * 2. Web Speech API:
 *    - To'liq tushuntirish matni yoki tugallangan gaplar `SpeechSynthesisUtterance` ga uzatiladi.
 *    - O'qish tezligi (rate) = 0.95, tembr (pitch) = 1.0.
 *    - Brauzerdagi ovozlar filtrlanib, eng sifatli Natural ovozlar (Google yoki Microsoft Natural) tanlanadi.
 * 3. Typewriter / matn animatsiyasi bilan audioni sinxronlashtirish:
 *    - Gaplar/iboralar silliq chiqadi, audio qayta boshlanib ketmaydi va so'zlar uzilmaydi.
 * 4. Brauzer oqimini (UI thread) muzlatib qo'ymaydigan toza Singleton kontroller:
 *    - `play`, `pause`, `resume`, `stop` operatsiyalari xavfsiz va asinxron boshqariladi.
 */

import { numbersToUzbekWords } from "./uz-numbers";

export interface JarvisVoiceState {
  isSpeaking: boolean;
  isPaused: boolean;
  isListening: boolean;
  supported: boolean;
  voiceName: string;
  currentText: string;
  currentSentence: string;
  sentenceIndex: number;
  totalSentences: number;
}

export type VoiceListener = (state: JarvisVoiceState) => void;

/**
 * Matn va matematik formulalarni ovozli o'qishda insondek tabiiy eshitilishi uchun
 * fonetik va matematik normallashtirish funksiyasi.
 * O'zbekcha qo'shma so'zlardagi ("ketma-ket", "yo'l-yo'riq", "o'z-o'zidan", "1-qadam")
 * defislarni hech qachon "ayiruv" deb o'qimaydi.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text || typeof text !== "string") return "";

  return (
    text
      // 1. LaTeX bloklari va inline belgilarini ochish
      .replace(/\$\$(.*?)\$\$/g, " $1 ")
      .replace(/\$(.*?)\$/g, " $1 ")
      // 2. Markdown formatlash belgilarini tozalash
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[\*\#`_~>]/g, "")
      .replace(/•/g, ". ")
      // 3. O'zbekcha tartib sonlar: "1-qadam" -> "1-chi qadam"
      .replace(
        /\b(\d+)\s*-\s*(qadam|bosqich|usul|qoida|shart|misol|mashq|savol|modul|dars|qism|band)\b/gi,
        "$1-chi $2"
      )
      // 4. Tutuq va apostroflarni standartlashtirish
      .replace(/[ʻʼ‘’`´]/g, "'")
      // 5. Funksiyalar va indeksli o'zgaruvchilar
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
      // 7. Matematik amallar
      .replace(/≠/g, " teng emas ")
      .replace(/≈/g, " taxminan teng ")
      .replace(/≤|⩽/g, " kichik yoki teng ")
      .replace(/≥|⩾/g, " katta yoki teng ")
      .replace(/±/g, " plyus minus ")
      .replace(/×|⋅|·/g, " ko'paytiruv ")
      .replace(/÷/g, " bo'luv ")
      .replace(/\+/g, " qo'shuv ")
      .replace(/=/g, " teng ")
      .replace(/−/g, " ayiruv ")
      .replace(/(\d|[a-zA-Z\)])\s+-\s+(\d|[a-zA-Z\(])/g, "$1 ayiruv $2")
      .replace(/(teng|\()\s*-(\d|[a-zA-Z])/g, "$1 minus $2")
      .replace(/(\)|[0-9a-zA-Z])\s*\/\s*(\(|[0-9a-zA-Z])/g, "$1 taqsim $2")
      // 8. Foiz va boshqalar
      .replace(/(\d+)\s*%/g, "$1 foiz")
      .replace(/\(\s*/g, ", ")
      .replace(/\s*\)/g, ", ")
      // 9. Emojilar va ortiqcha tinish belgilari
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
 * Ovozli o'qish uchun yakuniy matn: tozalash + barcha raqamlarni o'zbekcha so'zga aylantirish.
 * ("6 ga" -> "olti ga", "7.5" -> "yetti butun o'ndan besh"). Shu tufayli TTS raqamlarni
 * inglizcha/ruscha o'qib yubormaydi.
 */
export function prepareUzbekSpeechText(text: string): string {
  return numbersToUzbekWords(cleanTextForSpeech(text));
}

/**
 * AI Dars matnini to'liq gaplarga ajratish:
 * Regex: /[^.!?]+[.!?]+|[^.!?]+/g
 * Bitta harfli yoki mikr-bo'laklar (length <= 1) butunlay filtrlanadi.
 */
export function splitLessonIntoSentences(text: string): string[] {
  if (!text || typeof text !== "string") return [];
  const matches = text.match(/[^.!?]+[.!?]+|[^.!?]+/g);
  if (!matches) return [];
  return matches
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

/**
 * Matnni so'zma-so'z yoki harfma-harf EMAS, balki to'liq va tugallangan gaplar bo'yicha ajratish.
 * Qisqa tushuntirishlar (<= 240 belgi) yaxlit holda bitta SpeechSynthesisUtterance ga beriladi.
 * Bitta harfli yoki ma'nosiz mikr-bo'laklar butunlay filtrlanadi.
 */
export function splitIntoNaturalSentences(text: string): string[] {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned || cleaned.length <= 1) return [];

  // Agar butun tushuntirish matni 240 belgigacha bo'lsa, yaxlit holda bitta butun nutq sifatida qaytaramiz
  if (cleaned.length <= 240) {
    return [cleaned];
  }

  // Uzun matnlarni faqat tugallangan gap chegaralaridan (. ! ?) bo'lamiz
  const rawSentences =
    cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter((s) => s.length > 1) ?? [
      cleaned,
    ];

  const merged: string[] = [];
  let buffer = "";

  for (const sentence of rawSentences) {
    if (!sentence || sentence.length <= 1) continue;
    if (!buffer) {
      buffer = sentence;
    } else if ((buffer + " " + sentence).length <= 220) {
      buffer = `${buffer} ${sentence}`;
    } else {
      merged.push(buffer);
      buffer = sentence;
    }
  }

  if (buffer && buffer.length > 1) {
    merged.push(buffer);
  }

  return merged.filter((s) => s.length > 1);
}

/**
 * Yuqori sifatli Natural ovozni tekshirish (masalan: Google yoki Microsoft Natural)
 */
export function isHighQualityNaturalVoice(v: SpeechSynthesisVoice): boolean {
  if (!v) return false;
  const name = (v.name || "").toLowerCase();
  const uri = (v.voiceURI || "").toLowerCase();

  return (
    name.includes("natural") ||
    name.includes("neural") ||
    name.includes("google") ||
    name.includes("wavenet") ||
    name.includes("multilingual") ||
    name.includes("premium") ||
    name.includes("online") ||
    uri.includes("natural") ||
    uri.includes("neural") ||
    uri.includes("google")
  );
}

/**
 * Barcha mavjud ovozlar orasidan faqat yuqori sifatli Natural ovozlarni filtrlaydi
 */
export function filterNaturalVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  if (!voices || !Array.isArray(voices)) return [];
  return voices.filter(isHighQualityNaturalVoice);
}

/**
 * Brauzer ovozlaridan eng yuqori sifatli Natural ovozni saralash:
 * 1. O'zbek tilidagi Natural / Neural ovoz (uz-UZ Sardor/Madina Natural)
 * 2. Har qanday O'zbek tili ovozi
 * 3. Microsoft Natural ovozlari (Microsoft * Online (Natural))
 * 4. Google yuqori sifatli ovozlari (Google *)
 * 5. Boshqa ko'p tilli / Neural ovozlar
 * 6. Turkcha Natural ovoz (fonetik moslik uchun)
 */
export function pickBestTeacherVoice(
  voices: SpeechSynthesisVoice[],
  preferredLang = "uz-UZ",
  preferredGender: "female" | "male" | "auto" = "auto"
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const targetLang = preferredLang.toLowerCase().slice(0, 2);
  const isFemale = (v: SpeechSynthesisVoice) =>
    /female|madina|emel|jenny|ayol|zira|samantha/i.test(v.name);
  const isMale = (v: SpeechSynthesisVoice) =>
    /male|sardor|ahmet|guy|erkak|david/i.test(v.name);

  const genderMatches = (v: SpeechSynthesisVoice) => {
    if (preferredGender === "female") return isFemale(v);
    if (preferredGender === "male") return isMale(v);
    return true;
  };

  // 1. O'zbek tilidagi Natural / Neural ovoz
  const uzNatural =
    voices.find(
      (v) =>
        (v.lang.toLowerCase().startsWith(targetLang) ||
          /uzbek|o'zbek|madina|sardor/i.test(v.name)) &&
        isHighQualityNaturalVoice(v) &&
        genderMatches(v)
    ) ||
    voices.find(
      (v) =>
        (v.lang.toLowerCase().startsWith(targetLang) ||
          /uzbek|o'zbek|madina|sardor/i.test(v.name)) &&
        isHighQualityNaturalVoice(v)
    );
  if (uzNatural) return uzNatural;

  // 2. Har qanday O'zbek tili ovozi
  const uzStandard =
    voices.find(
      (v) =>
        (v.lang.toLowerCase().startsWith(targetLang) ||
          /uzbek|o'zbek|madina|sardor/i.test(v.name)) &&
        genderMatches(v)
    ) ||
    voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith(targetLang) ||
        /uzbek|o'zbek|madina|sardor/i.test(v.name)
    );
  if (uzStandard) return uzStandard;

  // 3. Microsoft Natural ovozlari (masalan, Microsoft * Online (Natural))
  const msNatural =
    voices.find(
      (v) =>
        /microsoft.*natural/i.test(v.name) &&
        genderMatches(v)
    ) ||
    voices.find((v) => /microsoft.*natural/i.test(v.name)) ||
    voices.find(
      (v) =>
        /\(natural\)/i.test(v.name) &&
        genderMatches(v)
    ) ||
    voices.find((v) => /\(natural\)/i.test(v.name));
  if (msNatural) return msNatural;

  // 4. Google yuqori sifatli ovozlari (Google *)
  const googleVoice =
    voices.find((v) => /google/i.test(v.name) && genderMatches(v)) ||
    voices.find((v) => /google/i.test(v.name));
  if (googleVoice) return googleVoice;

  // 5. Har qanday boshqa Natural / Neural / Multilingual ovoz
  const anyNatural =
    voices.find((v) => isHighQualityNaturalVoice(v) && genderMatches(v)) ||
    voices.find((v) => isHighQualityNaturalVoice(v));
  if (anyNatural) return anyNatural;

  // 6. Turkcha Natural ovoz
  const trVoice =
    voices.find(
      (v) => v.lang.toLowerCase().startsWith("tr") && isHighQualityNaturalVoice(v)
    ) || voices.find((v) => v.lang.toLowerCase().startsWith("tr"));
  if (trVoice) return trVoice;

  // 7. Standart brauzer ovozi
  return voices.find((v) => v.default) || voices[0] || null;
}

/**
 * AI O'QITUVCHI OVOZI SINGLETON KONTROLLERI
 * -----------------------------------------
 * Brauzer oqimini (UI thread) to'xtatib qo'ymaslik uchun barcha jarayonlar
 * asinxron tarzda boshqariladi.
 */
export class TeacherVoiceController {
  private static instance: TeacherVoiceController | null = null;

  private listeners: Set<VoiceListener> = new Set();
  private recognition: any = null;
  public selectedVoice: SpeechSynthesisVoice | null = null;
  private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();
  private activeAudio: HTMLAudioElement | null = null;
  private utteranceQueue: string[] = [];
  private activeSessionId = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private preferredGender: "female" | "male" | "auto" = "auto";

  // Talab bo'yicha parametrlar: rate = 0.95, pitch = 1.0
  public speechRate = 0.95;
  public speechPitch = 1.0;

  public state: JarvisVoiceState = {
    isSpeaking: false,
    isPaused: false,
    isListening: false,
    supported: false,
    voiceName: "Talaba AI Natural",
    currentText: "",
    currentSentence: "",
    sentenceIndex: 0,
    totalSentences: 0,
  };

  public static getInstance(): TeacherVoiceController {
    if (!TeacherVoiceController.instance) {
      TeacherVoiceController.instance = new TeacherVoiceController();
    }
    return TeacherVoiceController.instance;
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private init() {
    const hasTTS = typeof window !== "undefined" && "speechSynthesis" in window;
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;

    this.state.supported = hasTTS || Boolean(SpeechRecognition);

    if (hasTTS) {
      this.refreshVoices();
      this.restoreVoiceFromStorage();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.refreshVoices();
          this.restoreVoiceFromStorage();
        };
      }
    }

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = "uz-UZ";
      } catch {
        // Brauzerda cheklangan bo'lsa
      }
    }
  }

  public refreshVoices() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // localStorage da saqlangan ovoz mavjud bo'lfa, uni avval o'rnatamiz
    try {
      const saved = localStorage.getItem("jarvis_voice_name");
      if (saved) {
        const found = voices.find((v) => v.name === saved);
        if (found) {
          this.selectedVoice = found;
          this.state.voiceName = found.name;
          this.notify();
          return;
        }
      }
    } catch {
      // localStorage yo'q bo'lsa e'tiborsiz qoldiramiz
    }

    this.selectedVoice = pickBestTeacherVoice(
      voices,
      "uz-UZ",
      this.preferredGender
    );

    if (this.selectedVoice) {
      this.state.voiceName = this.selectedVoice.name;
      this.notify();
    }
  }

  public setVoiceGender(gender: "female" | "male" | "auto") {
    this.preferredGender = gender;
    this.refreshVoices();
  }

  public setVoiceByName(voiceName: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    const found = voices.find((v) => v.name === voiceName);
    if (found) {
      this.selectedVoice = found;
      this.state.voiceName = found.name;
      try {
        localStorage.setItem("jarvis_voice_name", found.name);
      } catch {
        // localStorage yo'q bo'lsa e'tiborsiz qoldiramiz
      }
      this.notify();
    }
  }

  public restoreVoiceFromStorage() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      const saved = localStorage.getItem("jarvis_voice_name");
      if (!saved) return;
      const voices = window.speechSynthesis.getVoices();
      const found = voices.find((v) => v.name === saved);
      if (found) {
        this.selectedVoice = found;
        this.state.voiceName = found.name;
        this.notify();
        return;
      }
    } catch {
      // localStorage yo'q bo'lsa e'tiborsiz qoldiramiz
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
    return window.speechSynthesis.getVoices() || [];
  }

  public subscribe(listener: VoiceListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const snapshot = { ...this.state };
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch {
        // Obunachi xatosini e'tiborsiz qoldirish
      }
    });
  }

  /**
   * Chromium brauzerlarida uzoq nutq vaqtida ovoz to'xtab qolishining (15s bug) oldini olish
   */
  private startHeartbeat() {
    this.stopHeartbeat();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.state.isSpeaking && !this.state.isPaused) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, 5000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * AI O'qituvchi ovozini boshlash (Web Speech API orqali to'liq gaplarni uzatish)
   * 1. Bo'lak yoki bitta harfli matnlar filtrlanadi.
   * 2. To'liq matn yoki gaplar `SpeechSynthesisUtterance` ga beriladi.
   * 3. Tezlik 0.95, tembr 1.0 ga sozlanadi.
   * 4. Brauzer UI oqimi asinxron mikrotasklar orqali ravon ishlaydi.
   */
  public async play(text?: string, onEnd?: () => void): Promise<void> {
    // Agar text berilmagan bo'lsa va pauza holatida bo'lsa, davom ettiramiz
    if (!text) {
      if (this.state.isPaused) {
        this.resume();
      }
      return;
    }

    if (typeof text !== "string") {
      onEnd?.();
      return;
    }

    const trimmed = text.trim();
    // 1-talab: Bitta harf yoki mikr-bo'laklarni speech funksiyasiga uzatishni qat'iy to'xtatish!
    if (trimmed.length <= 1) {
      return;
    }

    // Agar ayni shu to'liq tushuntirish matni allaqachon aytilayotgan bo'lsa,
    // pauzada bo'lsa resume qilamiz, aks holda qayta boshlamaymiz
    if (this.state.currentText === text) {
      if (this.state.isPaused) {
        this.resume();
      }
      return;
    }

    // Oldingi seansni to'xtatish
    this.stopInternal(false);

    const sessionId = ++this.activeSessionId;

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned || cleaned.length <= 1) {
      onEnd?.();
      return;
    }

    const sentences = splitIntoNaturalSentences(cleaned);
    if (sentences.length === 0) {
      onEnd?.();
      return;
    }

    this.state.currentText = text;
    this.state.isSpeaking = true;
    this.state.isPaused = false;
    this.state.sentenceIndex = 0;
    this.state.totalSentences = sentences.length;
    this.state.currentSentence = sentences[0];
    this.notify();

    // Brauzer avvalgi cancel() operatsiyasini to'liq yakunlashi uchun 50ms kutamiz
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (sessionId !== this.activeSessionId) return;

    // 1-USTUVORLIK: Insoniy va tabiiy Gemini Neural TTS orqali yangratish
    this.playEntireWithServerAudio(sentences, sessionId, onEnd);
  }

  /**
   * Server-side Neural Audio orqali zaxira ijro (agar Web Speech API ishlamasa yoki ovoz bo'lmasa)
   */
  private tryPlayServerAudio(
    sentence: string,
    sessionId: number,
    onEnded: () => void,
    onError?: () => void
  ) {
    if (typeof window === "undefined" || typeof Audio === "undefined") {
      if (onError) onError();
      else onEnded();
      return;
    }

    try {
      const voiceName = this.preferredGender === "male" ? "Puck" : "Aoede";
      const audioUrl = `/api/tts?text=${encodeURIComponent(sentence)}&voice=${voiceName}&speed=${this.speechRate}`;
      const audio = new Audio(audioUrl);
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
        onEnded();
      };

      audio.onerror = () => {
        if (sessionId !== this.activeSessionId) return;
        this.activeAudio = null;
        if (onError) onError();
        else onEnded();
      };

      void audio.play().catch(() => {
        if (sessionId === this.activeSessionId) {
          this.activeAudio = null;
          if (onError) onError();
          else onEnded();
        }
      });
    } catch {
      if (onError) onError();
      else onEnded();
    }
  }

  /**
   * Web Speech API orqali gaplarni navbatma-navbat ravon o'qish
   */
  private executeWebSpeechQueue(
    sentences: string[],
    sessionId: number,
    onEnd?: () => void
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      // Web Speech API bo'lmasa, darhol Server Neural TTS ga o'tamiz
      this.playEntireWithServerAudio(sentences, sessionId, onEnd);
      return;
    }

    if (!this.selectedVoice) {
      this.refreshVoices();
    }

    this.utteranceQueue = [...sentences];
    this.startHeartbeat();

    const playNext = () => {
      if (sessionId !== this.activeSessionId) return;

      const nextSentence = this.utteranceQueue.shift();
      if (!nextSentence) {
        this.finishSession(sessionId, onEnd);
        return;
      }

      const currentIndex = sentences.length - this.utteranceQueue.length - 1;
      this.state.currentSentence = nextSentence;
      this.state.sentenceIndex = currentIndex;
      this.notify();

      // Mavjud ovozlarni olish
      const currentVoices = window.speechSynthesis.getVoices();
      const voice =
        this.selectedVoice ||
        pickBestTeacherVoice(currentVoices, "uz-UZ", this.preferredGender) ||
        currentVoices[0];

      // 2-talab: To'liq gap SpeechSynthesisUtterance ga uzatiladi
      const utter = new SpeechSynthesisUtterance(nextSentence);

      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = typeof navigator !== "undefined" ? navigator.language : "uz-UZ";
      }

      utter.rate = this.speechRate;
      utter.pitch = this.speechPitch;
      utter.volume = 1.0;

      this.activeUtterances.add(utter);

      utter.onstart = () => {
        if (sessionId !== this.activeSessionId) return;
        this.state.isSpeaking = true;
        this.state.isPaused = false;
        this.notify();
      };

      utter.onend = () => {
        this.activeUtterances.delete(utter);
        if (sessionId !== this.activeSessionId) return;

        if (this.utteranceQueue.length > 0) {
          setTimeout(playNext, 40);
        } else {
          this.finishSession(sessionId, onEnd);
        }
      };

      utter.onerror = () => {
        this.activeUtterances.delete(utter);
        if (sessionId !== this.activeSessionId) return;

        // Web Speech API xato bersa, shu gapni Server Neural TTS orqali yangratamiz!
        this.tryPlayServerAudio(nextSentence, sessionId, () => {
          if (sessionId !== this.activeSessionId) return;
          if (this.utteranceQueue.length > 0) {
            setTimeout(playNext, 40);
          } else {
            this.finishSession(sessionId, onEnd);
          }
        });
      };

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utter);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {
        this.tryPlayServerAudio(nextSentence, sessionId, () => {
          if (sessionId !== this.activeSessionId) return;
          if (this.utteranceQueue.length > 0) {
            setTimeout(playNext, 40);
          } else {
            this.finishSession(sessionId, onEnd);
          }
        });
      }
    };

    playNext();
  }

  private playEntireWithServerAudio(
    sentences: string[],
    sessionId: number,
    onEnd?: () => void
  ) {
    let index = 0;
    const playStep = () => {
      if (sessionId !== this.activeSessionId) return;
      if (index >= sentences.length) {
        this.finishSession(sessionId, onEnd);
        return;
      }
      const sent = sentences[index];
      this.state.currentSentence = sent;
      this.state.sentenceIndex = index;
      this.notify();

      this.tryPlayServerAudio(
        sent,
        sessionId,
        () => {
          index += 1;
          setTimeout(playStep, 40);
        },
        () => {
          // Server audio mavjud bo'lmasa yoki xato bersa, zaxira Web Speech API ga o'tamiz
          this.executeWebSpeechQueue(sentences.slice(index), sessionId, onEnd);
        }
      );
    };
    playStep();
  }

  private finishSession(sessionId: number, onEnd?: () => void) {
    if (sessionId !== this.activeSessionId) return;
    this.stopHeartbeat();
    this.activeUtterances.clear();
    this.state.isSpeaking = false;
    this.state.isPaused = false;
    this.state.currentText = "";
    this.state.currentSentence = "";
    this.state.sentenceIndex = 0;
    this.notify();
    onEnd?.();
  }

  /**
   * speak - play funksiyasining qulay sarlavhasi
   */
  public speak(text: string, onEnd?: () => void) {
    void this.play(text, onEnd);
  }

  /**
   * Ovozni vaqtincha to'xtatish (Pause)
   */
  public pause() {
    this.state.isPaused = true;

    if (this.activeAudio && !this.activeAudio.paused) {
      try {
        this.activeAudio.pause();
      } catch {
        // ignore
      }
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.pause();
      } catch {
        // ignore
      }
    }

    this.notify();
  }

  /**
   * Ovozni davom ettirish (Resume)
   */
  public resume() {
    this.state.isPaused = false;

    if (this.activeAudio && this.activeAudio.paused) {
      try {
        void this.activeAudio.play();
      } catch {
        // ignore
      }
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }

    this.notify();
  }

  /**
   * To'liq to'xtatish (Stop) - barcha navbatlarni tozalaydi va oqimni xavfsiz bo'shatadi
   */
  public stop() {
    this.stopInternal(true);
  }

  private stopInternal(notifyListeners = true) {
    this.activeSessionId += 1;
    this.utteranceQueue = [];
    this.activeUtterances.clear();
    this.stopHeartbeat();

    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
        this.activeAudio.src = "";
      } catch {
        // ignore
      }
      this.activeAudio = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }

    this.state.isSpeaking = false;
    this.state.isPaused = false;
    this.state.currentText = "";
    this.state.currentSentence = "";
    this.state.sentenceIndex = 0;
    this.state.totalSentences = 0;

    if (notifyListeners) {
      this.notify();
    }
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

// Singleton instansiyalar
export const jarvisVoice: TeacherVoiceController = TeacherVoiceController.getInstance();
export const teacherVoice: TeacherVoiceController = jarvisVoice;
