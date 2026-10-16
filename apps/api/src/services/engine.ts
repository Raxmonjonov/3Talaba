import { LESSONS, Lesson, LessonStep } from "./curriculum.js";

export interface EngineState {
  lessonId: string | null;
  stepIndex: number;
  /** Consecutive correct answers, used to raise difficulty. */
  streak: number;
  /** Consecutive wrong answers, used to lower difficulty and offer help. */
  misses: number;
  /** Set once the student says they understand or wants the next topic. */
  awaitingNextTopic: boolean;
  /** Waiting for the student to restate a concept in their own words (Feynman). */
  awaitingExplanation: boolean;
  /** How many times the explanation prompt was repeated for the current concept. */
  explanationTries: number;
}

export function initialState(): EngineState {
  return {
    lessonId: null,
    stepIndex: 0,
    streak: 0,
    misses: 0,
    awaitingNextTopic: false,
    awaitingExplanation: false,
    explanationTries: 0,
  };
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/[?!.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isAffirmative(text: string): boolean {
  const t = normalize(text);
  return [
    "ha",
    "haa",
    "haqiqatan",
    "tushundim",
    "tushundim endi",
    "chiqdim",
    "yaxshi",
    "zo'r",
    "rahmat",
    "tushundim lekin",
    "tushundim ammo",
  ].some((k) => t.includes(k));
}

function isSkip(text: string): boolean {
  const t = normalize(text);
  return [
    "keyingi",
    "keyingi savol",
    "davom et",
    "boshqa mavzu",
    "boshqa savol",
    "keting",
    "o'tkaz",
  ].some((k) => t.includes(k));
}

function isGreeting(text: string): boolean {
  const t = normalize(text);
  if (t.length > 30) return false;
  return [
    "salom",
    "assalomu alaykum",
    "salomu alaykum",
    "xayr",
    "hello",
    "hi",
    "salam",
  ].some((k) => t === k || t.startsWith(k));
}

function isTired(text: string): boolean {
  const t = normalize(text);
  return [
    "charchadim",
    "tired",
    "darchadim",
    "jigarrang bo'ldim",
    "tinchlik",
    "dam olay",
    "uzun bo'ldi",
    "qiyin",
  ].some((k) => t.includes(k));
}

/** Find the best matching lesson for a free-text message. */
export function detectLesson(text: string, level: number): Lesson | null {
  const t = normalize(text);
  let best: Lesson | null = null;
  let bestScore = 0;

  for (const lesson of LESSONS) {
    if (lesson.fromLevel > level + 1) continue;

    let score = 0;
    for (const keyword of lesson.keywords) {
      if (t.includes(keyword)) score += keyword.length;
    }
    // Prefer lessons the student is already close to.
    if (lesson.fromLevel <= level) score += 2;

    if (score > bestScore) {
      bestScore = score;
      best = lesson;
    }
  }

  return bestScore >= 3 ? best : null;
}

/** Check whether the student answered the current step correctly. */
function isCorrect(step: LessonStep, text: string): boolean {
  const t = normalize(text);
  if (t.length === 0) return false;

  if (step.accept.includes("*")) return true;
  if (step.accept.some((a) => t === normalize(a))) return true;

  // Tolerate answers containing the accepted value, e.g. "x = 7".
  return step.accept.some((a) => {
    const token = normalize(a);
    return token.length > 0 && t.includes(token);
  });
}

function availableLessons(level: number): Lesson[] {
  return LESSONS.filter((l) => l.fromLevel <= level + 1);
}

function topicPrompt(level: number): string {
  const options = availableLessons(level)
    .map((l) => l.title)
    .join(", ");
  return `Qaysi mavzudan boshlaymiz? Hozirgi darajangiz bo'yicha imkoniyatlar: ${options}.`;
}

/** Renders the step currently at `state.stepIndex`, used after a Feynman check. */
function renderCurrentStep(
  lesson: Lesson,
  state: EngineState,
  address: string
): { reply: string; state: EngineState } {
  const current = lesson.steps[state.stepIndex];
  const cleared: EngineState = {
    ...state,
    awaitingExplanation: false,
    explanationTries: 0,
  };

  if (!current) {
    return {
      reply: `Bu mavzu yakunlandi, ${address}. Zo'r ish!`,
      state: { ...cleared, lessonId: null, stepIndex: 0, awaitingNextTopic: true },
    };
  }

  return {
    reply: [
      "Rahmat, yaxshi tushuntirdingiz.",
      `${current.concept}: ${current.explain}`,
      current.deepen,
    ].join("\n\n"),
    state: cleared,
  };
}

/** Opens a lesson at its first step and produces the opening explanation. */
function beginLesson(
  lesson: Lesson,
  level: number,
  address: string,
  state: EngineState
): { reply: string; state: EngineState } {
  const next: EngineState = {
    ...state,
    lessonId: lesson.id,
    stepIndex: 0,
    streak: 0,
    misses: 0,
    awaitingNextTopic: false,
  };

  const first = lesson.steps[0];
  const opening =
    level <= 1
      ? `${address}, yaxshi tanlov. ${lesson.title} — noldan, sekin boshlaymiz.`
      : `${address}, yaxshi tanlov. ${lesson.title} — boshlaymiz.`;

  return {
    reply: [
      opening,
      `${first.concept}: ${first.explain}`,
      first.example,
      first.ask,
    ].join("\n\n"),
    state: next,
  };
}

/**
 * Advance the engine and produce the next tutor turn.
 * Returns the reply plus the state to persist.
 */
export function nextTurn(
  state: EngineState,
  userText: string,
  level: number,
  address: string
): { reply: string; state: EngineState } {
  const next: EngineState = { ...state };

  if (isGreeting(userText)) {
    next.awaitingNextTopic = true;
    return {
      reply: `Salom, ${address}. ${topicPrompt(level)}`,
      state: next,
    };
  }

  if (isTired(userText)) {
    next.awaitingNextTopic = true;
    return {
      reply: `Xotirjamlik uchun rahmat, ${address}. Bir oz tanaffus olib keling — yangi kuch bilan qaytamiz. ${topicPrompt(level)}`,
      state: next,
    };
  }

  // Continue an active lesson if the message answers the current step.
  if (next.lessonId) {
    const lesson = LESSONS.find((l) => l.id === next.lessonId);
    const step = lesson?.steps[next.stepIndex];

    if (lesson && step) {
        // A student who names a different topic is asking to switch. Honour that
        // instead of forcing them to finish the current lesson first.
        const requested = detectLesson(userText, level);
        if (requested && requested.id !== lesson.id) {
          return beginLesson(requested, level, address, next);
        }

        // Feynman-style recall check: the student must explain the previous
        // concept in their own words before moving to the next idea.
        if (next.awaitingExplanation) {
          const t = normalize(userText);
          const words = t.split(" ").filter(Boolean).length;
          const substantive = t.length >= 25 && words >= 5;
          const gaveUp = /bilmayman|bilmadim|esimda yo/.test(t);

          if (!substantive && !gaveUp && next.explanationTries < 1) {
            next.explanationTries += 1;
            return {
              reply: "Yaqin keldi. Yana bir oz batafsilroq qilib ko'ring: bu tushuncha nima uchun muhim va qanday ishlaydi?",
              state: next,
            };
          }

          return renderCurrentStep(lesson, next, address);
        }

        if (isCorrect(step, userText)) {
          const learned = step.concept;
          next.streak += 1;
          next.misses = 0;

          if (next.stepIndex + 1 < lesson.steps.length) {
            next.stepIndex += 1;

            // Every second correct answer, pause for a Feynman-style explanation
            // check before the next concept is introduced (skip the final step).
            if (next.streak % 2 === 0) {
              next.awaitingExplanation = true;
              next.explanationTries = 0;
              return {
                reply: [
                  "Ajoyib, to'g'ri.",
                  `Endi kichik bir tekshiruv, ${address}: "${learned}" tushunchasini hech bilmaydigan odamga oddiy tilda, bir-ikki gap bilan tushuntirib bering.`,
                ].join("\n\n"),
                state: next,
              };
            }

            const upcoming = lesson.steps[next.stepIndex];
            return {
              reply: [
                "Ajoyib, to'g'ri.",
                `${upcoming.concept}: ${upcoming.explain}`,
                upcoming.deepen,
              ].join("\n\n"),
              state: next,
            };
          }

          next.lessonId = null;
          next.stepIndex = 0;
          next.awaitingNextTopic = true;
          return {
            reply: `Bu mavzu yakunlandi, ${address}. Zo'r ish! ${topicPrompt(level)}`,
            state: next,
          };
        }

      if (isSkip(userText)) {
        next.awaitingNextTopic = true;
        return {
          reply: `Yaxshi, ${address}. ${topicPrompt(level)}`,
          state: next,
        };
      }

        if (next.streak > 0) {
          next.streak = 0;
        }
        next.misses += 1;

        if (isAffirmative(userText) && next.misses > 0) {
          return {
            reply: `Yaxshi, ${address}. Unda boshqa qilib ko'ramiz. ${step.hint}`,
            state: next,
          };
        }

        if (next.misses >= 2) {
          next.misses = 0;
          next.awaitingExplanation = false;
          next.explanationTries = 0;
          next.stepIndex = Math.max(0, next.stepIndex - 1);
          return {
            reply: `Bu qiyin bo'ldimi? Normal, keling, sekin boshlaymiz.\n\n${step.concept}: ${step.explain}\n${step.example}\n\n${step.ask}`,
            state: next,
          };
        }

      return {
        reply: `Tushundim. Boshqa qilib ko'ramiz.\n\n${step.hint}\n\n${step.ask}`,
        state: next,
      };
    }
  }

  // No active lesson: either pick one or let the student choose.
  const detected = detectLesson(userText, level);

  if (detected && detected.steps.length > 0) {
    return beginLesson(detected, level, address, next);
  }

  if (isAffirmative(userText) && next.awaitingNextTopic) {
    const chosen = availableLessons(level)[0];
    if (chosen && chosen.steps.length > 0) {
      return beginLesson(chosen, level, address, next);
    }
  }

  next.awaitingNextTopic = true;
  return {
    reply: `Qiziqarli, ${address}. ${topicPrompt(level)}`,
    state: next,
  };
}