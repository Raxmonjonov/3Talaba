import { apiHandler, fail, ok } from '@/lib/server/api';
import { prisma } from '@/lib/server/db';
import { sessionStartSchema } from '@/lib/server/validation/schemas';

export const POST = apiHandler(
  { auth: true, csrf: true, schema: sessionStartSchema },
  async ({ user, input }) => {
    const lesson = await prisma.lesson.findUnique({ where: { id: input.lessonId } });
    if (!lesson) return fail('NOT_FOUND', 'Dars topilmadi', 404);

    if (input.plannedBlockId) {
      const block = await prisma.plannedBlock.findUnique({ where: { id: input.plannedBlockId } });
      if (!block) return fail('NOT_FOUND', 'Reja bloki topilmadi', 404);
    }

    const session = await prisma.lessonSession.create({
      data: {
        userId: user!.id,
        lessonId: lesson.id,
        plannedBlockId: input.plannedBlockId,
        mode: input.mode,
        status: 'ACTIVE',
        startReason: 'NEW',
      },
    });

    const lessonWithBlocks = await prisma.lesson.findUnique({
      where: { id: lesson.id },
      include: { blocks: { orderBy: { order: 'asc' } } },
    });

    return ok({ sessionId: session.id, lesson: lessonWithBlocks });
  },
);
