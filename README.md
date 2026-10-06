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
│       └── src/
│           ├── lib/               API client + tiplar
│           └── pages/             Login, Register, Placement, Dashboard, Study
└── docs/
```

## Talablar

- Node.js 20+
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

## Muhim tamoyillar

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
npm run typecheck
npm run build
npm run lint --workspace=@3talab/web
```