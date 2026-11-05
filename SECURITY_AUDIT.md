# 3Talab — Xavfsizlik Auditi Hisoboti

**Sana:** 2026-11-05  
**Obyekt:** `C:\Users\User\Desktop\3Talab` (Next.js 15.5.28 + NextAuth 4 + Prisma)  
**Metod:** Qo'lda kod tahlili + lokal ishlayotgan ilova ustida jonli tekshiruv (localhost:3000) + `npm audit`  
**Ruxsat:** Faqat egasining ruxsati bilan, faqat lokal nusxada. Tashqi tizimlarga hujum qilinmagan.

> **Strix haqida:** Strix 1.7.0 o'rnatildi va Strix Cloud'ga ulandi, ammo lite code review **36 kredit** talab qiladi, hisobda **5 kredit** bor (`scan_credit_limit_reached`). Shu sabab bu hisobot Strix'siz, bepul usulda tayyorlandi. Kod yuklash manifesti (139 fayl, 545 759 bayt, sha256 `70d659fe…c088f9`) tasdiqlashga tayyor turibdi.

---

## 1. Umumiy xulosa

| Daraja | Soni | Qisqa mazmun |
|---|---|---|
| 🔴 Critical | 2 | Autentifikatsiya to'liq chetlab o'tiladi; boshqa foydalanuvchining roadmap vazifasini o'zgartirish (IDOR) + XP |
| 🟠 High | 4 | Javob kalitlari ochiq; XP farming; voyaga yetmagan bola ma'lumotlari oshkor; admin email'ga ishonch |
| 🟡 Medium | 4 | AI endpointlar ochiq + uchinchi tomonga prompt; rate-limit aldash; CSP yo'q; eskirgan dependency |
| 🔵 Low | 4 | HSTS dev'da; fingerprinting; email tasdiqlash yo'q; secret uzunligi |

**Umumiy baho:** Hozirgi holatda ilovani **ommaviy internetga chiqarish xavfli**. Eng katta muammo — parol/email tekshiruvisiz istalgan odam tizimga "kirib" oladi, ya'ni autentifikatsiya himoyasi amalda yo'q.

**Yaxshi tomonlari (saqlab qolish kerak):**
- `.env` git'ga tushmagan, tarixda ham yo'q; kodda API kalit topilmadi.
- `dangerouslySetInnerHTML` faqat statik JSON-LD uchun ishlatilgan, foydalanuvchi matni emas — XSS yo'q.
- Nginx: faqat 443/tcp, TLS 1.3, `internal_net`, DB tashqariga yopiq, non-root Docker user — yaxshi hardening.
- Prisma ORM ishlatilgan (raw SQL yo'q) — SQL injection amalda yo'q.
- Zod bilan kirish validatsiyasi ko'p joyda bor.

---

## 2. Critical

### C-01. Istalgan email + istalgan parol bilan tizimga kirish (auth bypass)

**Fayl:** `src/lib/auth/options.ts:52-67`, `:70-90`

`authorize()` bazada foydalanuvchi topmasa ham, parol uzunligi ≥ 6 bo'lsa **soxta sessiya** qaytaradi:

```ts
// Demo yoki serverless rejimda kamida 6 belgili parol bilan tezkor kirish
if (credentials.password.length >= 6) {
  return { id: `serverless-${identifier}`, ... role: "STUDENT" };
}
```

Bundan yomoni: `catch` blokida ham xuddi shu narsa takrorlanadi (`:74-88`) — ya'ni DB xatosi bo'lsa ham **guest sessiya** beriladi.

**Tasdiqlangan PoC (lokal):**
```
POST /api/auth/callback/credentials
identifier=pentest-nonexistent@example.com&password=123456
→ 200 + next-auth.session-token
GET /api/auth/session
→ { "user": { "id": "serverless-pentest-nonexistent@example.com", "role": "STUDENT", ... } }
```

**Ta'siri:** har qanday begona odam o'zini "o'quvchi" qilib ko'rsatadi, himoyalangan API'larga kiradi, AI kvotasini yondiradi, kelajakda admin email ro'yxati sozlansa — admin bo'lib oladi (C-05 bilan birga).

**Tuzatish:**
```ts
async authorize(credentials) {
  if (!credentials?.identifier || !credentials?.password) throw new Error("...");
  const identifier = credentials.identifier.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { phone: credentials.identifier.trim() }] },
    include: { profile: true },
  });
  if (!user?.passwordHash) throw new Error("Email yoki parol noto'g'ri");
  const ok = await bcrypt.compare(credentials.password, user.passwordHash);
  if (!ok) throw new Error("Email yoki parol noto'g'ri");
  return { id: user.id, name: user.name, email: user.email, role: user.role, ... };
}
```
- `catch` ichida **hech qachon** sessiya qaytarmang — faqat xatoni qayta tashlang.
- Mehmon rejimi kerak bo'lsa, uni alohida `GuestProvider` yoki imzosiz `guest` cookie bilan qiling, lekin u **hech qanday DB yozuvi va shaxsiy ma'lumotga** ruxsat olmasin.
- `serverless-` prefiksli ID'larni barcha API'larda rad etish siyosatini saqlang (hozir ba'zi joylarda bor, lekin ishonchli chegara emas).

---

### C-02. IDOR — boshqa foydalanuvchining roadmap vazifasini o'zgartirish va XP olish

**Fayl:** `src/app/api/roadmap/route.ts:297-317`

```ts
const item = await prisma.roadmapItem.update({
  where: { id: parsed.data.itemId },   // egalik tekshiruvi YO'Q
  data: { isCompleted: parsed.data.isCompleted, ... },
});
if (parsed.data.isCompleted) {
  await prisma.profile.update({ where: { userId: session.user.id }, data: { xpTotal: { increment: item.xpReward } } });
}
```

`itemId` faqat string sifatida validatsiya qilinadi. Begona `itemId` yuborilsa:
1. boshqa o'quvchining rejasi "bajarildi" deb belgilanadi;
2. XP **sizning** profilingizga qo'shiladi (replay qilinsa — cheksiz XP).

**Tuzatish:**
```ts
const item = await prisma.roadmapItem.findFirst({
  where: { id: parsed.data.itemId, roadmap: { userId: session.user.id } },
  select: { id: true, xpReward: true, isCompleted: true },
});
if (!item) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
if (item.isCompleted === parsed.data.isCompleted) return NextResponse.json({ item }); // idempotent
// keyin update + XP faqat birinchi marta
```
Yaxshiroq variant: `updateMany({ where: { id, roadmap: { userId } } })` va `count === 0` bo'lsa 404. XP yozuvini tranzaksiyada (`prisma.$transaction`) bajaring va `XPEvent`da `@@unique([userId, reason, refId])` kabi dedupe qo'shing.

---

## 3. High

### H-01. Test javob kalitlari autentifikatsiyasiz ochiq

**Fayllar:** `src/app/api/questions/route.ts:136-148`, `src/app/api/lessons/[slug]/route.ts`

`GET /api/questions?subject=all` hech qanday sessiya talab qilmaydi va har bir savol uchun `correctAnswer` + `explanationUz` qaytaradi.

**Tasdiqlangan PoC:**
```
GET /api/questions?subject=all   (cookie yo'q)
→ 200, 35 savol, "correctAnswer": "B", ...
```

**Ta'siri:** testlar ma'nosiz bo'ladi, reyting va XP buziladi, kontent (pullik deb hisoblangan savollar) o'g'irlanadi.

**Tuzatish:**
- `correctAnswer` va `explanationUz`ni faqat javob yuborilgandan keyin (`POST` javobida) qaytaring.
- `GET`da faqat `id, prompt, options, difficulty` qoldiring.
- Test sessiyasini serverda saqlang: `Attempt` yaratilganda savollar to'plami va tartibi server tomonda belgilanadi.

### H-02. XP farming — bir savolni cheksiz takrorlash

**Fayl:** `src/app/api/questions/route.ts:187-214`, `src/app/api/lessons/[slug]/route.ts`

Har bir `POST` yangi `Attempt` va yangi `XPEvent` yaratadi; `questionId` bo'yicha dedupe yo'q. Foydalanuvchi bir xil to'g'ri javobni 1000 marta yuborib, XP/levelni cheksiz oshiradi.

**Tuzatish:**
- `XPEvent`ga `@@unique([userId, reason, refId])` qo'shing (`refId = questionId`), `create` o'rniga `upsert`/`createMany({ skipDuplicates: true })`.
- Bir savol uchun XP faqat **birinchi to'g'ri javobda** berilsin.
- Kunlik XP limiti (masalan 500 XP/kun) va `timeSpentSec` bo'yicha minimal chegara qo'ying.

### H-03. Voyaga yetmagan o'quvchi ma'lumotlari `code` orqali ochiq

**Fayl:** `src/app/api/guardian/route.ts:10-40`

`GET /api/guardian?code=<guardianShareCode>` autentifikatsiyasiz ishlaydi va bola ismi, viloyati, sinfi, urinishlar tarixi, dars jadvalini qaytaradi. Kod `cuid()` — taxmin qilish qiyin, lekin:
- kod **bekor qilinmaydi** (rotate/revoke yo'q);
- kod URL'da, brauzer tarixi/referrer/proksi loglarida qoladi;
- qo'lga tushsa — bola haqidagi ma'lumot abadiy ochiq.

**Tuzatish:**
- `guardianShareCode` uchun `expiresAt`, `revokedAt`, `lastUsedAt` maydonlari qo'shing va UI'da "kodni yangilash" tugmasi bering.
- Kodni URL o'rniga `POST` body/header orqali qabul qiling.
- `Cache-Control: no-store` va `Referrer-Policy: no-referrer` qo'ying (hozir global referrer policy boshqacha).
- Imkon bo'lsa, ota-onani ham autentifikatsiya qiling (telefon + OTP) — kod faqat bog'lash uchun.

### H-04. Admin huquqi tasdiqlanmagan email'ga ishonadi

**Fayl:** `src/lib/auth/admin.ts:12-19`, `src/lib/auth/options.ts` (ro'yxatdan o'tishda email tasdiqlanmaydi)

`isAdminEmail()` `ADMIN_EMAILS` ro'yxatidagi email'ga `role`dan qat'i nazar admin beradi. `ADMIN_EMAILS` hozir **sozlanmagan**, lekin:
- ro'yxatdan o'tishda email **tasdiqlanmaydi**;
- C-01 tufayli istalgan email bilan sessiya olish mumkin.

Ya'ni kelajakda `ADMIN_EMAILS=admin@3talaba.uz` qo'yilsa, `admin@3talaba.uz` + `123456` bilan istalgan odam admin bo'ladi.

**Tuzatish:**
- Admin huquqini faqat `User.role === "ADMIN"` (DB, tasdiqlangan) orqali bering.
- `ADMIN_EMAILS` ishlatilsa, email **verified** bo'lishi shart (`emailVerifiedAt`).
- Admin uchun 2FA (TOTP) qo'shing.

---

## 4. Medium

### M-01. AI endpointlar autentifikatsiyasiz + uchinchi tomonga prompt

**Fayllar:** `src/lib/ai/index.ts` (fallback `text.pollinations.ai`), `src/app/api/ai/coach/route.ts`

- Mehmon foydalanuvchi ham AI coach'ni chaqira oladi → kvota/abuse.
- `AI_PROVIDER=local` bo'lsa, promptlar `text.pollinations.ai`'ga yuboriladi — bu **uchinchi tomon**, maxfiylik siyosati va GDPR/bolalar ma'lumotlari nuqtai nazaridan xavfli.
- `aiRateLimitMap` chegaralanmagan (o'sib boradi).

**Tuzatish:** AI endpointlar uchun `session.user.id` majburiy qiling; uchinchi tomon fallback'ni production'da o'chiring (`AI_PROVIDER` bo'lmasa 503); `aiRateLimitMap`ni LRU bilan chegaralang (mavjud `checkRateLimit`dan foydalaning).

### M-02. Rate-limit aldash mumkin (X-Forwarded-For) va jarayon xotirasida

**Fayllar:** `src/middleware.ts:16-22`, `src/lib/rate-limit.ts`

`getClientIp()` `X-Forwarded-For`ning birinchi qiymatini oladi — uni klient o'zi qo'yishi mumkin. Nginx `$proxy_add_x_forwarded_for` bilan qo'shadi, lekin ilova to'g'ridan-to'g'ri ochiq bo'lsa (yoki boshqa proksi bo'lsa) aldash oson. Bundan tashqari limit **in-memory** — bir nechta instansiyada ishlamaydi, deploy'da nolga tushadi.

**Tasdiqlangan:** bir IP bilan 32 so'rov → 30×200, 2×429 (limit ishlaydi, lekin faqat bitta instansiyada).

**Tuzatish:** faqat ishonchli proksi (Nginx) `X-Real-IP`ni o'rnatsin va ilova faqat shu headerga ishonsin; `X-Forwarded-For`ni tashqi tomondan tozalang (`proxy_set_header X-Forwarded-For $remote_addr;`). Ko'p instansiya uchun Redis/Upstash rate-limit.

### M-03. CSP yo'q

**Fayllar:** `next.config.mjs`, `src/middleware.ts`, `netlify.toml`

HSTS, nosniff, DENY, referrer, permissions bor — lekin `Content-Security-Policy` yo'q. XSS topilmagan bo'lsa ham, CSP ikkinchi qatlam himoya bo'lardi.

**Tuzatish:** Next.js uchun nonce-based CSP:
```ts
const csp = [
  "default-src 'self'",
  "script-src 'self' 'nonce-<N>' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "connect-src 'self' https://generativelanguage.googleapis.com https://text.pollinations.ai",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");
```
Avval `Content-Security-Policy-Report-Only` bilan sinab ko'ring.

### M-04. Dependency zaifliklari

`npm audit --omit=dev`:

| Paket | Daraja | Muammo | Tuzatish |
|---|---|---|---|
| `postcss` (<8.5.10) | High | `</style>` orqali XSS (GHSA-qx2v-qp2m-jg93) | Next yangilanganda keladi |
| `next` (15.5.28) | Moderate | postcss orqali | `next@16.4.5` (semver-major) |
| `zod` (<4.6.6) | High | ReDoS/validatsiya | `zod@4.6.7` (semver-major) |

**Tavsiya:** alohida branch'da `next@16` + `zod@4` migratsiyasini rejalashtiring; shoshilinch bo'lsa `npm audit fix` (major bo'lmagan qismini) qo'llang. Major yangilashdan oldin `npx tsc --noEmit` va `npx vitest run` (32/32) bilan tekshiring.

---

## 5. Low

| ID | Muammo | Fayl | Tuzatish |
|---|---|---|---|
| L-01 | HSTS dev'da ham yuboriladi | `src/middleware.ts:25`, `next.config.mjs` | `NODE_ENV === "production"` bo'lgandagina qo'shing |
| L-02 | `/api/health` servis nomi va `tlsOnly`ni oshkor qiladi | `src/app/api/health/route.ts` | Minimal `{status:"ok"}` qoldiring |
| L-03 | Email tasdiqlash yo'q | `src/app/api/auth/register/route.ts` | `emailVerifiedAt` + tasdiqlash havolasi |
| L-04 | `NEXTAUTH_SECRET` 37 belgi (base64 emas, ehtimol qo'lda) | `.env` | `openssl rand -base64 32` bilan yangilang va faqat env'da saqlang |

**Qo'shimcha kuzatuv:** `nginx.conf`dagi `map $http_cookie` faqat `next-auth.session-token` va `__Secure-next-auth.session-token`ni taniydi. Agar cookie nomi `__Host-next-auth.session-token` bo'lsa, autentifikatsiyalangan javob 15s mikrokeshga tushishi mumkin. `~*next-auth\.session-token` naqshini kengaytiring yoki `/api/` uchun keshni butunlay o'chiring.

---

## 6. Ustuvor tuzatish rejasi

**Bugun (1-2 soat):**
1. `src/lib/auth/options.ts` — guest/fallback sessiyani olib tashlash (C-01).
2. `src/app/api/roadmap/route.ts` — egalik tekshiruvi + idempotent XP (C-02).
3. `src/app/api/questions/route.ts` + `lessons/[slug]` — `correctAnswer`ni GET'dan olib tashlash (H-01).
4. `src/app/api/questions/route.ts` — XP dedupe (H-02).

**Bu hafta:**
5. Guardian kodini revoke/expire qilish (H-03).
6. Admin email'ni verified qilish yoki faqat `role`ga o'tish (H-04).
7. AI endpointlarga auth + uchinchi tomon fallback'ni o'chirish (M-01).
8. Rate-limitni proksi header'iga moslash (M-02).

**Keyingi sprint:**
9. CSP (M-03).
10. `next@16` + `zod@4` migratsiyasi (M-04).
11. `SECURITY.md` + CI'da `npm audit` va testlar.

---

## 7. Tekshiruv metodikasi va cheklovlar

- **Qilingan:** statik kod tahlili (auth, API routes, middleware, Prisma sxema, nginx/Docker), `npm audit`, lokal HTTP PoC'lar (auth bypass, answer leak, rate-limit), git tarixida sir qidirish, `dangerouslySetInnerHTML`/`eval` qidiruvi.
- **Qilinmagan:** to'liq avtomatik DAST/fuzzing, brauzer orqali XSS/CSRF zanjirlari, uchinchi tomon OAuth oqimi, yuklama testi, Strix avtonom agent skani (kredit yetmadi).
- **Cheklov:** `dev.db` (SQLite) va `AI_PROVIDER=local` bilan tekshirildi; production PostgreSQL va Gemini rejimida ba'zi xatti-harakatlar farq qilishi mumkin.

## 8. Strix bilan davom etish

Kredit to'ldirilgach (31 kredit = $31, jami 36) yoki Docker/WSL2 o'rnatilgach:

```powershell
$env:Path = "$env:APPDATA\Python\Python312\Scripts;$env:Path"
strix cloud scans start --source . --engagement-type code_review --scan-tier lite --yes
```

Yoki to'liq manifestni ko'rib, tasdiqlang:

```powershell
strix cloud scans start --source . --dry-run --show-files --json
strix cloud scans start --source . --approve-sha256 70d659fea2bb8f439f0f51df4e596c3a759ff862a21c47d17978200ac6e088f9 ...
```

> Eslatma: Windows'da Strix'ning `source_upload.py` faylida `st_ctime_ns` bilan bog'liq xato tuzatilgan (lokal patch). Kelajakda `pip install --upgrade strix-agent` bu patch'ni o'chirib yuborishi mumkin — xato qaytsa, qayta qo'llang.
