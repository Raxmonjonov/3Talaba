/**
 * 3Talab — Algebra va Geometriya: Chuqur O'rganish Metodi (6 bosqich)
 *
 * Har bir mavzu bir xil 6 bosqichli metod asosida tuzilgan:
 * 1. TUSHUN   — intuitsiya: mavzu hayotda nimani anglatadi
 * 2. KO'R     — vizual model (chizma / grafik)
 * 3. FORMULA  — asosiy formulalar va ular NEGA to'g'ri ekanligi
 * 4. NAMUNA   — qadamma-qadam ishlangan misol
 * 5. MASHQ    — mustaqil yechish (javob avtomatik tekshiriladi)
 * 6. TAHLIL   — tipik xatolar, SAT lifehack va takrorlash rejasi
 */

export type MathBranch = "algebra" | "geometry";

export type MathVisual =
  | "balance"
  | "parabola"
  | "line"
  | "intersect"
  | "powers"
  | "triangle"
  | "right-triangle"
  | "area"
  | "circle"
  | "solid"
  | "trig";

export interface MathPracticeProblem {
  id: string;
  level: 1 | 2 | 3;
  promptUz: string;
  /** Raqamli javob (kasr ko'rinishidagi javoblar ham o'nli songa aylantirib tekshiriladi) */
  answer: number;
  hintUz: string;
  solutionUz: string;
}

export interface MathTopic {
  slug: string;
  branch: MathBranch;
  titleUz: string;
  summaryUz: string;
  visual: MathVisual;
  /** 1-bosqich: intuitsiya */
  intuitionUz: string[];
  /** 2-bosqich: chizma ostidagi izoh */
  visualCaptionUz: string;
  /** 3-bosqich: formulalar va isbot g'oyasi */
  formulas: Array<{ nameUz: string; formula: string; whyUz: string }>;
  /** 4-bosqich: ishlangan misol */
  workedExample: { problemUz: string; steps: string[]; answerUz: string };
  /** 5-bosqich: mashqlar */
  practice: MathPracticeProblem[];
  /** 6-bosqich: tipik xatolar va lifehack */
  commonMistakesUz: string[];
  satTipUz: string;
}

export const DEEP_METHOD_STEPS = [
  { id: 1, key: "intuition", titleUz: "Tushun", descUz: "Mavzuning hayotiy ma'nosi va intuitsiyasi" },
  { id: 2, key: "visual", titleUz: "Ko'r", descUz: "Chizma va grafik orqali vizual model" },
  { id: 3, key: "formula", titleUz: "Formula", descUz: "Asosiy formulalar va ular nega to'g'ri" },
  { id: 4, key: "example", titleUz: "Namuna", descUz: "Qadamma-qadam ishlangan misol" },
  { id: 5, key: "practice", titleUz: "Mashq", descUz: "Mustaqil yechish va avtomatik tekshiruv" },
  { id: 6, key: "review", titleUz: "Tahlil", descUz: "Tipik xatolar, lifehack va takrorlash" },
] as const;

/** Takrorlash (spaced repetition) jadvali — kunlarda */
export const REVIEW_SCHEDULE_DAYS = [1, 3, 7, 21] as const;

export const MATH_TOPICS: MathTopic[] = [
  // ───────────────────────────── ALGEBRA ─────────────────────────────
  {
    slug: "chiziqli-tenglamalar",
    branch: "algebra",
    titleUz: "Chiziqli tenglamalar",
    summaryUz: "ax + b = c ko'rinishidagi tenglamalarni ishonch bilan yechish",
    visual: "balance",
    intuitionUz: [
      "Tenglamani tarozi deb tasavvur qiling: chap va o'ng pallalar doim muvozanatda turadi.",
      "Bir tomonga qanday amal qilsangiz (qo'shish, ayirish, ko'paytirish, bo'lish), ikkinchi tomonga ham aynan shu amalni qilasiz — muvozanat buzilmaydi.",
      "Maqsad — noma'lumni (x) bitta pallada yolg'iz qoldirish.",
    ],
    visualCaptionUz: "Tarozi modeli: 3x + 4 va 19 teng og'irlikda. Ikkala palladan 4 ni olsak, 3x = 15 qoladi.",
    formulas: [
      {
        nameUz: "Umumiy yechim",
        formula: "ax + b = c  ⇒  x = (c − b) / a,  a ≠ 0",
        whyUz: "Avval ikkala tomondan b ni ayiramiz (ax = c − b), so'ng ikkala tomonni a ga bo'lamiz.",
      },
      {
        nameUz: "Hadni o'tkazish qoidasi",
        formula: "x + b = c  ⇔  x = c − b",
        whyUz: "Had tenglikning narigi tomoniga o'tganda ishorasi teskarisiga o'zgaradi — bu aslida ikkala tomondan b ni ayirishning qisqa yozuvi.",
      },
    ],
    workedExample: {
      problemUz: "5x − 7 = 18 tenglamani yeching.",
      steps: [
        "Ikkala tomonga 7 ni qo'shamiz: 5x = 18 + 7 = 25.",
        "Ikkala tomonni 5 ga bo'lamiz: x = 25 / 5 = 5.",
        "Tekshiramiz: 5 · 5 − 7 = 25 − 7 = 18 ✓",
      ],
      answerUz: "x = 5",
    },
    practice: [
      {
        id: "lin-1",
        level: 1,
        promptUz: "3x + 4 = 19 bo'lsa, x nechiga teng?",
        answer: 5,
        hintUz: "Avval ikkala tomondan 4 ni ayiring.",
        solutionUz: "3x = 15 ⇒ x = 5.",
      },
      {
        id: "lin-2",
        level: 2,
        promptUz: "7 − 2x = −5 bo'lsa, x nechiga teng?",
        answer: 6,
        hintUz: "Ikkala tomondan 7 ni ayiring, so'ng −2 ga bo'ling (ishoraga e'tibor bering).",
        solutionUz: "−2x = −12 ⇒ x = 6.",
      },
      {
        id: "lin-3",
        level: 3,
        promptUz: "(x + 3) / 4 = 5 bo'lsa, x nechiga teng?",
        answer: 17,
        hintUz: "Kasrdan qutulish uchun ikkala tomonni 4 ga ko'paytiring.",
        solutionUz: "x + 3 = 20 ⇒ x = 17.",
      },
    ],
    commonMistakesUz: [
      "Hadni narigi tomonga o'tkazganda ishorasini o'zgartirmaslik (3x + 4 = 19 ⇒ 3x = 23 — XATO).",
      "Faqat bitta hadni bo'lish: 3x + 6 = 12 ni 3 ga bo'lganda x + 6 = 4 deb yozish — XATO, to'g'risi x + 2 = 4.",
      "Manfiy songa bo'lganda ishorani yo'qotish.",
    ],
    satTipUz: "SAT ko'pincha x ni emas, ifodani so'raydi. Masalan, 6x + 10 = 34 bo'lsa, 3x + 5 = 34 / 2 = 17 — x ni topish shart emas!",
  },
  {
    slug: "kvadrat-tenglamalar",
    branch: "algebra",
    titleUz: "Kvadrat tenglamalar",
    summaryUz: "Diskriminant, Viyet teoremasi va ko'paytuvchilarga ajratish",
    visual: "parabola",
    intuitionUz: [
      "Kvadrat tenglama ax² + bx + c = 0 — bu parabolaning Ox o'qini qayerda kesib o'tishini so'rash demakdir.",
      "Parabola o'qni 2 marta, 1 marta kesishi yoki umuman kesmasligi mumkin — shuning uchun ildizlar soni 2, 1 yoki 0 ta bo'ladi.",
      "Diskriminant (D) aynan shu kesishishlar sonini oldindan aytib beradi.",
    ],
    visualCaptionUz: "y = x² − 5x + 6 parabolasi Ox o'qini x = 2 va x = 3 nuqtalarda kesib o'tadi — bular tenglamaning ildizlari.",
    formulas: [
      {
        nameUz: "Diskriminant",
        formula: "D = b² − 4ac",
        whyUz: "D > 0 — ikki ildiz, D = 0 — bitta ildiz, D < 0 — haqiqiy ildiz yo'q.",
      },
      {
        nameUz: "Ildizlar formulasi",
        formula: "x₁,₂ = (−b ± √D) / (2a)",
        whyUz: "To'liq kvadratga ajratish usulidan kelib chiqadi: a(x + b/2a)² = D/4a.",
      },
      {
        nameUz: "Viyet teoremasi",
        formula: "x₁ + x₂ = −b/a,   x₁ · x₂ = c/a",
        whyUz: "a(x − x₁)(x − x₂) ni ochsak, koeffitsiyentlarni solishtirib shu tengliklar hosil bo'ladi.",
      },
    ],
    workedExample: {
      problemUz: "x² − 5x + 6 = 0 tenglamani yeching.",
      steps: [
        "a = 1, b = −5, c = 6.",
        "D = (−5)² − 4 · 1 · 6 = 25 − 24 = 1.",
        "x = (5 ± 1) / 2 ⇒ x₁ = 3, x₂ = 2.",
        "Viyet bilan tekshiramiz: 3 + 2 = 5 = −b/a ✓,  3 · 2 = 6 = c/a ✓",
      ],
      answerUz: "x₁ = 3, x₂ = 2",
    },
    practice: [
      {
        id: "kv-1",
        level: 1,
        promptUz: "x² − 9 = 0 tenglamaning musbat ildizini toping.",
        answer: 3,
        hintUz: "x² = 9 ko'rinishiga keltiring.",
        solutionUz: "x² = 9 ⇒ x = ±3, musbat ildiz 3.",
      },
      {
        id: "kv-2",
        level: 2,
        promptUz: "x² − 7x + 10 = 0 tenglama ildizlarining yig'indisini toping.",
        answer: 7,
        hintUz: "Viyet teoremasi: x₁ + x₂ = −b/a.",
        solutionUz: "x₁ + x₂ = −(−7)/1 = 7 (ildizlar 2 va 5).",
      },
      {
        id: "kv-3",
        level: 3,
        promptUz: "2x² − 8x + 6 = 0 tenglama ildizlarining ko'paytmasini toping.",
        answer: 3,
        hintUz: "x₁ · x₂ = c/a — a = 2 ekanini unutmang.",
        solutionUz: "x₁ · x₂ = 6/2 = 3 (ildizlar 1 va 3).",
      },
    ],
    commonMistakesUz: [
      "b manfiy bo'lganda (−b) ni noto'g'ri hisoblash: b = −5 bo'lsa, −b = +5.",
      "Viyet teoremasini a ≠ 1 bo'lganda a ga bo'lmasdan qo'llash.",
      "D < 0 bo'lganda ham ildiz topishga urinish.",
    ],
    satTipUz: "Agar savol faqat ildizlar yig'indisi yoki ko'paytmasini so'rasa, tenglamani yechmang — Viyet bilan 5 soniyada javob bering.",
  },
  {
    slug: "funksiyalar",
    branch: "algebra",
    titleUz: "Funksiyalar va grafiklar",
    summaryUz: "Chiziqli funksiya, burchak koeffitsiyenti va parabola uchi",
    visual: "line",
    intuitionUz: [
      "Funksiya — bu 'mashina': unga x ni bersangiz, aniq bitta y qaytaradi.",
      "Chiziqli funksiyada y = kx + b: k — har qadamda qancha ko'tarilish (tezlik), b — boshlang'ich qiymat.",
      "Masalan, taksi narxi: b — o'tirish narxi, k — har bir km narxi.",
    ],
    visualCaptionUz: "y = 2x + 1 to'g'ri chizig'i: x 1 ga oshganda y 2 ga oshadi (k = 2), Oy o'qini y = 1 da kesadi (b = 1).",
    formulas: [
      {
        nameUz: "Chiziqli funksiya",
        formula: "y = kx + b",
        whyUz: "k — burchak koeffitsiyenti (qiyalik), b — Oy o'qi bilan kesishish nuqtasi.",
      },
      {
        nameUz: "Qiyalik (slope)",
        formula: "k = (y₂ − y₁) / (x₂ − x₁)",
        whyUz: "Ikki nuqta orasidagi 'ko'tarilish'ni 'yurish'ga nisbati.",
      },
      {
        nameUz: "Parabola uchi",
        formula: "x₀ = −b / (2a),   y₀ = f(x₀)",
        whyUz: "Parabola simmetrik, uning o'qi ildizlar o'rtasidan o'tadi: (x₁ + x₂)/2 = −b/2a.",
      },
    ],
    workedExample: {
      problemUz: "(1; 3) va (3; 7) nuqtalardan o'tuvchi to'g'ri chiziq tenglamasini toping.",
      steps: [
        "Qiyalik: k = (7 − 3) / (3 − 1) = 4 / 2 = 2.",
        "y = 2x + b ga (1; 3) ni qo'yamiz: 3 = 2 · 1 + b ⇒ b = 1.",
        "Tekshiramiz (3; 7): 2 · 3 + 1 = 7 ✓",
      ],
      answerUz: "y = 2x + 1",
    },
    practice: [
      {
        id: "fn-1",
        level: 1,
        promptUz: "f(x) = 3x − 4 bo'lsa, f(5) nechiga teng?",
        answer: 11,
        hintUz: "x o'rniga 5 ni qo'ying.",
        solutionUz: "f(5) = 15 − 4 = 11.",
      },
      {
        id: "fn-2",
        level: 2,
        promptUz: "(0; 2) va (4; 10) nuqtalardan o'tuvchi to'g'ri chiziqning qiyaligini (k) toping.",
        answer: 2,
        hintUz: "k = (y₂ − y₁) / (x₂ − x₁).",
        solutionUz: "k = (10 − 2) / (4 − 0) = 8 / 4 = 2.",
      },
      {
        id: "fn-3",
        level: 3,
        promptUz: "y = x² − 6x + 5 parabola uchining abssissasini (x₀) toping.",
        answer: 3,
        hintUz: "x₀ = −b / (2a).",
        solutionUz: "x₀ = 6 / 2 = 3.",
      },
    ],
    commonMistakesUz: [
      "Qiyalikda surat va maxrajdagi nuqtalar tartibini aralashtirish (y₂ − y₁ ni x₁ − x₂ ga bo'lish).",
      "f(x + 1) ni f(x) + 1 bilan adashtirish.",
      "Parabola uchida −b/2a dagi minus ishorani unutish.",
    ],
    satTipUz: "SAT jadval berib funksiyani so'rasa, javob variantlariga jadvaldagi 1–2 nuqtani qo'yib tekshirish eng tez usul.",
  },
  {
    slug: "sistemalar-tengsizliklar",
    branch: "algebra",
    titleUz: "Tenglamalar sistemasi va tengsizliklar",
    summaryUz: "Qo'shish, o'rniga qo'yish usullari va tengsizliklarni yechish",
    visual: "intersect",
    intuitionUz: [
      "Ikki noma'lumli sistema — ikki to'g'ri chiziqning kesishish nuqtasini topish demakdir.",
      "Chiziqlar kesishsa — bitta yechim, parallel bo'lsa — yechim yo'q, ustma-ust tushsa — cheksiz ko'p yechim.",
      "Tengsizlik tenglamaga o'xshaydi, faqat bitta qoida bor: manfiy songa ko'paytirsangiz yoki bo'lsangiz, belgi teskarisiga aylanadi.",
    ],
    visualCaptionUz: "x + y = 10 va x − y = 4 chiziqlari (7; 3) nuqtada kesishadi — bu sistemaning yagona yechimi.",
    formulas: [
      {
        nameUz: "Qo'shish usuli",
        formula: "(x + y) + (x − y) = 10 + 4  ⇒  2x = 14",
        whyUz: "Tenglamalarni qo'shganda bitta noma'lum yo'qoladi.",
      },
      {
        nameUz: "O'rniga qo'yish usuli",
        formula: "y = 10 − x  ⇒  x − (10 − x) = 4",
        whyUz: "Bir noma'lumni ikkinchisi orqali ifodalab, bitta tenglamaga keltiramiz.",
      },
      {
        nameUz: "Tengsizlik qoidasi",
        formula: "−2x > 6  ⇒  x < −3",
        whyUz: "Manfiy songa bo'lganda tartib teskari bo'ladi (masalan, 2 < 3, lekin −2 > −3).",
      },
    ],
    workedExample: {
      problemUz: "Sistemani yeching: x + y = 10, x − y = 4.",
      steps: [
        "Tenglamalarni qo'shamiz: 2x = 14 ⇒ x = 7.",
        "Birinchi tenglamaga qo'yamiz: 7 + y = 10 ⇒ y = 3.",
        "Tekshiramiz: 7 − 3 = 4 ✓",
      ],
      answerUz: "(x; y) = (7; 3)",
    },
    practice: [
      {
        id: "sys-1",
        level: 1,
        promptUz: "x + 2y = 8 va x = 2 bo'lsa, y nechiga teng?",
        answer: 3,
        hintUz: "x = 2 ni birinchi tenglamaga qo'ying.",
        solutionUz: "2 + 2y = 8 ⇒ y = 3.",
      },
      {
        id: "sys-2",
        level: 2,
        promptUz: "2x + y = 11 va x − y = 1 sistemadan x ni toping.",
        answer: 4,
        hintUz: "Tenglamalarni qo'shsangiz, y yo'qoladi.",
        solutionUz: "3x = 12 ⇒ x = 4 (y = 3).",
      },
      {
        id: "sys-3",
        level: 3,
        promptUz: "3x − 5 > 10 tengsizlikni qanoatlantiruvchi eng kichik butun x ni toping.",
        answer: 6,
        hintUz: "Avval 3x > 15 ga keltiring. Belgi qat'iy (>) ekaniga e'tibor bering.",
        solutionUz: "3x > 15 ⇒ x > 5, eng kichik butun son 6.",
      },
    ],
    commonMistakesUz: [
      "Manfiy songa bo'lganda tengsizlik belgisini o'zgartirmaslik.",
      "Bitta noma'lumni topib, ikkinchisini topishni unutish.",
      "Qat'iy (>) va noqat'iy (≥) belgilarni farqlamaslik.",
    ],
    satTipUz: "SAT 'sistemaning yechimi yo'q' desa, chiziqlar parallel: koeffitsiyentlar proporsional, ozod hadlar esa yo'q (a₁/a₂ = b₁/b₂ ≠ c₁/c₂).",
  },
  {
    slug: "darajalar-ildizlar",
    branch: "algebra",
    titleUz: "Darajalar va ildizlar",
    summaryUz: "Daraja xossalari, manfiy daraja va ildizlarni soddalashtirish",
    visual: "powers",
    intuitionUz: [
      "Daraja — takroriy ko'paytirishning qisqa yozuvi: 2⁴ = 2 · 2 · 2 · 2 = 16.",
      "Bir xil asosli darajalarni ko'paytirsak, ko'paytuvchilar soni qo'shiladi — shuning uchun ko'rsatkichlar qo'shiladi.",
      "Ildiz — darajaga teskari amal: √16 = 4, chunki 4² = 16.",
    ],
    visualCaptionUz: "2¹, 2², 2³: har bir qadamda kvadratlar soni ikki barobar ortadi — bu ko'rsatkichli o'sish.",
    formulas: [
      {
        nameUz: "Ko'paytirish va bo'lish",
        formula: "aᵐ · aⁿ = aᵐ⁺ⁿ,   aᵐ / aⁿ = aᵐ⁻ⁿ",
        whyUz: "m ta va n ta ko'paytuvchini birlashtirsak, jami m + n ta bo'ladi.",
      },
      {
        nameUz: "Darajani darajaga oshirish",
        formula: "(aᵐ)ⁿ = aᵐⁿ",
        whyUz: "aᵐ ni n marta ko'paytiramiz: m + m + … + m = m · n.",
      },
      {
        nameUz: "Nol va manfiy daraja",
        formula: "a⁰ = 1,   a⁻ⁿ = 1 / aⁿ",
        whyUz: "aⁿ / aⁿ = aⁿ⁻ⁿ = a⁰, lekin bu 1 ga teng.",
      },
      {
        nameUz: "Ildiz xossasi",
        formula: "√(a · b) = √a · √b,   a^(1/n) = ⁿ√a",
        whyUz: "Ildiz — 1/2 darajaga oshirish, shuning uchun daraja xossalari unga ham tegishli.",
      },
    ],
    workedExample: {
      problemUz: "√72 ni soddalashtiring.",
      steps: [
        "72 ni eng katta to'liq kvadrat ko'paytuvchiga ajratamiz: 72 = 36 · 2.",
        "√72 = √36 · √2 = 6√2.",
        "Tekshiramiz: (6√2)² = 36 · 2 = 72 ✓",
      ],
      answerUz: "√72 = 6√2",
    },
    practice: [
      {
        id: "pow-1",
        level: 1,
        promptUz: "3⁵ / 3³ ni hisoblang.",
        answer: 9,
        hintUz: "Bo'lishda ko'rsatkichlar ayiriladi.",
        solutionUz: "3⁵⁻³ = 3² = 9.",
      },
      {
        id: "pow-2",
        level: 2,
        promptUz: "(2³)² ni hisoblang.",
        answer: 64,
        hintUz: "Darajani darajaga oshirganda ko'rsatkichlar ko'paytiriladi.",
        solutionUz: "2⁶ = 64.",
      },
      {
        id: "pow-3",
        level: 3,
        promptUz: "√50 · √2 ni hisoblang.",
        answer: 10,
        hintUz: "√a · √b = √(a · b).",
        solutionUz: "√100 = 10.",
      },
    ],
    commonMistakesUz: [
      "aᵐ · aⁿ ni aᵐⁿ deb yozish (ko'rsatkichlarni ko'paytirish) — XATO.",
      "√(a + b) = √a + √b deb hisoblash — XATO (√9 + √16 = 7, lekin √25 = 5).",
      "Manfiy darajani manfiy son deb tushunish: 2⁻³ = 1/8, −8 emas.",
    ],
    satTipUz: "Turli asoslarni bir xil asosga keltiring: 4ˣ = 2²ˣ, 8 = 2³. Shunda ko'rsatkichlarni tenglashtirish mumkin.",
  },

  // ───────────────────────────── GEOMETRIYA ─────────────────────────────
  {
    slug: "burchaklar-uchburchaklar",
    branch: "geometry",
    titleUz: "Burchaklar va uchburchaklar",
    summaryUz: "Ichki va tashqi burchaklar, teng yonli va o'xshash uchburchaklar",
    visual: "triangle",
    intuitionUz: [
      "Uchburchakning uchala burchagini qirqib, yonma-yon qo'ysangiz, ular har doim to'g'ri chiziq (180°) hosil qiladi.",
      "Teng yonli uchburchakda ikki tomon teng bo'lgani uchun asosdagi ikki burchak ham teng.",
      "O'xshash uchburchaklar — bir xil shakl, faqat o'lchami boshqacha (masalan, rasmni kattalashtirish).",
    ],
    visualCaptionUz: "Uchburchak ichki burchaklari: 50° + 60° + 70° = 180°. Tashqi burchak qo'shni bo'lmagan ikki ichki burchak yig'indisiga teng.",
    formulas: [
      {
        nameUz: "Ichki burchaklar yig'indisi",
        formula: "∠A + ∠B + ∠C = 180°",
        whyUz: "Bir uchidan qarama-qarshi tomonga parallel chiziq o'tkazsak, ichki almashinuvchi burchaklar teng bo'ladi va 180° hosil qiladi.",
      },
      {
        nameUz: "Tashqi burchak",
        formula: "Tashqi ∠ = ∠A + ∠B (qo'shni bo'lmagan)",
        whyUz: "Tashqi burchak + ∠C = 180° va ∠A + ∠B + ∠C = 180°.",
      },
      {
        nameUz: "n-burchak ichki burchaklari",
        formula: "S = (n − 2) · 180°",
        whyUz: "n-burchakni bir uchidan (n − 2) ta uchburchakka bo'lish mumkin.",
      },
    ],
    workedExample: {
      problemUz: "Uchburchakning ikki burchagi 50° va 60°. Uchinchi burchagini va unga qo'shni tashqi burchakni toping.",
      steps: [
        "Uchinchi burchak: 180° − 50° − 60° = 70°.",
        "Unga qo'shni tashqi burchak: 180° − 70° = 110°.",
        "Tekshiramiz: tashqi burchak = 50° + 60° = 110° ✓",
      ],
      answerUz: "70° va 110°",
    },
    practice: [
      {
        id: "tri-1",
        level: 1,
        promptUz: "Uchburchakning ikki burchagi 35° va 85°. Uchinchi burchak necha gradus?",
        answer: 60,
        hintUz: "Yig'indi 180°.",
        solutionUz: "180 − 35 − 85 = 60°.",
      },
      {
        id: "tri-2",
        level: 2,
        promptUz: "Teng yonli uchburchak uchidagi burchak 40°. Asosdagi burchak necha gradus?",
        answer: 70,
        hintUz: "Asosdagi ikki burchak teng: 2x + 40 = 180.",
        solutionUz: "2x = 140 ⇒ x = 70°.",
      },
      {
        id: "tri-3",
        level: 3,
        promptUz: "Oltiburchak (n = 6) ichki burchaklari yig'indisi necha gradus?",
        answer: 720,
        hintUz: "S = (n − 2) · 180°.",
        solutionUz: "(6 − 2) · 180 = 720°.",
      },
    ],
    commonMistakesUz: [
      "Teng yonli uchburchakda uchidagi burchakni asosdagi burchak bilan adashtirish.",
      "Tashqi burchakni 360° dan ayirib topish.",
      "O'xshash uchburchaklarda yuzlar nisbati tomonlar nisbatiga teng deb o'ylash (aslida k²).",
    ],
    satTipUz: "SAT chizmasi 'masshtabda emas' (not drawn to scale) bo'lishi mumkin — ko'z bilan emas, faqat berilgan sonlar bilan ishlang.",
  },
  {
    slug: "pifagor-teoremasi",
    branch: "geometry",
    titleUz: "Pifagor teoremasi va maxsus uchburchaklar",
    summaryUz: "a² + b² = c², Pifagor uchliklari, 45-45-90 va 30-60-90",
    visual: "right-triangle",
    intuitionUz: [
      "To'g'ri burchakli uchburchakda katetlarga qurilgan kvadratlar yuzlari yig'indisi gipotenuzaga qurilgan kvadrat yuziga teng.",
      "Bu qoida masofani topishning asosi: koordinata tekisligida ikki nuqta orasidagi masofa ham aynan Pifagor!",
      "Ba'zi uchburchaklar shunchalik ko'p uchraydiki, ularni yod bilish vaqtni tejaydi: 3-4-5, 5-12-13, 8-15-17.",
    ],
    visualCaptionUz: "Katetlari 3 va 4 bo'lgan uchburchak: 3² + 4² = 9 + 16 = 25 = 5², demak gipotenuza 5.",
    formulas: [
      {
        nameUz: "Pifagor teoremasi",
        formula: "a² + b² = c²",
        whyUz: "Tomoni (a + b) bo'lgan kvadrat ichiga 4 ta bir xil uchburchak joylab, yuzlarni ikki usulda hisoblash orqali isbotlanadi.",
      },
      {
        nameUz: "45°-45°-90° uchburchak",
        formula: "x : x : x√2",
        whyUz: "Teng katetli: x² + x² = 2x² ⇒ c = x√2.",
      },
      {
        nameUz: "30°-60°-90° uchburchak",
        formula: "x : x√3 : 2x",
        whyUz: "Teng tomonli uchburchakni balandlik bilan teng ikkiga bo'lishdan hosil bo'ladi.",
      },
      {
        nameUz: "Ikki nuqta orasidagi masofa",
        formula: "d = √((x₂ − x₁)² + (y₂ − y₁)²)",
        whyUz: "Gorizontal va vertikal farqlar katetlar, masofa esa gipotenuza.",
      },
    ],
    workedExample: {
      problemUz: "To'g'ri burchakli uchburchakning katetlari 6 va 8. Gipotenuzani toping.",
      steps: [
        "c² = 6² + 8² = 36 + 64 = 100.",
        "c = √100 = 10.",
        "E'tibor bering: bu 3-4-5 uchligining 2 barobari (6-8-10).",
      ],
      answerUz: "c = 10",
    },
    practice: [
      {
        id: "pyt-1",
        level: 1,
        promptUz: "Katetlari 5 va 12 bo'lgan to'g'ri burchakli uchburchak gipotenuzasini toping.",
        answer: 13,
        hintUz: "5² + 12² = ?",
        solutionUz: "25 + 144 = 169 ⇒ c = 13.",
      },
      {
        id: "pyt-2",
        level: 2,
        promptUz: "Gipotenuza 17, bir kateti 8. Ikkinchi katetni toping.",
        answer: 15,
        hintUz: "b² = c² − a².",
        solutionUz: "289 − 64 = 225 ⇒ b = 15.",
      },
      {
        id: "pyt-3",
        level: 3,
        promptUz: "30°-60°-90° uchburchakda 30° qarshisidagi katet 4 ga teng. Gipotenuzani toping.",
        answer: 8,
        hintUz: "30° qarshisidagi katet gipotenuzaning yarmiga teng.",
        solutionUz: "c = 2 · 4 = 8.",
      },
    ],
    commonMistakesUz: [
      "Gipotenuzani katet o'rniga qo'yish: c — har doim to'g'ri burchak qarshisidagi eng uzun tomon.",
      "Katetni topishda ayirish o'rniga qo'shish (b² = c² + a² — XATO).",
      "Ildiz chiqarishni unutib, c² ni javob deb yozish.",
    ],
    satTipUz: "Sonlar 3-4-5 yoki 5-12-13 ga karrali bo'lsa (masalan 9-12-?), hisoblamasdan javob: 15.",
  },
  {
    slug: "yuzlar-perimetr",
    branch: "geometry",
    titleUz: "Yuzlar va perimetr",
    summaryUz: "To'rtburchak, uchburchak, trapetsiya va parallelogramm yuzlari",
    visual: "area",
    intuitionUz: [
      "Yuz — shaklni qoplash uchun kerak bo'ladigan 1×1 kvadratchalar soni.",
      "Uchburchak — to'rtburchakning aynan yarmi, shuning uchun formulada 1/2 bor.",
      "Perimetr — shakl atrofini aylanib chiqish uchun yurilgan yo'l (tomonlar yig'indisi).",
    ],
    visualCaptionUz: "Trapetsiyani diagonal bo'yicha ikki uchburchakka bo'lsak: (a · h)/2 + (b · h)/2 = (a + b) · h / 2.",
    formulas: [
      { nameUz: "To'g'ri to'rtburchak", formula: "S = a · b,   P = 2(a + b)", whyUz: "a qatorda b tadan kvadratcha." },
      { nameUz: "Uchburchak", formula: "S = (a · h) / 2", whyUz: "Uchburchak — asosi a, balandligi h bo'lgan parallelogrammning yarmi." },
      { nameUz: "Parallelogramm", formula: "S = a · h", whyUz: "Bir uchini kesib, ikkinchi tomonga o'tkazsak, to'g'ri to'rtburchak hosil bo'ladi." },
      { nameUz: "Trapetsiya", formula: "S = (a + b) · h / 2", whyUz: "O'rta chiziq (a + b)/2 ni balandlikka ko'paytiramiz." },
    ],
    workedExample: {
      problemUz: "Trapetsiyaning asoslari 6 va 10, balandligi 4. Yuzini toping.",
      steps: [
        "O'rta chiziq: (6 + 10) / 2 = 8.",
        "S = 8 · 4 = 32.",
        "Tekshiramiz: (6 + 10) · 4 / 2 = 64 / 2 = 32 ✓",
      ],
      answerUz: "S = 32",
    },
    practice: [
      {
        id: "area-1",
        level: 1,
        promptUz: "Uchburchakning asosi 10, balandligi 6. Yuzini toping.",
        answer: 30,
        hintUz: "S = a · h / 2.",
        solutionUz: "10 · 6 / 2 = 30.",
      },
      {
        id: "area-2",
        level: 2,
        promptUz: "Kvadratning perimetri 36. Uning yuzini toping.",
        answer: 81,
        hintUz: "Avval tomonni toping: P = 4a.",
        solutionUz: "a = 9 ⇒ S = 81.",
      },
      {
        id: "area-3",
        level: 3,
        promptUz: "Trapetsiyaning asoslari 5 va 9, balandligi 6. Yuzini toping.",
        answer: 42,
        hintUz: "S = (a + b) · h / 2.",
        solutionUz: "(5 + 9) · 6 / 2 = 42.",
      },
    ],
    commonMistakesUz: [
      "Uchburchak yuzida 1/2 ni unutish.",
      "Balandlik o'rniga yon tomonni ishlatish (balandlik asosga perpendikulyar bo'lishi shart).",
      "Yuz (kv. birlik) va perimetr (birlik) o'lchov birliklarini aralashtirish.",
    ],
    satTipUz: "Tomonlar k marta kattalashsa, perimetr k marta, yuz esa k² marta ortadi.",
  },
  {
    slug: "aylana",
    branch: "geometry",
    titleUz: "Aylana va doira",
    summaryUz: "Uzunlik, yuz, yoy, sektor va ichki chizilgan burchaklar",
    visual: "circle",
    intuitionUz: [
      "Aylana — markazdan bir xil masofada (radius) yotgan barcha nuqtalar.",
      "π ≈ 3,14 — har qanday aylanada uzunlikning diametrga nisbati. Bu o'zgarmas son.",
      "Sektor — 'pitsa bo'lagi': markaziy burchak 360° ning qancha qismi bo'lsa, yuz ham shuncha qismi bo'ladi.",
    ],
    visualCaptionUz: "Radiusi r bo'lgan aylana va 60° li sektor: u butun doiraning 60/360 = 1/6 qismi.",
    formulas: [
      { nameUz: "Uzunlik va yuz", formula: "C = 2πr,   S = πr²", whyUz: "π ning ta'rifidan C = πd = 2πr." },
      { nameUz: "Yoy uzunligi", formula: "L = (α / 360°) · 2πr", whyUz: "Yoy — aylananing α/360 qismi." },
      { nameUz: "Sektor yuzi", formula: "S = (α / 360°) · πr²", whyUz: "Sektor — doiraning α/360 qismi." },
      { nameUz: "Ichki chizilgan burchak", formula: "∠ichki = ∠markaziy / 2", whyUz: "Bir yoyga tiralgan ichki burchak markaziy burchakning yarmiga teng." },
      { nameUz: "Aylana tenglamasi", formula: "(x − a)² + (y − b)² = r²", whyUz: "Markaz (a; b) dan masofa r bo'lgan nuqtalar — Pifagor teoremasidan." },
    ],
    workedExample: {
      problemUz: "Radiusi 6 bo'lgan doiraning 60° li sektori yuzini toping.",
      steps: [
        "Butun doira yuzi: π · 6² = 36π.",
        "Sektor ulushi: 60 / 360 = 1/6.",
        "S = 36π / 6 = 6π.",
      ],
      answerUz: "S = 6π",
    },
    practice: [
      {
        id: "cir-1",
        level: 1,
        promptUz: "Aylana diametri 14. Radiusini toping.",
        answer: 7,
        hintUz: "r = d / 2.",
        solutionUz: "14 / 2 = 7.",
      },
      {
        id: "cir-2",
        level: 2,
        promptUz: "Ichki chizilgan burchak 35°. Shu yoyga tiralgan markaziy burchak necha gradus?",
        answer: 70,
        hintUz: "Markaziy burchak ichki burchakdan 2 barobar katta.",
        solutionUz: "2 · 35 = 70°.",
      },
      {
        id: "cir-3",
        level: 3,
        promptUz: "(x − 2)² + (y + 1)² = 49 aylananing radiusini toping.",
        answer: 7,
        hintUz: "Tenglamaning o'ng tomoni r².",
        solutionUz: "r² = 49 ⇒ r = 7.",
      },
    ],
    commonMistakesUz: [
      "Radius o'rniga diametrni formulaga qo'yish.",
      "Aylana tenglamasida r² ni r deb olish (r = 49 — XATO).",
      "Markaz koordinatasida ishorani adashtirish: (y + 1)² ⇒ b = −1.",
    ],
    satTipUz: "SAT da x² + y² + Dx + Ey + F = 0 berilsa, to'liq kvadratga ajratib markaz va radiusni toping.",
  },
  {
    slug: "hajmlar",
    branch: "geometry",
    titleUz: "Fazoviy jismlar va hajmlar",
    summaryUz: "Kub, prizma, silindr, konus va shar hajmlari",
    visual: "solid",
    intuitionUz: [
      "Hajm — jismni to'ldirish uchun kerak bo'ladigan 1×1×1 kubchalar soni.",
      "Prizma va silindr — asos yuzini balandlik bo'yicha 'qavat-qavat' takrorlash: V = S_asos · h.",
      "Konus va piramida — xuddi shunday asos va balandlikdagi silindr/prizmaning aynan 1/3 qismi.",
    ],
    visualCaptionUz: "Silindr: radiusi r bo'lgan doirani h balandlikka 'cho'zsak', hajm πr²h bo'ladi.",
    formulas: [
      { nameUz: "Kub va parallelepiped", formula: "V = a³,   V = a · b · c", whyUz: "Uzunlik × eni × balandlik bo'yicha kubchalar soni." },
      { nameUz: "Prizma va silindr", formula: "V = S_asos · h,   V_silindr = πr²h", whyUz: "Asos yuzi balandlik bo'yicha takrorlanadi." },
      { nameUz: "Konus va piramida", formula: "V = (1/3) · S_asos · h", whyUz: "Bir xil asos va balandlikdagi prizmaning 1/3 qismi." },
      { nameUz: "Shar", formula: "V = (4/3)πr³", whyUz: "Arximed isboti: shar unga tashqi chizilgan silindr hajmining 2/3 qismi." },
    ],
    workedExample: {
      problemUz: "Radiusi 3, balandligi 5 bo'lgan silindr hajmini toping.",
      steps: [
        "Asos yuzi: π · 3² = 9π.",
        "V = 9π · 5 = 45π.",
        "Taxminan: 45 · 3,14 ≈ 141,3.",
      ],
      answerUz: "V = 45π",
    },
    practice: [
      {
        id: "vol-1",
        level: 1,
        promptUz: "Qirrasi 4 bo'lgan kub hajmini toping.",
        answer: 64,
        hintUz: "V = a³.",
        solutionUz: "4³ = 64.",
      },
      {
        id: "vol-2",
        level: 2,
        promptUz: "O'lchamlari 2, 3 va 5 bo'lgan to'g'ri burchakli parallelepiped hajmini toping.",
        answer: 30,
        hintUz: "V = a · b · c.",
        solutionUz: "2 · 3 · 5 = 30.",
      },
      {
        id: "vol-3",
        level: 3,
        promptUz: "Radiusi 3, balandligi 4 bo'lgan konus hajmi kπ ga teng. k ni toping.",
        answer: 12,
        hintUz: "V = (1/3)πr²h.",
        solutionUz: "(1/3) · 9 · 4 = 12 ⇒ V = 12π.",
      },
    ],
    commonMistakesUz: [
      "Konus va piramida hajmida 1/3 ni unutish.",
      "Shar hajmida r² ishlatish (to'g'risi r³).",
      "Diametr berilganda uni radius deb olish.",
    ],
    satTipUz: "Formulalar SAT da 'Reference sheet' da beriladi — lekin qaysi formulani tanlashni bilish sizning vazifangiz.",
  },
  {
    slug: "trigonometriya",
    branch: "geometry",
    titleUz: "Trigonometriya asoslari",
    summaryUz: "sin, cos, tan va asosiy trigonometrik ayniyatlar",
    visual: "trig",
    intuitionUz: [
      "Trigonometriya — to'g'ri burchakli uchburchakdagi burchak va tomonlar o'rtasidagi bog'lanish.",
      "Burchak o'zgarmasa, uchburchak qanchalik katta bo'lmasin, tomonlar nisbati bir xil qoladi — shu nisbatlar sin, cos, tan deb ataladi.",
      "Eslab qolish uchun: SOH-CAH-TOA (Sin = Qarama-qarshi/Gipotenuza, Cos = Yopishgan/Gipotenuza, Tan = Qarama-qarshi/Yopishgan).",
    ],
    visualCaptionUz: "3-4-5 uchburchakda 3 ga qarshi α burchak uchun: sin α = 3/5, cos α = 4/5, tan α = 3/4.",
    formulas: [
      { nameUz: "Asosiy nisbatlar", formula: "sin α = a/c,   cos α = b/c,   tan α = a/b", whyUz: "a — qarama-qarshi katet, b — yopishgan katet, c — gipotenuza." },
      { nameUz: "Asosiy ayniyat", formula: "sin²α + cos²α = 1", whyUz: "(a/c)² + (b/c)² = (a² + b²)/c² = 1 — bu Pifagor teoremasining o'zi!" },
      { nameUz: "To'ldiruvchi burchaklar", formula: "sin α = cos(90° − α)", whyUz: "Bir burchakka qarama-qarshi katet ikkinchi burchakka yopishgan katet bo'ladi." },
      { nameUz: "Maxsus qiymatlar", formula: "sin 30° = 1/2,  sin 45° = √2/2,  sin 60° = √3/2", whyUz: "30-60-90 va 45-45-90 uchburchaklardan kelib chiqadi." },
    ],
    workedExample: {
      problemUz: "Katetlari 3 va 4 bo'lgan uchburchakda 3 ga qarshi burchak uchun sin, cos, tan ni toping.",
      steps: [
        "Gipotenuza: √(9 + 16) = 5.",
        "sin α = 3/5 = 0,6;  cos α = 4/5 = 0,8;  tan α = 3/4 = 0,75.",
        "Tekshiramiz: 0,6² + 0,8² = 0,36 + 0,64 = 1 ✓",
      ],
      answerUz: "sin α = 0,6;  cos α = 0,8;  tan α = 0,75",
    },
    practice: [
      {
        id: "trig-1",
        level: 1,
        promptUz: "sin 30° ning qiymatini o'nli kasrda yozing.",
        answer: 0.5,
        hintUz: "30-60-90 uchburchakda 30° qarshisidagi katet gipotenuzaning yarmi.",
        solutionUz: "sin 30° = 1/2 = 0,5.",
      },
      {
        id: "trig-2",
        level: 2,
        promptUz: "Katetlari 6 va 8, gipotenuzasi 10 bo'lgan uchburchakda 6 ga qarshi burchakning kosinusini toping.",
        answer: 0.8,
        hintUz: "cos = yopishgan katet / gipotenuza. 6 ga qarshi burchakka 8 yopishgan.",
        solutionUz: "cos α = 8/10 = 0,8.",
      },
      {
        id: "trig-3",
        level: 3,
        promptUz: "sin x = 0,6 bo'lsa, cos(90° − x) nechiga teng?",
        answer: 0.6,
        hintUz: "sin α = cos(90° − α).",
        solutionUz: "cos(90° − x) = sin x = 0,6.",
      },
    ],
    commonMistakesUz: [
      "Qarama-qarshi va yopishgan katetlarni adashtirish — doim burchakning o'zidan qarang.",
      "sin² α ni sin(α²) deb tushunish.",
      "Kalkulyator gradus (DEG) o'rniga radian (RAD) rejimida bo'lishi.",
    ],
    satTipUz: "SAT sevimli savoli: sin(x) = cos(y) bo'lsa, x + y = 90°. Hech narsa hisoblamang!",
  },
];

export function getMathTopic(slug: string): MathTopic | undefined {
  return MATH_TOPICS.find((t) => t.slug === slug);
}

/**
 * O'quvchi javobini tekshiradi. "0,5", "0.5", "1/2", " 7 " kabi yozuvlarni qabul qiladi.
 */
export function parseStudentNumber(raw: string): number | null {
  const s = raw.trim().replace(/\s+/g, "").replace(",", ".").replace("−", "-");
  if (!s) return null;
  if (s.includes("/")) {
    const [num, den] = s.split("/");
    const n = Number(num);
    const d = Number(den);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
    return n / d;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function checkMathAnswer(raw: string, expected: number): boolean {
  const value = parseStudentNumber(raw);
  if (value === null) return false;
  return Math.abs(value - expected) < 1e-6;
}
