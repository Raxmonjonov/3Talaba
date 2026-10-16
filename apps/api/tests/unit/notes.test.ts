import { describe, it, expect } from "vitest";
import { normalizeNoteBody, MAX_NOTE_CHARS } from "../../src/services/notes.js";

describe("normalizeNoteBody", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeNoteBody("  xulosa  \n")).toBe("xulosa");
  });

  it("keeps an empty note empty (a cleared summary)", () => {
    expect(normalizeNoteBody("   \n\t ")).toBe("");
  });

  it("clamps to the maximum length", () => {
    const long = "a".repeat(MAX_NOTE_CHARS + 500);
    expect(normalizeNoteBody(long)).toHaveLength(MAX_NOTE_CHARS);
  });

  it("leaves a normal note untouched", () => {
    expect(normalizeNoteBody("Kvadrat tenglama: ax² + bx + c = 0")).toBe(
      "Kvadrat tenglama: ax² + bx + c = 0"
    );
  });
});
