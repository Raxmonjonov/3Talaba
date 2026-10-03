import type { SeedQuestion } from '../types';

/** Logic: logic-basics (12), patterns (8), conditional (8) = 28. */
export const LOGIC_QUESTIONS: SeedQuestion[] = [
  // ── logic-basics ─────────────────────────────────────────────────────────
  {
    skill: 'logic-basics',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 60,
    passage: [
      'Barcha mushuklar sutemizvorilardir. Ba’zi sutemizvorilar uy hayvonlaridir.',
      'All cats are mammals. Some mammals are pets.',
    ],
    p: [
      'Qaysi javob albatta to‘g‘ri bo‘lishi kerak?',
      'What must be true?',
    ],
    options: [
      { label: { uz: 'Barcha mushuklar sutemizvor', en: 'All cats are mammals' }, correct: true },
      { label: { uz: 'Ba’zi mushuklar uy hayvoni', en: 'Some cats are pets' } },
      { label: { uz: 'Ba’zi mushuklar yirtqi', en: 'Some cats are predators' } },
      { label: { uz: 'Hech narsa', en: 'Nothing follows' } },
    ],
  },
  {
    skill: 'logic-basics',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 75,
    passage: [
      'Mushuklar itlar emas. Barcha itlar hayvonlardir.',
      'No cats are dogs. All dogs are animals.',
    ],
    p: [
      'Qaysi qat’iyat albatta to‘g‘ri bo‘lishi kerak?',
      'Which statement must be true?',
    ],
    options: [
      { label: { uz: 'Ba’zi mushuklar hayvon emas', en: 'Some cats are not animals' } },
      { label: { uz: 'Ba’zi hayvonlar mushuk emas', en: 'Some animals are not cats' }, correct: true },
      { label: { uz: 'Barcha mushuklar itlardan farqli', en: 'All cats are unlike dogs' } },
      { label: { uz: 'Barcha itlar mushuk emas', en: 'All dogs are not cats' } },
    ],
  },
  {
    skill: 'logic-basics',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 90,
    passage: [
      'Agar yomg‘ir yoysa, yer namlanadi. Yer quruq.',
      'If it rains, the ground gets wet. The ground is dry.',
    ],
    p: [
      'Nima xulosa qilinishi mumkin?',
      'What can be concluded?',
    ],
    options: [
      { label: { uz: 'Yomgir yog‘magan', en: 'It did not rain' }, correct: true },
      { label: { uz: 'Yomgir yotgan', en: 'It rained' } },
      { label: { uz: 'Yer quruq emas', en: 'The ground is not dry' } },
      { label: { uz: 'Xulosa chiqarib bo‘lmaydi', en: 'No conclusion is possible' } },
    ],
  },
  {
    skill: 'logic-basics',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 90,
    p: [
      '“Barcha A — B” da’vosining inkorini tanlang:',
      'Choose the negation of “All A are B”:',
    ],
    options: [
      { label: { uz: 'Ba’zi A B emas', en: 'Some A are not B' }, correct: true },
      { label: { uz: 'Ba’zi B A emas', en: 'Some B are not A' } },
      { label: { uz: 'Hech qanday A B emas', en: 'No A are B' } },
      { label: { uz: 'Barcha A B', en: 'All A are B' } },
    ],
  },
  {
    skill: 'logic-basics',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 120,
    passage: [
      'X, Y va Z dan har biri matematikada yoki fizikada yoki ikkalasida ham ixtisoslashgan. X fizikada emas. Y ham, Z ham fizikada emas.',
      'Each of X, Y and Z specialises in mathematics, physics, or both. X is not in physics. Neither Y nor Z is in physics.',
    ],
    p: [
      'Xulosa?',
      'Conclusion?',
    ],
    options: [
      { label: { uz: 'Uchchalasi ham faqat matematikada', en: 'All three specialise only in mathematics' }, correct: true },
      { label: { uz: 'X fizikada ham ixtisoslashgan', en: 'X also specialises in physics' } },
      { label: { uz: 'Kamida bitta faqat matematikada', en: 'At least one specialises only in mathematics' } },
      { label: { uz: 'Xulosa chiqarib bo‘lmaydi', en: 'No conclusion is possible' } },
    ],
  },
  {
    skill: 'logic-basics',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 150,
    passage: [
      'Barcha o‘qituvchilar talabalar uchun rag‘bat yaratadi. Ba’zi talabalar rag‘batlanadi.',
      'All teachers motivate students. Some students are motivated.',
    ],
    p: [
      'Qaysi xulosa to‘g‘ri?',
      'Which conclusion is correct?',
    ],
    options: [
      { label: { uz: 'Rag‘batlanuvchi talabalarning ba’zi o‘qituvchilari bor', en: 'Some motivated students have teachers' }, correct: true },
      { label: { uz: 'Barcha rag‘batlanuvchi talabalar o‘qituvchiga ega', en: 'All motivated students have a teacher' } },
      { label: { uz: 'Ba’zi o‘qituvchilar rag‘batlanmaydi', en: 'Some teachers do not motivate' } },
      { label: { uz: 'Xulosa chiqarib bo‘lmaydi', en: 'No conclusion is possible' } },
    ],
  },
  {
    skill: 'logic-basics',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 150,
    p: [
      'Qaysi qator to‘liq inkor (contraposition) konversiyasi?',
      'Which option is the contrapositive of the full negation?',
    ],
    options: [
      { label: {
        uz: 'Barcha darslar tayyorlangan → barcha darslar o‘qitilgan',
        en: 'All lessons prepared → all lessons taught',
      }, correct: true },
      { label: {
        uz: 'Barcha darslar o‘qitilgan → barcha darslar tayyorlangan',
        en: 'All lessons taught → all lessons prepared',
      } },
      { label: {
        uz: 'Ba’zi darslar o‘qitilmagan → barcha darslar tayyor emas',
        en: 'Some lessons not taught → all lessons not prepared',
      } },
      { label: {
        uz: 'Hech qanday dars o‘qitilmagan',
        en: 'No lesson taught',
      } },
    ],
  },
  {
    skill: 'logic-basics',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 180,
    passage: [
      'Tajriba natijasi: A guruhida 8/20, B guruhida 12/20 muvaffaqiyatli bo‘ldi.',
      'Experiment results: group A 8/20 succeeded, group B 12/20 succeeded.',
    ],
    p: [
      'Qaysi xulosa faqat raqamlardan kelib chiqadi?',
      'Which conclusion follows from the numbers alone?',
    ],
    options: [
      { label: { uz: 'B guruhida muvaffaqiyat ulushi yuqoriroq', en: 'The success share is higher in group B' }, correct: true },
      { label: { uz: 'B usuli samaraliroq', en: 'Method B is more effective' } },
      { label: { uz: 'B guruhi ishonchliroq natija berdi', en: 'Group B produced more reliable results' } },
      { label: { uz: 'A guruhi muvaffaqiyatsiz', en: 'Group A failed' } },
    ],
  },
  {
    skill: 'logic-basics',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 210,
    p: [
      'Qanday sharoitda P → Q "tinch" (valid) hisoblanadi?',
      'When is the argument P → Q valid?',
    ],
    options: [
      { label: { uz: 'P chindan ham yolg‘on bo‘lganda', en: 'When P is in fact false' }, correct: true },
      { label: { uz: 'Q chindan ham rost bo‘lganda', en: 'When Q is in fact true' } },
      { label: { uz: 'Ikkalasi ham chindan rost bo‘lganda', en: 'When both are in fact true' } },
      { label: { uz: 'Hech qachon', en: 'Never' } },
    ],
  },
  {
    skill: 'logic-basics',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 210,
    passage: [
      'Qoidani buzish — qoidani bilish — qoidani o‘zgartirish.',
      'To break a rule is to know a rule is to change a rule.',
    ],
    p: [
      'Agar "qoidani bilish" — "qoidani buzish" desangiz, unda "qoidani buzish" nima bilan bir qilinadi?',
      'If “knowing a rule” is “breaking a rule”, what is “breaking a rule” the same as?',
    ],
    options: [
      { label: { uz: 'Qoidani o‘zgartirish', en: 'Changing a rule' }, correct: true },
      { label: { uz: 'Qoidani bilish', en: 'Knowing a rule' } },
      { label: { uz: 'Qoidani saqlash', en: 'Keeping a rule' } },
      { label: { uz: 'Qoidalarni o‘rganish', en: 'Learning rules' } },
    ],
  },
  {
    skill: 'logic-basics',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 240,
    passage: [
      'A faqat B bo‘lsa bor. B — D ning bir qismi.',
      'A exists only if B. B is part of D.',
    ],
    p: [
      'A ga nima to‘g‘ri keladi?',
      'What follows about A?',
    ],
    options: [
      { label: { uz: 'A — D ning bir qismi', en: 'A is part of D' }, correct: true },
      { label: { uz: 'D — A ning bir qismi', en: 'D is part of A' } },
      { label: { uz: 'A va D teng', en: 'A and D are equal' } },
      { label: { uz: 'A D dan mustaqil', en: 'A is independent of D' } },
    ],
  },
  {
    skill: 'logic-basics',
    type: 'MCQ_SINGLE',
    d: 2,
    sec: 270,
    passage: [
      'Ba’zi bituvchi imtihonlar oson, ba’zilari qiyin. Hech bir imtihon ham oson, ham qiyin emas.',
      'Some final exams are easy, some are hard. No exam is both easy and hard.',
    ],
    p: [
      'Natijada nimani aytish mumkin?',
      'What can be said as a result?',
    ],
    options: [
      { label: { uz: 'Kamida bitta imtihon oson yoki qiyin', en: 'At least one exam is easy or hard' }, correct: true },
      { label: { uz: 'Barcha imtihonlar oson', en: 'All exams are easy' } },
      { label: { uz: 'Barcha imtihonlar qiyin', en: 'All exams are hard' } },
      { label: { uz: 'Imtihonlar kam', en: 'There are few exams' } },
    ],
  },

  // ── logic-patterns ───────────────────────────────────────────────────────
  {
    skill: 'logic-patterns',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 60,
    p: [
      'Keyingi son qaysi: 2, 4, 8, 16, …?',
      'What comes next: 2, 4, 8, 16, …?',
    ],
    options: [
      { label: { uz: '20', en: '20' } },
      { label: { uz: '32', en: '32' }, correct: true },
      { label: { uz: '18', en: '18' } },
      { label: { uz: '64', en: '64' } },
    ],
  },
  {
    skill: 'logic-patterns',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 75,
    p: [
      'Keyingi son qaysi: 1, 1, 2, 3, 5, …?',
      'What comes next: 1, 1, 2, 3, 5, …?',
    ],
    options: [
      { label: { uz: '7', en: '7' } },
      { label: { uz: '8', en: '8' }, correct: true },
      { label: { uz: '9', en: '9' } },
      { label: { uz: '6', en: '6' } },
    ],
  },
  {
    skill: 'logic-patterns',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 75,
    p: [
      'Keyingi son qaysi: 1, 4, 9, 16, …?',
      'What comes next: 1, 4, 9, 16, …?',
    ],
    options: [
      { label: { uz: '20', en: '20' } },
      { label: { uz: '25', en: '25' }, correct: true },
      { label: { uz: '18', en: '18' } },
      { label: { uz: '24', en: '24' } },
    ],
  },
  {
    skill: 'logic-patterns',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 90,
    p: [
      'Keyingi harf qaysi: A, C, E, G, …?',
      'What comes next: A, C, E, G, …?',
    ],
    options: [
      { label: { uz: 'H', en: 'H' } },
      { label: { uz: 'I', en: 'I' }, correct: true },
      { label: { uz: 'K', en: 'K' } },
      { label: { uz: 'J', en: 'J' } },
    ],
  },
  {
    skill: 'logic-patterns',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 120,
    p: [
      'Keyingi son qaysi: 1, 3, 6, 10, 15, …?',
      'What comes next: 1, 3, 6, 10, 15, …?',
    ],
    options: [
      { label: { uz: '20', en: '20' } },
      { label: { uz: '21', en: '21' }, correct: true },
      { label: { uz: '18', en: '18' } },
      { label: { uz: '25', en: '25' } },
    ],
  },
  {
    skill: 'logic-patterns',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 150,
    p: [
      'Keyingi harf qaysi: Z, X, V, T, …?',
      'What comes next: Z, X, V, T, …?',
    ],
    options: [
      { label: { uz: 'R', en: 'R' }, correct: true },
      { label: { uz: 'S', en: 'S' } },
      { label: { uz: 'U', en: 'U' } },
      { label: { uz: 'W', en: 'W' } },
    ],
  },
  {
    skill: 'logic-patterns',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 180,
    p: [
      'Keyingi son qaysi: 2, 6, 12, 20, 30, …?',
      'What comes next: 2, 6, 12, 20, 30, …?',
    ],
    options: [
      { label: { uz: '36', en: '36' } },
      { label: { uz: '42', en: '42' }, correct: true },
      { label: { uz: '40', en: '40' } },
      { label: { uz: '44', en: '44' } },
    ],
  },
  {
    skill: 'logic-patterns',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 210,
    p: [
      'Keyingi son qaysi: 5, 9, 18, 31, 49, …?',
      'What comes next: 5, 9, 18, 31, 49, …?',
    ],
    options: [
      { label: { uz: '62', en: '62' } },
      { label: { uz: '72', en: '72' }, correct: true },
      { label: { uz: '68', en: '68' } },
      { label: { uz: '79', en: '79' } },
    ],
  },

  // ── logic-conditional ────────────────────────────────────────────────────
  {
    skill: 'logic-conditional',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 120,
    passage: [
      'Hamma A — B. Ba’zi B — C. Yana: hech qanday B — D emas.',
      'All A are B. Some B are C. Also, no B is D.',
    ],
    p: [
      'Qaysi jumla chindan ham rost?',
      'Which statement is definitely true?',
    ],
    options: [
      { label: { uz: 'Ba’zi C — D emas', en: 'Some C are not D' }, correct: true },
      { label: { uz: 'Barcha C — A', en: 'All C are A' } },
      { label: { uz: 'Ba’zi A — C', en: 'Some A are C' } },
      { label: { uz: 'Barcha B — D emas', en: 'All B are not D' } },
    ],
  },
  {
    skill: 'logic-conditional',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 150,
    passage: [
      'Agar o‘quvchi imtihonni topshirsa, u baho oladi. U baho olmagan.',
      'If a student submits the exam, then they receive a grade. They did not receive a grade.',
    ],
    p: [
      'Qanday xulosa to‘g‘ri keladi?',
      'What conclusion follows?',
    ],
    options: [
      { label: { uz: 'O‘quvchi imtihonni topshirmagan', en: 'The student did not submit the exam' }, correct: true },
      { label: { uz: 'O‘quvchi imtihonni topshirmagan bo‘lishi mumkin emas', en: 'It is impossible the student submitted it' } },
      { label: { uz: 'O‘quvchi baho olgan', en: 'The student received a grade' } },
      { label: { uz: 'Xulosa chiqarib bo‘lmaydi', en: 'No conclusion follows' } },
    ],
  },
  {
    skill: 'logic-conditional',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 180,
    passage: [
      'Kitobni o‘qigan kishi uni tushunadi. Ba’zi kishilar kitobni tushunmagan.',
      'Anyone who read the book understood it. Some people did not understand the book.',
    ],
    p: [
      'Bu qaysi shaklda?',
      'What form is this?',
    ],
    options: [
      { label: { uz: 'Modus tollens', en: 'Modus tollens' }, correct: true },
      { label: { uz: 'Modus ponens', en: 'Modus ponens' } },
      { label: { uz: 'Chainsaw syllogizm', en: 'Chainsaw syllogism' } },
      { label: { uz: 'Affirming the consequent', en: 'Affirming the consequent' } },
    ],
  },
  {
    skill: 'logic-conditional',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 180,
    p: [
      'Qanday sharoitda "P → Q" ning konversasi xato bo‘ladi?',
      'When is the converse of “P → Q” invalid?',
    ],
    options: [
      { label: { uz: 'Q → P har doim ham to‘g‘ri bo‘lmasa', en: 'Whenever Q → P is not also true' }, correct: true },
      { label: { uz: 'Faqat P rost bo‘lganda', en: 'Only when P is true' } },
      { label: { uz: 'Faqat Q yolg‘on bo‘lganda', en: 'Only when Q is false' } },
      { label: { uz: 'Hech qachon xato bo‘lmaydi', en: 'It is never invalid' } },
    ],
  },
  {
    skill: 'logic-conditional',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 210,
    passage: [
      'Faqat mendi kitob o‘qigan talabalar muvaffaqiyatli bo‘ldi.',
      'Only students who read my book became successful.',
    ],
    p: [
      'Bu qaysi tipdagi shartli?',
      'What type of conditional is this?',
    ],
    options: [
      { label: { uz: 'Faqatlik ("only … then")', en: 'Only-if (“only … then”)' }, correct: true },
      { label: { uz: 'Yetarlik ("if … then")', en: 'Sufficient (“if … then”)' } },
      { label: { uz: 'Konditsional tanlov', en: 'Conditional choice' } },
      { label: { uz: 'Ekvivalentlik', en: 'Equivalence' } },
    ],
  },
  {
    skill: 'logic-conditional',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 240,
    passage: [
      'P: "Ishonchli odam do‘stlari bilan yolg‘on gapirmaydi."',
      'P: “A trustworthy person never lies to their friends.”',
    ],
    p: [
      'Qaysi hodisa P ni inkor qiladi?',
      'Which event falsifies P?',
    ],
    options: [
      { label: { uz: 'Ishonchli odam do‘stiga yolg‘on dedi', en: 'A trustworthy person lied to a friend' }, correct: true },
      { label: { uz: 'Ishonchli odam yolg‘on dedi', en: 'A trustworthy person lied' } },
      { label: { uz: 'Ishonchsiz odam do‘stiga yolg‘on dedi', en: 'An untrustworthy person lied to a friend' } },
      { label: { uz: 'Do‘st yolg‘on gapirdi', en: 'A friend lied' } },
    ],
  },
  {
    skill: 'logic-conditional',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 270,
    passage: [
      'Agar shunday bo‘lsa: (1) hammaga ko‘ra yaxshi, (2) hech kim yomonlik ko‘rmaydi.',
      'Suppose: (1) it is good for everyone, (2) no one gets hurt.',
    ],
    p: [
      'Ikki shartni birlashtirish uchun qaysi shakl kerak?',
      'Which form is needed to combine the two conditions?',
    ],
    options: [
      { label: { uz: 'P → Q, Q → R, demak P → R', en: 'P → Q, Q → R, therefore P → R' }, correct: true },
      { label: { uz: 'P va Q → R', en: 'P and Q → R' } },
      { label: { uz: 'P yoki Q → R', en: 'P or Q → R' } },
      { label: { uz: 'R → P va Q', en: 'R → P and Q' } },
    ],
  },
  {
    skill: 'logic-conditional',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 300,
    passage: [
      'Barcha oqilona qarorlar dalilga asoslanadi. Ba’zi qarorlar natija bermaydi.',
      'All wise decisions are based on evidence. Some decisions produce no result.',
    ],
    p: [
      'Qanday asoslash xarakterli?',
      'What kind of reasoning is this?',
    ],
    options: [
      { label: { uz: 'Indeksiyalangan (mantiqiy) xulosa', en: 'Indexed (logical) inference' }, correct: true },
      { label: { uz: 'Tasodifiy taxmin', en: 'Random guess' } },
      { label: { uz: 'Taxminiy (abdukktiv)', en: 'Abductive' } },
      { label: { uz: 'Analogik', en: 'Analogical' } },
    ],
  },
];