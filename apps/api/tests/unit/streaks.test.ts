import { describe, expect, it } from "vitest";
import { computeStreaks } from "../../src/services/streaks.js";

function utcDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

describe("computeStreaks", () => {
  it("returns zeros for an empty history", () => {
    expect(computeStreaks(new Set())).toEqual({
      current: 0,
      best: 0,
      todayActive: false,
    });
  });

  it("counts a multi-day run ending today", () => {
    const set = new Set([utcDaysAgo(0), utcDaysAgo(1), utcDaysAgo(2)]);
    const result = computeStreaks(set);
    expect(result.current).toBe(3);
    expect(result.best).toBe(3);
    expect(result.todayActive).toBe(true);
  });

  it("keeps yesterday's streak when today is still empty", () => {
    const set = new Set([utcDaysAgo(1), utcDaysAgo(2)]);
    const result = computeStreaks(set);
    expect(result.current).toBe(2);
    expect(result.todayActive).toBe(false);
  });

  it("breaks the run on a gap and tracks the best segment", () => {
    const set = new Set([
      utcDaysAgo(0),
      utcDaysAgo(1),
      utcDaysAgo(4),
      utcDaysAgo(5),
      utcDaysAgo(6),
      utcDaysAgo(7),
    ]);
    const result = computeStreaks(set);
    expect(result.current).toBe(2);
    expect(result.best).toBe(4);
  });
});
