import { describe, it, expect } from "vitest";
import {
  normalizeAttemptReflection,
  MAX_ATTEMPT_REFLECTION_CHARS,
} from "../../src/services/mockExams.js";

describe("normalizeAttemptReflection", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeAttemptReflection("  vaqtni to'g'ri taqsimladim  \n")).toBe(
      "vaqtni to'g'ri taqsimladim"
    );
  });

  it("keeps an empty body empty (a cleared reflection)", () => {
    expect(normalizeAttemptReflection("  \n\t ")).toBe("");
  });

  it("clamps to the maximum length", () => {
    const long = "a".repeat(MAX_ATTEMPT_REFLECTION_CHARS + 500);
    expect(normalizeAttemptReflection(long)).toHaveLength(
      MAX_ATTEMPT_REFLECTION_CHARS
    );
  });

  it("leaves a normal reflection untouched", () => {
    expect(
      normalizeAttemptReflection("O'qish bo'limida vaqt yetmadi, keyingi safar tezroq.")
    ).toBe("O'qish bo'limida vaqt yetmadi, keyingi safar tezroq.");
  });
});
