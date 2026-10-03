import 'server-only';

import { PrismaAdapter } from '@auth/prisma-adapter';
import {
  type DefaultSession,
  type NextAuthConfig,
  type NextAuthResult,
} from 'next-auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';

import { getServerEnv } from '@/lib/env';
import { prisma } from '@/lib/server/db';
import { logger } from '@/lib/server/logger';
import type { SessionUser } from '@/lib/server/auth/rbac';

import { hashPassword, isCommonPassword, passwordProblem, verifyPassword } from './password';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: SessionUser['role'];
      level: number;
      onboarded: boolean;
      gender: SessionUser['gender'];
      isMinor: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: SessionUser['role'];
    level: number;
    onboarded: boolean;
    gender: SessionUser['gender'];
    birthYear: number | null;
  }
}

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

function minorFrom(birthYear: number | null): boolean {
  if (!birthYear) return false;
  const age = new Date().getUTCFullYear() - birthYear;
  return age > 0 && age < 18;
}

export function buildAuthConfig(): NextAuthConfig {
  const env = getServerEnv();

  const providers: NextAuthConfig['providers'] = [
    Credentials({
      name: 'Email va parol',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Parol', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            level: true,
            onboardedAt: true,
            gender: true,
            birthDate: true,
            deletedAt: true,
          },
        });

        // Xato holatlar farqlanmasligi uchun "pseudo" parol bilan ham tekshiramiz.
        if (!user || user.deletedAt || !user.passwordHash) {
          await verifyPassword(
            '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZQ$0kO7Yw0mSSbnwmYPQoMDr4Zp4vJEh0PJ0smdQwCXsA',
            password,
          ).catch(() => false);
          return null;
        }

        const valid = await verifyPassword(user.passwordHash, password);
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          level: user.level,
          onboarded: user.onboardedAt !== null,
          gender: user.gender,
          birthYear: user.birthDate?.getUTCFullYear() ?? null,
        };
      },
    }),
  ];

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: false,
      }),
    );
  }

  return {
    adapter: PrismaAdapter(prisma),
    secret: env.AUTH_SECRET,
    trustHost: env.AUTH_TRUST_HOST,
    session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
    pages: {
      signIn: '/uz/auth/login',
      newUser: '/uz/auth/register',
      error: '/uz/auth/error',
      verifyRequest: '/uz/auth/verify-request',
    },
    providers,
    cookies: {
      sessionToken: {
        name:
          env.NODE_ENV === 'production'
            ? '__Secure-3talab.session-token'
            : '3talab.session-token',
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: env.NODE_ENV === 'production',
        },
      },
    },
    callbacks: {
      async signIn({ user, account }) {
        if (!user.id) return true;

        // Faqat ro'yxatdan o'tish paytida default profil yaratiladi.
        if (account?.provider === 'credentials') return true;

        const existing = await prisma.user.findUnique({
          where: { id: user.id },
          select: { email: true, deletedAt: true },
        });
        if (existing?.deletedAt) return false;
        return true;
      },

      async jwt({ token, user }) {
        if (user?.id) {
          token.id = user.id;
          const fresh = await prisma.user
            .findUnique({
              where: { id: user.id },
              select: {
                role: true,
                level: true,
                onboardedAt: true,
                gender: true,
                birthDate: true,
              },
            })
            .catch(() => null);

          if (fresh) {
            token.role = fresh.role;
            token.level = fresh.level;
            token.onboarded = fresh.onboardedAt !== null;
            token.gender = fresh.gender;
            token.birthYear = fresh.birthDate?.getUTCFullYear() ?? null;
          }
        }
        return token;
      },

      async session({ session, token }) {
        session.user.id = token.id;
        session.user.role = token.role ?? 'STUDENT';
        session.user.level = token.level ?? 0;
        session.user.onboarded = token.onboarded ?? false;
        session.user.gender = token.gender ?? null;
        session.user.isMinor = minorFrom(token.birthYear ?? null);
        return session;
      },
    },
    events: {
      async createUser({ user }) {
        if (!user.id) return;
        try {
          await prisma.userPreferences.create({ data: { userId: user.id } });
          await prisma.aiTutorProfile.create({ data: { userId: user.id } });
          await prisma.streak.create({ data: { userId: user.id } });
          await prisma.consentRecord.create({
            data: {
              userId: user.id,
              kind: 'DATA_PROCESSING',
              granted: true,
              version: '1.0',
            },
          });
        } catch (error) {
          logger().error({ err: error, userId: user.id }, 'default profil yaratilmadi');
        }
      },
    },
  };
}

let cached: NextAuthResult | null = null;

/** Auth.js konfiguratsiyasi (bir marta yaratiladi). */
export function getAuth(): NextAuthResult {
  if (!cached) cached = NextAuth(buildAuthConfig());
  return cached;
}

type Lazy<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : T;

/**
 * `next build` route modullarini import qiladi, lekin so'rov bajarilmaydi.
 * Shu sababli Auth.js konfiguratsiyasi import vaqtida emas, birinchi
 * chaqirilganda yaratiladi — aks holda build muhitida `AUTH_SECRET`
 * yo'q bo'lsa build butunlay ishlamaydi.
 */
function lazyAuth<T extends keyof NextAuthResult>(key: T): Lazy<NextAuthResult[T]> {
  return ((...args: unknown[]) => {
    const target = getAuth()[key] as unknown as (...a: unknown[]) => unknown;
    return Reflect.apply(target, getAuth(), args);
  }) as Lazy<NextAuthResult[T]>;
}

export const handlers = {
  GET: lazyAuth('handlers').GET,
  POST: lazyAuth('handlers').POST,
} as NextAuthResult['handlers'];

export const auth = lazyAuth('auth') as NextAuthResult['auth'];
export const signIn = lazyAuth('signIn') as NextAuthResult['signIn'];
export const signOut = lazyAuth('signOut') as NextAuthResult['signOut'];

/** Server komponentlarida joriy sessiya. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? '',
    role: session.user.role,
    level: session.user.level,
    onboardedAt: session.user.onboarded ? new Date() : null,
    birthDate: null,
    gender: session.user.gender,
  };
}

export { hashPassword, passwordProblem, isCommonPassword };