import { describe, it, expect } from "vitest";
import {
  normalizeReflectionBody,
  MAX_REFLECTION_CHARS,
} from "../../src/services/reflections.js";

describe("normalizeReflectionBody", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeReflectionBody("  vaqtni noto'g'ri o'qidim  \n")).toBe(
      "vaqtni noto'g'ri o'qidim"
    );
  });

  it("keeps an empty body empty (a cleared reflection)", () => {
    expect(normalizeReflectionBody("  \n\t ")).toBe("");
  });

  it("clamps to the maximum length", () => {
    const long = "a".repeat(MAX_REFLECTION_CHARS + 500);
    expect(normalizeReflectionBody(long)).toHaveLength(MAX_REFLECTION_CHARS);
  });

  it("leaves a normal reflection untouched", () => {
    expect(
      normalizeReflectionBody("Present Perfect kerak edi, Past Simple emas")
    ).toBe("Present Perfect kerak edi, Past Simple emas");
  });
});
