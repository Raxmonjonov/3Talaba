import { describe, expect, it } from "vitest";
import {
  DEEP_METHOD_STEPS,
  MATH_TOPICS,
  checkMathAnswer,
  checkMathProblemAnswer,
  getMathTopic,
  parseStudentNumber,
} from "@/lib/curriculum/math-deep-dive";

describe("Stage 7 — Algebra va Geometriya chuqur o'rganish metodi", () => {
  it("6 bosqichli metod va ikkala fan bo'yicha mavzular mavjud (14+ mavzu)", () => {
    expect(DEEP_METHOD_STEPS).toHaveLength(6);
    expect(MATH_TOPICS.filter((t) => t.branch === "algebra").length).toBeGreaterThanOrEqual(7);
    expect(MATH_TOPICS.filter((t) => t.branch === "geometry").length).toBeGreaterThanOrEqual(6);
  });

  it("har bir mavzu barcha bosqichlar uchun to'liq kontentga ega", () => {
    const slugs = new Set<string>();
    for (const t of MATH_TOPICS) {
      expect(slugs.has(t.slug)).toBe(false);
      slugs.add(t.slug);
      expect(t.intuitionUz.length).toBeGreaterThan(0);
      expect(t.formulas.length).toBeGreaterThan(0);
      expect(t.workedExample.steps.length).toBeGreaterThan(0);
      expect(t.practice.length).toBeGreaterThanOrEqual(3);
      expect(t.commonMistakesUz.length).toBeGreaterThan(0);
    }
    expect(getMathTopic("pifagor-teoremasi")?.branch).toBe("geometry");
    expect(getMathTopic("foizlar-va-proporsiya")?.branch).toBe("algebra");
    expect(getMathTopic("vektorlar-koordinatalar")?.branch).toBe("geometry");
  });

  it("o'quvchi javobini turli yozuvlarda to'g'ri tekshiradi", () => {
    expect(parseStudentNumber("0,5")).toBe(0.5);
    expect(parseStudentNumber("1/2")).toBe(0.5);
    expect(parseStudentNumber(" −3 ")).toBe(-3);
    expect(parseStudentNumber("abc")).toBeNull();
    expect(checkMathAnswer("13", 13)).toBe(true);
    expect(checkMathAnswer("4/5", 0.8)).toBe(true);
    expect(checkMathAnswer("12", 13)).toBe(false);
  });

  it("SAT variantli (A, B, C, D) va erkin sonli savollarni aniq tekshiradi", () => {
    const sampleMC = {
      id: "test-mc",
      level: 1 as const,
      promptUz: "Test savoli",
      answer: 25,
      hintUz: "Test",
      solutionUz: "Test",
      correctOption: "B" as const,
    };

    expect(checkMathProblemAnswer("B", sampleMC)).toBe(true);
    expect(checkMathProblemAnswer("b", sampleMC)).toBe(true);
    expect(checkMathProblemAnswer("A", sampleMC)).toBe(false);
    expect(checkMathProblemAnswer("25", sampleMC)).toBe(true);
  });
});
