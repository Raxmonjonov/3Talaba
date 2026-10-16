import { describe, it, expect } from "vitest";
import { latestMistakes, type AnswerLite } from "../../src/services/mistakes.js";
import { correctAnswerLabel, givenAnswerLabel } from "../../src/services/questions.js";

function answer(
  questionId: string,
  correct: boolean,
  answeredAt: string,
  given = "x"
): AnswerLite {
  return { questionId, correct, given, answeredAt: new Date(answeredAt) };
}

describe("latestMistakes", () => {
  it("keeps only the newest attempt per question", () => {
    const history = [
      answer("a", false, "2026-01-03"),
      answer("a", true, "2026-01-02"),
      answer("b", false, "2026-01-01"),
    ];
    // a's newest attempt is wrong, so it stays; b is wrong too.
    expect(latestMistakes(history, 10).map((m) => m.questionId)).toEqual(["a", "b"]);
  });

  it("drops questions answered correctly since the mistake", () => {
    const history = [
      answer("a", true, "2026-01-03"),
      answer("a", false, "2026-01-02"),
    ];
    expect(latestMistakes(history, 10)).toEqual([]);
  });

  it("respects the limit", () => {
    const history = [
      answer("a", false, "2026-01-03"),
      answer("b", false, "2026-01-02"),
      answer("c", false, "2026-01-01"),
    ];
    expect(latestMistakes(history, 2).map((m) => m.questionId)).toEqual(["a", "b"]);
  });

  it("returns nothing for an empty history", () => {
    expect(latestMistakes([], 5)).toEqual([]);
  });
});

const mcqRow = {
  type: "MCQ_MULTI",
  options: JSON.stringify([
    { label: { uz: "Birinchi", en: "First" }, correct: true },
    { label: { uz: "Ikkinchi", en: "Second" }, correct: false },
    { label: { uz: "Uchinchi", en: "Third" }, correct: true },
  ]),
};

const numericRow = {
  type: "NUMERIC",
  options: JSON.stringify([
    { label: { uz: "7", en: "7" }, correct: true, accepts: ["7"] },
  ]),
};

describe("correctAnswerLabel", () => {
  it("joins every correct option for multiple choice", () => {
    expect(correctAnswerLabel(mcqRow, "uz")).toBe("Birinchi, Uchinchi");
  });

  it("uses the target for free text", () => {
    expect(correctAnswerLabel(numericRow, "en")).toBe("7");
  });
});

describe("givenAnswerLabel", () => {
  it("maps choice indexes back to their labels", () => {
    expect(givenAnswerLabel(mcqRow, "0,2", "uz")).toBe("Birinchi, Uchinchi");
  });

  it("returns free text as typed", () => {
    expect(givenAnswerLabel(numericRow, "xato javob", "uz")).toBe("xato javob");
  });

  it("resolves a numeric chip index for free text", () => {
    expect(givenAnswerLabel(numericRow, "0", "uz")).toBe("7");
  });
});
