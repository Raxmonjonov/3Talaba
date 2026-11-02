import { describe, expect, it } from "vitest";
import {
  buildLiveTeacherPrompt,
  normalizeLiveModel,
  toSpokenText,
  LIVE_TEACHER_TOOL_DECLARATIONS,
  type LiveTeacherLesson,
} from "@/lib/ai/live-teacher";

const lesson: LiveTeacherLesson = {
  titleUz: "Kvadrat tenglamalar",
  summaryUz: "Kvadrat tenglamani yechishni o'rganamiz.",
  theoryMarkdown: "$$ax^2 + bx + c = 0$$ ko'rinishidagi tenglama.",
  examples: [
    {
      title: "Oddiy misol",
      problem: "x^2 - 5x + 6 = 0",
      stepByStepSolution: ["Diskriminantni topamiz", "Ildizlarni hisoblaymiz"],
      takeaway: "Ildizlar 2 va 3.",
    },
  ],
  questions: [
    {
      promptUz: "Tenglamaning ildizlari nechta?",
      options: [
        { id: "A", text: "1 ta" },
        { id: "B", text: "2 ta" },
      ],
      correctAnswer: "B",
      explanationUz: "Kvadrat tenglama ikki ildizga ega.",
      hints: ["Diskriminantni hisoblang"],
    },
  ],
  estMinutes: 15,
  subjectNameUz: "Matematika",
  topicTitleUz: "Algebra",
  nextLessonTitleUz: "Kvadrat funksiya",
};

describe("Stage 9 — Talaba AI jonli ovozli ustoz", () => {
  it("LaTeX va belgilarni tabiiy o'zbekcha talaffuzga aylantiradi", () => {
    const spoken = toSpokenText("$$\\frac{1}{2}$$ va \\sqrt{16} hamda x^2");

    expect(spoken).toContain("bo'lingan");
    expect(spoken).toContain("ildiz ostida");
    expect(spoken).toContain("kvadrat");
    expect(spoken).not.toContain("\\frac");
    expect(spoken).not.toContain("$$");
  });

  it("o'qituvchilik promptiga dars, o'quvchi va joriy bosqich ma'lumotlarini kiritadi", () => {
    const prompt = buildLiveTeacherPrompt(
      lesson,
      {
        honorific: "aziz o'quvchi",
        level: "INTERMEDIATE",
        grade: "9-sinf",
        targetUniversity: "MIT",
      },
      { stage: "EXERCISES", questionIndex: 0, totalQuestions: 1 },
    );

    expect(prompt).toContain("Talaba AI");
    expect(prompt).toContain("aziz o'quvchi");
    expect(prompt).toContain("Matematika");
    expect(prompt).toContain("Kvadrat tenglamalar");
    expect(prompt).toContain("mustaqil mashqlar");
    expect(prompt).toContain("1-mashq");
    expect(prompt).toContain("lesson_control");
    expect(prompt).toContain("Faqat o'zbek tilida");
    // To'g'ri javob agentga ma'lum bo'lishi kerak, lekin o'quvchiga aytilmasligi aytilgan.
    expect(prompt).toContain("To'g'ri javob (o'quvchiga aytma): B");
  });

  it("lesson_control tool deklaratsiyasi to'g'ri shakllangan", () => {
    const [tool] = LIVE_TEACHER_TOOL_DECLARATIONS;

    expect(tool.name).toBe("lesson_control");
    expect(tool.parameters.required).toContain("action");
    expect(tool.parameters.properties.action.enum).toEqual([
      "theory",
      "examples",
      "exercises",
      "hint",
    ]);
  });

  it("model nomini models/ prefiksisiz normallashtiradi", () => {
    expect(normalizeLiveModel("models/gemini-2.5-flash-native-audio-preview-12-2025")).toBe(
      "gemini-2.5-flash-native-audio-preview-12-2025",
    );
    expect(normalizeLiveModel(null)).toContain("gemini-");
  });
});
