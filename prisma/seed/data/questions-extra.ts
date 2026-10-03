import type { SeedQuestion } from '../types';

/**
 * Savol zaxirasi to'ldiruvchisi — kam sonli skill'lar uchun qo'shimcha savollar.
 * Namuna imtihonlar va drill bloklari har bir skill'dan yetarli savol topishi uchun.
 */
export const EXTRA_QUESTIONS: SeedQuestion[] = [
  // ── math-probability ─────────────────────────────────────────────────────
  {
    skill: 'math-probability',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 60,
    p: [
      'Ikki turli tanga tashlanganda ikkala yuzasi ham bo‘lish ehtimoli qancha?',
      'When two fair coins are tossed, what is the probability of two heads?',
    ],
    options: [
      { label: { uz: '1/4', en: '1/4' }, correct: true, accepts: ['1/4', '0.25'] },
      { label: { uz: '1/2', en: '1/2' } },
      { label: { uz: '1/3', en: '1/3' } },
      { label: { uz: '3/4', en: '3/4' } },
    ],
  },
  {
    skill: 'math-probability',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 60,
    p: [
      'Guruhda 12 talaba bor: 7 qiz, 5 o‘g‘il. Tasodifiy bitta talaba tanlanganda qiz bo‘lish ehtimoli?',
      'A class has 12 students: 7 girls, 5 boys. If one student is chosen at random, what is the probability of choosing a girl?',
    ],
    options: [
      { label: { uz: '7/12', en: '7/12' }, correct: true, accepts: ['7/12', '0.583'] },
      { label: { uz: '5/12', en: '5/12' } },
      { label: { uz: '7', en: '7' } },
      { label: { uz: '12/7', en: '12/7' } },
    ],
  },
  {
    skill: 'math-probability',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 75,
    passage: [
      'Ikki hodisa A va B mustaqil (independent), P(A) = 0.4 va P(B) = 0.5.',
      'Two events A and B are independent, with P(A) = 0.4 and P(B) = 0.5.',
    ],
    p: [
      'P(A va B) qancha?',
      'What is P(A and B)?',
    ],
    options: [
      { label: { uz: '0.2', en: '0.2' }, correct: true, accepts: ['0.2'] },
      { label: { uz: '0.9', en: '0.9' } },
      { label: { uz: '0.45', en: '0.45' } },
      { label: { uz: '0.1', en: '0.1' } },
    ],
  },
  {
    skill: 'math-probability',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 90,
    p: [
      'Ikki tanga tashlanganda kamida bitta yuz chiqish ehtimoli?',
      'When two fair coins are tossed, what is the probability of at least one head?',
    ],
    options: [
      { label: { uz: '3/4', en: '3/4' }, correct: true, accepts: ['3/4', '0.75'] },
      { label: { uz: '1/4', en: '1/4' } },
      { label: { uz: '1/2', en: '1/2' } },
      { label: { uz: '1', en: '1' } },
    ],
  },
  {
    skill: 'math-probability',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 120,
    p: [
      'Qutilarda 4 qiz va 6 o‘g‘il bor. Ikkita tasodifiy tanlanganda ikkalasi ham qiz bo‘lish ehtimoli?',
      'A school has 4 girls and 6 boys. If two students are chosen at random, what is the probability that both are girls?',
    ],
    options: [
      { label: { uz: '2/15', en: '2/15' }, correct: true, accepts: ['2/15', '0.1333'] },
      { label: { uz: '4/10', en: '4/10' } },
      { label: { uz: '1/5', en: '1/5' } },
      { label: { uz: '1/6', en: '1/6' } },
    ],
  },
  {
    skill: 'math-probability',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 150,
    passage: [
      'Tasodifiy son 1 dan 20 gacha tanlandi. U 3 ga bo‘linadimi?',
      'An integer from 1 to 20 is chosen at random. What is the probability that it is divisible by 3?',
    ],
    p: [
      'Ehtimoliyat qancha?',
      'What is the probability?',
    ],
    options: [
      { label: { uz: '1/10', en: '1/10' }, correct: true, accepts: ['0.1', '1/10'] },
      { label: { uz: '3/20', en: '3/20' } },
      { label: { uz: '1/20', en: '1/20' } },
      { label: { uz: '3/10', en: '3/10' } },
    ],
  },
  {
    skill: 'math-probability',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 180,
    p: [
      'Qiymatlar: 4, 4, 6, 8, 8, 8, 10. Mediana qancha?',
      'Values: 4, 4, 6, 8, 8, 8, 10. What is the median?',
    ],
    options: [
      { label: { uz: '8', en: '8' }, correct: true, accepts: ['8'] },
      { label: { uz: '7', en: '7' } },
      { label: { uz: '6', en: '6' } },
      { label: { uz: '8.4', en: '8.4' } },
    ],
  },
  {
    skill: 'math-probability',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 210,
    passage: [
      'Beshta kuzatish: 3, 5, 7, 9, 11. O‘rtacha qancha va mediana qancha?',
      'Five observations: 3, 5, 7, 9, 11. What are the mean and the median?',
    ],
    p: [
      'Ikkalasi ham qancha?',
      'What are both of them?',
    ],
    options: [
      { label: { uz: 'Ikkalasi ham 7', en: 'Both are 7' }, correct: true, accepts: ['7'] },
      { label: { uz: 'O‘rtacha 7, mediana 9', en: 'Mean 7, median 9' } },
      { label: { uz: 'O‘rtacha 6, mediana 7', en: 'Mean 6, median 7' } },
      { label: { uz: 'Ikkalasi ham 6', en: 'Both are 6' } },
    ],
  },

  // ── sat-data (qo'shimcha) ───────────────────────────────────────────────
  {
    skill: 'sat-data',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 90,
    passage: [
      'Jadval: shahar 2019 — 120, 2020 — 135, 2021 — 150, 2022 — 150, 2023 — 180 (ming so\'m).',
      'Table: city 2019 — 120, 2020 — 135, 2021 — 150, 2022 — 150, 2023 — 180 (thousands).',
    ],
    p: [
      'Qaysi yil o‘sish eng sekin bo‘ldi?',
      'In which year was the increase the smallest?',
    ],
    options: [
      { label: { uz: '2022 (o‘sish yo‘q)', en: '2022 (no increase)' }, correct: true },
      { label: { uz: '2020', en: '2020' } },
      { label: { uz: '2019', en: '2019' } },
      { label: { uz: '2023', en: '2023' } },
    ],
  },
  {
    skill: 'sat-data',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 120,
    p: [
      'Beshta son: 2, 3, 3, 7, 10. Mediana qancha?',
      'Five numbers: 2, 3, 3, 7, 10. What is the median?',
    ],
    options: [
      { label: { uz: '3', en: '3' }, correct: true, accepts: ['3'] },
      { label: { uz: '4', en: '4' } },
      { label: { uz: '5', en: '5' } },
      { label: { uz: '2', en: '2' } },
    ],
  },
  {
    skill: 'sat-data',
    type: 'MCQ_SINGLE',
    d: 2,
    sec: 150,
    passage: [
      'Uchta kuzatish qiymati: 4, 8, 16. Ularning kvadratlari o‘rtachasining kvadrat ildizi qancha? (standart chetlanma)',
      'Three observed values: 4, 8, 16. What is the standard deviation of the values?',
    ],
    p: [
      'Standart chetlanma qancha? (o‘rtacha = 28/3 ≈ 9.333)',
      'What is the standard deviation? (mean = 28/3 ≈ 9.333)',
    ],
    options: [
      { label: { uz: '≈ 4.99', en: '≈ 4.99' }, correct: true, accepts: ['4.99', '5.0'] },
      { label: { uz: '≈ 9.33', en: '≈ 9.33' } },
      { label: { uz: '≈ 2.24', en: '≈ 2.24' } },
      { label: { uz: '≈ 12', en: '≈ 12' } },
    ],
  },
  {
    skill: 'sat-data',
    type: 'MCQ_SINGLE',
    d: 2.5,
    sec: 180,
    passage: [
      'Ikki sinf: A sinfida 30 talaba, o‘rtacha ball 78. B sinfida 20 talaba, o‘rtacha ball 86.',
      'Two classes: class A has 30 students with mean 78. Class B has 20 students with mean 86.',
    ],
    p: [
      'Ikki sinfning umumiy o‘rtachasi qancha?',
      'What is the combined mean of the two classes?',
    ],
    options: [
      { label: { uz: '81.2', en: '81.2' }, correct: true, accepts: ['81.2'] },
      { label: { uz: '82', en: '82' } },
      { label: { uz: '86', en: '86' } },
      { label: { uz: '84', en: '84' } },
    ],
  },

  // ── sat-reading (qo'shimcha) ────────────────────────────────────────────
  {
    skill: 'sat-reading',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 90,
    passage: [
      'Matn: "Muallif inson tabiatiga ishonchi yo‘q, chunki u ijtimoiy sharoitga bog‘liq."',
      'Passage: “The author distrusts human nature because it is shaped by social conditions.”',
    ],
    p: [
      'Matnning markaziy g‘oyasi qaysi?',
      'What is the central claim?',
    ],
    options: [
      {
        label: { uz: 'Inson tabiati ijtimoiy sharoitga bog‘liq', en: 'Human nature depends on social conditions' },
        correct: true,
      },
      { label: { uz: 'Inson tabiati yaxshi', en: 'Human nature is good' } },
      { label: { uz: 'Ijtimoiy sharoit o‘zgarmaydi', en: 'Social conditions never change' } },
      { label: { uz: 'Muallif ijtimoiy fanlarni yoqtiradi', en: 'The author rejects social science' } },
    ],
  },
  {
    skill: 'sat-reading',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 120,
    passage: [
      'Birinchi abzas: muammo tavsifi. Ikkinchi: muammoning sabablari. Uchinchi: muqarrar yechim.',
      'Paragraph 1: describes the problem. Paragraph 2: causes. Paragraph 3: the inevitable solution.',
    ],
    p: [
      'Bu qaysi tuzilma?',
      'Which structure is this?',
    ],
    options: [
      { label: { uz: 'Sabab-natija', en: 'Cause and effect' }, correct: true },
      { label: { uz: 'Qarama-qarshi', en: 'Counterclaim' } },
      { label: { uz: 'Taqqoslash', en: 'Comparison' } },
      { label: { uz: 'Vaqt o‘tishi', en: 'Timeline' } },
    ],
  },
  {
    skill: 'sat-reading',
    type: 'MCQ_SINGLE',
    d: 2,
    sec: 150,
    passage: [
      'Matn oxirida: "Bu usul samarali bo‘lishi mumkin, ammo u qimmat va uzoq muddatli ta’sir ko‘rsatishi hali isbotlangan emas."',
      'Passage ends: “The method may be effective, but it is expensive and its long-term impact has not been demonstrated.”',
    ],
    p: [
      'Xulosa qanday tavsiflanadi?',
      'How would you describe the conclusion?',
    ],
    options: [
      {
        label: { uz: 'Cheklangan, ehtiyotkor natija', en: 'A qualified, cautious conclusion' },
        correct: true,
      },
      { label: { uz: 'To‘liq tasdiqlovchi', en: 'A fully affirmative conclusion' } },
      { label: { uz: 'Butunlay rad etuvchi', en: 'A complete rejection' } },
      { label: { uz: 'Savol qo‘yish', en: 'A question' } },
    ],
  },
  {
    skill: 'sat-reading',
    type: 'MCQ_SINGLE',
    d: 2,
    sec: 150,
    passage: [
      'Matn: "Muallif o‘z fikrini ochiq aytadi, keyin uni qarshi argument bilan tekshiradi va oxirida o‘z pozitsiyasini qayta tasdiqlaydi."',
      'Passage: “The author states a position, tests it against a counterargument and reaffirms the position at the end.”',
    ],
    p: [
      'Muallifning yondashuv usuli qaysi?',
      'What is the author’s approach?',
    ],
    options: [
      { label: { uz: 'Qarama-qarshi orqali mustahkamlash', en: 'Strengthening through opposition' }, correct: true },
      { label: { uz: 'To‘liq rad etish', en: 'Complete rejection' } },
      { label: { uz: 'Tavsiflash', en: 'Pure description' } },
      { label: { uz: 'Sabab-natija', en: 'Cause and effect' } },
    ],
  },
  {
    skill: 'sat-reading',
    type: 'MCQ_SINGLE',
    d: 2.5,
    sec: 180,
    passage: [
      'Birinchi jumlada noaniq "biror narsa" ishlatilgan, ikkinchisida aniq "mavjud ma’lumotlar" ishlatilgan.',
      'The first sentence uses a vague “something”; the second uses the definite “the available data”.',
    ],
    p: [
      'Ikkinchi jumlada nima o‘zgarishi mumkin?',
      'What may change in the second sentence?',
    ],
    options: [
      {
        label: { uz: 'Aniq ma’lumotga murojaat qilinadi', en: 'A reference to specific data is introduced' },
        correct: true,
      },
      { label: { uz: 'Qaror o‘zgaradi', en: 'The decision changes' } },
      { label: { uz: 'Muallif pozitsiyasini o‘zgartiradi', en: 'The author changes position' } },
      { label: { uz: 'Hech narsa o‘zgarishi mumkin emas', en: 'Nothing can change' } },
    ],
  },
  {
    skill: 'sat-reading',
    type: 'MCQ_SINGLE',
    d: 2.5,
    sec: 180,
    passage: [
      'Matn: "Eng ko‘p uchraydigan xato — birinchi dalil bilan yakun chiqarish. Ikkinchi dalil esa ko‘pchilikda bo‘lmaydi."',
      'Passage: “The most common error is concluding from the first piece of evidence. The second is absent in most accounts.”',
    ],
    p: [
      'Muallifning urg‘usi nimaga?',
      'What is the author’s emphasis on?',
    ],
    options: [
      {
        label: { uz: 'Xulosa birinchi dalildan olinmasligi kerak', en: 'That a conclusion must not rest on the first piece of evidence' },
        correct: true,
      },
      { label: { uz: 'Birinchi dalil keraksiz', en: 'That the first piece of evidence is useless' } },
      { label: { uz: 'Matn uzun', en: 'That the passage is long' } },
      { label: { uz: 'Muallif o‘zini qoralamaydi', en: 'That the author does not revise' } },
    ],
  },

  // ── sat-writing (qo'shimcha) ────────────────────────────────────────────
  {
    skill: 'sat-writing',
    type: 'MCQ_SINGLE',
    d: 2,
    sec: 150,
    passage: [
      'Bo‘shliq: “Qo‘mita taklif bo‘yicha bo‘lingan: uch a’zo qarshi, yetti a’zo qo‘llab-quvvatladi.”',
      'Sentence: “The committee was divided on the proposal, with three members opposing and seven supporting.”',
    ],
    p: [
      'Bu gapdagi eng aniqlikni oshiradigan tuzatish qaysi?',
      'Which revision would make this sentence clearest?',
    ],
    options: [
      {
        label: {
          uz: '"Divided" o‘rniga aniq raqamlarni oldinga ko‘chirish',
          en: 'Move the exact counts before “divided”',
        }, correct: true,
      },
      {
        label: { uz: '"Was" o‘rniga "got" qo‘yish', en: 'Replace “was” with “got”' },
      },
      { label: { uz: '"Proposal" o‘rniga "matter" qo‘yish', en: 'Replace “proposal” with “matter”' } },
      { label: { uz: 'O‘zgartirish kerak emas', en: 'No revision needed' } },
    ],
  },
  {
    skill: 'sat-writing',
    type: 'MCQ_SINGLE',
    d: 2.5,
    sec: 180,
    p: [
      'Ikki gapni birlashtirishning eng yaxshi usulini tanlang: “Ma’lumotlar to‘liq bo‘lmagan. Shuning uchun xulosa zaif bo‘ldi.”',
      'Choose the best way to combine two sentences: “The data were incomplete. The conclusion was therefore weak.”',
    ],
    options: [
      {
        label: {
          uz: 'Because the data were incomplete, the conclusion was weak.',
          en: 'Because the data were incomplete, the conclusion was weak.',
        }, correct: true,
      },
      {
        label: {
          uz: 'The data were incomplete which made the conclusion weak.',
          en: 'The data were incomplete which made the conclusion weak.',
        },
      },
      {
        label: {
          uz: 'The conclusion was weak, the data were incomplete.',
          en: 'The conclusion was weak, the data were incomplete.',
        },
      },
      {
        label: {
          uz: 'Although the data were incomplete, the conclusion was strong.',
          en: 'Although the data were incomplete, the conclusion was strong.',
        },
      },
    ],
  },

  // ── sat-advanced (qo'shimcha) ───────────────────────────────────────────
  {
    skill: 'sat-advanced',
    type: 'MCQ_SINGLE',
    d: 2,
    sec: 180,
    passage: [
      'Tenglama: log₃(2x − 5) = 2',
      'Equation: log₃(2x − 5) = 2',
    ],
    p: ['x qancha?', 'What is x?'],
    options: [
      { label: { uz: '7', en: '7' }, correct: true, accepts: ['7'] },
      { label: { uz: '5', en: '5' } },
      { label: { uz: '2', en: '2' } },
      { label: { uz: '11', en: '11' } },
    ],
  },
  {
    skill: 'sat-advanced',
    type: 'MCQ_SINGLE',
    d: 2.5,
    sec: 210,
    passage: [
      'Sikl uchburchagi: burchaklar x, x, 180 − 2x. Tashqi burchagi ichki qo‘shimchisi bilan teng.',
      'A triangle has angles x, x and 180 − 2x. An exterior angle equals its adjacent interior angle.',
    ],
    p: [
      'Tashqi burchak qancha?',
      'What is the exterior angle?',
    ],
    options: [
      { label: { uz: '90°', en: '90°' }, correct: true, accepts: ['90'] },
      { label: { uz: '60°', en: '60°' } },
      { label: { uz: '120°', en: '120°' } },
      { label: { uz: '45°', en: '45°' } },
    ],
  },
];