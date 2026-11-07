import { describe, expect, it } from "vitest";
import { MATH_15_MODULES } from "@/lib/curriculum/math-modules-data";
import { SEED_CURRICULUM } from "@/lib/curriculum/seed-content";
import {
  buildChalkboardFromLesson,
  buildChalkboardFromMathModule,
} from "@/lib/learning/chalkboard-builder";

describe("Stage 12: Animated AI Ustoz Chalkboard Classroom Builder", () => {
  it("matches the exact 4-zone chalkboard layout for Linear Functions (Chiziqli Funksiya Nima?)", () => {
    const linearBundle = SEED_CURRICULUM[0]!;
    const slide = buildChalkboardFromLesson({
      slug: linearBundle.topic.lesson.slug,
      subjectName: linearBundle.nameUz,
      lessonTitle: linearBundle.topic.lesson.titleUz,
      theoryMarkdown: linearBundle.topic.lesson.theoryMarkdown,
      examples: linearBundle.topic.lesson.examples,
    });

    expect(slide.topicTitle).toBe("Chiziqli Funksiya Nima?");
    expect(slide.formulas).toEqual([
      "f(x) = mx + b",
      "m = (y2 - y1) / (x2 - x1)",
    ]);
    expect(slide.leftConcept.paragraphs[0]).toContain("Digital SAT Matematika");
    expect(slide.leftConcept.bullets.length).toBeGreaterThanOrEqual(2);
    expect(slide.rightGoldenRule.heading).toContain("SAT Imtihonidagi Oltin Qoida");
    expect(slide.bottomSpecialRule.heading).toBe(
      "Parallel va Perpendikulyar To'g'ri Chiziqlar"
    );
  });

  it("generates complete 4-zone slides and 4-step AI Ustoz narration for all 20 topics", () => {
    const allSlides = [
      ...SEED_CURRICULUM.map((s) =>
        buildChalkboardFromLesson({
          slug: s.topic.lesson.slug,
          subjectName: s.nameUz,
          lessonTitle: s.topic.lesson.titleUz,
          theoryMarkdown: s.topic.lesson.theoryMarkdown,
          examples: s.topic.lesson.examples,
        })
      ),
      ...MATH_15_MODULES.map((m) => buildChalkboardFromMathModule(m)),
    ];

    expect(allSlides).toHaveLength(20);

    for (const slide of allSlides) {
      expect(slide.topicTitle.length).toBeGreaterThan(3);
      expect(slide.formulas.length).toBeGreaterThanOrEqual(1);
      expect(slide.teacherNarration.SODDA).toHaveLength(4);
      expect(slide.teacherNarration.STANDART).toHaveLength(4);
      expect(slide.teacherNarration.TEZKOR).toHaveLength(4);
      for (const line of slide.teacherNarration.SODDA) {
        expect(line.length).toBeGreaterThan(20);
      }
    }
  });
});
