import { describe, expect, it } from "vitest";
import {
  buildTutorMessages,
  catalogLessonReply,
  systemPrompt,
  type TutorContext,
} from "../../src/services/tutor.js";

const base: TutorContext = {
  firstName: "Diyor",
  preferredTitle: null,
  currentLevel: 3,
  gender: "MALE",
  target: "SAT",
  focusMode: true,
  softConfirm: true,
};

const lesson = {
  title: "Kvadrat tenglamalar",
  summary: "ax² + bx + c = 0 shaklidagi tenglamalar.",
  objectives: ["Diskriminantni hisoblash", "Ildizlarni topish"],
  blocks: [
    { title: "Nazariya", content: "Diskriminant D = b² − 4ac formulasi bilan tenglamaning ildizlari soni aniqlanadi." },
    { title: "Misol", content: "x² − 5x + 6 = 0 uchun D = 1, ildizlar 2 va 3." },
  ],
};

describe("tutor system prompt", () => {
  it("keeps the base teaching rules", () => {
    const prompt = systemPrompt(base);
    expect(prompt).toContain("3Talab");
    expect(prompt).toContain("o'zbek tilida");
    expect(prompt).toContain("daraja 3");
  });

  it("embeds the catalog lesson when attached", () => {
    const prompt = systemPrompt({ ...base, lesson });
    expect(prompt).toContain("Joriy katalog darsi");
    expect(prompt).toContain("Kvadrat tenglamalar");
    expect(prompt).toContain("Diskriminant");
    expect(prompt).toContain("Nazariya");
  });

  it("omits the lesson section for free sessions", () => {
    expect(systemPrompt(base)).not.toContain("Joriy katalog darsi");
  });
});

describe("buildTutorMessages", () => {
  it("prepends the system prompt and keeps history", () => {
    const messages = buildTutorMessages(base, [
      { role: "user", content: "salom" },
      { role: "assistant", content: "assalom" },
    ]);
    expect(messages[0]?.role).toBe("system");
    expect(messages).toHaveLength(3);
  });
});

describe("catalogLessonReply", () => {
  it("opens with the lesson title, summary and first block", () => {
    const reply = catalogLessonReply(lesson, "Diyor");
    expect(reply).toContain("Kvadrat tenglamalar");
    expect(reply).toContain("ax² + bx + c = 0");
    expect(reply).toContain("Nazariya");
    expect(reply).toContain("Diyor");
    expect(reply).toContain("Qaysi qismdan");
  });

  it("survives a lesson with no blocks", () => {
    const reply = catalogLessonReply({ ...lesson, blocks: [] }, "Malikam");
    expect(reply).toContain("Kvadrat tenglamalar");
    expect(reply).toContain("Dars mazmunini birga");
    expect(reply).toContain("Qaysi qismdan boshlaymiz");
  });

  it("falls back to a free-form prompt without objectives", () => {
    const reply = catalogLessonReply(
      { ...lesson, blocks: [], objectives: [] },
      "Malikam"
    );
    expect(reply).toContain("Savolingizni yozing");
  });
});
