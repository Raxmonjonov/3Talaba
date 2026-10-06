import type { SeedCourse } from '../../types';

/** Mantiq kursi: 4 dars. */
export const LOGIC_COURSE: SeedCourse = {
  slug: 'logic',
  subject: 'LOGIC',
  title: ['Mantiq va tahlil', 'Logic and Analysis'],
  description: [
    'Kvantifikatorlar, shartli xulosalar, naqsh va xato tahlili.',
    'Quantifiers, conditional reasoning, patterns and fallacy detection.',
  ],
  modules: [
    {
      slug: 'logic-core',
      title: ['Mantiq asoslari', 'Logic Foundations'],
      description: ['Asosiy tuzilmalar.', 'Core structures.'],
      levelRange: '0-5',
      lessons: [
        {
          slug: 'logic-quantifiers',
          title: ['Kvantifikatorlar va inkor', 'Quantifiers and Negation'],
          summary: [
            '"Barcha", "ba’zi", "hech qanday" va ularning inkori.',
            'All, some, no — and their negations.',
          ],
          objectives: [
            ['"Barcha A — B" inkorini to‘g‘ri shakllantirish', 'Negate “all A are B” correctly'],
            ['Berilgan shartlardan mustaqil xulosani ajratish', 'Separate entailment from possibility'],
          ],
          storyAct: 1,
          storyTitle: ['Inkor minorasi', 'The Negation Mine'],
          levelRange: '0-3',
          estMinutes: 45,
          xpReward: 35,
          skills: ['logic-basics'],
          blocks: [
            {
              kind: 'STORY',
              title: ['Inkor minorasi', 'The Negation Mine'],
              minMinutes: 5,
              content: {
                uz: 'Bir noto‘g‘ri inkor butun dalil zanjirini buzadi. Bugun biz teskarisini o‘rganamiz.',
                en: 'One wrong negation breaks the whole chain of reasoning. Today we work backwards.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Teskari o‘zgartirish qoidalari', 'The Reversal Rules'],
              minMinutes: 14,
              content: {
                uz: 'Inkor qoidalari: "Barcha A — B" → "Ba’zi A — B emas". "Ba’zi A — B" → "Barcha A — B emas". "Hech qanday A — B emas" → "Ba’zi A — B". Boshqa qoidam yo‘q — bu uchta misol emas, mantiqiy qoidalar.',
                en: 'Negation rules: “all A are B” → “some A are not B”. “Some A are B” → “no A are B”. “No A are B” → “some A are B”. These are not examples but logical rules.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Inkorni ikki marta berish', 'Double Negation'],
              minMinutes: 10,
              content: {
                uz: '"Hech qanday A — B emas" inkori "Ba’zi A — B". Agar shuni yana inkor qilsangiz, "Hech qanday A — B emas" ga qaytasiz. Ikki marta inkor o‘z-o‘zini bekor qiladi.',
                en: 'The negation of “no A are B” is “some A are B”. Negate that again and you return to “no A are B”. Double negation cancels out.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Kvantifikator drill', 'Quantifier Drill'],
              minMinutes: 14,
              content: {
                uz: '10 ta jumla inkor qiling va turli shakllarda yozing.',
                en: 'Negate ten sentences and rewrite them in different forms.',
              },
              skills: ['logic-basics'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 11,
              content: {
                uz: '10 ta aralash mantiq savoli.',
                en: 'Ten mixed logic questions.',
              },
              skills: ['logic-basics'],
            },
          ],
        },
        {
          slug: 'logic-conditionals',
          title: ['Shartli xulosalar', 'Conditional Reasoning'],
          summary: [
            'Modus ponens, modus tollens, konversiya va "faqat" shartli.',
            'Modus ponens, modus tollens, converse and “only if” conditionals.',
          ],
          objectives: [
            ['To‘g‘ri va noto‘g‘ri shartli shakllarni ajratish', 'Separate valid from invalid conditionals'],
            ['"Faqat" kalit so‘zining ta’sirini tushunish', 'Understand the effect of “only”'],
          ],
          storyAct: 2,
          storyTitle: ['Faqat so‘zining og‘irligi', 'The Weight of Only'],
          levelRange: '1-4',
          estMinutes: 50,
          xpReward: 40,
          skills: ['logic-conditional'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['To‘rtta asosiy shakl', 'The Four Core Forms'],
              minMinutes: 14,
              content: {
                uz: 'Modus ponens: P → Q, P, demak Q (to‘g‘ri). Modus tollens: P → Q, Q emas, demak P emas (to‘g‘ri). Konversiya: Q → P (noto‘g‘ri). Inkorsiya: Q emas → P emas (noto‘g‘ri). Konversiya va inkorsiya — eng ko‘p uchraydigan xatolar.',
                en: 'Modus ponens: P → Q, P, therefore Q (valid). Modus tollens: P → Q, not Q, therefore not P (valid). Converse: Q → P (invalid). Inverse: not Q → not P (invalid). Converse and inverse are the most common fallacies.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['"Faqat" kalit so‘zi', 'The Keyword “Only”'],
              minMinutes: 12,
              content: {
                uz: '"Faqat men kitob o‘qigan talabalar muvaffaqiyatli bo‘ldi" = muvaffaqiyatli bo‘lish uchun mening kitobimni o‘qish shart. Teskari: "Menim kitobimni o‘qigan har bir talaba muvaffaqiyatli" — bu umuman boshqa hujjat.',
                en: '“Only students who read my book became successful” means reading my book is necessary for success. The reverse — every student who read my book succeeded — is a completely different claim.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Shartli drill', 'Conditional Drill'],
              minMinutes: 14,
              content: {
                uz: '10 ta shartli shaklni belgilang: ponens, tollens, konversiya yoki xato.',
                en: 'Label ten conditional forms: ponens, tollens, converse or invalid.',
              },
              skills: ['logic-conditional'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 12,
              content: {
                uz: '10 ta aralash shartli xulosa savoli.',
                en: 'Ten mixed conditional-reasoning questions.',
              },
              skills: ['logic-conditional'],
            },
          ],
        },
        {
          slug: 'logic-patterns',
          title: ['Ketma-ketliklar va naqshlar', 'Sequences and Patterns'],
          summary: [
            'Arifmetik, geometrik, kvadrat va Fibonacci ketma-ketligi.',
            'Arithmetic, geometric, square and Fibonacci sequences.',
          ],
          objectives: [
            ['Ketma-ketlik turini aniqlash', 'Identify a sequence type'],
            ['Qoida shakllantirish va davom ettirish', 'Formulate the rule and continue it'],
          ],
          storyAct: 3,
          storyTitle: ['Naqsh izlagichi', 'The Pattern Seeker'],
          levelRange: '0-3',
          estMinutes: 45,
          xpReward: 35,
          skills: ['logic-patterns'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Beshta asosiy ketma-ketlik', 'Five Core Sequences'],
              minMinutes: 14,
              content: {
                uz: 'Arifmetik: farq doimiy (2, 4, 6 → 8). Geometrik: nisbat doimiy (2, 4, 8 → 16). Kvadrat: 1, 4, 9, 16 → 25. Fibonacci: har bir had oldingi ikkitaning yig‘indisi (1, 1, 2, 3, 5 → 8). Uchburchak: 1, 3, 6, 10 → 15 (keyingi son = uning tartib raqami).',
                en: 'Arithmetic: constant difference (2, 4, 6 → 8). Geometric: constant ratio (2, 4, 8 → 16). Square: 1, 4, 9, 16 → 25. Fibonacci: each term is the sum of the previous two (1, 1, 2, 3, 5 → 8). Triangular: 1, 3, 6, 10 → 15.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Qiyin ketma-ketlik', 'Harder Sequence'],
              minMinutes: 10,
              content: {
                uz: '5, 9, 18, 31, 49: farqlar 4, 9, 13, 18 — farqlar ham o‘zgarib boradi, lekin izchil emas. Boshqa nuqta: har bir had = o‘zidan oldingi ikki had yig‘indisi + 4: 5+9+4 = 18, 9+18+4 = 31, 18+31 = 49? Yo‘q. To‘g‘ri qoida: had_n = 2·had_(n−1) + kamayuvchi qo‘shimcha. Qiyin ketma-ketliklarda har bir qadamda farqlarni va nisbatlarni yozib ko‘ring.',
                en: '5, 9, 18, 31, 49: the differences 4, 9, 13, 18 are not constant, and neither is the ratio. Note that each term relates to the two before it plus a growing amount. For hard sequences, always write the differences and ratios before guessing.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Ketma-ketlik drill', 'Sequence Drill'],
              minMinutes: 12,
              content: {
                uz: '12 ta ketma-ketlikning keyingisini toping va qoidani bir qatorda yozing.',
                en: 'Find the next term of twelve sequences and state each rule in one line.',
              },
              skills: ['logic-patterns'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 9,
              content: {
                uz: '10 ta aralash naqsh savoli.',
                en: 'Ten mixed pattern questions.',
              },
              skills: ['logic-patterns'],
            },
          ],
        },
        {
          slug: 'logic-fallacies',
          title: ['Xato tahlil va bahs', 'Fallacies and Debate'],
          summary: [
            'Sabab-natija chalkashtirish, generalization va strawman.',
            'Post hoc, hasty generalisation and straw man.',
          ],
          objectives: [
            ['Klassik xatolarni matnda aniqlash', 'Identify classic fallacies in a text'],
            ['Xatoni tuzatish uchun kuchli qayta ishlash yozish', 'Rewrite a claim to fix the flaw'],
          ],
          storyAct: 4,
          storyTitle: ['Xato zaxirasi', 'The Flaw Reserve'],
          levelRange: '2-5',
          estMinutes: 55,
          xpReward: 45,
          skills: ['logic-basics'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Eng tez uchraydigan xatolar', 'The Most Frequent Fallacies'],
              minMinutes: 14,
              content: {
                uz: 'Post hoc: "A keyin B bo‘ldi, demak A sababi." Generalizatsiya: "Bir kishi yomon ish qildi, demak butun guruh shunday." Straw man: "Siz ularning argumentini noto‘g‘ri talqin qildingiz." Taqdimot xatosi: past narxli mahsulot = past sifat.',
                en: 'Post hoc: “A came before B, so A caused B.” Hasty generalisation: “One member did it, so the whole group does.” Straw man: misrepresenting the opponent. Bandwagon: cheap means low quality.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Xatoni tuzatish', 'Repairing a Flawed Claim'],
              minMinutes: 12,
              content: {
                uz: 'Xato: "Talabalar baho oshgani sababli yangi dastur ishladi." Tuzatilgan: "Yangilanishdan keyin baholar oshdi, bu o‘zaro bog‘liqlikni ko‘rsatadi, lekin sabab-natija aloqasini isbotlamaydi." Bu o‘zgarish argumentni saqlaydi va uni aniqlashtiradi.',
                en: 'Flawed: “Because scores rose, the new programme worked.” Repaired: “Scores rose after the update, which shows correlation but not causation.” This keeps the argument and makes it honest.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Xato tahlil drill', 'Fallacy Drill'],
              minMinutes: 16,
              content: {
                uz: '8 ta argumentni tahlil qiling: xatoni aniqlang va tuzatilgan variantini yozing.',
                en: 'Analyse eight arguments: identify the flaw and write a corrected version.',
              },
              skills: ['logic-basics'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 13,
              content: {
                uz: '10 ta aralash mantiq va xato savoli.',
                en: 'Ten mixed logic and fallacy questions.',
              },
              skills: ['logic-basics'],
            },
          ],
        },
      ],
    },
  ],
};