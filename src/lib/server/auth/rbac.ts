import 'server-only';

import type { Role } from '@prisma/client';

/** Autentifikatsiyalangan foydalanuvchi (sessiyadan olinadi). */
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  level: number;
  onboardedAt: Date | null;
  birthDate: Date | null;
  gender: 'FEMALE' | 'MALE' | 'OTHER' | null;
};

export const ADMIN_ROLES: readonly Role[] = ['ADMIN'];

export function isAdmin(user: Pick<SessionUser, 'role'> | null | undefined): boolean {
  return !!user && ADMIN_ROLES.includes(user.role);
}

export function isTeacher(user: Pick<SessionUser, 'role'> | null | undefined): boolean {
  return !!user && (user.role === 'TEACHER' || user.role === 'ADMIN');
}

export function isStudent(user: Pick<SessionUser, 'role'> | null | undefined): boolean {
  return !!user && user.role === 'STUDENT';
}

/** Route Handler himoyasi — admin talab qiladigan endpointlar uchun. */
export function assertAdmin(user: SessionUser | null): asserts user is SessionUser {
  if (!isAdmin(user)) {
    throw new ForbiddenError('Bu sahifaga kirish huquqingiz yo‘q');
  }
}

export function assertTeacher(user: SessionUser | null): asserts user is SessionUser {
  if (!isTeacher(user)) {
    throw new ForbiddenError('Bu sahifaga kirish huquqingiz yo‘q');
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends Error {
  readonly status = 400;
  readonly issues: string[];
  constructor(message: string, issues: string[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

export class NotFoundError extends Error {
  readonly status = 404;
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}