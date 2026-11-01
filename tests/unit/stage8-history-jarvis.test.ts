import { describe, expect, it } from "vitest";
import { cleanTextForSpeech } from "@/lib/voice/jarvis-speech";

describe("Stage 8 — JARVIS Ovozli Agent va Dars Tarixi", () => {
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
});
