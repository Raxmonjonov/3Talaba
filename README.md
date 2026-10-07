# 3Talab

Tinch, hurmatli va foydali o‘rganish muhiti — SAT, IELTS va oliygoh kirishga
tayyorgarlik uchun.

## Tuzilma

```
3Talab/
├── apps/
│   ├── api/                       Express + TypeScript + Prisma
│   │   ├── prisma/
│   │   │   ├── schema.prisma           SQLite (sukut bo'yicha, tez sinov)
│   │   │   └── schema.postgresql.prisma PostgreSQL (ishlab chiqarish)
│   │   └── src/
│   │       ├── config/            Prisma client
│   │       ├── controllers/       auth, chat, learning
│   │       ├── middlewares/       JWT autentifikatsiya
│   │       ├── routes/
│   │       ├── services/
│   │       │   ├── curriculum.ts  Darslar + daraja o‘lchovi
│   │       │   ├── engine.ts      Matritsa uslubidagi dialog
│   │       │   └── tutor.ts       AI tutor system prompti
│   │       └── utils/
│   └── web/                       React + Vite + Tailwind
│       ├── public/                og-image*.png, sitemap.xml, robots.txt
│       ├── scripts/               generate-og-image.ps1 + og-content.json
│       └── src/
│           ├── components/landing/  Sarlavha, Hero, Mahsulot, FAQ, Footer
│           ├── i18n/              uz.ts (manba), en.ts, ru.ts, config.ts
│           ├── lib/               API client, SEO, mavzu (theme)
│           └── pages/             Landing, Login, Register, Placement,
│                                  Dashboard, Study
```

## Landing sahifasi

Bosh sahifa uchta til mavjudligida ochiladi va `useSeo` orqali qidiruv
tizimlari uchun mos meta-teglarni o‘rnatadi:

| Yo‘nalish | Til |
| --------- | --- |
| `/uz`     | O‘zbekcha (sukut bo‘yicha, `/` shu yerga yo‘naltiriladi) |
| `/en`     | Inglizcha |
| `/ru`     | Ruscha |

Xususiyatlar: ochiq/qorong‘i mavzu (`3talab_theme` localStorage’da saqlanadi),
`taslama` (skip) havolasi, `prefers-color-scheme` bilan moslashuvchan animatsiyalar,
hamda har bir til uchun alohida Open Graph rasm.

OG rasmlarni qayta yaratish:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File apps\web\scripts\generate-og-image.ps1
```

Matnlar `scripts/og-content.json` ichida — skript o‘zida ASCII saqlanadi,
chunki PowerShell BOM’siz `.ps1` fayllarni ANSI sifatida o‘qiydi va
kirill belgilar buzilishi mumkin.

## Talablar

- Node.js 20.19+ yoki 22.12+ (Vite 8 talab qiladi; Netlify’da `netlify.toml`
  orqali 22 raqamlanadi)
- SQLite (biror narsa o‘rnatish shart emas) yoki PostgreSQL

## O‘rnatish

```bash
npm install
```

## Sozlash

```bash
copy apps\api\.env.example apps\api\.env
```

`.env` ichida `DATABASE_URL` ni SQLite uchun `file:./dev.db` qiling
(tayyor namunasi shunday).

## Ma’lumotlar bazasi

```bash
npm run prisma:push     --workspace=@3talab/api
npm run prisma:generate --workspace=@3talab/api
```

## Ishga tushirish

```bash
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:4000

## PostgreSQL ga o‘tish

```bash
copy apps\api\prisma\schema.prisma apps\api\prisma\schema.sqlite.prisma
copy apps\api\prisma\schema.postgresql.prisma apps\api\prisma\schema.prisma
```

Keyin `.env` da `DATABASE_URL="postgresql://...:5432/3talab"` qiling va
`npm run prisma:push` ishga tushiring.

## AI model

Platforma **AI kalitisiz ham to‘liq ishlaydi** — ichki o‘quv dvigoteli
(`engine.ts` + `curriculum.ts`) matritsa uslubida dars beradi.

`OPENROUTER_API_KEY` qo‘ysangiz, AI model qo‘shimcha ravishda javoblarni
tabiiylashtiradi va chuqurroq tushuntirish beradi. Kalit yo‘q bo‘lsa
tizim buzilmaydi, faqat ichki dvigotel ishlatiladi.

## API

| Method | Route | Vazifa |
| ------ | ----- | ------ |
| POST | `/api/auth/register` | Ro‘yxatdan o‘tish |
| POST | `/api/auth/login` | Kirish |
| GET | `/api/auth/me` | Hozirgi foydalanuvchi |
| PATCH | `/api/user/settings` | Murojaat nomi, fokus rejimi |
| POST | `/api/chat/start` | Yangi dars sessiyasi |
| POST | `/api/chat/message` | Xabar yuborish |
| GET | `/api/chat/sessions` | Sessiyalar ro‘yxati |
| GET | `/api/chat/sessions/:id` | Sessiya tarixi |
| POST | `/api/chat/sessions/:id/end` | Sessiyani tugatish |
| GET | `/api/learning/placement` | Daraja o‘lchovi savollari |
| POST | `/api/learning/placement` | Natijani baholash, darajani saqlash |
| GET | `/api/learning/progress` | O‘rganish statistikasi |
| POST | `/api/learning/progress` | Bugungi vaqtni yozish |

## Joylashtirish

Sayt Netlify’da `netlify.toml` orqali quriladi:

- **Base directory**: bo‘sh qoldirilishi kerak (konfiguratsiya repo ildizida)
- **Build**: `apps/web` ichida `npm run build`
- **Publish**: `apps/web/dist`
- `/* → /index.html` (200) SPA yo‘naltiruvi bilan
- `NODE_VERSION = 22`

```bash
npm run build
```

### API

API alohida hostga joylanadi (Node.js 22+ va doimiy ma'lumotlar bazasi bilan):

```bash
npm run build --workspace=@3talab/api   # dist/ chiqadi
npm start --workspace=@3talab/api       # node apps/api/dist/index.js
```

Ishlayotganini tekshirish: `GET /health` → `{"ok":true,"service":"3talab-api"}`.

Muhit o‘zgaruvchilari:

| O‘zgaruvchi | Vazifa |
| ----------- | ------ |
| `PORT` | Port (sukut: `4000`) |
| `DATABASE_URL` | SQLite: `file:./dev.db`; ishlab chiqarishda PostgreSQL. Schema'ni almashtirish uchun yuqoridagi bo‘limga qarang |
| `JWT_SECRET` | Token imzosi — yashirin saqlansin |
| `JWT_EXPIRES_IN` | Token muddati, mas. `7d` |
| `SITE_URL` | Ruxsat berilgan origin(lar). Vergul bilan bir nechta kiritish mumkin: `https://site.app,https://preview.app` |
| `OPENROUTER_API_KEY` | AI qatlami (ixtiyoriy — kalit bo‘lmasa ichki dvigotel ishlaydi) |
| `OPENROUTER_MODEL` | Model nomi (sukut: `deepseek/deepseek-chat-v3-0324:free`) |

Web bundle‘ning API manzili **qurilish vaqtida** `VITE_API_URL` orqali kiradi.
Netlify‘da build environment‘ga o‘rnatilishi shart:

```bash
VITE_API_URL=https://api.example.com
```

O‘rnatilmasa sukut bo‘yicha `http://localhost:4000` ishlatiladi (faqat mahalliy
ishlash uchun).

1. **Majburlash yo‘q.** Chiqish hech qachon bloklanmaydi.
2. **Sog‘lom tempo.** Dam olish tavsiya qilinadi (25 daqiqalik sikl,
   yumshoq eslatma), majburlanmaydi.
3. **Sukut bilan o‘rganish.** Har javob bitta qadam beradi — nazariyani
   to‘kmab berish yo‘q.
4. **Hurmatli murojaat.** Ayollar uchun «Malikam», erkaklar uchun
   «Shag‘zodam». Foydalanuvchi istalgan nomni o‘zi tanlashi mumkin.
5. **Adaptiv daraja.** Daraja 0 bo‘lsa ham — noldan, sekin boshlaydi.
6. **Halol baholash.** Daraja o‘lchovi eng qiyin savoldan boshlab ketadi va
   to‘xtovchi to‘g‘ri javoblar zanjiri bo‘yicha hisoblanadi — tasodifiy
   to‘g‘ri javob darajani oshirib ketmaydi.

## Tekshiruv

```bash
npm run lint
npm run typecheck
npm run build
```