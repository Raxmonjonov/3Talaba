import { describe, expect, it } from "vitest";
import {
  examStoreActions,
  useRealExamStore,
} from "@/lib/simulator/exam-store";
import {
  CD_IELTS_40_QUESTIONS,
  CD_IELTS_PASSAGES,
} from "@/lib/simulator/cd-ielts-data";
import { EX_IELTS_EXAMINER_SYSTEM_PROMPT } from "@/app/api/ai/examiner/route";
import {
  EssayEvaluationSchema,
  evaluateEssayDeterministically,
  STRICT_EXAMINER_SYSTEM_PROMPT,
} from "@/lib/examiner/essay-evaluator";

describe("Stage 14: CD-IELTS Inspera Split-Screen Simulator (Zustand) & AI Examiner", () => {
  it("provides a complete 40-question CD-IELTS dataset across 3 passages", () => {
    expect(CD_IELTS_PASSAGES).toHaveLength(3);
    expect(CD_IELTS_40_QUESTIONS).toHaveLength(40);
    expect(CD_IELTS_40_QUESTIONS[0]?.number).toBe(1);
    expect(CD_IELTS_40_QUESTIONS[39]?.number).toBe(40);
  });

  it("manages resizable split-screen ratio, 40-question states, and Pause/Save in Zustand", () => {
    const store = useRealExamStore.getState();

    // Resizable split ratio clamps between 25% and 75%
    store.setSplitRatio(62.5);
    expect(useRealExamStore.getState().splitRatio).toBe(62.5);
    store.setSplitRatio(95);
    expect(useRealExamStore.getState().splitRatio).toBe(75);
    store.setSplitRatio(10);
    expect(useRealExamStore.getState().splitRatio).toBe(25);
    store.setSplitRatio(50);

    // Navigating to Q28 automatically selects passage-3
    store.setCurrentQuestion(28);
    expect(useRealExamStore.getState().currentQuestion).toBe(28);
    expect(useRealExamStore.getState().activePassageId).toBe("passage-3");

    // Answering & flagging Q28
    store.setQuestionAnswer(28, "TRUE");
    store.toggleQuestionFlag(28);
    expect(useRealExamStore.getState().questionAnswers[28]).toBe("TRUE");
    expect(useRealExamStore.getState().flaggedByNumber[28]).toBe(true);

    // Pause / Save Session records timestamp
    store.pauseAndSaveSession();
    expect(useRealExamStore.getState().isTimerPaused).toBe(true);
    expect(useRealExamStore.getState().lastSavedAt).toBeTruthy();
  });

  it("persists highlights, sticky notes, and clear actions across question switches in Zustand", () => {
    examStoreActions.addHighlight(
      "adult neurogenesis persists within the dentate gyrus",
      "green",
      "Important for Question 1"
    );
    const stateAfterHighlight = useRealExamStore.getState();
    const added = stateAfterHighlight.highlights[0];
    expect(added?.quote).toBe(
      "adult neurogenesis persists within the dentate gyrus"
    );
    expect(added?.color).toBe("green");
    expect(added?.note).toBe("Important for Question 1");

    if (added) {
      stateAfterHighlight.updateHighlightNote(
        added.id,
        "Updated sticky note for Q1 & Q8"
      );
      expect(useRealExamStore.getState().highlights[0]?.note).toBe(
        "Updated sticky note for Q1 & Q8"
      );
    }

    // Switching questions preserves highlights
    useRealExamStore.getState().setCurrentQuestion(19);
    expect(useRealExamStore.getState().highlights.length).toBeGreaterThan(0);

    // Clearing by quote removes the matching highlight
    useRealExamStore
      .getState()
      .clearHighlights("adult neurogenesis persists within the dentate gyrus");
    expect(
      useRealExamStore
        .getState()
        .highlights.some(
          (h) =>
            h.quote === "adult neurogenesis persists within the dentate gyrus"
        )
    ).toBe(false);
  });

  it("recalculates the Micro-Adaptive Roadmap when AI Examiner returns a weak criterion", () => {
    examStoreActions.setAIGradeResult({
      overall_band: 7.0,
      criteria_scores: { TR: 7.5, CC: 7.5, LR: 6.0, GRA: 7.0 },
      inline_corrections: [
        {
          original_phrase: "good skills",
          improved_phrase: "specialized competencies",
          band_9_synonym: "domain-specific expertise",
          criterion: "LR",
          severity: "critical",
          reason: "Upgrade generic vocabulary.",
          reason_uz: "Oddiy so'zni akademik ibora bilan almashtiring.",
        },
      ],
      actionable_next_steps: ["Drill C1 collocations"],
      examiner_summary_en: "Solid structure, upgrade LR.",
      examiner_summary_uz: "Yaxshi tuzilma, LR ni oshiring.",
      xp_awarded: 65,
      remediation_plan: {
        weakest_criterion: "LR",
        scheduled_node_slug: "writing-task2-lexical-precision",
        scheduled_node_title:
          "Writing Task 2: C1/C2 Academic Collocations Drill",
        scheduled_node_title_uz:
          "Writing Task 2: C1/C2 Akademik kolokatsiyalar",
        scheduled_for: "Tomorrow (Priority #1)",
      },
    });

    const state = examStoreActions.getState();
    expect(state.aiGradeResult?.overall_band).toBe(7.0);
    expect(state.adaptiveRoadmap[0]?.priority).toBe("URGENT_REMEDIATION");
    expect(state.adaptiveRoadmap[0]?.nodeSlug).toBe(
      "writing-task2-lexical-precision"
    );
  });

  it("validates EssayEvaluationSchema, enforces anti-inflation under-length penalty, and extracts verbatim inline quotes", () => {
    const sampleShortEssay =
      "On the one hand, many students attend university to get a good job. Because the market is very competitive, they need good skills.";
    const result = evaluateEssayDeterministically(
      sampleShortEssay,
      "Discuss both views on university education.",
      "WRITING_TASK_2"
    );

    const parsed = EssayEvaluationSchema.parse(result);
    expect(parsed.overall_band % 0.5).toBe(0);
    expect(parsed.criteria.TR.score).toBeLessThanOrEqual(6.0);
    expect(
      parsed.criteria.TR.weaknesses.some((w) => w.includes("PENALTY APPLIED"))
    ).toBe(true);

    expect(parsed.inline_corrections.length).toBeGreaterThanOrEqual(3);
    for (const corr of parsed.inline_corrections) {
      expect(sampleShortEssay).toContain(corr.exact_original_quote);
      expect(["GRAMMAR", "LEXICAL", "COHESION"]).toContain(corr.error_category);
    }
    expect(parsed.actionable_drills_uz).toHaveLength(3);
  });

  it("defines strict anti-inflation Examiner System Prompts", () => {
    expect(EX_IELTS_EXAMINER_SYSTEM_PROMPT).toContain("Task Response (TR)");
    expect(STRICT_EXAMINER_SYSTEM_PROMPT).toContain("UNDER-LENGTH PENALTY");
  });
});
