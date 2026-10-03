import { apiHandler, fail, ok } from '@/lib/server/api';
import { placementStartSchema } from '@/lib/server/validation/schemas';
import { prisma } from '@/lib/server/db';

export const POST = apiHandler({ auth: true, csrf: true, schema: placementStartSchema }, async ({ user }) => {
  if (!user) return fail('UNAUTHORIZED', 'Unauthorized', 401);

  const attempt = await prisma.placementAttempt.create({
    data: {
      userId: user!.id,
      status: 'IN_PROGRESS',
    },
  });

  const question = await prisma.question.findFirst({
    where: { difficulty: { gte: -0.5, lte: 0.5 }, options: { some: { isCorrect: true } } },
    include: { options: true },
    orderBy: { difficulty: 'asc' },
  });

  return ok({ attemptId: attempt.id, question });
});
