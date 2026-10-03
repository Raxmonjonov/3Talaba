import { apiHandler, fail, ok } from '@/lib/server/api';
import { placementAnswerSchema } from '@/lib/server/validation/schemas';
import { prisma } from '@/lib/server/db';
import {
  applyAnswer,
  initialState,
  selectNextItem,
  type Item,
  type PlacementState,
} from '@/lib/server/placement/adaptive';

type TraceEntry = {
  itemId: string;
  difficulty: number;
  skillId: string;
  correct: boolean;
};

export const POST = apiHandler(
  { auth: true, csrf: true, schema: placementAnswerSchema },
  async ({ user, input }) => {
    const attempt = await prisma.placementAttempt.findFirst({
      where: { id: input.attemptId, userId: user!.id, status: 'IN_PROGRESS' },
      include: { answers: { orderBy: { order: 'asc' } } },
    });
    if (!attempt) return fail('NOT_FOUND', 'Urinish topilmadi', 404);

    const question = await prisma.question.findUnique({
      where: { id: input.questionId },
      include: { options: true },
    });
    if (!question) return fail('NOT_FOUND', 'Savol topilmadi', 404);

    const correctOption = question.options.find((option) => option.isCorrect);
    const correct = matches(correctOption?.label, input.chosen);

    const trace = parseTrace(attempt.itemTrace);
    let state = replay(trace);
    const item: Item = { id: question.id, difficulty: question.difficulty, skillId: question.skillId };
    state = applyAnswer(state, item, correct);
    trace.push({ itemId: item.id, difficulty: item.difficulty, skillId: item.skillId, correct });

    const order = attempt.answers.length + 1;
    await prisma.placementAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: question.id,
        order,
        chosen: input.chosen,
        isCorrect: correct,
        responseTimeMs: input.responseTimeMs,
        difficultyBefore: question.difficulty,
        thetaBefore: state.history[state.history.length - 1]?.thetaBefore ?? 0,
        thetaAfter: state.theta,
        seAfter: state.se,
      },
    });

    await prisma.placementAttempt.update({
      where: { id: attempt.id },
      data: {
        abilityTheta: state.theta,
        abilityStderr: state.se,
        rawTotal: order,
        rawCorrect: trace.filter((entry) => entry.correct).length,
        itemTrace: trace,
      },
    });

    let nextQuestion = null;
    if (!state.finished) {
      const pool = await loadPool();
      const nextItem = selectNextItem(state, pool);
      if (nextItem) {
        nextQuestion = await prisma.question.findUnique({
          where: { id: nextItem.id },
          include: { options: true },
        });
      }
    }

    return ok({ correct, theta: state.theta, se: state.se, finished: state.finished, nextQuestion });
  },
);

function parseTrace(value: unknown): TraceEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is TraceEntry =>
      typeof entry === 'object' &&
      entry !== null &&
      typeof (entry as TraceEntry).itemId === 'string' &&
      typeof (entry as TraceEntry).difficulty === 'number' &&
      typeof (entry as TraceEntry).skillId === 'string' &&
      typeof (entry as TraceEntry).correct === 'boolean',
  );
}

function replay(trace: TraceEntry[]): PlacementState {
  let state = initialState();
  for (const entry of trace) {
    state = applyAnswer(
      state,
      { id: entry.itemId, difficulty: entry.difficulty, skillId: entry.skillId },
      entry.correct,
    );
  }
  return state;
}

async function loadPool(): Promise<Item[]> {
  const questions = await prisma.question.findMany({
    where: { isActive: true },
    select: { id: true, difficulty: true, skillId: true },
  });
  return questions.map((question) => ({
    id: question.id,
    difficulty: question.difficulty,
    skillId: question.skillId,
  }));
}

function matches(label: unknown, chosen: string | string[] | number): boolean {
  if (!label) return false;
  if (typeof label === 'string') return label === String(chosen);
  if (typeof chosen !== 'string' || Array.isArray(chosen)) return false;
  if (typeof label === 'object') {
    const dict = label as Record<string, unknown>;
    return dict.uz === chosen || dict.en === chosen;
  }
  return false;
}
