import { describe, it, expect } from "vitest";
import { initialState, nextTurn, detectLesson } from "../../src/services/engine.js";

const NAME = "Dilnoza";

function beginFirstLesson(level = 0) {
  return nextTurn(initialState(), "matematika", level, NAME);
}

describe("initialState", () => {
  it("starts idle at step zero", () => {
    expect(initialState()).toEqual({
      lessonId: null,
      stepIndex: 0,
      streak: 0,
      misses: 0,
      awaitingNextTopic: false,
    });
  });
});

describe("detectLesson", () => {
  it("picks the math lesson from a keyword match", () => {
    expect(detectLesson("matematika", 0)?.id).toBe("math-zero-numbers");
  });

  it("never suggests a lesson above the student's reach", () => {
    // sat-math has fromLevel 6; at level 0 the gate fromLevel <= level + 1
    // rejects it, so the keyword match must not surface.
    expect(detectLesson("sat", 0)).toBeNull();
  });

  it("opens the SAT lesson once the student is close enough", () => {
    expect(detectLesson("sat", 5)?.id).toBe("sat-math");
  });
});

describe("greetings and wellbeing", () => {
  it("greets and offers a topic list", () => {
    const out = nextTurn(initialState(), "salom", 0, NAME);
    expect(out.reply).toContain("Salom");
    expect(out.reply).toContain("Qaysi mavzudan");
    expect(out.state.awaitingNextTopic).toBe(true);
  });

  it("suggests a break when the student is tired", () => {
    const out = nextTurn(initialState(), "charchadim", 0, NAME);
    expect(out.reply).toContain("tanaffus");
    expect(out.state.awaitingNextTopic).toBe(true);
  });
});

describe("lesson flow", () => {
  it("starts the math lesson slowly at level 0", () => {
    const out = beginFirstLesson(0);
    expect(out.state.lessonId).toBe("math-zero-numbers");
    expect(out.reply).toContain("noldan, sekin");
    expect(out.reply).toContain("5 + 4 nechaga teng?");
  });

  it("confirms a correct answer and advances to the next step", () => {
    const begun = beginFirstLesson(0);
    const out = nextTurn(begun.state, "9", 0, NAME);
    expect(out.reply).toContain("Ajoyib, to'g'ri.");
    expect(out.state.stepIndex).toBe(1);
    expect(out.state.streak).toBe(1);
  });

  it("hints on a wrong answer and counts the miss", () => {
    const begun = beginFirstLesson(0);
    const out = nextTurn(begun.state, "5", 0, NAME);
    expect(out.reply).toContain("Boshqa qilib ko'ramiz");
    expect(out.state.misses).toBe(1);
  });

  it("re-teaches the step after two misses", () => {
    let state = beginFirstLesson(0).state;
    state = nextTurn(state, "5", 0, NAME).state;
    const out = nextTurn(state, "yo'q", 0, NAME);
    expect(out.reply).toContain("keling, sekin boshlaymiz");
    expect(out.state.stepIndex).toBe(0);
    expect(out.state.misses).toBe(0);
  });

  it("honours a student-suggested topic switch", () => {
    let state = beginFirstLesson(0).state;
    const out = nextTurn(state, "ingliz tili", 0, NAME);
    expect(out.state.lessonId).toBe("english-grammar");
  });

  it("walks the whole lesson to completion and returns to the menu", () => {
    let state = beginFirstLesson(0).state;
    for (const answer of ["9", "24", "6", "2"]) {
      const out = nextTurn(state, answer, 0, NAME);
      state = out.state;
    }
    expect(state.lessonId).toBeNull();
    expect(state.awaitingNextTopic).toBe(true);
  });

  it("is skipped when the student asks to move on", () => {
    const begun = beginFirstLesson(0);
    const out = nextTurn(begun.state, "davom et", 0, NAME);
    expect(out.state.awaitingNextTopic).toBe(true);
    expect(out.reply).toContain("Qaysi mavzudan");
  });
});

describe("pick a topic after the menu", () => {
  it("begins the first available lesson on an affirmative", () => {
    const greeted = nextTurn(initialState(), "salom", 0, NAME);
    const out = nextTurn(greeted.state, "tushundim", 0, NAME);
    expect(out.state.lessonId).toBe("math-zero-numbers");
  });
});