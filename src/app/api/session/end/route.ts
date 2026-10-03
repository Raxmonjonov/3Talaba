import { apiHandler, fail, ok } from '@/lib/server/api';
import { prisma } from '@/lib/server/db';
import { sessionEndSchema } from '@/lib/server/validation/schemas';

export const POST = apiHandler(
  { auth: true, csrf: true, schema: sessionEndSchema },
  async ({ user, input }) => {
    const session = await prisma.lessonSession.findUnique({ where: { id: input.sessionId } });
    if (!session || session.userId !== user!.id) {
      return fail('NOT_FOUND', 'Sessiya topilmadi', 404);
    }

    const endedAt = new Date();
    const elapsedSec = Math.max(0, Math.round((endedAt.getTime() - session.startedAt.getTime()) / 1000));

    const updated = await prisma.lessonSession.update({
      where: { id: session.id },
      data: { status: 'COMPLETED', completed: true, endedAt, elapsedSec },
    });

    return ok({ sessionId: updated.id, status: updated.status, xpAwarded: updated.xpAwarded });
  },
);
