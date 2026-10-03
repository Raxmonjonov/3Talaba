import { hashPassword, isCommonPassword, passwordProblem } from '@/lib/server/auth/password';
import { registerSchema } from '@/lib/server/validation/schemas';
import { prisma } from '@/lib/server/db';
import { apiHandler, fail, ok } from '@/lib/server/api';
import {  } from '@/lib/server/auth/rbac';

export const POST = apiHandler({ csrf: true, schema: registerSchema }, async ({ input }) => {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new Error('Bu email allaqachon ro‘yxatdan o‘tgan');

  if (isCommonPassword(input.password)) return fail('WEAK_PASSWORD', 'Parol juda oddiy', 400);
  const problem = passwordProblem(input.password);
  if (problem) return fail('WEAK_PASSWORD', problem, 400);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name ?? input.email.split('@')[0],
      passwordHash: await hashPassword(input.password),
      role: 'STUDENT',
      level: 0,
      onboardedAt: null},
    select: { id: true, email: true }});

  return ok({ id: user.id, email: user.email }, { status: 201 });
});