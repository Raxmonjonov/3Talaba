import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, getHonorificTitle } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";

describe("Bosqich 1: Autentifikatsiya va Murojaat Validatsiyasi", () => {
  it("Qiz o'quvchiga 'Malikam', o'g'il o'quvchiga 'Shag'zodam' deb murojaat qiladi", () => {
    expect(getHonorificTitle("FEMALE")).toBe("Malikam");
    expect(getHonorificTitle("MALE")).toBe("Shag'zodam");
    expect(getHonorificTitle(undefined)).toBe("Shag'zodam");
  });

  it("To'g'ri ro'yxatdan o'tish ma'lumotlarini qabul qiladi", () => {
    const valid = registerSchema.safeParse({
      name: "Madina Karimova",
      gender: "FEMALE",
      age: 16,
      grade: "10-sinf",
      region: "Samarqand",
      email: "Madina@3Talab.uz",
      phone: "+998901234567",
      password: "securePassword123",
    });

    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.email).toBe("madina@3talab.uz");
    }
  });

  it("Qisqa parol yoki noto'g'ri yoshni rad etadi", () => {
    const invalid = registerSchema.safeParse({
      name: "Ali",
      gender: "MALE",
      age: 7,
      grade: "10-sinf",
      region: "Toshkent sh.",
      email: "ali@mail.uz",
      password: "123",
    });

    expect(invalid.success).toBe(false);
  });

  it("Login ma'lumotlarini tekshiradi", () => {
    expect(
      loginSchema.safeParse({ identifier: "ali@3talab.uz", password: "secret" }).success,
    ).toBe(true);
    expect(loginSchema.safeParse({ identifier: "", password: "" }).success).toBe(false);
  });

  it("Rate limiter belgilangan limitdan oshganda bloklaydi", () => {
    const key = "test-ip-stage1";
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(false);
  });
});
