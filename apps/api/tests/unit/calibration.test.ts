import { describe, it, expect } from "vitest";
import { summarizeCalibration, type RatedAnswer } from "../../src/services/calibration.js";

function rated(confidence: number | null, correct: boolean): RatedAnswer {
  return { confidence, correct };
}

describe("summarizeCalibration", () => {
  it("ignores answers without a confidence rating", () => {
    const summary = summarizeCalibration([
      rated(null, true),
      rated(3, true),
    ]);
    expect(summary.total).toBe(2);
    expect(summary.rated).toBe(1);
  });

  it("counts high-confidence mistakes as overconfident", () => {
    const summary = summarizeCalibration([
      rated(3, false),
      rated(3, true),
      rated(1, false),
    ]);
    expect(summary.overconfident).toBe(1);
  });

  it("counts correct-but-unsure answers as underconfident", () => {
    const summary = summarizeCalibration([
      rated(1, true),
      rated(1, true),
      rated(2, true),
    ]);
    expect(summary.underconfident).toBe(2);
  });

  it("builds per-level accuracy buckets", () => {
    const summary = summarizeCalibration([
      rated(3, true),
      rated(3, false),
      rated(2, true),
    ]);
    const high = summary.buckets[2];
    expect(high.total).toBe(2);
    expect(high.correct).toBe(1);
    expect(high.accuracy).toBe(0.5);
  });

  it("computes overall accuracy across rated answers only", () => {
    const summary = summarizeCalibration([
      rated(3, true),
      rated(1, false),
      rated(null, false),
    ]);
    expect(summary.accuracy).toBe(0.5);
  });

  it("handles an empty history", () => {
    const summary = summarizeCalibration([]);
    expect(summary.rated).toBe(0);
    expect(summary.accuracy).toBe(0);
    expect(summary.overconfident).toBe(0);
    expect(summary.buckets).toHaveLength(3);
  });

  it("ignores out-of-range confidence values", () => {
    const summary = summarizeCalibration([
      { confidence: 0, correct: true },
      { confidence: 4, correct: true },
    ]);
    expect(summary.rated).toBe(0);
  });
});
