import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TeacherVoiceController,
  cleanTextForSpeech,
  filterNaturalVoices,
  isHighQualityNaturalVoice,
  jarvisVoice,
  pickBestTeacherVoice,
  splitIntoNaturalSentences,
  splitLessonIntoSentences,
  teacherVoice,
} from "@/lib/voice/jarvis-speech";

describe("Stage 13 — AI Teacher Voice Controller & Refactoring", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    jarvisVoice.stop();
  });

  it("1. Singleton Controller: jarvisVoice va teacherVoice yagona singleton instansiyani taqdim etadi", () => {
    expect(jarvisVoice).toBeDefined();
    expect(teacherVoice).toBeDefined();
    expect(jarvisVoice).toBe(teacherVoice);
    expect(TeacherVoiceController.getInstance()).toBe(jarvisVoice);
  });

  it("2. O'qish parametrlari talab bo'yicha rate = 0.95 va pitch = 1.0 ga teng", () => {
    expect(jarvisVoice.speechRate).toBe(0.95);
    expect(jarvisVoice.speechPitch).toBe(1.0);
  });

  it("3. Bitta harfli yoki mikr-bo'laklarni (chunks) speech funksiyasiga uzatishni to'xtatadi", async () => {
    const playSpy = vi.spyOn(jarvisVoice, "play");

    // Yagona harf yoki bo'sh joy uzatilganda nutq boshlanmaydi
    await jarvisVoice.play("a");
    expect(jarvisVoice.state.isSpeaking).toBe(false);

    await jarvisVoice.play(" ");
    expect(jarvisVoice.state.isSpeaking).toBe(false);

    await jarvisVoice.play("!");
    expect(jarvisVoice.state.isSpeaking).toBe(false);

    // splitIntoNaturalSentences ham bo'lak yoki bitta harf qaytarmaydi
    expect(splitIntoNaturalSentences("a")).toEqual([]);
    expect(splitIntoNaturalSentences("")).toEqual([]);
  });

  it("4. To'liq tushuntirish matni yoki tugallangan gaplar SpeechSynthesisUtterance ga uzatiladi", () => {
    const explanation =
      "Kvadrat tenglamani Viyet teoremasi orqali tezkor yechamiz. Ildizlar yig'indisi 6 ga, ko'paytmasi 8 ga teng.";
    const sentences = splitIntoNaturalSentences(explanation);

    // Bo'laklanmagan, 240 belgidan kam tushuntirish bitta to'liq gap/tushuntirish sifatida saqlanadi
    expect(sentences.length).toBe(1);
    expect(sentences[0]).toBe(
      "Kvadrat tenglamani Viyet teoremasi orqali tezkor yechamiz. Ildizlar yig'indisi 6 ga, ko'paytmasi 8 ga teng."
    );

    // Uzun tushuntirish esa harfma-harf emas, faqat tugallangan gaplar bo'yicha ajratiladi
    const longText =
      "1-qoida: Chiziqli funksiya koordinata tekisligida to'g'ri chiziqni ifodalaydi. Uning umumiy ko'rinishi f(x) = mx + b formulasi bilan beriladi. Bu yerda m burchak koeffitsiyenti bo'lib, to'g'ri chiziqning qanchalik tikligini ko'rsatadi. Agar m musbat bo'lsa, funksiya o'suvchi bo'ladi.";
    const longSentences = splitIntoNaturalSentences(longText);

    expect(longSentences.length).toBeGreaterThan(1);
    longSentences.forEach((s) => {
      expect(s.length).toBeGreaterThan(10);
      expect(s).not.toBe("a");
      expect(s).not.toBe("b");
    });
  });

  it("5. Brauzer ovozlaridan Microsoft Natural va Google yuqori sifatli ovozlarini filtrlaydi va tanlaydi", () => {
    const mockVoices: SpeechSynthesisVoice[] = [
      {
        name: "Microsoft David Desktop - English (United States)",
        lang: "en-US",
        default: false,
        localService: true,
        voiceURI: "urn:moz-tts:sapi:Microsoft David Desktop",
      } as SpeechSynthesisVoice,
      {
        name: "Microsoft Jenny Online (Natural) - English (United States)",
        lang: "en-US",
        default: false,
        localService: false,
        voiceURI: "Microsoft Jenny Online (Natural)",
      } as SpeechSynthesisVoice,
      {
        name: "Google US English",
        lang: "en-US",
        default: false,
        localService: false,
        voiceURI: "Google US English",
      } as SpeechSynthesisVoice,
      {
        name: "Microsoft Sardor Online (Natural) - Uzbek (Uzbekistan)",
        lang: "uz-UZ",
        default: false,
        localService: false,
        voiceURI: "Microsoft Sardor Online (Natural)",
      } as SpeechSynthesisVoice,
      {
        name: "Standard Uzbek Voice",
        lang: "uz-UZ",
        default: false,
        localService: true,
        voiceURI: "uz-standard",
      } as SpeechSynthesisVoice,
    ];

    expect(isHighQualityNaturalVoice(mockVoices[1])).toBe(true);
    expect(isHighQualityNaturalVoice(mockVoices[2])).toBe(true);
    expect(isHighQualityNaturalVoice(mockVoices[3])).toBe(true);
    expect(isHighQualityNaturalVoice(mockVoices[0])).toBe(false);

    const naturalList = filterNaturalVoices(mockVoices);
    expect(naturalList.length).toBe(3);

    // O'zbek tilidagi eng yaxshi Natural ovoz (Sardor Natural) birinchi tanlanadi
    const bestUz = pickBestTeacherVoice(mockVoices, "uz-UZ");
    expect(bestUz?.name).toContain("Sardor Online (Natural)");

    // Agar o'zbek tili bo'lmasa, Microsoft Natural yoki Google ovozi tanlanadi
    const englishOnlyVoices = mockVoices.slice(0, 3);
    const bestEn = pickBestTeacherVoice(englishOnlyVoices, "en-US");
    expect(bestEn?.name).toContain("Natural");
  });

  it("6. play, pause, resume va stop holatlari oqimni muzlatmasdan boshqariladi", () => {
    expect(jarvisVoice.state.isSpeaking).toBe(false);
    expect(jarvisVoice.state.isPaused).toBe(false);

    jarvisVoice.pause();
    expect(jarvisVoice.state.isPaused).toBe(true);

    jarvisVoice.resume();
    expect(jarvisVoice.state.isPaused).toBe(false);

    jarvisVoice.stop();
    expect(jarvisVoice.state.isSpeaking).toBe(false);
    expect(jarvisVoice.state.isPaused).toBe(false);
    expect(jarvisVoice.state.currentText).toBe("");
  });

  it("7. Lesson/Speech: splitLessonIntoSentences regex (/[^.!?]+[.!?]+|[^.!?]+/g) orqali to'liq gaplarga ajratadi va 1 ta harfli belgilarni olmaydi", () => {
    const text =
      "Assalomu alaykum! Bugungi darsimiz chiziqli funksiya haqida. Bu juda sodda mavzu? Albatta!";
    const sentences = splitLessonIntoSentences(text);

    expect(sentences).toHaveLength(4);
    expect(sentences[0]).toBe("Assalomu alaykum!");
    expect(sentences[1]).toBe("Bugungi darsimiz chiziqli funksiya haqida.");
    expect(sentences[2]).toBe("Bu juda sodda mavzu?");
    expect(sentences[3]).toBe("Albatta!");

    // Yagona harf yoki bo'sh tokenlarni olmaydi
    expect(splitLessonIntoSentences("a")).toEqual([]);
    expect(splitLessonIntoSentences("! ? .")).toEqual([]);
  });

  it("8. Lesson/Speech: speechSynthesis.cancel() overlapping audioni to'xtatadi", () => {
    const mockCancel = vi.fn();
    (globalThis as any).window = {
      speechSynthesis: {
        cancel: mockCancel,
        speak: vi.fn(),
        getVoices: () => [],
      },
    };

    jarvisVoice.stop();
    expect(mockCancel).toHaveBeenCalled();
  });
});
