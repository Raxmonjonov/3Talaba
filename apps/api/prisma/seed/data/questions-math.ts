import type { SeedQuestion } from '../types';

/** Mathematics: arithmetic (8), algebra (8), geometry (8), word problems (8) = 32. */
export const MATH_QUESTIONS: SeedQuestion[] = [
  // ── math-arithmetic ──────────────────────────────────────────────────────
  {
    skill: 'math-arithmetic',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 45,
    p: [
      'Hisoblang: 0.36 × 25',
      'Calculate: 0.36 × 25',
    ],
    options: [
      { label: { uz: '9', en: '9' }, correct: true, accepts: ['9', '9.0'] },
      { label: { uz: '0.9', en: '0.9' } },
      { label: { uz: '90', en: '90' } },
      { label: { uz: '0.09', en: '0.09' } },
    ],
  },
  {
    skill: 'math-arithmetic',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 45,
    p: [
      '18/24 kasrini soddalashtiring.',
      'Simplify the fraction 18/24.',
    ],
    options: [
      { label: { uz: '3/4', en: '3/4' }, correct: true, accepts: ['3/4', '0.75'] },
      { label: { uz: '2/3', en: '2/3' } },
      { label: { uz: '3/2', en: '3/2' } },
      { label: { uz: '6/8', en: '6/8' } },
    ],
  },
  {
    skill: 'math-arithmetic',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 60,
    p: [
      '240 ning 15% i nechaga teng?',
      'What is 15% of 240?',
    ],
    options: [
      { label: { uz: '36', en: '36' }, correct: true, accepts: ['36'] },
      { label: { uz: '24', en: '24' } },
      { label: { uz: '40', en: '40' } },
      { label: { uz: '16', en: '16' } },
    ],
  },
  {
    skill: 'math-arithmetic',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 60,
    p: [
      '2⁵ ning qiymati nechaga teng?',
      'What is the value of 2⁵?',
    ],
    options: [
      { label: { uz: '32', en: '32' }, correct: true, accepts: ['32'] },
      { label: { uz: '16', en: '16' } },
      { label: { uz: '64', en: '64' } },
      { label: { uz: '25', en: '25' } },
    ],
  },
  {
    skill: 'math-arithmetic',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 75,
    p: [
      'Qaysi kasr eng katta?',
      'Which fraction is the largest?',
    ],
    options: [
      { label: { uz: '7/12', en: '7/12' }, correct: true },
      { label: { uz: '5/8', en: '5/8' } },
      { label: { uz: '3/5', en: '3/5' } },
      { label: { uz: '4/7', en: '4/7' } },
    ],
  },
  {
    skill: 'math-arithmetic',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 75,
    p: [
      'How many integers lie between 100 and 200, inclusive of both ends but exclusive of endpoints?',
      'How many integers lie strictly between 100 and 200?',
    ],
    options: [
      { label: { uz: '99', en: '99' }, correct: true, accepts: ['99'] },
      { label: { uz: '100', en: '100' } },
      { label: { uz: '98', en: '98' } },
      { label: { uz: '101', en: '101' } },
    ],
  },
  {
    skill: 'math-arithmetic',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 90,
    p: [
      '3.14159 ni ikki xonali kasrga yaxlitlang.',
      'Round 3.14159 to two decimal places.',
    ],
    options: [
      { label: { uz: '3.14', en: '3.14' }, correct: true, accepts: ['3.14'] },
      { label: { uz: '3.15', en: '3.15' } },
      { label: { uz: '3.141', en: '3.141' } },
      { label: { uz: '3.1', en: '3.1' } },
    ],
  },
  {
    skill: 'math-arithmetic',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 90,
    p: [
      '6 va 14 ning eng kichik umumiy ko’paytuvchisi necha?',
      'What is the least common multiple of 6 and 14?',
    ],
    options: [
      { label: { uz: '42', en: '42' }, correct: true, accepts: ['42'] },
      { label: { uz: '84', en: '84' } },
      { label: { uz: '28', en: '28' } },
      { label: { uz: '21', en: '21' } },
    ],
  },

  // ── math-algebra ─────────────────────────────────────────────────────────
  {
    skill: 'math-algebra',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 90,
    p: [
      'Tenglamani yeching: 3x − 7 = 14',
      'Solve for x: 3x − 7 = 14',
    ],
    options: [
      { label: { uz: '7', en: '7' }, correct: true, accepts: ['7'] },
      { label: { uz: '5', en: '5' } },
      { label: { uz: '9', en: '9' } },
      { label: { uz: '21', en: '21' } },
    ],
  },
  {
    skill: 'math-algebra',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 90,
    p: [
      'Soddalashtiring: (2x³y²)/(4xy²)',
      'Simplify: (2x³y²)/(4xy²)',
    ],
    options: [
      { label: { uz: 'x²/2', en: 'x²/2' }, correct: true },
      { label: { uz: '2x²', en: '2x²' } },
      { label: { uz: 'x³/2', en: 'x³/2' } },
      { label: { uz: 'x²/4', en: 'x²/4' } },
    ],
  },
  {
    skill: 'math-algebra',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 120,
    p: [
      'To’liq ko’paytuvchilarga ajrating: x² − 5x + 6',
      'Factor completely: x² − 5x + 6',
    ],
    options: [
      { label: { uz: '(x − 2)(x − 3)', en: '(x − 2)(x − 3)' }, correct: true },
      { label: { uz: '(x + 2)(x + 3)', en: '(x + 2)(x + 3)' } },
      { label: { uz: '(x − 1)(x − 6)', en: '(x − 1)(x − 6)' } },
      { label: { uz: '(x − 5)(x + 1)', en: '(x − 5)(x + 1)' } },
    ],
  },
  {
    skill: 'math-algebra',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 120,
    p: [
      'Agar f(x) = 2x + 1 bo‘lsa, f(4) nechaga teng?',
      'If f(x) = 2x + 1, what is f(4)?',
    ],
    options: [
      { label: { uz: '9', en: '9' }, correct: true, accepts: ['9'] },
      { label: { uz: '7', en: '7' } },
      { label: { uz: '8', en: '8' } },
      { label: { uz: '10', en: '10' } },
    ],
  },
  {
    skill: 'math-algebra',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 150,
    passage: [
      'Chiziqli funksiya f(x) = mx + c ko‘rinishida yozilgan. Berilganlar: f(3) = 11 va f(5) = 19.',
      'A linear function is written as f(x) = mx + c. You are given f(3) = 11 and f(5) = 19.',
    ],
    p: [
      'm ning qiymati nechaga teng?',
      'What is the value of m?',
    ],
    options: [
      { label: { uz: '4', en: '4' }, correct: true, accepts: ['4'] },
      { label: { uz: '8', en: '8' } },
      { label: { uz: '2', en: '2' } },
      { label: { uz: '11', en: '11' } },
    ],
  },
  {
    skill: 'math-algebra',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 150,
    p: [
      'Tengsizlikni yeching: 5x − 3 > 12',
      'Solve the inequality: 5x − 3 > 12',
    ],
    options: [
      { label: { uz: 'x > 3', en: 'x > 3' }, correct: true },
      { label: { uz: 'x < 3', en: 'x < 3' } },
      { label: { uz: 'x > 15', en: 'x > 15' } },
      { label: { uz: 'x < 15', en: 'x < 15' } },
    ],
  },
  {
    skill: 'math-algebra',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 180,
    passage: [
      'Uchta ketma-ket juft butun sonning yig‘indisi 84 ga teng.',
      'The sum of three consecutive even integers is 84.',
    ],
    p: [
      'Ulardan eng kattasi nechaga teng?',
      'What is the largest of them?',
    ],
    options: [
      { label: { uz: '30', en: '30' }, correct: true, accepts: ['30'] },
      { label: { uz: '28', en: '28' } },
      { label: { uz: '32', en: '32' } },
      { label: { uz: '26', en: '26' } },
    ],
  },
  {
    skill: 'math-algebra',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 210,
    passage: [
      'Chiziq (2, 5) va (6, 13) nuqtalaridan o‘tadi.',
      'A line passes through (2, 5) and (6, 13).',
    ],
    p: [
      'Bu chiziqning y o’qidagi kesimi nechaga teng?',
      'What is the y-intercept of this line?',
    ],
    options: [
      { label: { uz: '3', en: '3' }, correct: true, accepts: ['3'] },
      { label: { uz: '2', en: '2' } },
      { label: { uz: '1', en: '1' } },
      { label: { uz: '4', en: '4' } },
    ],
  },

  // ── math-geometry ────────────────────────────────────────────────────────
  {
    skill: 'math-geometry',
    type: 'MCQ_SINGLE',
    d: -2,
    sec: 90,
    p: [
      'Uzunligi 8 sm, kengligi 5 sm bo‘lgan to‘g’ri to‘rtburchakning yuzasi qancha?',
      'What is the area of a rectangle with length 8 cm and width 5 cm?',
    ],
    options: [
      { label: { uz: '40 cm²', en: '40 cm²' }, correct: true, accepts: ['40'] },
      { label: { uz: '26 cm²', en: '26 cm²' } },
      { label: { uz: '13 cm²', en: '13 cm²' } },
      { label: { uz: '80 cm²', en: '80 cm²' } },
    ],
  },
  {
    skill: 'math-geometry',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 90,
    p: [
      'Radiusi 5 sm bo‘lgan aylananing uzunligi qancha? (π = 3.14 deb oling)',
      'What is the circumference of a circle with radius 5 cm? (Use π = 3.14)',
    ],
    options: [
      { label: { uz: '31.4 cm', en: '31.4 cm' }, correct: true, accepts: ['31.4'] },
      { label: { uz: '15.7 cm', en: '15.7 cm' } },
      { label: { uz: '78.5 cm', en: '78.5 cm' } },
      { label: { uz: '25 cm', en: '25 cm' } },
    ],
  },
  {
    skill: 'math-geometry',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 120,
    p: [
      'Kataklari 6 va 8 bo‘lgan to‘g‘ri uchburchakning gipotenuzasi necha?',
      'What is the hypotenuse of a right triangle with legs 6 and 8?',
    ],
    options: [
      { label: { uz: '10', en: '10' }, correct: true, accepts: ['10'] },
      { label: { uz: '12', en: '12' } },
      { label: { uz: '14', en: '14' } },
      { label: { uz: '48', en: '48' } },
    ],
  },
  {
    skill: 'math-geometry',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 120,
    p: [
      'Uchburchakda ikki burchak 50° va 60° ga teng. Uchinchi burchak qancha?',
      'In a triangle, two angles measure 50° and 60°. What is the third angle?',
    ],
    options: [
      { label: { uz: '70°', en: '70°' }, correct: true, accepts: ['70'] },
      { label: { uz: '80°', en: '80°' } },
      { label: { uz: '60°', en: '60°' } },
      { label: { uz: '90°', en: '90°' } },
    ],
  },
  {
    skill: 'math-geometry',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 150,
    passage: [
      'Silindrning radiusi 3 sm, balandligi 10 sm. π = 3.14 deb oling.',
      'A cylinder has radius 3 cm and height 10 cm. Use π = 3.14.',
    ],
    p: [
      'Silindrning umumiy yuzasi qancha?',
      'What is the total surface area of the cylinder?',
    ],
    options: [
      { label: { uz: '244.92 cm²', en: '244.92 cm²' }, correct: true, accepts: ['244.92'] },
      { label: { uz: '94.2 cm²', en: '94.2 cm²' } },
      { label: { uz: '150.72 cm²', en: '150.72 cm²' } },
      { label: { uz: '282 cm²', en: '282 cm²' } },
    ],
  },
  {
    skill: 'math-geometry',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 180,
    p: [
      'Tomoni 4 sm bo‘lgan kubning hajmi qancha?',
      'What is the volume of a cube whose side is 4 cm?',
    ],
    options: [
      { label: { uz: '64 cm³', en: '64 cm³' }, correct: true, accepts: ['64'] },
      { label: { uz: '16 cm³', en: '16 cm³' } },
      { label: { uz: '48 cm³', en: '48 cm³' } },
      { label: { uz: '12 cm²', en: '12 cm²' } },
    ],
  },
  {
    skill: 'math-geometry',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 210,
    p: [
      'To‘rtburchakning burchaklari yig‘indisi necha darajaga teng?',
      'The angles of a quadrilateral sum to how many degrees?',
    ],
    options: [
      { label: { uz: '360°', en: '360°' }, correct: true, accepts: ['360'] },
      { label: { uz: '180°', en: '180°' } },
      { label: { uz: '540°', en: '540°' } },
      { label: { uz: '720°', en: '720°' } },
    ],
  },
  {
    skill: 'math-geometry',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 240,
    passage: [
      'Muntazam oltiburchakning tomoni 4 sm. √3 ≈ 1.732 deb oling.',
      'A regular hexagon has side length 4 cm. Use √3 ≈ 1.732.',
    ],
    p: [
      'Oltiburchakning yuzasi qancha? (A = (3√3/2)s²)',
      'What is the area of the hexagon? (A = (3√3/2)s²)',
    ],
    options: [
      { label: { uz: '≈ 41.57 cm²', en: '≈ 41.57 cm²' }, correct: true, accepts: ['41.57', '41.568', '24√3'] },
      { label: { uz: '≈ 24 cm²', en: '≈ 24 cm²' } },
      { label: { uz: '≈ 16 cm²', en: '≈ 16 cm²' } },
      { label: { uz: '≈ 48 cm²', en: '≈ 48 cm²' } },
    ],
  },

  // ── math-word-problems ───────────────────────────────────────────────────
  {
    skill: 'math-word-problems',
    type: 'MCQ_SINGLE',
    d: -1.5,
    sec: 120,
    passage: [
      'Kitobning dastlabki narxi 12 000 so‘m. Avval narx 20% ga tushiriladi, keyin 25% ga oshiriladi.',
      'A book originally costs 12 000 so‘m. The price is first reduced by 20% and then increased by 25%.',
    ],
    p: [
      'Yakuniy narx qancha?',
      'What is the final price?',
    ],
    options: [
      { label: { uz: '12 000', en: '12 000' }, correct: true, accepts: ['12000', '12 000'] },
      { label: { uz: '9 600', en: '9 600' } },
      { label: { uz: '14 400', en: '14 400' } },
      { label: { uz: '11 000', en: '11 000' } },
    ],
  },
  {
    skill: 'math-word-problems',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 150,
    passage: [
      'Trenk 3 soat davomida doimiy tezlik bilan 240 km yo‘l bosadi.',
      'A train travels 240 km in 3 hours at constant speed.',
    ],
    p: [
      'Uning tezligi qancha?',
      'What is its speed?',
    ],
    options: [
      { label: { uz: '80 km/h', en: '80 km/h' }, correct: true, accepts: ['80'] },
      { label: { uz: '60 km/h', en: '60 km/h' } },
      { label: { uz: '720 km/h', en: '720 km/h' } },
      { label: { uz: '90 km/h', en: '90 km/h' } },
    ],
  },
  {
    skill: 'math-word-problems',
    type: 'MCQ_SINGLE',
    d: -1,
    sec: 180,
    passage: [
      '3 litr sharbat konsentrati 5 litr suv bilan aralashtirilsa, 8 litrlik aralashma hosil bo‘ladi.',
      'Mixing 3 L of juice concentrate with 5 L of water gives an 8 L mixture.',
    ],
    p: [
      'Aralashmaning qancha qismi konsentrant?',
      'What fraction of the mixture is concentrate?',
    ],
    options: [
      { label: { uz: '3/8', en: '3/8' }, correct: true, accepts: ['3/8', '0.375'] },
      { label: { uz: '5/8', en: '5/8' } },
      { label: { uz: '3/5', en: '3/5' } },
      { label: { uz: '8/3', en: '8/3' } },
    ],
  },
  {
    skill: 'math-word-problems',
    type: 'MCQ_SINGLE',
    d: -0.5,
    sec: 180,
    passage: [
      'Ali 6 kun davomida kuniga 15 sahifa, keyin 4 kun davomida kuniga 20 sahifa o‘qidi.',
      'Ali reads 15 pages a day for 6 days, then 20 pages a day for 4 days.',
    ],
    p: [
      'U jami necha sahifa o‘qigan?',
      'How many pages did he read in total?',
    ],
    options: [
      { label: { uz: '170', en: '170' }, correct: true, accepts: ['170'] },
      { label: { uz: '160', en: '160' } },
      { label: { uz: '150', en: '150' } },
      { label: { uz: '180', en: '180' } },
    ],
  },
  {
    skill: 'math-word-problems',
    type: 'MCQ_SINGLE',
    d: 0,
    sec: 210,
    passage: [
      'Bir ishchi ishni yolg‘iz 12 kunda tugatadi. Ikkinchi ishchi bilan ish 4 kunda tugaydi. Ikkinchi ishchi yolg‘iz qancha vaqt kerak bo‘ladi?',
      'A worker completes a job in 12 days alone. With a second worker the job takes 4 days. How long would the second worker need alone?',
    ],
    p: [
      'Ikkinchi ishchi yolg‘iz qancha kunga ehtiyoj bo‘ladi?',
      'How many days would the second worker need alone?',
    ],
    options: [
      { label: { uz: '6', en: '6' }, correct: true, accepts: ['6'] },
      { label: { uz: '8', en: '8' } },
      { label: { uz: '16', en: '16' } },
      { label: { uz: '3', en: '3' } },
    ],
  },
  {
    skill: 'math-word-problems',
    type: 'MCQ_SINGLE',
    d: 0.5,
    sec: 240,
    passage: [
      'Ikki sonning yig‘indisi 37, ko‘paytuvchisi 300 ga teng.',
      'The sum of two numbers is 37 and their product is 300.',
    ],
    p: [
      'Kattaroq son nechaga teng?',
      'What is the larger number?',
    ],
    options: [
      { label: { uz: '25', en: '25' }, correct: true, accepts: ['25'] },
      { label: { uz: '20', en: '20' } },
      { label: { uz: '30', en: '30' } },
      { label: { uz: '12', en: '12' } },
    ],
  },
  {
    skill: 'math-word-problems',
    type: 'MCQ_SINGLE',
    d: 1,
    sec: 270,
    passage: [
      'Bir miqdor avval 10% ga oshadi, keyin 10% ga kamayadi. Yakuniy qiymat aslidan katta, kichik yoki tengmi?',
      'A quantity increases by 10% and then decreases by 10%. Is the final value larger, smaller, or equal to the original?',
    ],
    p: [
      'Yakuniy qiymat…',
      'The final value is…',
    ],
    options: [
      { label: { uz: '1% ga kichik', en: '1% smaller' }, correct: true },
      { label: { uz: 'Originalga teng', en: 'Equal to the original' } },
      { label: { uz: '1% ga katta', en: '1% larger' } },
      { label: { uz: '20% ga kichik', en: '20% smaller' } },
    ],
  },
  {
    skill: 'math-word-problems',
    type: 'MCQ_SINGLE',
    d: 1.5,
    sec: 300,
    passage: [
      'Avtomobil 100 km ga 7 litr yo‘qilg‘i sarflaydi. Yo‘qilg‘ining narxi litriga 12 000 so‘m.',
      'A car uses 7 L of fuel per 100 km. Fuel costs 12 000 so‘m per litre.',
    ],
    p: [
      '450 km li sayohat uchun yo‘qilg‘iga qancha sarf bo‘ladi?',
      'How much does the fuel cost for a 450 km trip?',
    ],
    options: [
      { label: { uz: '378 000', en: '378 000' }, correct: true, accepts: ['378000', '378 000'] },
      { label: { uz: '420 000', en: '420 000' } },
      { label: { uz: '315 000', en: '315 000' } },
      { label: { uz: '84 000', en: '84 000' } },
    ],
  },
];