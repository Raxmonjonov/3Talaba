import { describe, expect, it } from "vitest";
import {
  LEARNING_PACE_OPTIONS,
  STUDENT_PERSONA_TRACKS,
  explainFormulaSimply,
} from "@/lib/learning/easy-adaptation";
import { extractPaceDirective, generateAICoachResponse } from "@/lib/ai";
import { buildSmartFallback } from "@/lib/coach/smart-fallback";

describe("Stage 11: Easy Learning Adaptation & Step-by-Step Onboarding System", () => {
  it("defines 3 complete student adaptation modes (SODDA, STANDART, TEZKOR) and 4 persona tracks", () => {
    expect(LEARNING_PACE_OPTIONS.map((o) => o.id)).toEqual([
      "SODDA",
      "STANDART",
      "TEZKOR",
    ]);

    for (const option of LEARNING_PACE_OPTIONS) {
      expect(option.title.length).toBeGreaterThan(5);
      expect(option.summary.length).toBeGreaterThan(20);
      expect(option.dailyPlan.length).toBeGreaterThan(15);
      expect(option.aiPromptPrefix).toContain("[O'quvchi darajasi:");
    }

    expect(STUDENT_PERSONA_TRACKS).toHaveLength(4);
    for (const track of STUDENT_PERSONA_TRACKS) {
      expect(track.steps).toHaveLength(4);
      expect(track.firstHref.startsWith("/")).toBe(true);
      for (const step of track.steps) {
        expect(step.href.startsWith("/")).toBe(true);
        expect(step.detail.length).toBeGreaterThan(20);
      }
    }
  });

  it("decodes mathematical symbols into plain Uzbek for 0-level beginners", () => {
    expect(explainFormulaSimply("y = mx + b")).toContain("qiyalik");
    expect(explainFormulaSimply("D = b^2 - 4ac")).toContain("2 ta yechim");
    expect(explainFormulaSimply("a / b, b ≠ 0")).toContain("kasr chizig'i");
    expect(explainFormulaSimply("a / b, b ≠ 0")).toContain("teng emas");
  });

  it("extracts pace directives cleanly without polluting topic matching in AI Coach", async () => {
    const soddaOpt = LEARNING_PACE_OPTIONS.find((o) => o.id === "SODDA")!;
    const tezkorOpt = LEARNING_PACE_OPTIONS.find((o) => o.id === "TEZKOR")!;

    const parsed = extractPaceDirective(`${tezkorOpt.aiPromptPrefix}3x + 5 = 20`);
    expect(parsed.paceHint).toBe("TEZKOR");
    expect(parsed.coreQuestion).toBe("3x + 5 = 20");

    // Even though TEZKOR prefix mentions "IELTS 7.5+", a math equation must still solve as math!
    const fastMathRes = await generateAICoachResponse({
      userMessage: `${tezkorOpt.aiPromptPrefix}3x + 5 = 20`,
      mode: "STEP_BY_STEP",
      gender: "MALE",
      studentName: "Sardor",
      turnIndex: 1,
    });
    expect(fastMathRes.reply).toContain("Aniq Yechim");
    expect(fastMathRes.reply).toContain("x = 5");
    expect(fastMathRes.reply).toContain("10 Soniyalik Imtihon Siri");

    // SODDA mode adds beginner balance-scale intuition and plain-language reminder
    const soddaMathRes = await generateAICoachResponse({
      userMessage: `${soddaOpt.aiPromptPrefix}2x + 4 = 14`,
      mode: "STEP_BY_STEP",
      gender: "FEMALE",
      studentName: "Madina",
      turnIndex: 1,
    });
    expect(soddaMathRes.reply).toContain("ikki pallali tarozi");
    expect(soddaMathRes.reply).toContain("0 dan Sodda Eslatma");
  });

  it("adapts smart local fallback responses according to student pace", () => {
    const beginnerFallback = buildSmartFallback({
      subjectId: "sat-math",
      subjectLabel: "SAT Math",
      mode: "STEP_BY_STEP",
      message: "Viyeta teoremasini tushuntir",
      honorific: "Aziz o'quvchi",
      turnIndex: 1,
      pace: "SODDA",
    });
    expect(beginnerFallback.reply).toContain("0 dan Sodda Xulosa");

    const fastFallback = buildSmartFallback({
      subjectId: "sat-math",
      subjectLabel: "SAT Math",
      mode: "STEP_BY_STEP",
      message: "Viyeta teoremasini tushuntir",
      honorific: "Aziz o'quvchi",
      turnIndex: 1,
      pace: "TEZKOR",
    });
    expect(fastFallback.reply).toContain("10 Soniyalik Imtihon Siri");
  });
});
