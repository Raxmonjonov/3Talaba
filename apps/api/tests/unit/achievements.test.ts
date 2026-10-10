import { describe, it, expect } from "vitest";
import {
  ACHIEVEMENTS,
  type AchievementStats,
} from "../../src/services/achievements.js";

const base: AchievementStats = {
  currentLevel: 0,
  totalMinutes: 0,
  activeDays: 0,
  totalCompleted: 0,
  sessions: 0,
  answers: 0,
};

const def = (slug: string) => {
  const found = ACHIEVEMENTS.find((a) => a.slug === slug);
  if (!found) throw new Error(`missing achievement ${slug}`);
  return found;
};

describe("achievement catalog", () => {
  it("has unique slugs", () => {
    const slugs = ACHIEVEMENTS.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("marks placement_done as event-only", () => {
    expect(def("placement_done").eventOnly).toBe(true);
    expect(def("placement_done").check(base)).toBe(false);
  });

  it("covers bronze, silver and gold", () => {
    const tiers = new Set(ACHIEVEMENTS.map((a) => a.tier));
    expect(tiers.has("bronze")).toBe(true);
    expect(tiers.has("silver")).toBe(true);
    expect(tiers.has("gold")).toBe(true);
  });

  it("every slug has uz/en/ru titles and descriptions", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.title.uz.length).toBeGreaterThan(0);
      expect(a.title.en.length).toBeGreaterThan(0);
      expect(a.title.ru.length).toBeGreaterThan(0);
      expect(a.description.uz.length).toBeGreaterThan(0);
      expect(a.description.en.length).toBeGreaterThan(0);
      expect(a.description.ru.length).toBeGreaterThan(0);
    }
  });
});

describe("stat thresholds", () => {
  it("first_steps unlocks after one session", () => {
    expect(def("first_steps").check(base)).toBe(false);
    expect(def("first_steps").check({ ...base, sessions: 1 })).toBe(true);
  });

  it("level medals use inclusive thresholds", () => {
    expect(def("level_3").check({ ...base, currentLevel: 2 })).toBe(false);
    expect(def("level_3").check({ ...base, currentLevel: 3 })).toBe(true);
    expect(def("level_6").check({ ...base, currentLevel: 5 })).toBe(false);
    expect(def("level_6").check({ ...base, currentLevel: 6 })).toBe(true);
    expect(def("level_10").check({ ...base, currentLevel: 9 })).toBe(false);
    expect(def("level_10").check({ ...base, currentLevel: 10 })).toBe(true);
  });

  it("time medals count total minutes", () => {
    expect(def("time_60").check({ ...base, totalMinutes: 59 })).toBe(false);
    expect(def("time_60").check({ ...base, totalMinutes: 60 })).toBe(true);
    expect(def("time_300").check({ ...base, totalMinutes: 300 })).toBe(true);
    expect(def("time_1000").check({ ...base, totalMinutes: 1000 })).toBe(true);
  });

  it("active_7 needs seven active days", () => {
    expect(def("active_7").check({ ...base, activeDays: 6 })).toBe(false);
    expect(def("active_7").check({ ...base, activeDays: 7 })).toBe(true);
  });

  it("question medals accept either Answer rows or progress.completed", () => {
    expect(def("questions_50").check({ ...base, answers: 49 })).toBe(false);
    expect(def("questions_50").check({ ...base, answers: 50 })).toBe(true);
    expect(def("questions_50").check({ ...base, totalCompleted: 50 })).toBe(true);
    expect(def("questions_200").check({ ...base, answers: 200 })).toBe(true);
    expect(def("questions_200").check({ ...base, totalCompleted: 200 })).toBe(true);
  });

  it("empty stats earn nothing except event-only placeholders stay locked", () => {
    const unlocked = ACHIEVEMENTS.filter((a) => !a.eventOnly && a.check(base));
    expect(unlocked).toHaveLength(0);
  });
});
