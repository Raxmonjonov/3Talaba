import { describe, it, expect } from "vitest";
import { gradeAnswer, serveQuestion } from "../../src/services/questions.js";

const mcqRow = {
  id: "m1",
  skillSlug: "sat-algebra",
  type: "MCQ_SINGLE",
  promptUz: "Tenglama?",
  promptEn: "Equation?",
  passageUz: null,
  passageEn: "Read carefully.",
  options: JSON.stringify([
    { label: { uz: "A", en: "A" }, correct: true },
    { label: { uz: "B", en: "B" }, correct: false },
  ]),
  difficulty: -1,
  seconds: 30,
};

const numericRow = {
  id: "n1",
  skillSlug: "sat-algebra",
  type: "NUMERIC",
  promptUz: "3x-7=14, x?",
  promptEn: "3x-7=14, x?",
  passageUz: null,
  passageEn: null,
  options: JSON.stringify([
    { label: { uz: "7", en: "7" }, correct: true, accepts: ["7", "7.0"] },
  ]),
  difficulty: -2.5,
  seconds: 30,
};

describe("serveQuestion", () => {
  it("never leaks accepts or correct to the client", () => {
    const served = serveQuestion(numericRow, "en");
    expect(served.options).toEqual([{ label: "7" }]);
    expect(JSON.stringify(served)).not.toContain("accepts");
    expect(JSON.stringify(served)).not.toContain("correct");
  });

  it("exposes the passage for reading items", () => {
    const served = serveQuestion(mcqRow, "en");
    expect(served.passage).toBe("Read carefully.");
  });
});

describe("gradeAnswer free-text", () => {
  it("accepts any listed variant", () => {
    expect(gradeAnswer(numericRow, "7", "en").correct).toBe(true);
    expect(gradeAnswer(numericRow, "7.0", "en").correct).toBe(true);
    expect(gradeAnswer(numericRow, " 7 ", "en").correct).toBe(true);
    expect(gradeAnswer(numericRow, "8", "en").correct).toBe(false);
  });

  it("resolves a legacy option index to the label", () => {
    expect(gradeAnswer(numericRow, "0", "en").correct).toBe(true);
  });

  it("grades MCQ by index as before", () => {
    expect(gradeAnswer(mcqRow, "0", "en").correct).toBe(true);
    expect(gradeAnswer(mcqRow, "1", "en").correct).toBe(false);
  });
});
