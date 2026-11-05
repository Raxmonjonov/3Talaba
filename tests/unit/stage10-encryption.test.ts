import { describe, expect, it } from "vitest";
import {
  decryptField,
  decryptPrismaResult,
  encryptDeterministic,
  encryptField,
  encryptPrismaWhereFilter,
  encryptPrismaWriteData,
  isEncryptedPayload,
} from "@/lib/security/encryption";
import {
  decryptBrowserAES256GCM,
  encryptBrowserAES256GCM,
  openClientString,
  sealClientString,
} from "@/lib/security/client-storage";

describe("Stage 10: Ma'lumotlarni Shifrlash (AES-256-GCM, SIV, Prisma & Client Storage)", () => {
  it("AES-256-GCM har safar yangi IV bilan shifrlaydi va aniq qayta deshifrlaydi", () => {
    const secretText = "O'zbekiston — SAT 1500+ va IELTS 7.5+ sari maxfiy yozuv: x^2 - 6x + 8 = 0";
    const c1 = encryptField(secretText);
    const c2 = encryptField(secretText);

    expect(c1).toBeTruthy();
    expect(c2).toBeTruthy();
    expect(isEncryptedPayload(c1)).toBe(true);
    expect(c1).toMatch(/^enc:v1:/);
    // Tasodifiy 96-bit IV sababli ikkita shifrmatn bir-biridan farq qilishi shart
    expect(c1).not.toBe(c2);
    expect(c1).not.toContain("SAT 1500+");

    expect(decryptField(c1)).toBe(secretText);
    expect(decryptField(c2)).toBe(secretText);

    // Idempotentlik: ikki marta ustma-ust shifrlanib ketmaydi
    expect(encryptField(c1)).toBe(c1);
  });

  it("AES-256-GCM buzilgan (tampered) shifrmatnni rad etadi (AuthTag himoyasi)", () => {
    const encrypted = encryptField("Maxfiy insho matni va ball: 1540")!;
    const parts = encrypted.split(":");
    const lastSeg = parts[parts.length - 1]!;
    const flippedChar = lastSeg[0] === "A" ? "B" : "A";
    parts[parts.length - 1] = flippedChar + lastSeg.slice(1);
    const tampered = parts.join(":");

    expect(() => decryptField(tampered, { strict: true })).toThrow();
    expect(decryptField(tampered)).toBe("[SHIFRLANGAN]");
  });

  it("Deterministik AES-256-GCM-SIV telefon raqamni qidiruvga mos shifrlaydi", () => {
    const phone = "+998901234567";
    const d1 = encryptDeterministic(phone, "User.phone");
    const d2 = encryptDeterministic(phone, "User.phone");
    const dOtherCtx = encryptDeterministic(phone, "Other.field");

    expect(d1).toMatch(/^enc:det1:/);
    expect(d1).toBe(d2);
    expect(d1).not.toBe(dOtherCtx);
    expect(d1).not.toContain("99890");

    expect(decryptField(d1, { context: "User.phone", strict: true })).toBe(phone);
    // Noto'g'ri AAD kontekst bilan ochishga urinish rad etilishi kerak
    expect(() => decryptField(d1, { context: "Wrong.context", strict: true })).toThrow();
  });

  it("Prisma yozuv, qidiruv (where) va o'qish natijalarini ichma-ich shaffof shifrlaydi", () => {
    const rawUserCreate = {
      name: "Madina Karimova",
      email: "madina@3talaba.uz",
      phone: "+998935554433",
      profile: {
        create: {
          region: "Samarqand viloyati",
          targetUniversity: "KAIST & MIT",
          targetCountry: "Janubiy Koreya, AQSh",
        },
      },
    };

    const encryptedWrite = encryptPrismaWriteData("User", rawUserCreate) as typeof rawUserCreate;
    expect(encryptedWrite.name).toBe("Madina Karimova");
    expect(encryptedWrite.phone).toMatch(/^enc:det1:/);
    expect(encryptedWrite.profile.create.region).toMatch(/^enc:v1:/);
    expect(encryptedWrite.profile.create.targetUniversity).toMatch(/^enc:v1:/);

    const encryptedWhere = encryptPrismaWhereFilter("User", {
      OR: [{ email: "madina@3talaba.uz" }, { phone: "+998935554433" }],
    }) as { OR: Array<{ email?: string; phone?: string }> };
    expect(encryptedWhere.OR[1]?.phone).toBe(encryptedWrite.phone);

    // Bazadan qaytgan shifrlangan natijani ochish
    const simulatedDbRow = {
      id: "usr_1",
      name: encryptedWrite.name,
      email: encryptedWrite.email,
      phone: encryptedWrite.phone,
      profile: {
        region: encryptedWrite.profile.create.region,
        targetUniversity: encryptedWrite.profile.create.targetUniversity,
        targetCountry: encryptedWrite.profile.create.targetCountry,
      },
    };

    const decryptedRow = decryptPrismaResult("User", simulatedDbRow);
    expect(decryptedRow.phone).toBe("+998935554433");
    expect(decryptedRow.profile.region).toBe("Samarqand viloyati");
    expect(decryptedRow.profile.targetUniversity).toBe("KAIST & MIT");
    expect(decryptedRow.profile.targetCountry).toBe("Janubiy Koreya, AQSh");

    // Eski shifrlanmagan matn ham xatosiz o'qiladi
    expect(decryptField("Toshkent sh.")).toBe("Toshkent sh.");
  });

  it("Brauzer (Client Storage) ChaCha20+MAC va WebCrypto AES-256-GCM shifrlashni tekshiradi", async () => {
    const jsonPayload = JSON.stringify({
      email: "ali@3talaba.uz",
      totalScore: 6,
      estimatedSat: "1500+",
    });

    const s1 = sealClientString("3talaba_placement_result", jsonPayload);
    const s2 = sealClientString("3talaba_placement_result", jsonPayload);
    expect(s1).toMatch(/^cenc:v1:/);
    expect(s1).not.toBe(s2);
    expect(s1).not.toContain("ali@3talaba.uz");

    expect(openClientString("3talaba_placement_result", s1)).toBe(jsonPayload);
    // Boshqa kalit nomi ostida ko'chirib qo'yilsa (key-swap attack) MAC rad etadi
    expect(openClientString("boshqa_kalit", s1)).toBeNull();

    // Shifrmatn 1 ta belgiga o'zgartirilsa MAC rad etadi
    const bad = s1.slice(0, -2) + (s1.endsWith("A") ? "B" : "A");
    expect(openClientString("3talaba_placement_result", bad)).toBeNull();

    // Web Crypto API AES-256-GCM
    const wc = await encryptBrowserAES256GCM(jsonPayload);
    expect(wc).toMatch(/^wcenc:v1:/);
    expect(await decryptBrowserAES256GCM(wc)).toBe(jsonPayload);
  });
});
