import { describe, it, expect } from "vitest";
import {
  PLACEMENT_QUESTION_BANK,
  selectNextAdaptiveQuestion,
  evaluatePlacementTest,
  levelToStartingDifficulty,
} from "@/lib/curriculum/placement-engine";

describe("Bosqich 2: Adaptiv Placement Test va Natija Hisoblash", () => {
  it("O'quvchining o'z bahosini to'g'ri boshlang'ich qiyinlik darajasiga o'tkazadi", () => {
    expect(levelToStartingDifficulty("ZERO")).toBe(1);
    expect(levelToStartingDifficulty("BEGINNER")).toBe(2);
    expect(levelToStartingDifficulty("INTERMEDIATE")).toBe(3);
    expect(levelToStartingDifficulty("ADVANCED")).toBe(4);
  });

  it("Belgilangan fan va qiyinlik darajasi bo'yicha takrorlanmaydigan adaptiv savol tanlaydi", () => {
    const q1 = selectNextAdaptiveQuestion({
      subjectSlug: "sat-math",
      targetDifficulty: 2,
      answeredIds: [],
    });
    expect(q1).not.toBeNull();
    expect(q1?.subjectSlug).toBe("sat-math");
    expect(q1?.difficulty).toBe(2);

    const q2 = selectNextAdaptiveQuestion({
      subjectSlug: "sat-math",
      targetDifficulty: 3,
      answeredIds: q1 ? [q1.id] : [],
    });
    expect(q2).not.toBeNull();
    expect(q2?.id).not.toBe(q1?.id);
    expect(q2?.difficulty).toBe(3);
  });

  it("Barcha javoblar to'g'ri bo'lganda ADVANCED daraja va yuqori SAT/IELTS hisoblaydi", () => {
    const allCorrectAnswers = PLACEMENT_QUESTION_BANK.slice(0, 10).map((q) => ({
      questionId: q.id,
      subjectSlug: q.subjectSlug,
      difficulty: q.difficulty,
      givenAnswer: q.correctAnswer,
    }));

    const summary = evaluatePlacementTest({
      answers: allCorrectAnswers,
      speakingComfort: "CONFIDENT",
      writingExperience: "FULL_ESSAYS",
      honorific: "Malikam",
    });

    expect(summary.overallLevel).toBe("ADVANCED");
    expect(summary.scorePercent).toBe(100);
    expect(summary.estimatedSat).toBeGreaterThanOrEqual(1500);
    expect(summary.estimatedIelts).toBeGreaterThanOrEqual(8.0);
    expect(summary.writingSpeakingAdvice).toContain("Malikam");
  });

  it("Barcha javoblar xato bo'lganda ZERO (Noldan) darajani belgilaydi", () => {
    const allWrongAnswers = PLACEMENT_QUESTION_BANK.slice(0, 10).map((q) => ({
      questionId: q.id,
      subjectSlug: q.subjectSlug,
      difficulty: q.difficulty,
      givenAnswer: q.correctAnswer === "A" ? "B" : "A",
    }));

    const summary = evaluatePlacementTest({
      answers: allWrongAnswers,
      speakingComfort: "SHY",
      writingExperience: "NONE",
      honorific: "Shag'zodam",
    });

    expect(summary.overallLevel).toBe("ZERO");
    expect(summary.scorePercent).toBe(0);
    expect(summary.writingSpeakingAdvice).toContain("Shag'zodam");
  });
});
