import { describe, expect, it } from "vitest";
import {
  analyzeStudentSignal,
  evaluateAcademicWriting,
  generateAICoachResponse,
  getVariedHonorific,
  redactPersonalInfo,
} from "@/lib/ai";

describe("Stage 5: Provider-Agnostic Socratic AI Coach (/lib/ai)", () => {
  it("rotates warm honorifics and prefers the student's first name", () => {
    const f0 = getVariedHonorific("FEMALE", 0);
    const f1 = getVariedHonorific("FEMALE", 1);
    const m0 = getVariedHonorific("MALE", 0);

    expect(f0.length).toBeGreaterThan(0);
    expect(f0).not.toBe(f1);
    expect(m0).toBe(f0);

    expect(getVariedHonorific("FEMALE", 0, "Madina Karimova")).toBe("Madina");
    expect(getVariedHonorific("MALE", 0, "Ali Valiyev")).toBe("Ali");
  });

  it("applies Socratic method: guides first with a question, then explains step-by-step", async () => {
    const firstTurn = await generateAICoachResponse({
      userMessage: "6x + 10 = 34 tenglamadan 3x + 5 ni qanday topaman?",
      mode: "SOCRATIC_TUTOR",
      gender: "FEMALE",
      studentName: "Madina",
      studentLevel: "BEGINNER",
      turnIndex: 0,
      history: [],
    });

    expect(firstTurn.metadata.socraticStep).toBe("GUIDING_QUESTION");
    expect(firstTurn.reply).toContain("Madina");
    expect(firstTurn.reply).toContain("tayyor javobni darhol berib qo'ymayman");
    expect(firstTurn.reply).not.toContain("Aniq Yechim");

    const secondTurn = await generateAICoachResponse({
      userMessage: "Ikkala tomonini 2 ga bo'lamiz!",
      mode: "SOCRATIC_TUTOR",
      gender: "FEMALE",
      studentName: "Madina",
      studentLevel: "BEGINNER",
      turnIndex: 1,
      history: [
        { role: "USER", content: "6x + 10 = 34" },
        { role: "ASSISTANT", content: firstTurn.reply },
      ],
    });

    expect(secondTurn.metadata.socraticStep).toBe("STEP_BY_STEP");
    expect(secondTurn.reply).toContain("1-bosqich");
  });

  it("evaluates IELTS / Academic Writing with structured Band rubric and Socratic challenge", () => {
    const sampleEssay =
      "Some people argue that online platforms will replace universities. However, campus education remains essential for laboratory research. Furthermore, face-to-face mentorship builds critical thinking skills. Therefore, a hybrid model is optimal.";

    const { reply, rubric } = evaluateAcademicWriting(
      sampleEssay,
      "Shag'zodam",
      "INTERMEDIATE"
    );

    expect(Number(rubric.estimatedBand)).toBeGreaterThanOrEqual(6.0);
    expect(rubric.wordCount).toBeGreaterThan(25);
    expect(rubric.coherenceCohesion).toBeGreaterThanOrEqual(6.5);
    expect(reply).toContain("Shag'zodam");
    expect(reply).toContain("Socratic Vazifa");
  });

  it("enforces child safety, PII redaction, and fatigue/rest care", async () => {
    const pii = redactPersonalInfo("Mening telefonim +998 90 123 45 67 va pasportim AA1234567");
    expect(pii.hadPII).toBe(true);
    expect(pii.cleanText).toContain("[TELEFON_YASHIRILDI]");
    expect(pii.cleanText).toContain("[PASPORT_YASHIRILDI]");

    const signal = analyzeStudentSignal("Ustoz, bugun juda charchadim va uyqum kelyapti");
    expect(signal.isFatigued).toBe(true);

    const fatigueRes = await generateAICoachResponse({
      userMessage: "Ustoz, bugun juda charchadim",
      mode: "SOCRATIC_TUTOR",
      gender: "MALE",
    });
    expect(fatigueRes.metadata.fatigueDetected).toBe(true);
    expect(fatigueRes.metadata.socraticStep).toBe("WELLNESS_CARE");
    expect(fatigueRes.reply).toContain("10 daqiqalik tanaffus");

    const unsafeRes = await generateAICoachResponse({
      userMessage: "Qimor va kazino haqida gapirib ber",
      mode: "SOCRATIC_TUTOR",
      gender: "FEMALE",
    });
    expect(unsafeRes.metadata.safetyBlocked).toBe(true);
  });
});
