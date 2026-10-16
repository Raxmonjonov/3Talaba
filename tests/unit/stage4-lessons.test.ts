import { describe, expect, it } from "vitest";
import { SEED_BADGES, SEED_CURRICULUM } from "@/lib/curriculum/seed-content";
import { PLACEMENT_QUESTION_BANK } from "@/lib/curriculum/placement-engine";

describe("Stage 4: Lesson Curriculum, Question Bank & Badges Seed Data", () => {
  it("contains all 5 core subjects with structured lessons, theory, and examples", () => {
    expect(SEED_CURRICULUM.length).toBe(5);

    const subjectSlugs = SEED_CURRICULUM.map((s) => s.slug);
    expect(subjectSlugs).toEqual([
      "sat-math",
      "sat-rw",
      "ielts",
      "foundation-math",
      "academic-writing",
    ]);

    for (const bundle of SEED_CURRICULUM) {
      expect(bundle.topic.lesson.titleUz.length).toBeGreaterThan(10);
      expect(bundle.topic.lesson.theoryMarkdown.length).toBeGreaterThan(150);
      expect(bundle.topic.lesson.examples.length).toBeGreaterThanOrEqual(1);
      expect(bundle.topic.lesson.questions.length).toBeGreaterThanOrEqual(2);
      expect(bundle.topic.lesson.xpReward).toBeGreaterThanOrEqual(70);
    }
  });

  it("ensures every lesson and placement question has valid 4 options, correct answer, and Uzbek explanation", () => {
    const lessonQuestions = SEED_CURRICULUM.flatMap((s) => s.topic.lesson.questions);
    expect(lessonQuestions.length).toBeGreaterThanOrEqual(14);

    for (const q of lessonQuestions) {
      expect(q.options.map((o) => o.id)).toEqual(["A", "B", "C", "D"]);
      expect(["A", "B", "C", "D"]).toContain(q.correctAnswer);
      expect(q.explanationUz.length).toBeGreaterThan(20);
      expect(q.hints.length).toBeGreaterThanOrEqual(1);
    }

    expect(PLACEMENT_QUESTION_BANK.length).toBe(20);
  });

  it("defines gamification badges with valid XP bonuses and conditions", () => {
    expect(SEED_BADGES.length).toBe(6);
    const badgeSlugs = SEED_BADGES.map((b) => b.slug);
    expect(badgeSlugs).toContain("first-lesson");
    expect(badgeSlugs).toContain("sharp-shooter");

    for (const badge of SEED_BADGES) {
      expect(badge.xpBonus).toBeGreaterThanOrEqual(50);
      expect(badge.titleUz.length).toBeGreaterThan(3);
    }
  });
});
