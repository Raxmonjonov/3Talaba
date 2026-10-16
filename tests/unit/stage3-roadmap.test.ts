import { describe, it, expect } from "vitest";
import {
  calculateDailyTimeBreakdown,
  generatePersonalizedRoadmap,
} from "@/lib/curriculum/roadmap-generator";

describe("Bosqich 3: 12 Oylik Yo'l Xaritasi Generatori va Kunlik Vaqt Tanlash", () => {
  it("Standart (<= 120 daqiqa) kunlik vaqtni to'g'ri taqsimlaydi", () => {
    const std60 = calculateDailyTimeBreakdown(60);
    expect(std60.totalMinutes).toBe(60);
    expect(std60.isCustomOverTwoHours).toBe(false);
    expect(std60.theoryMinutes + std60.practiceMinutes + std60.aiReviewMinutes).toBe(60);

    const std120 = calculateDailyTimeBreakdown(120);
    expect(std120.totalMinutes).toBe(120);
    expect(std120.isCustomOverTwoHours).toBe(false);
    expect(std120.dailyQuestionCount).toBeGreaterThan(std60.dailyQuestionCount);
  });

  it("Qo'lda kiritilgan (> 120 daqiqa) vaqt uchun intensiv rejim va tanaffuslarni hisoblaydi", () => {
    const custom180 = calculateDailyTimeBreakdown(180);
    expect(custom180.totalMinutes).toBe(180);
    expect(custom180.isCustomOverTwoHours).toBe(true);
    expect(custom180.scheduleAdviceUz).toContain("standart 2 soatdan ko'p");
    expect(custom180.pomodoroSessions).toBe(6);
  });

  it("12 oy va 48 haftalik to'liq shaxsiy yo'l xaritasini generatsiya qiladi va zaif fanlarga ustuvorlik beradi", () => {
    const plan = generatePersonalizedRoadmap({
      startLevel: "ZERO",
      dailyMinutes: 90,
      targetSatScore: 1520,
      targetIeltsScore: 8.0,
      targetUniversity: "MIT",
      weakSubjects: ["ielts"],
    });

    expect(plan.months).toHaveLength(12);
    expect(plan.annualStudyHours).toBe(Math.round((90 * 6 * 48) / 60));
    // 12 oy * 4 hafta * 6 kun = 288 kunlik vazifa
    expect(plan.items).toHaveLength(288);
    // 1-oy 1-hafta 1-kun zaif fan ("ielts") bilan boshlanishi kerak
    expect(plan.items[0]?.subjectSlug).toBe("ielts");
    expect(plan.items[0]?.durationMinutes).toBe(90);
  });
});
