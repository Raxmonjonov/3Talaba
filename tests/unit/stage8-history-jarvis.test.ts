import { describe, expect, it } from "vitest";
import {
  cleanTextForSpeech,
  splitIntoNaturalSentences,
} from "@/lib/voice/jarvis-speech";

describe("Stage 8 — JARVIS Ovozli Agent va Tabiiy Nutq Normallashtirish", () => {
  it("cleanTextForSpeech formulalar va LaTeX belgilarini talaffuzga to'g'ri tozalaydi", () => {
    const raw = "Tenglama: $$3x + 5 = 20$$ va $x^2$ ildizlari √16 ga teng.";
    const cleaned = cleanTextForSpeech(raw);

    expect(cleaned).toContain("qo'shuv");
    expect(cleaned).toContain("teng");
    expect(cleaned).toContain("x kvadrat");
    expect(cleaned).toContain("ildiz ostida");
    expect(cleaned).not.toContain("$$");
    expect(cleaned).not.toContain("$");
  });

  it("Markdown va formatlash belgilarini ovozga xalaqit bermaydigan qilib tozalaydi", () => {
    const raw = "**Ofarin!** Bu `muhim` qoida va *ajoyib* natija.";
    const cleaned = cleanTextForSpeech(raw);

    expect(cleaned).toBe("Ofarin! Bu muhim qoida va ajoyib natija.");
    expect(cleaned).not.toContain("**");
    expect(cleaned).not.toContain("`");
    expect(cleaned).not.toContain("*");
  });

  it("O'zbekcha qo'shma so'zlar va tartib sonlardagi defisni 'ayiruv' deb buzib o'qimaydi", () => {
    const raw =
      "1-qadam: yo'l-yo'riqni ketma-ket va o'z-o'zidan tushunib oling. Formulalar: f(x) = mx + b va m = (y2 - y1) / (x2 - x1).";
    const cleaned = cleanTextForSpeech(raw);

    expect(cleaned).toContain("1-chi qadam");
    expect(cleaned).toContain("yo'l-yo'riqni");
    expect(cleaned).toContain("ketma-ket");
    expect(cleaned).toContain("o'z-o'zidan");
    expect(cleaned).not.toContain("ketma ayiruv ket");
    expect(cleaned).not.toContain("1 ayiruv qadam");
    expect(cleaned).toContain("f iks teng m iks qo'shuv b");
    expect(cleaned).toContain("y ikki ayiruv y bir");
  });

  it("splitIntoNaturalSentences matnni harfma-harf yoki bo'g'inlab emas, to'liq gaplar bo'yicha ajratadi", () => {
    const text =
      "Assalomu alaykum! Bugungi mavzumiz: Chiziqli Funksiya Nima? Qo'rqmang, buni mutlaqo noldan juda sodda tilda o'rganamiz.";
    const sentences = splitIntoNaturalSentences(text);

    expect(sentences.length).toBe(1);
    expect(sentences[0]).toContain("Assalomu alaykum!");
    expect(sentences[0]).toContain("Chiziqli Funksiya Nima?");
  });
});
