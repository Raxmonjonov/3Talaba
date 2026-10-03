import type { SeedQuestion } from '../types';

/** SAT savollari: matematika (25), o'qish (20), lug'at (15) = 60. */
export const SAT_QUESTIONS: SeedQuestion[] = [
  // ── sat-algebra ─────────────────────────────────────────────────────────
  {
    skill: 'sat-algebra',
    type: 'NUMERIC',
    d: -2.5,
    sec: 30,
    p: ['Agar 3x − 7 = 14, u holda x nechaga teng?', 'If 3x − 7 = 14, what is the value of x?'],
    options: [{ label: { uz: '7', en: '7' }, correct: true, accepts: ['7', '7.0'] }],
  },
  {
    skill: 'sat-algebra',
    type: 'NUMERIC',
    d: -2,
    sec: 45,
    p: ['5x² ni 4x bilan bo‘linsa, natija nechaga teng?', 'Divide 5x² by 4x. What is the result?'],
    options: [{ label: { uz: '1.25x', en: '1.25x' }, correct: true, accepts: ['1.25x', '5x/4', '(5/4)x', '1.25 x'] }],
  },
  {
    skill: 'sat-algebra',
    type: 'NUMERIC',
    d: -1.5,
    sec: 60,
    p: [
      'Agar biror son 5 ga ko‘paytirilganda uning qiymati 120 ga oshsa, bu son dastlab qancha edi?',
      'If a number multiplied by 5 increases it by 120, what was the number?',
    ],
    options: [{ label: { uz: '30', en: '30' }, correct: true, accepts: ['30'] }],
  },
  {
    skill: 'sat-algebra',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 75,
    p: [
      'Quyidagi tenglamalar tizimida y + x = 10 va y − x = 4 bo‘lsa, x nechaga teng?',
      'In the system y + x = 10 and y − x = 4, what is x?',
    ],
    options: [
      { label: { uz: '3', en: '3' } },
      { label: { uz: '5', en: '5' }, correct: true },
      { label: { uz: '7', en: '7' } },
      { label: { uz: '−2', en: '−2' } },
    ],
  },
  {
    skill: 'sat-algebra',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 90,
    p: [
      '2x² − 11x − 10 ni chiziqli ko‘rinishga keltiring.',
      'Factor 2x² − 11x − 10 into linear factors.',
    ],
    options: [
      { label: { uz: '(2x − 1)(x + 10)', en: '(2x − 1)(x + 10)' }, correct: true },
      { label: { uz: '(2x + 1)(x − 10)', en: '(2x + 1)(x − 10)' } },
      { label: { uz: '(2x − 5)(x + 2)', en: '(2x − 5)(x + 2)' } },
      { label: { uz: '(x − 5)(2x + 2)', en: '(x − 5)(2x + 2)' } },
    ],
  },
  {
    skill: 'sat-algebra',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 120,
    p: [
      'f(x) = 3x² − 2x + 1. f(a) = 10 bo‘lsa, a ning qiymatlarini toping.',
      'Let f(x) = 3x² − 2x + 1. If f(a) = 10, find the possible values of a.',
    ],
    options: [
      { label: { uz: 'a = 1 yoki a = −5/3', en: 'a = 1 or a = −5/3' }, correct: true },
      { label: { uz: 'a = 2 yoki a = −1', en: 'a = 2 or a = −1' } },
      { label: { uz: 'a = 3 yoki a = −2', en: 'a = 3 or a = −2' } },
      { label: { uz: 'a = −1/3 yoki a = 1', en: 'a = −1/3 or a = 1' } },
    ],
  },
  {
    skill: 'sat-algebra',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 120,
    p: [
      '|2x − 6| = 8 tenglamasida x ning barcha yechimlarini toping.',
      'Solve |2x − 6| = 8 for all values of x.',
    ],
    options: [
      { label: { uz: 'x = 1 yoki x = 7', en: 'x = 1 or x = 7' }, correct: true },
      { label: { uz: 'x = 7 yoki x = −1', en: 'x = 7 or x = −1' } },
      { label: { uz: 'x = −2 yoki x = 14', en: 'x = −2 or x = 14' } },
      { label: { uz: 'x = 4 yoki x = −4', en: 'x = 4 or x = −4' } },
    ],
  },
  {
    skill: 'sat-algebra',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 150,
    p: [
      'x² − 8x + c = 0 ning ikki yechimi ham musbat va yig‘indisi 8 bo‘lsa, c nechaga teng?',
      'For x² − 8x + c = 0, both roots are positive and their sum is 8. What is c?',
    ],
    options: [
      { label: { uz: '4', en: '4' } },
      { label: { uz: '12', en: '12' } },
      { label: { uz: '16', en: '16' }, correct: true },
      { label: { uz: '64', en: '64' } },
    ],
  },
  {
    skill: 'sat-algebra',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 180,
    p: [
      'Sizning uzgina ikki soningiz yig‘indisi 100 ga teng. Ulardan biri ikkinchisining yarimiga teng emas. Ikkalasining kvadratlar yig‘indisi qancha?',
      'Two positive numbers sum to 100, and one is 3/2 of the other. What is the sum of their squares?',
    ],
    options: [
      { label: { uz: '4 000', en: '4 000' } },
      { label: { uz: '5 000', en: '5 000' } },
      { label: { uz: '6 000', en: '6 000' }, correct: true },
      { label: { uz: '7 200', en: '7 200' } },
    ],
  },
  {
    skill: 'sat-algebra',
    type: 'MCQ_SINGLE',
    d: 2,
    sec: 180,
    p: [
      'Ifodani chiziqli ko‘rinishga keltiring: 2x³ + 3x² − 2x − 3',
      'Factor into linear factors: 2x³ + 3x² − 2x − 3',
    ],
    options: [
      { label: { uz: '(x − 1)(x + 1)(2x + 3)', en: '(x − 1)(x + 1)(2x + 3)' }, correct: true },
      { label: { uz: '(x + 1)(x − 1)(2x − 3)', en: '(x + 1)(x − 1)(2x − 3)' } },
      { label: { uz: '(x − 1)²(2x + 3)', en: '(x − 1)²(2x + 3)' } },
      { label: { uz: '(2x − 1)(x + 1)(x + 3)', en: '(2x − 1)(x + 1)(x + 3)' } },
    ],
  },

  // ── sat-advanced ───────────────────────────────────────────────────────
  {
    skill: 'sat-advanced',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 120,
    p: [
      'log₂(x − 3) = 3 tenglamasida x nechaga teng?',
      'If log₂(x − 3) = 3, what is x?',
    ],
    options: [
      { label: { uz: '6', en: '6' } },
      { label: { uz: '11', en: '11' }, correct: true },
      { label: { uz: '19', en: '19' } },
      { label: { uz: '24', en: '24' } },
    ],
  },
  {
    skill: 'sat-advanced',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 120,
    p: [
      '2^(x+1) = 4^(x−2) tenglamasini yeching.',
      'Solve 2^(x+1) = 4^(x−2).',
    ],
    options: [
      { label: { uz: 'x = −5', en: 'x = −5' }, correct: true },
      { label: { uz: 'x = −3', en: 'x = −3' } },
      { label: { uz: 'x = 3', en: 'x = 3' } },
      { label: { uz: 'x = 5', en: 'x = 5' } },
    ],
  },
  {
    skill: 'sat-advanced',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 150,
    p: [
      '2i³ + 3i² ni soddalashtiring (i² = −1).',
      'Simplify 2i³ + 3i², where i² = −1.',
    ],
    options: [
      { label: { uz: '−3 − 2i', en: '−3 − 2i' }, correct: true },
      { label: { uz: '−3 + 2i', en: '−3 + 2i' } },
      { label: { uz: '3 − 2i', en: '3 − 2i' } },
      { label: { uz: '1 − 2i', en: '1 − 2i' } },
    ],
  },
  {
    skill: 'sat-advanced',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 180,
    p: [
      'sin θ = 3/5 va θ ikkinchi kvadrantda bo‘lsa, cos θ nechaga teng?',
      'If sin θ = 3/5 and θ lies in Quadrant II, what is cos θ?',
    ],
    options: [
      { label: { uz: '−4/5', en: '−4/5' }, correct: true },
      { label: { uz: '4/5', en: '4/5' } },
      { label: { uz: '−3/4', en: '−3/4' } },
      { label: { uz: '3/4', en: '3/4' } },
    ],
  },
  {
    skill: 'sat-advanced',
    type: 'MCQ_SINGLE',
    d: 2,
    sec: 180,
    p: [
      'x³ + 6x² + 11x + 6 ni yechimlarini toping.',
      'Find the roots of x³ + 6x² + 11x + 6.',
    ],
    options: [
      { label: { uz: '−1, −2, −3', en: '−1, −2, −3' }, correct: true },
      { label: { uz: '1, 2, 3', en: '1, 2, 3' } },
      { label: { uz: '−1, −2, 3', en: '−1, −2, 3' } },
      { label: { uz: '2, 3, 6', en: '2, 3, 6' } },
    ],
  },
  {
    skill: 'sat-advanced',
    type: 'MCQ_SINGLE',
    d: 2.5,
    sec: 240,
    p: [
      'Aylananing markazi (2, −3), radiusi 5. Nuqta (6, 1) aylana ichida yoki ustida yoki tashqarisida?',
      'A circle has centre (2, −3) and radius 5. Is the point (6, 1) inside, on, or outside?',
    ],
    options: [
      { label: { uz: 'Tashqarisida', en: 'Outside' }, correct: true },
      { label: { uz: 'Ichida', en: 'Inside' } },
      { label: { uz: 'Ustida (teng)', en: 'On the circle (equal)' } },
    ],
  },

  // ── sat-data ───────────────────────────────────────────────────────────
  {
    skill: 'sat-data',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 60,
    p: [
      'To‘rt kishi yoshi: 12, 15, 15 va 18. O‘rtacha yosh necha?',
      'Four people are aged 12, 15, 15 and 18. What is the mean age?',
    ],
    options: [
      { label: { uz: '14', en: '14' } },
      { label: { uz: '15', en: '15' }, correct: true },
      { label: { uz: '15,5', en: '15.5' } },
      { label: { uz: '16', en: '16' } },
    ],
  },
  {
    skill: 'sat-data',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 90,
    p: [
      'Ma’lumotlar: 3, 5, 5, 7, 9, 11. Medianasi nechaga teng?',
      'For the data set 3, 5, 5, 7, 9, 11, what is the median?',
    ],
    options: [
      { label: { uz: '5', en: '5' } },
      { label: { uz: '6', en: '6' }, correct: true },
      { label: { uz: '7', en: '7' } },
      { label: { uz: '8', en: '8' } },
    ],
  },
  {
    skill: 'sat-data',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 90,
    p: [
      'Quyidagi chastotalar jadvalida og‘irliklangan o‘rtacha toping: qiymat 2 → 3 marta, qiymat 4 → 5 marta, qiymat 8 → 2 marta.',
      'Find the weighted mean: value 2 occurs 3 times, value 4 occurs 5 times, value 8 occurs 2 times.',
    ],
    options: [
      { label: { uz: '4,0', en: '4.0' } },
      { label: { uz: '4,4', en: '4.4' }, correct: true },
      { label: { uz: '4,6', en: '4.6' } },
      { label: { uz: '5,0', en: '5.0' } },
    ],
  },
  {
    skill: 'sat-data',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 120,
    p: [
      'Ikki sonning o‘rta arifmetigi 10, kvadratlarining o‘rtasi 58. Sonlarning mahsuloti nechaga teng?',
      'Two numbers have arithmetic mean 10 and mean of squares 58. What is their product?',
    ],
    options: [
      { label: { uz: '48', en: '48' } },
      { label: { uz: '36', en: '36' } },
      { label: { uz: '42', en: '42' }, correct: true },
      { label: { uz: '64', en: '64' } },
    ],
  },
  {
    skill: 'sat-data',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 150,
    p: [
      'O‘rtachasi 20, standart chetlanmasi 4 bo‘lgan taqsimot uchun Chebyshev teoremasi bo‘yicha o‘rtachadan 8 birlik (2 standart chetlanma) ichida kamida necha foiz qiymat bo‘ladi?',
      'For a distribution with mean 20 and standard deviation 4, Chebyshev’s theorem guarantees that at least what percentage of values lie within 8 units (2 SD) of the mean?',
    ],
    options: [
      {
        label: { uz: '75%', en: '75%' },
        correct: true,
        explanation: {
          uz: 'Chebyshev: 1 − 1/k² = 1 − 1/4 = 0.75, ya’ni kamida 75%.',
          en: 'Chebyshev: 1 − 1/k² = 1 − 1/4 = 0.75, so at least 75%.',
        },
      },
      {
        label: { uz: '50%', en: '50%' },
        explanation: {
          uz: 'Bu faqat 1 standart chetlanma uchun (k = 1) kuchli kafolat.',
          en: 'That bound only holds for 1 SD (k = 1).',
        },
      },
      {
        label: { uz: '95%', en: '95%' },
        explanation: {
          uz: '95% normal taqsimot uchun (k ≈ 1.96), lekin Chebyshev kengroq taqsimotlar uchun kafolat bermaydi.',
          en: '95% holds for a normal distribution (k ≈ 1.96), but Chebyshev does not guarantee it.',
        },
      },
      {
        label: { uz: '100%', en: '100%' },
        explanation: {
          uz: 'Chebyshev hech qachon 100% bermaydi — chetdan chiqish har doim mumkin.',
          en: 'Chebyshev never gives 100% — outliers are always possible.',
        },
      },
    ],
  },
  {
    skill: 'sat-data',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 150,
    p: [
      'Ikki guruh bir-biriga bog‘liq emas. 1-guruh: n=30, o‘rtacha=72, sd=8. 2-guruh: n=30, o‘rtacha=80, sd=10. Qaysi xulosa ishonchli?',
      'Two independent groups. Group 1: n=30, mean=72, sd=8. Group 2: n=30, mean=80, sd=10. Which conclusion is most defensible?',
    ],
    options: [
      { label: {
        uz: 'Ikkinchi guruh o‘rtachasi sezilarli yuqori (standart xatolar taxminan ±2,5 ball)',
        en: 'Group 2’s mean is meaningfully higher (SE of the difference is about 2.5 points)',
      }, correct: true },
      { label: {
        uz: 'Farq tasodifiy, sabab o‘zgartiruvchilar boshqarilmagan',
        en: 'The difference is random noise; confounders are uncontrolled',
      } },
      { label: { uz: 'Ikkinchi guruh butunlay yaxshi o‘zgaruvchilarga ega', en: 'Group 2 simply has better students' } },
      { label: { uz: 'Biror narsa hisoblanadi', en: 'One of the numbers must be wrong' } },
    ],
  },

  // ── sat-reading ────────────────────────────────────────────────────────
  {
    skill: 'sat-reading',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 90,
    passage: [
      'Uzoq davom etgan ochlikdan keyin, ko‘pchilik birinchi ovqatni tez yeydi. Biroq oshqozon hazm qilish uchun mo‘ljallangan. Tez yeyilgan ovqat ko‘pincha og‘irlik va ko‘ngil aylanish keltiradi.',
      'After prolonged fasting, most people eat their first meal quickly. The stomach, however, is built for digestion. A hurried first meal often brings heaviness and nausea.',
    ],
    p: [
      'Birinchi ovqat nima uchun asta yeyilishi kerak?',
      'Why should the first meal be eaten slowly?',
    ],
    options: [
      { label: { uz: 'Sabab oshqozon tez hazm qilishga moslashgan', en: 'Because the stomach is equipped for slow digestion' }, correct: true },
      { label: { uz: 'Sabab tez yeyish og‘irlik keltiradi', en: 'Because eating fast causes heaviness' } },
      { label: { uz: 'Sabab ochlikdan keyin ishtahа bo‘lmaydi', en: 'Because there is no appetite after fasting' } },
      { label: { uz: 'Sabab ko‘pchilik shunday qiladi', en: 'Because most people do it' } },
    ],
  },
  {
    skill: 'sat-reading',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 90,
    passage: [
      'Chet el universitetlarida talabalar uchun stipendiya odatdagina ikki turga bo‘linadi: merkatij asosidagi (academic merit) va ehtiyoj asosidagi (need-based). Birinchi to‘lov belgilangan ball chegarasini bosib o‘tish talab qiladi.',
      'At international universities, scholarships usually fall into two types: merit-based and need-based. Merit awards require reaching a defined score threshold.',
    ],
    p: [
      'Merit-asosidagi stipendiya olish uchun nima kerak?',
      'What is required to receive a merit-based scholarship?',
    ],
    options: [
      { label: { uz: 'Belgilangan ball chegarasini bosib o‘tish', en: 'Exceeding the defined score threshold' }, correct: true },
      { label: { uz: 'Kam oilaviy darajada bo‘lish', en: 'A low family income' } },
      { label: { uz: 'Faqat bitiruvchilar uchun', en: 'Only for graduates' } },
      { label: { uz: 'Alohida ariza berish', en: 'A separate application form' } },
    ],
  },
  {
    skill: 'sat-reading',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 120,
    passage: [
      'Tadqiqotchilar o‘quvchilarning o‘z-o‘zidan o‘rganishi uchun qiziqish natijalarini tahlil qildi. Natija: qiziqish hech qachon motivatsiyani to‘liq almashtirmaydi, biroq uni mustahkamlaydi.',
      'Researchers analysed outcomes for students who self-direct their learning. Finding: interest never fully replaces motivation, but it strengthens it.',
    ],
    p: [
      'Tadqiqot natijasi bo‘yicha qiziqish motivatsiyaga qanday ta’sir qiladi?',
      'According to the study, how does interest affect motivation?',
    ],
    options: [
      { label: { uz: 'Motivatsiyani to‘liq almashtirmaydi, faqat mustahkamlaydi', en: 'It does not replace motivation, it strengthens it' }, correct: true },
      { label: { uz: 'Motivatsiyani butunlay almashtiradi', en: 'It fully replaces motivation' } },
      { label: { uz: 'Motivatsiyaga ta’sir qilmaydi', en: 'It has no effect on motivation' } },
      { label: { uz: 'Faqat past natijalarda muhim', en: 'It matters only for weak results' } },
    ],
  },
  {
    skill: 'sat-reading',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 120,
    passage: [
      'Ba’zi tadqiqotlar kuzatuv natijalarini sabab deb o‘lchaydi, ammo bu xato. Kuzatuv — qaror emas, qaror esa kuzatuvni oldindan belgilaydi.',
      'Some studies treat observational outcomes as causes, which is a mistake. Observation is not the decision — the decision determines what gets observed.',
    ],
    p: [
      'Muallifga ko‘ra, kuzatuv va qaror o‘rtasidagi bog‘liqlik qaysicha?',
      'According to the author, how are observation and decision related?',
    ],
    options: [
      { label: { uz: 'Qaror kuzatuvni oldindan belgilaydi', en: 'The decision determines the observation in advance' }, correct: true },
      { label: { uz: 'Kuzatuv qarorni oldindan belgilaydi', en: 'The observation determines the decision in advance' } },
      { label: { uz: 'Ularning o‘rtasida bog‘liqlik yo‘q', en: 'There is no relationship between them' } },
      { label: { uz: 'Faqat laboratoriya sharoitida bog‘liq', en: 'They are linked only in laboratory settings' } },
    ],
  },
  {
    skill: 'sat-reading',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 150,
    passage: [
      'Ma’lumotlarni vizual shaklda taqdim etish ko‘pincha matn ko‘rib chiqishdan tezroq. Ammo vizual ifoda bilan bog‘liq xato bo‘lishi ham mumkin — masalan, noto‘g‘ri masshtablangan o‘q.',
      'Presenting data visually is often faster than reading it in text. But visual representation can also mislead — a badly scaled axis, for example.',
    ],
    p: [
      'Matnning tezroq ekanligi haqidagi da’vo nima bilan kuchaytirilgan?',
      'What strengthens the claim that text is faster?',
    ],
    options: [
      { label: { uz: 'Grafiklarning o‘lchov chizig‘i noto‘g‘ri bo‘lishi mumkin', en: 'Graph axes can be mis-scaled' }, correct: true },
      { label: { uz: 'Matn o‘qish ko‘nikmasi o‘lchandi', en: 'Reading skill was measured' } },
      { label: { uz: 'Tajriba 1000 ishtirokchida o‘tkazildi', en: 'The experiment involved 1 000 participants' } },
      { label: { uz: 'Vizual ifoda har doim qiyin', en: 'Visual display is always harder' } },
    ],
  },
  {
    skill: 'sat-reading',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 150,
    passage: [
      'Sinflarda texnologiyani ishlatishning asosiy savoli uning tezligi emas, balki o‘quvchi qarorini mustaqil qabul qilishiga imkon berishi.',
      'The central question about classroom technology is not its speed but whether it lets the learner make decisions independently.',
    ],
    p: [
      'Muallif texnologiyaga bo‘lgan asosiy e’tiborni nimaga qaratadi?',
      'What does the author focus technology debates on?',
    ],
    options: [
      { label: { uz: 'Mustaqil qaror qabul qilish imkoniyatiga', en: 'On enabling independent decision-making' }, correct: true },
      { label: { uz: 'Tezlikka', en: 'On speed' } },
      { label: { uz: 'Narxiga', en: 'On cost' } },
      { label: { uz: 'O‘qituvchi mehnatiga', en: 'On teacher workload' } },
    ],
  },

  // ── sat-writing ────────────────────────────────────────────────────────
  {
    skill: 'sat-writing',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 90,
    p: [
      'Biror insonning arizasida eng kuchli taassurot qaysi biri?',
      'Which feature of an essay makes the strongest impression?',
    ],
    options: [
      { label: { uz: 'Aniq, o‘lchovli misol', en: 'A specific, concrete example' }, correct: true },
      { label: { uz: 'Uzun kirish qismi', en: 'A long introduction' } },
      { label: { uz: 'Ko‘p undirilgan so‘zlar', en: 'Many sophisticated words' } },
      { label: { uz: 'Qisqa xulosa', en: 'A short conclusion' } },
    ],
  },
  {
    skill: 'sat-writing',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 90,
    p: [
      'Kirish qismida quyidagilardan qaysi biri kamroq kutiladi?',
      'Which of these is least expected in an introduction?',
    ],
    options: [
      { label: { uz: 'Barcha dalillar keltirilishi', en: 'Listing every supporting point' }, correct: true },
      { label: { uz: 'Teza ochiq aytilishi', en: 'A clear thesis statement' } },
      { label: { uz: 'Mavzuga qiziqish chorasi', en: 'A hook related to the topic' } },
      { label: { uz: 'Savol qo‘yish', en: 'Posing a question' } },
    ],
  },
  {
    skill: 'sat-writing',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 120,
    p: [
      'Asosiy fikr (thesis) qanday shaklda bo‘lishi kerak?',
      'How should a thesis statement be written?',
    ],
    options: [
      { label: {
        uz: 'Aniq da’vo qilib, dalillar bilan kuzatilishi mumkin bo‘lsin',
        en: 'Make a clear claim that can be supported by evidence',
      }, correct: true },
      { label: { uz: 'Faqat savol ko‘rinishida', en: 'Only as a question' } },
      { label: { uz: 'Ma’lumotni qayta sanash', en: 'Restating known information' } },
      { label: { uz: 'Qaror yakunida qolishi', en: 'Left until the conclusion' } },
    ],
  },
  {
    skill: 'sat-writing',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 150,
    p: [
      'Qarshi argumentni keltirgandan keyin eng to‘g‘ri usul qaysi?',
      'After presenting a counterargument, what is the best next step?',
    ],
    options: [
      { label: {
        uz: 'Uni tanib olish va asosiy tezani mustahkamlash',
        en: 'Acknowledge it and reinforce your thesis',
      }, correct: true },
      { label: { uz: 'Uni butunlay rad etish', en: 'Dismiss it entirely' } },
      { label: { uz: 'Uni yana uzoqroq takrorlash', en: 'Repeat it at greater length' } },
      { label: { uz: 'Undan keyin yangi savol qo‘yish', en: 'Pose a new question afterwards' } },
    ],
  },
  {
    skill: 'sat-writing',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 150,
    p: [
      'Xulosa qismida qanday xato eng ko‘p uchraydi?',
      'Which mistake is most common in conclusions?',
    ],
    options: [
      { label: { uz: 'Yangi dalil keltirish', en: 'Introducing new evidence' }, correct: true },
      { label: { uz: 'Teza qisqacha takrorlash', en: 'Restating the thesis briefly' } },
      { label: { uz: 'Kelingi kelajakni eslatish', en: 'Pointing forward' } },
      { label: { uz: 'Kirishga qaytish', en: 'Returning to the hook' } },
    ],
  },
  {
    skill: 'sat-writing',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 180,
    p: [
      'Ilmiy uslubda eng to‘g‘ri so‘z tanlovi qaysi?',
      'In academic writing, which word choice is most appropriate?',
    ],
    options: [
      { label: { uz: 'ko‘rsatdi (demonstrated)', en: 'demonstrated' }, correct: true },
      { label: { uz: 'juda yaxshi bo‘ldi', en: 'was really great' } },
      { label: { uz: 'nima ish qildi', en: 'did stuff' } },
      { label: { uz: 'juda tez o‘zgardi', en: 'changed super fast' } },
    ],
  },

  // ── sat-vocab ──────────────────────────────────────────────────────────
  {
    skill: 'sat-vocab',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 45,
    p: [
      '"Munosib" so‘zining eng yaqin o‘rindoshi?',
      'Which word is closest in meaning to “appropriate”?',
    ],
    options: [
      { label: { uz: 'mos', en: 'suitable' }, correct: true },
      { label: { uz: 'qiyin', en: 'difficult' } },
      { label: { uz: 'tez', en: 'quick' } },
      { label: { uz: 'eski', en: 'old' } },
    ],
  },
  {
    skill: 'sat-vocab',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 45,
    p: [
      '"Alohida" so‘zining teskari ma’nosi?',
      'Which word is the closest opposite of “isolated”?',
    ],
    options: [
      { label: { uz: 'jamaviy', en: 'collective' }, correct: true },
      { label: { uz: 'yaqin', en: 'near' } },
      { label: { uz: 'jim', en: 'quiet' } },
      { label: { uz: 'sekin', en: 'slow' } },
    ],
  },
  {
    skill: 'sat-vocab',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 60,
    p: [
      '"Kamaytirmoq" (mitigate) so‘zining taxminan ma’nosi?',
      'What does “mitigate” roughly mean?',
    ],
    options: [
      { label: { uz: 'Yumshoqligini kamaytirish', en: 'To make less severe' }, correct: true },
      { label: { uz: 'Butunlay yo‘q qilish', en: 'To eliminate completely' } },
      { label: { uz: 'Ko‘paytirish', en: 'To increase' } },
      { label: { uz: 'O‘lchash', en: 'To measure' } },
    ],
  },
  {
    skill: 'sat-vocab',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 60,
    p: [
      '"Barqaror" (sustainable) so‘zi qaysi kontekstda to‘g‘ri ishlatiladi?',
      'In which context is “sustainable” used correctly?',
    ],
    options: [
      { label: { uz: 'Uzoq muddatli resurslarni buzmaydigan', en: 'Not depleting resources over the long term' }, correct: true },
      { label: { uz: 'Tez o‘lchadigan', en: 'Quickly measurable' } },
      { label: { uz: 'Qimmat', en: 'Expensive' } },
      { label: { uz: 'O‘zgaruvchan', en: 'Changeable' } },
    ],
  },
  {
    skill: 'sat-vocab',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 75,
    p: [
      'Gapda: "Tadqiqot natijalari ba’zi o‘qituvchilarning taxminini yoxshilamagan." Bu yerda "yaxshilamagan" nimani bildiradi?',
      'In: “The study results did not improve some teachers’ assumptions.” What does “improve” imply here?',
    ],
    options: [
      { label: { uz: 'Taxminlarni kuchaytirmadi', en: 'It did not strengthen the assumptions' }, correct: true },
      { label: { uz: 'Taxminlarni butunlay rad etdi', en: 'It disproved them entirely' } },
      { label: { uz: 'Taxminlarni o‘zgartirmadi', en: 'It changed nothing in them' } },
      { label: { uz: 'Taxminlarni aniqlashtirmadi', en: 'It clarified them' } },
    ],
  },
  {
    skill: 'sat-vocab',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 75,
    p: [
      '"Darg‘ah" (paradox) so‘zi qaysi ma’noda ishlatilgan?',
      'Which statement uses “paradox” correctly?',
    ],
    options: [
      { label: {
        uz: 'Ko‘proq mashq qilgan talaba kam natija oldi — bu ko‘rinmas jarayon edi',
        en: 'The student who practised more scored lower — an apparent contradiction',
      }, correct: true },
      { label: { uz: 'Ikki xil natija keldi', en: 'Two different results appeared' } },
      { label: { uz: 'Savol berilmadi', en: 'No question was asked' } },
      { label: { uz: 'Natijalar tasdiqlanmadi', en: 'The results were not confirmed' } },
    ],
  },
  {
    skill: 'sat-vocab',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 90,
    p: [
      'Ustoz: “I cannot underscore how much your work has improved.” Bu gapda “underscore” qanday ma’noga ega?',
      'A tutor says: “I cannot underscore how much your work has improved.” What does “underscore” mean?',
    ],
    options: [
      { label: { uz: 'Ta’kidlash, ajratib ko‘rsatish', en: 'To emphasise, to highlight' }, correct: true },
      { label: { uz: 'Pastga chizish', en: 'To draw a line underneath' } },
      { label: { uz: 'Xavf ostida qoldirmoq', en: 'To leave in danger' } },
      { label: { uz: 'Hisobdan chiqarish', en: 'To subtract' } },
    ],
  },
  {
    skill: 'sat-vocab',
    type: 'MCQ_SINGLE',
    d: 2,
    sec: 90,
    p: [
      '"Ambigv" (ambiguous) so‘zi qanday usulda aniqlanadi?',
      'How is the meaning of “ambiguous” itself determined?',
    ],
    options: [
      { label: {
        uz: 'Uni turli talqinlarga yo‘l ochadigan ishlatish orqali',
        en: 'By how it is used to allow more than one interpretation',
      }, correct: true },
      { label: { uz: 'Uni lug‘atda birinchi marta uchraganini bilish orqali', en: 'By when it first appears in a dictionary' } },
      { label: { uz: 'Uni tarjima qilish orqali', en: 'By translating it' } },
      { label: { uz: 'Uni eslab qolish orqali', en: 'By remembering it' } },
    ],
  },
];