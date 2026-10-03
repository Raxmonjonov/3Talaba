import { apiHandler, fail, ok } from '@/lib/server/api';
import { placementFinishSchema } from '@/lib/server/validation/schemas';
import { prisma } from '@/lib/server/db';
import { thetaToLevel } from '@/lib/server/placement/adaptive';

export const POST = apiHandler(
  { auth: true, csrf: true, schema: placementFinishSchema },
  async ({ user, input }) => {
    const attempt = await prisma.placementAttempt.findUnique({
      where: { id: input.attemptId },
      include: { answers: true },
    });
    if (!attempt || attempt.userId !== user!.id) return fail('NOT_FOUND', 'Urinish topilmadi', 404);
    if (attempt.status !== 'IN_PROGRESS') {
      return fail('ALREADY_FINISHED', 'Urinish allaqachon yakunlangan', 400);
    }

    const level = thetaToLevel(attempt.abilityTheta);

    await prisma.placementAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'COMPLETED',
        level,
        rawTotal: attempt.answers.length,
        finishedAt: new Date(),
      },
    });

    await prisma.user.update({ where: { id: user!.id }, data: { level } });

    return ok({
      level,
      theta: attempt.abilityTheta,
      se: attempt.abilityStderr,
      answered: attempt.answers.length,
    });
  },
);
