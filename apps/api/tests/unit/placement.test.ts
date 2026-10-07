import { describe, it, expect } from "vitest";
import {
  probabilityCorrect,
  itemInformation,
  selectNextItem,
  updateAbility,
  applyAnswer,
  initialState,
  skillThetas,
  thetaToLevel,
  thetaToScaled,
  levelToTheta,
  planModeForLevel,
  DEFAULT_CONFIG,
  THETA_MIN,
  THETA_MAX,
} from "../../src/services/placement.js";

const p = (difficulty: number, id = "q" + difficulty) => ({ id, difficulty, skillId: "s1" });

describe("probabilityCorrect", () => {
  it("returns 0.5 for a student matched to the item", () => {
    expect(probabilityCorrect(0, 0)).toBeCloseTo(0.5, 4);
  });

  it("stays inside the [0.0001, 0.9999] band and is monotonic", () => {
    const low = probabilityCorrect(THETA_MIN, THETA_MAX);
    const high = probabilityCorrect(THETA_MAX, THETA_MIN);
    expect(low).toBeGreaterThanOrEqual(0.0001);
    expect(high).toBeLessThanOrEqual(0.9999);
    expect(low).toBeLessThan(0.5);
    expect(high).toBeGreaterThan(0.5);
    // Exact Rasch values at the reachable band edges.
    expect(high).toBeCloseTo(1 / (1 + Math.exp(-(THETA_MAX - THETA_MIN))), 6);
  });
});

describe("itemInformation", () => {
  it("peaks at 0.25 when P is 0.5", () => {
    expect(itemInformation(0, 0)).toBeCloseTo(0.25, 4);
  });
});

describe("selectNextItem", () => {
  it("returns null for an empty pool", () => {
    expect(selectNextItem(initialState(), [])).toBeNull();
  });

  it("never reuses an answered item", () => {
    const pool = [p(0), p(1)];
    const state = applyAnswer(initialState(), pool[0], true);
    const next = selectNextItem(state, pool);
    expect(next?.id).toBe(pool[1].id);
  });

  it("breaks ties toward the harder item", () => {
    // Both items sit equally informative when theta == 0 (difficulty 0 is the
    // closest; a tie needs two items with comparable information).
    const pool = [p(-0.5), p(0.5)];
    const state = { ...initialState(), theta: 0, se: 1 };
    const next = selectNextItem(state, pool);
    expect(next?.difficulty).toBe(0.5);
  });
});

describe("updateAbility", () => {
  it("raises theta on a correct answer and lowers SE", () => {
    const before = initialState();
    const after = updateAbility(before.theta, before.se, 0, true);
    expect(after.theta).toBeGreaterThan(before.theta);
    expect(after.se).toBeLessThan(before.se);
  });

  it("lowers theta on a wrong answer", () => {
    const before = initialState();
    const after = updateAbility(before.theta, before.se, 0, false);
    expect(after.theta).toBeLessThan(before.theta);
  });
});

describe("applyAnswer", () => {
  it("records history and never mutates the input", () => {
    const state = initialState();
    const next = applyAnswer(state, p(0), true);
    expect(state.answered).toHaveLength(0);
    expect(next.answered).toHaveLength(1);
    expect(next.history[0]).toMatchObject({ itemId: "q0", correct: true, skillId: "s1" });
  });

  it("finishes once minItems are answered and SE drops to the target", () => {
    let state = initialState();
    const config = { ...DEFAULT_CONFIG, minItems: 3, maxItems: 10, targetSe: 0.9 };
    for (let i = 0; i < 3; i++) {
      state = applyAnswer(state, p(i, "q" + i), true, config);
    }
    expect(state.finished).toBe(true);
  });

  it("hard-stops at maxItems even if SE stays high", () => {
    let state = initialState();
    const config = { ...DEFAULT_CONFIG, minItems: 2, maxItems: 2, targetSe: 0.05 };
    for (let i = 0; i < 2; i++) {
      state = applyAnswer(state, p(i, "q" + i), true, config);
    }
    expect(state.finished).toBe(true);
    expect(state.answered).toHaveLength(2);
  });
});

describe("skillThetas", () => {
  it("rewards a perfect accuracy skill", () => {
    const history = [1, 2, 3, 4].map((d, i) => ({
      itemId: "q" + i,
      correct: true,
      thetaBefore: 0,
      thetaAfter: 0.5,
      seAfter: 0.8,
      skillId: "strong",
    }));
    expect(skillThetas(history)["strong"]).toBeGreaterThan(0);
  });

  it("punishes an all-wrong skill", () => {
    const history = [1, 2, 3].map((d, i) => ({
      itemId: "q" + i,
      correct: false,
      thetaBefore: 0,
      thetaAfter: -0.5,
      seAfter: 0.8,
      skillId: "weak",
    }));
    expect(skillThetas(history)["weak"]).toBeLessThan(0);
  });
});

describe("thetaToLevel", () => {
  it("maps the calibration thresholds exactly", () => {
    expect(thetaToLevel(-2)).toBe(0);
    expect(thetaToLevel(-1.2)).toBe(1);
    expect(thetaToLevel(0)).toBe(2);
    expect(thetaToLevel(1.0)).toBe(4);
    expect(thetaToLevel(2)).toBe(5);
  });
});

describe("thetaToScaled", () => {
  it("turns [-3, 3] into the 400-1600 band", () => {
    expect(thetaToScaled(THETA_MIN)).toBe(400);
    expect(thetaToScaled(0)).toBe(1000);
    expect(thetaToScaled(THETA_MAX)).toBe(1600);
  });
});

describe("levelToTheta / planModeForLevel", () => {
  it("picks the midpoint of each level band", () => {
    expect(levelToTheta(0)).toBeCloseTo(-2.1, 4);
    expect(levelToTheta(2)).toBeCloseTo(0, 4);
    expect(levelToTheta(5)).toBeCloseTo(1.7, 4);
  });

  it("applies the plan mode transition", () => {
    expect(planModeForLevel(0)).toBe("STARTER");
    expect(planModeForLevel(3)).toBe("STANDARD");
    expect(planModeForLevel(4)).toBe("INTENSIVE");
  });
});