import { describe, expect, it } from "vitest";
import {
  buildLeaderboard,
  buildWeeklyAndMonthlySeries,
  calculateGoalDistance,
  calculateLevelInfo,
} from "@/lib/gamification/progress-engine";

describe("Stage 6: Gamification & Progress Engine", () => {
  it("calculates level, progress percentage, and honorific title from XP", () => {
    const f1 = calculateLevelInfo(50, "FEMALE");
    expect(f1.level).toBe(1);
    expect(f1.progressPct).toBe(25);
    expect(f1.xpToNextLevel).toBe(150);
    expect(f1.titleUz).toContain("Malika");

    const m3 = calculateLevelInfo(450, "MALE");
    expect(m3.level).toBe(3);
    expect(m3.titleUz).toContain("Shag'zoda");
  });

  it("calculates distance to target SAT and IELTS scores", () => {
    const dist = calculateGoalDistance({
      targetUniversity: "MIT",
      targetSatScore: 1520,
      targetIeltsScore: 8.0,
      estimatedSat: 1100,
      estimatedIelts: 6.0,
      xpTotal: 500,
      completedLessonsCount: 4,
    });

    expect(dist.targetUniversity).toBe("MIT");
    expect(dist.satCurrent).toBeGreaterThan(1100);
    expect(dist.satRemaining).toBe(1520 - dist.satCurrent);
    expect(dist.ieltsCurrent).toBeGreaterThanOrEqual(6.5);
    expect(dist.overallReadinessPct).toBeGreaterThan(30);
  });

  it("generates 7-day weekly and 6-month monthly chart series and sorted leaderboard", () => {
    const charts = buildWeeklyAndMonthlySeries({
      xpTotal: 320,
      dailyMinutes: 90,
      attemptsCount: 10,
      correctCount: 8,
    });

    expect(charts.weeklySeries.length).toBe(7);
    expect(charts.monthlySeries.length).toBe(6);

    const board = buildLeaderboard({
      userName: "Madina Karimova",
      gender: "FEMALE",
      region: "Toshkent sh.",
      targetUniversity: "Harvard",
      xpTotal: 950,
      streakDays: 12,
    });

    expect(board.length).toBe(5);
    const current = board.find((b) => b.isCurrentUser);
    expect(current).toBeDefined();
    expect(current?.rank).toBe(3);
  });
});
