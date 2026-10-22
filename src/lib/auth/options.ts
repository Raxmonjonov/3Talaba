import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getHonorificTitle } from "@/lib/validations/auth";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email va Parol",
    credentials: {
      identifier: { label: "Email yoki Telefon", type: "text" },
      password: { label: "Parol", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.identifier || !credentials?.password) {
        throw new Error("Email/telefon va parolni kiriting");
      }

      const identifier = credentials.identifier.trim().toLowerCase();

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { phone: credentials.identifier.trim() }],
        },
        include: {
          profile: true,
        },
      });

      if (!user || !user.passwordHash) {
        throw new Error("Bunday foydalanuvchi topilmadi yoki parol noto'g'ri");
      }

      const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!isValid) {
        throw new Error("Email yoki parol noto'g'ri kiritildi");
      }

      const gender = user.profile?.gender === "FEMALE" ? "FEMALE" : "MALE";

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender,
        honorific: user.name?.split(" ")[0] || "O'quvchi",
        onboardingDone: Boolean(user.profile?.onboardingDone),
        placementDone: Boolean(user.profile?.placementDone),
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 kun
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          include: { profile: true },
        });

        if (!existing) {
          const created = await prisma.user.create({
            data: {
              name: user.name ?? "O'quvchi",
              email: user.email.toLowerCase(),
              image: user.image,
              profile: {
                create: {
                  gender: "MALE",
                  age: 16,
                  grade: "10-sinf",
                  region: "Toshkent sh.",
                },
              },
              streak: {
                create: {
                  currentStreak: 1,
                  longestStreak: 1,
                  lastActiveDate: new Date().toISOString().slice(0, 10),
                },
              },
            },
          });
          user.id = created.id;
        } else {
          user.id = existing.id;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "STUDENT";
        token.gender = user.gender ?? "MALE";
        token.honorific = user.name?.split(" ")[0] || "O'quvchi";
        token.onboardingDone = Boolean(user.onboardingDone);
        token.placementDone = Boolean(user.placementDone);
      }

      if (trigger === "update" && session) {
        if (typeof session.onboardingDone === "boolean") {
          token.onboardingDone = session.onboardingDone;
        }
        if (typeof session.placementDone === "boolean") {
          token.placementDone = session.placementDone;
        }
        if (session.gender === "FEMALE" || session.gender === "MALE") {
          token.gender = session.gender;
          token.honorific = (session.name || token.name || "").split(" ")[0] || "O'quvchi";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.gender = token.gender;
        session.user.honorific = token.honorific;
        session.user.onboardingDone = token.onboardingDone;
        session.user.placementDone = token.placementDone;
      }
      return session;
    },
  },
  secret: resolveAuthSecret(),
};

/**
 * Production'da NEXTAUTH_SECRET majburiy. Zaxira kalit faqat lokal ishlab chiqish uchun.
 * Aks holda JWT'lar hammaga ma'lum kalit bilan imzolanib qolgan bo'lardi.
 */
function resolveAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
    throw new Error("NEXTAUTH_SECRET production muhitida o'rnatilishi shart (kamida 16 belgi).");
  }
  return "local-dev-only-3talab-secret-key-2026";
}
