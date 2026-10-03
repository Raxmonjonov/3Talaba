import type { Prisma } from '@prisma/client';
import { apiHandler, fail, ok } from '@/lib/server/api';
import { prisma } from '@/lib/server/db';
import { cuidSchema } from '@/lib/server/validation/schemas';
import { z } from 'zod';

const stepCreateSchema = z.object({
  sessionId: cuidSchema,
  blockId: cuidSchema.optional(),
  payload: z.record(z.unknown()).default({}),
});

export const POST = apiHandler(
  { auth: true, csrf: true, schema: stepCreateSchema },
  async ({ user, input }) => {
    const session = await prisma.lessonSession.findUnique({
      where: { id: input.sessionId },
      include: { steps: true },
    });
    if (!session || session.userId !== user!.id) {
      return fail('NOT_FOUND', 'Sessiya topilmadi', 404);
    }

    const step = await prisma.sessionStep.create({
      data: {
        sessionId: session.id,
        blockId: input.blockId,
        order: session.steps.length + 1,
        status: 'ACTIVE',
        payload: input.payload as Prisma.InputJsonValue,
        startedAt: new Date(),
      },
    });

    await prisma.lessonSession.update({
      where: { id: session.id },
      data: { stepIndex: step.order, lastActiveAt: new Date() },
    });

    return ok({ stepId: step.id, order: step.order });
  },
);
