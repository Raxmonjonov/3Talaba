import { describe, it, expect } from "vitest";
import {
  createCard,
  forgettingCurve,
  reviewCard,
  dueCards,
  projectedLoad,
  humanInterval,
  GRADE_LABELS,
  DEFAULT_PARAMS,
  type Grade,
} from "../../src/services/srs/fsrs.js";

const NOW = new Date("2026-01-01T10:00:00Z");
const DAY = 86_400_000;

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / DAY;
}

describe("createCard", () => {
  it("starts empty and due immediately", () => {
    const card = createCard(NOW);
    expect(card.state).toBe(0);
    expect(card.stability).toBe(0);
    expect(card.reps).toBe(0);
    expect(card.lapses).toBe(0);
    expect(card.lastReviewAt).toBeNull();
    expect(card.dueAt.getTime()).toBe(NOW.getTime());
  });
});

describe("forgettingCurve", () => {
  it("is 1 at t=0 and decreases as time passes", () => {
    expect(forgettingCurve(0, 3)).toBeCloseTo(1, 6);
    const soon = forgettingCurve(1, 3);
    const later = forgettingCurve(10, 3);
    expect(soon).toBeLessThan(1);
    expect(later).toBeLessThan(soon);
  });

  it("is higher for higher stability", () => {
    expect(forgettingCurve(5, 8)).toBeGreaterThan(forgettingCurve(5, 2));
  });
});

describe("reviewCard", () => {
  it("promotes a new card on 'good' straight to review and schedules it days out", () => {
    const card = reviewCard(createCard(NOW), 3, NOW);
    expect(card.state).toBe(2); // grade ≥ 3 leaves learning immediately
    expect(card.reps).toBe(1);
    expect(card.stability).toBeGreaterThan(0);
    expect(card.lastReviewAt).toEqual(NOW);
    expect(card.dueAt.getTime()).toBeGreaterThan(NOW.getTime());
  });

  it("keeps a new card in learning on 'hard'", () => {
    const card = reviewCard(createCard(NOW), 2, NOW);
    expect(card.state).toBe(1);
  });

  it("keeps 'again' cards due within minutes", () => {
    const card = reviewCard(createCard(NOW), 0, NOW);
    const minutes = (card.dueAt.getTime() - NOW.getTime()) / 60_000;
    expect(minutes).toBeLessThanOrEqual(10);
    expect(card.state).toBe(1);
  });

  it("gives a longer interval for 'easy' than for 'good'", () => {
    const easy = reviewCard(createCard(NOW), 5, NOW);
    const good = reviewCard(createCard(NOW), 3, NOW);
    expect(daysBetween(NOW, easy.dueAt)).toBeGreaterThan(
      daysBetween(NOW, good.dueAt),
    );
  });

  it("promotes learning → review once stability is solid", () => {
    let card = reviewCard(createCard(NOW), 3, NOW);
    // Simulate a few successful reviews spaced by the due times.
    for (let i = 0; i < 4; i += 1) {
      card = reviewCard(card, 3, card.dueAt);
    }
    expect(card.state).toBe(2); // review
    expect(daysBetween(NOW, card.dueAt)).toBeGreaterThan(1);
  });

  it("counts a review-stage 'again' as a lapse and shortens stability", () => {
    let card = reviewCard(createCard(NOW), 5, NOW);
    for (let i = 0; i < 6; i += 1) {
      card = reviewCard(card, 4, card.dueAt);
    }
    expect(card.state).toBe(2);
    const before = card.stability;
    const lapsed = reviewCard(card, 0, card.dueAt);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.state).toBe(3); // relearning
    expect(lapsed.stability).toBeLessThan(before);
  });

  it("stays inside difficulty and stability bounds", () => {
    let card = createCard(NOW);
    for (let i = 0; i < 12; i += 1) {
      const grade = (i % 2 === 0 ? 5 : 0) as Grade;
      card = reviewCard(card, grade, NOW);
      expect(card.difficulty).toBeGreaterThanOrEqual(1);
      expect(card.difficulty).toBeLessThanOrEqual(10);
      expect(card.stability).toBeGreaterThan(0);
      expect(card.dueAt.getTime()).toBeGreaterThanOrEqual(NOW.getTime());
    }
  });

  it("maps grades to labels", () => {
    expect(GRADE_LABELS[0]).toBe("again");
    expect(GRADE_LABELS[2]).toBe("hard");
    expect(GRADE_LABELS[3]).toBe("good");
    expect(GRADE_LABELS[5]).toBe("easy");
  });
});

describe("dueCards / projectedLoad / humanInterval", () => {
  function readyIn(days: number) {
    return { dueAt: new Date(NOW.getTime() + days * DAY), state: 2 as const };
  }

  it("filters by due time", () => {
    const cards = [readyIn(-1), readyIn(0), readyIn(1)];
    expect(dueCards(cards, NOW)).toHaveLength(2);
    expect(dueCards(cards, NOW).map((c) => c.dueAt)).toEqual([
      cards[0].dueAt,
      cards[1].dueAt,
    ]);
  });

  it("projects a non-negative daily load", () => {
    const nowCard = reviewCard(createCard(NOW), 4, NOW);
    const laterCard = reviewCard(nowCard, 4, nowCard.dueAt);
    const load = projectedLoad([nowCard, laterCard], 7);
    expect(load).toHaveLength(7);
    expect(load.every((n) => n >= 0)).toBe(true);
  });

  it("humanInterval speaks Uzbek and English", () => {
    const card = reviewCard(createCard(NOW), 3, NOW);
    expect(humanInterval(card, "uz")).toBeTruthy();
    expect(humanInterval(card, "en")).toBeTruthy();
  });
});

describe("DEFAULT_PARAMS", () => {
  it("exposes the FSRS v4.5 weight vector", () => {
    expect(DEFAULT_PARAMS.w.length).toBeGreaterThanOrEqual(13);
  });
});
