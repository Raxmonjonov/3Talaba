import { z } from "zod";

export const UZBEK_REGIONS = [
  "Toshkent sh.",
  "Toshkent vil.",
  "Samarqand",
  "Buxoro",
  "Farg'ona",
  "Andijon",
  "Namangan",
  "Qashqadaryo",
  "Surxondaryo",
  "Xorazm",
  "Navoiy",
  "Jizzax",
  "Sirdaryo",
  "Qoraqalpog'iston",
] as const;

export const GRADE_OPTIONS = [
  "7-sinf",
  "8-sinf",
  "9-sinf",
  "10-sinf",
  "11-sinf",
  "Akademik litsey / Kollej",
  "Maktab bitiruvchisi (Gap Year)",
  "Talaba (1–2-bosqich)",
] as const;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ismingiz kamida 2 ta harfdan iborat bo'lishi kerak")
    .max(80, "Ism juda uzun"),
  gender: z.enum(["FEMALE", "MALE"], {
    errorMap: () => ({ message: "Iltimos, jinsingizni tanlang (Qiz / O'g'il)" }),
  }),
  age: z.coerce
    .number()
    .int()
    .min(10, "Yosh kamida 10 da bo'lishi kerak")
    .max(40, "Yosh 40 gacha bo'lishi kerak"),
  grade: z.string().min(2, "Sinfingizni tanlang"),
  region: z.string().min(2, "Viloyatingizni tanlang"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email manzilingizni to'g'ri kiriting (masalan: ali@mail.uz)"),
  phone: z
    .string()
    .trim()
    .max(25, "Telefon raqami juda uzun")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak")
    .max(100, "Parol juda uzun"),
});

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Email yoki telefon raqamingizni kiriting"),
  password: z.string().min(1, "Parolingizni kiriting"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * O'quvchi jinsiga qarab hurmatli va iliq murojaat so'zini qaytaradi.
 */
export function getHonorificTitle(gender?: string | null, name?: string | null): string {
  if (name && name.trim()) {
    return name.trim().split(' ')[0];
  }
  return "Aziz o'quvchi";
}
