import { describe, it, expect } from "vitest";
import { PLACEMENT, scorePlacement } from "../../src/services/curriculum.js";

function accepted(ids: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const id of ids) map[id] = PLACEMENT.find((q) => q.id === id)!.correct;
  return map;
}

describe("scorePlacement", () => {
  it("gives level 10 for a perfect run and reports all answers", () => {
    const result = scorePlacement(accepted(PLACEMENT.map((q) => q.id)));
    expect(result.level).toBe(10);
    expect(result.earned).toBe(PLACEMENT.length);
    expect(result.possible).toBe(PLACEMENT.length);
    expect(result.detail).toHaveLength(PLACEMENT.length);
    expect(result.detail.every((d) => d.correct)).toBe(true);
  });

  it("stops the streak at the first gap — a lucky hard answer cannot inflate the level", () => {
    // p1..p2 correct, p3 wrong, then p9 correct (the break happens first).
    const answers = accepted(["p1", "p2"]);
    answers["p3"] = (PLACEMENT[2].correct + 1) % PLACEMENT[2].options.length;
    answers["p9"] = PLACEMENT[8].correct;
    const result = scorePlacement(answers);
    expect(result.earned).toBe(2);
    expect(result.possible).toBe(3); // stops counting after the first gap
    expect(result.level).toBe(1);
  });

  it("returns 0 when the very first question is missed", () => {
    const answers: Record<string, number> = {};
    answers["p1"] = (PLACEMENT[0].correct + 1) % PLACEMENT[0].options.length;
    const result = scorePlacement(answers);
    expect(result.level).toBe(0);
    expect(result.earned).toBe(0);
  });

  it("does not penalise unanswered later questions", () => {
    const result = scorePlacement(accepted(["p1", "p2", "p3", "p4", "p5"]));
    expect(result.possible).toBe(5);
    expect(result.earned).toBe(5);
    expect(result.level).toBe(4); // level of the last answered question
  });

  it("lists each answered question with its explanation", () => {
    const result = scorePlacement(accepted(["p1"]));
    expect(result.detail).toEqual([
      {
        id: "p1",
        correct: true,
        chosen: PLACEMENT[0].correct,
        explain: PLACEMENT[0].explain,
      },
    ]);
  });

  it("keeps the level inside 0..10 for degenerate input", () => {
    expect(scorePlacement({}).level).toBe(0);
    expect(scorePlacement({ notARealId: 0 }).level).toBe(0);
  });
});