import { apiHandler, ok } from '@/lib/server/api';
import { onboardingFinishSchema } from '@/lib/server/validation/schemas';
import { prisma } from '@/lib/server/db';

export const POST = apiHandler({ auth: true, csrf: true, schema: onboardingFinishSchema }, async ({ user }) => {
  const now = new Date();
  await prisma.user.update({
    where: { id: user!.id },
    data: { onboardedAt: now, tutorProfile: { upsert: { create: {}, update: {} } } },
  });

  return ok({ onboardedAt: now.toISOString() });
});