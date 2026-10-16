import { describe, it, expect } from "vitest";
import {
  normalizeSelfQuestion,
  MAX_PROMPT_CHARS,
  MAX_ANSWER_CHARS,
} from "../../src/services/selfQuestions.js";

describe("normalizeSelfQuestion", () => {
  it("trims prompt and answer", () => {
    expect(normalizeSelfQuestion("  Nima uchun?  ", "  Chunki shunday  ")).toEqual({
      prompt: "Nima uchun?",
      answer: "Chunki shunday",
    });
  });

  it("rejects an empty prompt", () => {
    expect(normalizeSelfQuestion("   ", "javob")).toBeNull();
  });

  it("rejects an empty answer", () => {
    expect(normalizeSelfQuestion("savol", "\n\t ")).toBeNull();
  });

  it("clamps both fields to their maximum length", () => {
    const result = normalizeSelfQuestion(
      "q".repeat(MAX_PROMPT_CHARS + 100),
      "a".repeat(MAX_ANSWER_CHARS + 100)
    );
    expect(result?.prompt).toHaveLength(MAX_PROMPT_CHARS);
    expect(result?.answer).toHaveLength(MAX_ANSWER_CHARS);
  });

  it("keeps a normal question untouched", () => {
    expect(
      normalizeSelfQuestion(
        "Present Perfect qachon ishlatiladi?",
        "Tugallanmagan, hozirgi natijaga bog'liq harakatlar uchun"
      )
    ).toEqual({
      prompt: "Present Perfect qachon ishlatiladi?",
      answer: "Tugallanmagan, hozirgi natijaga bog'liq harakatlar uchun",
    });
  });
});
