export interface MathModuleLesson {
  id: number;
  slug: string;
  title: string;
  branch: "algebra" | "geometry";
  isFree: boolean;
  shortDesc: string;
  badge: string;

  // 1. Nazariya va Konsepsiya
  theory: {
    headline: string;
    intuition: string;
    paragraphs: string[];
    realWorldAnalogy: string;
  };

  // 2. Formula va Isbot (Proof)
  proof: {
    title: string;
    mainFormulas: Array<{ label: string; formula: string; note: string }>;
    proofSteps: Array<{ stepNumber: number; title: string; latex: string; explanation: string }>;
    conclusion: string;
  };

  // 3. Vizual Model turi
  visualType: "linear" | "parabola" | "pythagoras" | "circle" | "polygon";

  // 4. SAT Tuzoqlari (Common Traps)
  satTraps: Array<{
    trapTitle: string;
    mistakeText: string;
    correctWay: string;
    satLifehack: string;
  }>;

  // 5. Mini-Amaliyot (2 ta savol)
  miniPractice: Array<{
    id: string;
    prompt: string;
    options: { id: "A" | "B" | "C" | "D"; text: string }[];
    correct: "A" | "B" | "C" | "D";
    solution: string;
  }>;

  // 6. Talaba AI Xulosasi (Cheat Sheet)
  aiSummary: {
    cheatSheetTitle: string;
    takeaways: string[];
    quickRules: string[];
    suggestedAiPrompt: string;
  };
}

export const MATH_15_MODULES: MathModuleLesson[] = [
  // =========================================================================
  // MODUL 1: Chiziqli tenglamalar va tengsizliklar (Ochiq)
  // =========================================================================
  {
    id: 1,
    slug: "chiziqli-tenglamalar",
    title: "1. Chiziqli tenglamalar va tengsizliklar",
    branch: "algebra",
    isFree: true,
    shortDesc: "Tarozi muvozanati, burchak koeffitsiyenti (slope) va SAT proporsiya qoidalari.",
    badge: "Ochiq",
    theory: {
      headline: "Tenglama — bu mukammal muvozanatdagi palla tarozi",
      intuition:
        "Tenglama har doim ikkita pallasida bir xil og'irlik turgan qadimiy tarozidir. Agar chap pallaga 5 kg qo'shsangiz, muvozanat buzilmasligi uchun o'ng pallaga ham 5 kg qo'shishingiz shart.",
      paragraphs: [
        "Chiziqli tenglamaning eng sodda ko'rinishi: ax + b = c. Bu yerda x — noma'lum yuk, a — o'sha yuklar soni, b va c — ma'lum toshlar.",
        "Asosiy maqsad: barcha x li hadlarni bir tomonga, barcha sonlarni ikkinchi tomonga o'tkazib, x ni 'yolg'iz qoldirish' (izolyatsiya qilish).",
        "Tengsizliklarda esa eng muhim qoida: ikkala tomonni manfiy songa ko'paytirganda yoki bo'lganda, tengsizlik belgisi teskarisiga o'zgaradi (> dan < ga).",
      ],
      realWorldAnalogy:
        "Taksi narxi: 10 000 so'm o'tirish haqi (boshlang'ich b) + har bir km uchun 3 000 so'm (koeffitsiyent a). Agar cho'ntagingizda 40 000 so'm bo'lsa: 3000x + 10000 = 40000.",
    },
    proof: {
      title: "Chiziqli tenglamani yechishning aksiomatik isboti",
      mainFormulas: [
        { label: "Standart ko'rinish", formula: "ax + b = 0", note: "a ≠ 0 bo'lganda yagona yechimga ega: x = -b/a" },
        { label: "Burchak koeffitsiyenti (Slope)", formula: "m = (y₂ - y₁) / (x₂ - x₁)", note: "Har 1 birlik gorizontal siljishdagi vertikal o'zgarish" },
      ],
      proofSteps: [
        {
          stepNumber: 1,
          title: "Ikkala tomondan b ni ayirish",
          latex: "ax + b - b = c - b  \\implies  ax = c - b",
          explanation: "Tenglikning ikkala tomoniga bir xil son qo'shilsa yoki ayirilsa, tenglik saqlanadi (tenglik aksiomasi).",
        },
        {
          stepNumber: 2,
          title: "Koeffitsiyent a ga bo'lish (a ≠ 0)",
          latex: "\\frac{ax}{a} = \\frac{c - b}{a}  \\implies  x = \\frac{c - b}{a}",
          explanation: "Nolga bo'lish mumkin emas. a ≠ 0 bo'lgani uchun yagona aniq yechim hosil bo'ladi.",
        },
      ],
      conclusion: "Har qanday 1-darajali tenglama aynan bitta ildizga ega yoki a=0 holatida cheksiz/yechimsiz bo'ladi.",
    },
    visualType: "linear",
    satTraps: [
      {
        trapTitle: "x ni topmasdan butun ifodani so'rash",
        mistakeText: "Savol '4x + 6 ni toping' deydi. O'quvchi x ni topib, vaqt yo'qotadi va adashadi.",
        correctWay: "Agar 2x + 3 = 14 bo'lsa, 4x + 6 bu ifodaning 2 barobari! Demak, javob: 14 · 2 = 28.",
        satLifehack: "SAT da hech qachon shoshilib x ni hisoblamang — avval savolda so'ralgan ifodani berilgan tenglama bilan solishtiring.",
      },
      {
        trapTitle: "Tengsizlikda manfiy songa bo'lish",
        mistakeText: "-3x < 12 dan x < -4 deb belgilash.",
        correctWay: "-3 ga bo'lganda ishora qat'iy teskarisiga aylanadi: x > -4.",
        satLifehack: "Manfiy son bilan ko'paytirganda/bo'lganda qizil signalni eslang: belgi 180° ga buriladi!",
      },
    ],
    miniPractice: [
      {
        id: "m1-p1",
        prompt: "Agar 5x - 7 = 18 bo'lsa, 10x - 5 ifodaning qiymati nechiga teng?",
        options: [
          { id: "A", text: "45" },
          { id: "B", text: "50" },
          { id: "C", text: "55" },
          { id: "D", text: "40" },
        ],
        correct: "A",
        solution: "5x = 25 ⇒ x = 5. Demak, 10(5) - 5 = 50 - 5 = 45. (Yoki: 10x - 14 = 36 ⇒ 10x - 5 = 36 + 9 = 45).",
      },
      {
        id: "m1-p2",
        prompt: "Qaysi tenglama x ning har qanday qiymatida o'rinli (cheksiz ko'p yechimga ega)?",
        options: [
          { id: "A", text: "3(x + 2) = 3x + 5" },
          { id: "B", text: "2(2x - 1) = 4x - 2" },
          { id: "C", text: "5x + 1 = 2x + 1" },
          { id: "D", text: "4x - 8 = 4(x - 3)" },
        ],
        correct: "B",
        solution: "2(2x - 1) = 4x - 2 qavslar ochilsa: 4x - 2 = 4x - 2. Ayniyat hosil bo'ladi, demak cheksiz ko'p yechim.",
      },
    ],
    aiSummary: {
      cheatSheetTitle: "Chiziqli tenglamalar shpargalkasi",
      takeaways: [
        "ax + b = c tenglamada x = (c - b) / a.",
        "m = (y₂ - y₁) / (x₂ - x₁) — burchak koeffitsiyenti.",
        "Paralel to'g'ri chiziqlar uchun m₁ = m₂.",
        "Perpendikulyar to'g'ri chiziqlar uchun m₁ · m₂ = -1.",
      ],
      quickRules: ["Tengsizlikda manfiy songa bo'lsang, belgini ag'dar!", "Ifodalar orasidagi ko'paytuvchini izla."],
      suggestedAiPrompt: "Ustoz, SAT Math'dagi 'No solution' va 'Infinitely many solutions' savollarini 5 soniyada qanday ajrataman?",
    },
  },

  // =========================================================================
  // MODUL 2: Kvadrat tenglamalar va Viyet teoremasi (Ochiq)
  // =========================================================================
  {
    id: 2,
    slug: "kvadrat-tenglamalar",
    title: "2. Kvadrat tenglamalar va Viyet teoremasi",
    branch: "algebra",
    isFree: true,
    shortDesc: "Diskriminant tahlili, to'la kvadratga ajratish va Viyeta teoremasi orqali ildizlar siri.",
    badge: "Ochiq",
    theory: {
      headline: "Kvadrat tenglama — parabolaning yer (x o'qi) bilan uchrashuvi",
      intuition:
        "Toshni yuqoriga otganingizda uning balandligi h(t) = -5t² + v₀t + h₀ ko'rinishidagi kvadrat funksiyaga bo'ysunadi. Tosh yerga tushganda h = 0 bo'ladi — bu esa kvadrat tenglamaning ildizlaridir.",
      paragraphs: [
        "Har qanday kvadrat tenglama ax² + bx + c = 0 ko'rinishida yoziladi (a ≠ 0).",
        "Diskriminant D = b² - 4ac orqali ildizlar xarakteri aniqlanadi: D > 0 (2 ta haqiqiy ildiz), D = 0 (1 ta karrali ildiz), D < 0 (haqiqiy ildiz yo'q, 2 ta kompleks ildiz).",
        "Viyeta teoremasi — tenglamani yechmasdan, ildizlar yig'indisi va ko'paytmasini bir soniyada topish qurolidir.",
      ],
      realWorldAnalogy:
        "Bino arxitekturasidagi arkalar yoki sun'iy yo'ldosh tovoqlari (antenalar) — barcha signallarni bir fokus nuqtasiga jamlaydigan kvadrat parabola shaklidadir.",
    },
    proof: {
      title: "To'la kvadratga ajratish orqali kvadrat formula isboti",
      mainFormulas: [
        { label: "Kvadrat formula", formula: "x = (-b ± √(b² - 4ac)) / (2a)", note: "Diskriminant D = b² - 4ac" },
        { label: "Viyeta teoremasi", formula: "x₁ + x₂ = -b/a,   x₁ · x₂ = c/a", note: "Ildizlarni topmasdan hisoblash siri" },
      ],
      proofSteps: [
        {
          stepNumber: 1,
          title: "a ga bo'lish va c/a ni o'ngga o'tkazish",
          latex: "x^2 + \\frac{b}{a}x = -\\frac{c}{a}",
          explanation: "a koeffitsiyentini 1 ga keltirib olamiz.",
        },
        {
          stepNumber: 2,
          title: "Ikkala tomonga (b / 2a)² ni qo'shish (to'la kvadrat hosil qilish)",
          latex: "x^2 + 2\\cdot x \\cdot \\frac{b}{2a} + \\left(\\frac{b}{2a}\\right)^2 = \\frac{b^2}{4a^2} - \\frac{c}{a}",
          explanation: "(x + b/2a)² yig'indining kvadratini hosil qilamiz.",
        },
        {
          stepNumber: 3,
          title: "Ildiz chiqarish va x ni topish",
          latex: "\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}  \\implies  x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
          explanation: "Mana nima uchun maxrajda 2a va ildiz ostida b² - 4ac turadi!",
        },
      ],
      conclusion: "Viyet teoremasi x₁ va x₂ ni qo'shganda ildizli ifodalar qisqarib ketishi natijasida kelib chiqadi: (-b+√D -b-√D)/(2a) = -2b/(2a) = -b/a.",
    },
    visualType: "parabola",
    satTraps: [
      {
        trapTitle: "Viyeta yig'indisida ishorani unutish",
        mistakeText: "x² - 8x + 12 = 0 tenglamada ildizlar yig'indisini -8 deb olish.",
        correctWay: "Formula: x₁ + x₂ = -b/a. Bu yerda b = -8, demak -(-8)/1 = +8!",
        satLifehack: "Kvadrat tenglamada o'rta hadning teskari ishorasi — ildizlar yig'indisidir.",
      },
      {
        trapTitle: "D = 0 'One distinct real solution' tuzog'i",
        mistakeText: "Savol 'Tenglama yagona haqiqiy ildizga ega bo'lsa, k nechiga teng?' deganda formulani yechishga kirishish.",
        correctWay: "Shart: D = b² - 4ac = 0 bo'lishi shart. To'g'ridan-to'g'ri b² = 4ac ni qo'ying.",
        satLifehack: "'One real solution' yoki 'tangent to x-axis' desa, darhol D = 0 deb yozing.",
      },
    ],
    miniPractice: [
      {
        id: "m2-p1",
        prompt: "Agar x² - 12x + k = 0 tenglamaning bitta ildizi ikkinchisidan 2 ga katta bo'lsa, k nechiga teng?",
        options: [
          { id: "A", text: "35" },
          { id: "B", text: "32" },
          { id: "C", text: "36" },
          { id: "D", text: "27" },
        ],
        correct: "A",
        solution: "Viyet: x₁ + x₂ = 12. Shart: x₁ - x₂ = 2. Qo'shsak: 2x₁ = 14 ⇒ x₁ = 7, x₂ = 5. Demak, k = 7 · 5 = 35.",
      },
      {
        id: "m2-p2",
        prompt: "3x² + 6x + c = 0 tenglama aynan bitta haqiqiy ildizga ega bo'lishi uchun c nechiga teng bo'lishi kerak?",
        options: [
          { id: "A", text: "2" },
          { id: "B", text: "3" },
          { id: "C", text: "4" },
          { id: "D", text: "1" },
        ],
        correct: "B",
        solution: "D = b² - 4ac = 6² - 4(3)(c) = 36 - 12c = 0 ⇒ 12c = 36 ⇒ c = 3.",
      },
    ],
    aiSummary: {
      cheatSheetTitle: "Kvadrat tenglamalar shpargalkasi",
      takeaways: [
        "D = b² - 4ac. D > 0 (2 ta), D = 0 (1 ta), D < 0 (0 ta haqiqiy).",
        "Viyeta: x₁ + x₂ = -b/a,   x₁ · x₂ = c/a.",
        "x₁² + x₂² = (x₁ + x₂)² - 2x₁x₂.",
        "Parabola uchi x_v = -b / (2a).",
      ],
      quickRules: ["Yig'indida b ning ishorasi teskari!", "D=0 bo'lsa to'la kvadrat bo'ladi."],
      suggestedAiPrompt: "Talaba AI, menga SAT Math'dan Viyeta teoremasiga doir eng qiyin 1 ta savol ber.",
    },
  },

  // =========================================================================
  // MODUL 3: Kvadrat funksiyalar va Parabola (Ochiq)
  // =========================================================================
  {
    id: 3,
    slug: "kvadrat-funksiyalar",
    title: "3. Kvadrat funksiyalar va Parabola",
    branch: "algebra",
    isFree: true,
    shortDesc: "Vertex form f(x)=a(x-h)²+k, simmetriya o'qi, maksimum/minimum va grafik tahlili.",
    badge: "Ochiq",
    theory: {
      headline: "Parabola — tabiatning eng simmetrik egri chizig'i",
      intuition:
        "Parabola har doim o'zining cho'qqisi (Vertex) atrofida mukammal ko'zgu simmetriyasiga ega. Agar a > 0 bo'lsa, kosadek tepaga ochiladi (minimum qiymat); a < 0 bo'lsa, gumbazdek pastga ochiladi (maksimum qiymat).",
      paragraphs: [
        "Parabolaning 3 xil ko'rinishi bor: Standart f(x)=ax²+bx+c, Ildizli f(x)=a(x-x₁)(x-x₂) va Cho'qqi (Vertex) f(x)=a(x-h)²+k.",
        "SAT da eng ko'p so'raladigan ko'rinish — bu Cho'qqi ko'rinishidir, chunki (h, k) darhol funksiyaning eng katta yoki eng kichik qiymatini ko'rsatadi.",
        "Simmetriya o'qi doimo x = h = -b / (2a) to'g'ri chizig'idir.",
      ],
      realWorldAnalogy:
        "Basketbol to'pining savatga uchishi: eng yuqori nuqtaga yetib (Vertex), so'ngra xuddi shunday trayektoriya bilan savatga tushadi.",
    },
    proof: {
      title: "Standart ko'rinishdan Vertex (cho'qqi) ko'rinishga o'tish isboti",
      mainFormulas: [
        { label: "Vertex Form", formula: "f(x) = a(x - h)² + k", note: "Cho'qqi nuqtasi: (h, k)" },
        { label: "Simmetriya o'qi", formula: "h = -b / (2a),   k = f(h)", note: "Ildizlarning o'rta arifmetigi: (x₁ + x₂) / 2" },
      ],
      proofSteps: [
        {
          stepNumber: 1,
          title: "a koeffitsiyentini qavsdan chiqarish",
          latex: "f(x) = a\\left(x^2 + \\frac{b}{a}x\\right) + c",
          explanation: "Faqat x li hadlardan a ni chiqaramiz.",
        },
        {
          stepNumber: 2,
          title: "Qavs ichida to'la kvadrat hosil qilish",
          latex: "f(x) = a\\left(x + \\frac{b}{2a}\\right)^2 - a\\cdot \\frac{b^2}{4a^2} + c = a\\left(x + \\frac{b}{2a}\\right)^2 + \\left(c - \\frac{b^2}{4a}\\right)",
          explanation: "Mana h = -b/(2a) va k = c - b²/(4a) kelib chiqishi!",
        },
      ],
      conclusion: "Har qanday kvadrat funksiyaning cho'qqisi simmetriya o'qida yotadi: h = -b/(2a).",
    },
    visualType: "parabola",
    satTraps: [
      {
        trapTitle: "Vertexdagi h ning ishorasida adashish",
        mistakeText: "f(x) = 2(x + 3)² - 5 funksiyaning cho'qqisini (3, -5) deb o'ylash.",
        correctWay: "Formula a(x - h)² bo'lgani uchun, x + 3 = x - (-3), demak h = -3! Cho'qqi: (-3, -5).",
        satLifehack: "Qavs ichidagi sonning teskarisi — h koordinatasidir.",
      },
      {
        trapTitle: "Maksimum/Minimum qiymat nimani anglatishi",
        mistakeText: "Savol 'eng kichik qiymatini toping' desa, h ni belgilab qo'yish.",
        correctWay: "X qayerdaligi so'ralsa — h (masalan, qaysi sekundda). Eng kichik qiymat so'ralsa — k (masalan, qanday balandlik)!",
        satLifehack: "Maksimum/minimum qiymat har doim y o'qidagi k sonidir.",
      },
    ],
    miniPractice: [
      {
        id: "m3-p1",
        prompt: "f(x) = -2(x - 4)² + 18 funksiyaning maksimum qiymati nechiga teng va u qaysi x da erishiladi?",
        options: [
          { id: "A", text: "Maksimum 18 (x = 4 da)" },
          { id: "B", text: "Maksimum -18 (x = -4 da)" },
          { id: "C", text: "Minimum 18 (x = 4 da)" },
          { id: "D", text: "Maksimum 4 (x = 18 da)" },
        ],
        correct: "A",
        solution: "a = -2 < 0 bo'lgani uchun parabola pastga ochiladi (maksimumga ega). Cho'qqi (4, 18). Maksimum qiymat: 18.",
      },
      {
        id: "m3-p2",
        prompt: "y = x² - 6x + 5 parabolaning simmetriya o'qi tenglamasini toping:",
        options: [
          { id: "A", text: "x = 3" },
          { id: "B", text: "x = -3" },
          { id: "C", text: "x = 6" },
          { id: "D", text: "y = 3" },
        ],
        correct: "A",
        solution: "h = -b / (2a) = -(-6) / (2 · 1) = 6 / 2 = 3. Simmetriya o'qi vertikal to'g'ri chiziq: x = 3.",
      },
    ],
    aiSummary: {
      cheatSheetTitle: "Kvadrat funksiya & Parabola shpargalkasi",
      takeaways: [
        "Standard: ax² + bx + c (c — y-intercept).",
        "Vertex: a(x - h)² + k ((h, k) — cho'qqi).",
        "Factored: a(x - p)(x - q) (p va q — x-intercepts).",
        "h = (p + q) / 2 = -b / (2a).",
      ],
      quickRules: ["a > 0 bo'lsa minimum, a < 0 bo'lsa maksimum.", "Qavs ichi x-siljishni teskari ko'rsatadi."],
      suggestedAiPrompt: "Talaba AI, Desmos kalkulyatorida parabolani siljitish bo'yicha SAT sirlarini tushuntir.",
    },
  },

  // =========================================================================
  // MODULLAR 4–15 (Pro Campus)
  // =========================================================================
  {
    id: 4,
    slug: "kophadlar-bezout",
    title: "4. Ko'phadlar va Bezout teoremasi",
    branch: "algebra",
    isFree: false,
    shortDesc: "Qoldiqli bo'lish, ko'phad ildizlari, Remainder Theorem va ko'paytuvchilarga ajratish.",
    badge: "Pro Campus",
    theory: {
      headline: "Ko'phadlarni bo'lish — sonlarni bo'lish kabi qulay",
      intuition:
        "P(x) ko'phadni (x - c) ga bo'lgandagi qoldiqni topish uchun uzun bo'lish shart emas — shunchaki x o'rniga c qo'ysangiz bas (Bezout teoremasi)!",
      paragraphs: [
        "Remainder Theorem: P(x) ni (x - c) ga bo'lgandagi qoldiq R = P(c) ga teng.",
        "Factor Theorem: Agar P(c) = 0 bo'lsa, demak (x - c) ko'phadning ko'paytuvchisi (faktori) hisoblanadi.",
      ],
      realWorldAnalogy: "Raqamli kodlash va shifrlash (kriptografiya) algoritmlari to'liq ko'phadlar qoldig'iga asoslanadi.",
    },
    proof: {
      title: "Bezout teoremasi isboti",
      mainFormulas: [{ label: "Qoldiqli bo'lish", formula: "P(x) = (x - c)Q(x) + R", note: "R — o'zgarmas son" }],
      proofSteps: [
        {
          stepNumber: 1,
          title: "x = c qo'yish",
          latex: "P(c) = (c - c)Q(c) + R = 0\\cdot Q(c) + R = R",
          explanation: "(c - c) = 0 bo'lib, butun Q(c) yo'qoladi va aynan R qoladi!",
        },
      ],
      conclusion: "Qoldiq doimo P(c) ga teng.",
    },
    visualType: "linear",
    satTraps: [
      {
        trapTitle: "(x + 2) ga bo'lganda c = 2 deb olish",
        mistakeText: "P(2) ni hisoblab qo'yish.",
        correctWay: "(x - c) = (x + 2) ⇒ c = -2. Demak, P(-2) hisoblanadi!",
        satLifehack: "Qavsdagi sonning teskarisini ko'phadga qo'ying.",
      },
    ],
    miniPractice: [
      {
        id: "m4-p1",
        prompt: "P(x) = x³ - 2x² + 5x - 7 ko'phadni (x - 2) ga bo'lgandagi qoldiqni toping:",
        options: [
          { id: "A", text: "3" },
          { id: "B", text: "7" },
          { id: "C", text: "-3" },
          { id: "D", text: "5" },
        ],
        correct: "A",
        solution: "P(2) = 2³ - 2(2²) + 5(2) - 7 = 8 - 8 + 10 - 7 = 3.",
      },
    ],
    aiSummary: {
      cheatSheetTitle: "Ko'phadlar qoidalari",
      takeaways: ["Qoldiq R = P(c).", "Agar P(c) = 0 bo'lsa, x = c ildizdir."],
      quickRules: ["(x - a) ga bo'lsang, x = a qo'y."],
      suggestedAiPrompt: "Talaba AI, ko'phadlarni burchakli bo'lish usulini misol bilan tushuntir.",
    },
  },
  {
    id: 5,
    slug: "ratsional-ifodalar",
    title: "5. Ratsional ifodalar va tengsizliklar",
    branch: "algebra",
    isFree: false,
    shortDesc: "Kasrli tenglamalar, chet ildizlar (extraneous solutions) va intervallar metodi.",
    badge: "Pro Campus",
    theory: {
      headline: "Maxrajda x bo'lganda ehtiyotkorlik — nolga bo'lish taqiqlanadi!",
      intuition: "Ratsional ifodalarda maxrajni nolga aylantiradigan nuqtalar xavfli zonadir (asimptotalar).",
      paragraphs: ["Chet ildizlar tenglamani kvadratga ko'targanda yoki maxrajga ko'paytirganda hosil bo'ladi."],
      realWorldAnalogy: "Tezlik va vaqt: t = S / v. Tezlik nolga yaqinlashganda vaqt cheksizga intiladi.",
    },
    proof: {
      title: "Intervallar metodi isboti",
      mainFormulas: [{ label: "Ratsional kasr", formula: "P(x) / Q(x) ≥ 0", note: "Q(x) ≠ 0 sharti bilan" }],
      proofSteps: [{ stepNumber: 1, title: "Ildizlarni topish", latex: "P(x)=0, Q(x)=0", explanation: "O'qda ishoralar o'zgaradigan nuqtalar belgilanadi." }],
      conclusion: "Har bir oraliqda ishora tekshiriladi.",
    },
    visualType: "linear",
    satTraps: [{ trapTitle: "Chet ildizni tekshirmaslik", mistakeText: "Topilgan x ni to'g'ri deb belgilash.", correctWay: "Maxrajga qo'yib tekshiring!", satLifehack: "Kasrli tenglamada ildizni maxrajga qo'yib 0 chiqmasligini tekshir." }],
    miniPractice: [{ id: "m5-p1", prompt: "x / (x - 3) = 3 / (x - 3) + 2 tenglamaning ildizini toping:", options: [{ id: "A", text: "x = 3" }, { id: "B", text: "Yechimga ega emas" }, { id: "C", text: "x = 5" }, { id: "D", text: "x = 0" }], correct: "B", solution: "x = 3 + 2(x - 3) ⇒ x = 2x - 3 ⇒ x = 3. Lekin x = 3 bo'lsa maxraj 0 bo'lib qoladi! Chet ildiz, yechim yo'q." }],
    aiSummary: { cheatSheetTitle: "Ratsional kasrlar", takeaways: ["Maxraj hech qachon 0 bo'lmasin.", "Chet ildizlarni tekshir."], quickRules: ["Intervallar metodida juft karrali ildizda ishora o'zgarmaydi."], suggestedAiPrompt: "Talaba AI, extraneous solution qachon paydo bo'lishini tushuntir." },
  },
  {
    id: 6,
    slug: "darajalar-ildizlar",
    title: "6. Darajalar, ildizlar va radikallar",
    branch: "algebra",
    isFree: false,
    shortDesc: "Kasr darajalar x^(m/n), manfiy darajalar va radikal tenglamalarni yechish qoidalari.",
    badge: "Pro Campus",
    theory: {
      headline: "Ildiz — bu aslida kasr darajadir!",
      intuition: "ⁿ√(xᵐ) = x^(m/n). Bu formula orqali barcha daraja xossalarini ildizlarga ham qo'llash mumkin.",
      paragraphs: ["x⁻ⁿ = 1 / xⁿ — manfiy daraja sonni ag'daradi."],
      realWorldAnalogy: "Virus tarqalishi va bakteriyalarning bo'linishi: 2¹, 2², 2³...",
    },
    proof: {
      title: "Kasr darajaning ma'nosi",
      mainFormulas: [{ label: "Kasr daraja", formula: "x^(a/b) = ᵇ√(xᵃ)", note: "b — ildiz darajasi, a — ko'rsatkich" }],
      proofSteps: [{ stepNumber: 1, title: "Darajaga ko'tarish", latex: "(x^{1/n})^n = x^{n/n} = x^1 = x", explanation: "Ildizning n-darajasi sonning o'ziga teng." }],
      conclusion: "Darajalar ko'paytiriladi, bo'linganda ayiriladi.",
    },
    visualType: "linear",
    satTraps: [{ trapTitle: "√(x²) = x deb o'ylash", mistakeText: "Manfiy sonlar uchun |x| bo'ladi.", correctWay: "√((-5)²) = √25 = +5.", satLifehack: "Kvadrat ildiz doimo nomanfiy natija beradi." }],
    miniPractice: [{ id: "m6-p1", prompt: "16^(3/4) ning qiymatini hisoblang:", options: [{ id: "A", text: "8" }, { id: "B", text: "12" }, { id: "C", text: "6" }, { id: "D", text: "16" }], correct: "A", solution: "16^(1/4) = 2, so'ngra 2³ = 8." }],
    aiSummary: { cheatSheetTitle: "Darajalar xossalari", takeaways: ["xᵃ · xᵇ = xᵃ⁺ᵇ", "xᵃ / xᵇ = xᵃ⁻ᵇ", "(xᵃ)ᵇ = xᵃᵇ"], quickRules: ["Manfiy daraja kasrga aylantiradi."], suggestedAiPrompt: "Talaba AI, radikal tenglamalarni tezkor yechish usulini o'rgat." },
  },
  {
    id: 7,
    slug: "eksponensial-logarifm",
    title: "7. Ko'rsatkichli va logarifmik funksiyalar",
    branch: "algebra",
    isFree: false,
    shortDesc: "O'sish va kamayish modellari y=a(1±r)^t, murakkab foiz va logarifm qoidalari.",
    badge: "Pro Campus",
    theory: {
      headline: "Eksponensial o'sish — qor uyumi effekti",
      intuition: "Chiziqli o'sish har yili bir xil son qo'shadi (+5). Eksponensial o'sish esa bir xil karra ko'paytiradi (·1.05).",
      paragraphs: ["y = a(b)^x. Agar b > 1 bo'lsa o'sish, 0 < b < 1 bo'lsa kamayish."],
      realWorldAnalogy: "Bank depozitlaridagi murakkab foiz (compound interest).",
    },
    proof: {
      title: "Logarifm — darajaning teskarisi",
      mainFormulas: [{ label: "Logarifm ta'rifi", formula: "log_b(a) = c  ⟺  b^c = a", note: "b > 0, b ≠ 1, a > 0" }],
      proofSteps: [{ stepNumber: 1, title: "Xossalar", latex: "\\log(xy) = \\log x + \\log y", explanation: "Darajalarni qo'shish qoidasidan kelib chiqadi." }],
      conclusion: "Logarifm ko'paytmani yig'indiga aylantiradi.",
    },
    visualType: "linear",
    satTraps: [{ trapTitle: "Yillik foiz va oylik foiz adashishi", mistakeText: "1.05 ni 50% deb o'ylash.", correctWay: "1.05 = 1 + 0.05, ya'ni 5% o'sish.", satLifehack: "1 dan katta qismi foiz o'sishini beradi." }],
    miniPractice: [{ id: "m7-p1", prompt: "M(t) = 500 · (0.88)^t funksiya har yili qanday o'zgarishni bildiradi?", options: [{ id: "A", text: "Har yili 12% ga kamayadi" }, { id: "B", text: "Har yili 88% ga kamayadi" }, { id: "C", text: "Har yili 12% ga o'sadi" }, { id: "D", text: "Har yili 500$ kamayadi" }], correct: "A", solution: "0.88 = 1 - 0.12, ya'ni har yili 12% kamayish." }],
    aiSummary: { cheatSheetTitle: "Eksponensial modellar", takeaways: ["y = a(1 + r)^t — o'sish.", "y = a(1 - r)^t — kamayish."], quickRules: ["Asos 1 dan katta bo'lsa o'sadi, kichik bo'lsa so'nadi."], suggestedAiPrompt: "Talaba AI, murakkab foiz formulasini tushuntir." },
  },
  {
    id: 8,
    slug: "burchaklar-uchburchaklar",
    title: "8. Burchaklar va uchburchaklar geometriyasi",
    branch: "geometry",
    isFree: false,
    shortDesc: "Ichki burchaklar yig'indisi 180°, tashqi burchak xossasi, o'xshashlik (similarity).",
    badge: "Pro Campus",
    theory: {
      headline: "Uchburchak — geometriya binosining eng mustahkam g'ishti",
      intuition: "Uchburchakning ichki burchaklari yig'indisi doimo 180°. Tashqi burchak esa o'ziga qo'shni bo'lmagan ikki ichki burchak yig'indisiga teng.",
      paragraphs: ["O'xshash uchburchaklarda mos tomonlar nisbati bir xil (k) va yuzlar nisbati k² bo'ladi."],
      realWorldAnalogy: "Ko'priklar va kranlar nima uchun uchburchak fermalardan yasaladi? Chunki uchburchak deformatsiyaga uchramaydi.",
    },
    proof: {
      title: "Uchburchak burchaklari 180° ekanining isboti",
      mainFormulas: [{ label: "Burchaklar yig'indisi", formula: "α + β + γ = 180°", note: "Ixtiyoriy uchburchakda" }],
      proofSteps: [{ stepNumber: 1, title: "Paralel chiziq o'tkazish", latex: "L \\parallel AC", explanation: "Ichki almashinuvchi burchaklar tengligidan 180° li yoyiq burchak hosil bo'ladi." }],
      conclusion: "Tashqi burchak d = a + b.",
    },
    visualType: "pythagoras",
    satTraps: [{ trapTitle: "O'xshashlikda yuzlar nisbatini adashtirish", mistakeText: "Tomonlar 2 barobar katta bo'lsa, yuz ham 2 barobar deb o'ylash.", correctWay: "Tomonlar k bo'lsa, yuz k² = 4 barobar katta!", satLifehack: "Yuzlar nisbati tomonlar nisbatining kvadratidir." }],
    miniPractice: [{ id: "m8-p1", prompt: "Uchburchakning ikki burchagi 45° va 65° bo'lsa, uchinchi burchak tashqi burchagi nechiga teng?", options: [{ id: "A", text: "110°" }, { id: "B", text: "70°" }, { id: "C", text: "135°" }, { id: "D", text: "120°" }], correct: "A", solution: "Tashqi burchak o'ziga qo'shni bo'lmagan ikki burchak yig'indisi: 45° + 65° = 110°." }],
    aiSummary: { cheatSheetTitle: "Uchburchaklar qoidalari", takeaways: ["Ichki burchaklar: 180°.", "O'xshashlik: yuzlar k² nisbatda."], quickRules: ["Tashqi burchak = boshqa ikkitasining yig'indisi."], suggestedAiPrompt: "Talaba AI, SAT geometriyadagi eng tezkor burchak qoidalarini ayt." },
  },
  {
    id: 9,
    slug: "pifagor-teoremasi",
    title: "9. Pifagor teoremasi va maxsus uchburchaklar",
    branch: "geometry",
    isFree: false,
    shortDesc: "a²+b²=c², Pifagor uchliklari (3-4-5, 5-12-13, 7-24-25, 8-15-17), 30-60-90 va 45-45-90.",
    badge: "Pro Campus",
    theory: {
      headline: "To'g'ri burchakli uchburchak — koordinata masofasining poydevori",
      intuition: "Ikkita katet ustiga qurilgan kvadratlar yuzining yig'indisi gipotenuza ustiga qurilgan kvadrat yuziga teng.",
      paragraphs: ["SAT Reference sheet'da berilgan 30-60-90 (x, x√3, 2x) va 45-45-90 (x, x, x√2) vaqtni 10 barobar tejaydi."],
      realWorldAnalogy: "Ekran diagonali: 16:9 nisbatdagi monitor diagonali Pifagor teoremasi orqali hisoblanadi.",
    },
    proof: {
      title: "Kvadrat ichidagi kvadrat orqali Pifagor isboti",
      mainFormulas: [
        { label: "Pifagor", formula: "a² + b² = c²", note: "c — gipotenuza" },
        { label: "30-60-90", formula: "30° qarshisi: x,   60° qarshisi: x√3,   90°: 2x", note: "Teng tomonli uchburchakning yarmi" },
      ],
      proofSteps: [{ stepNumber: 1, title: "Katta kvadrat yuzi", latex: "(a + b)^2 = 4\\cdot (\\frac{1}{2}ab) + c^2", explanation: "a² + 2ab + b² = 2ab + c² ⇒ a² + b² = c²!" }],
      conclusion: "Isbot to'liq.",
    },
    visualType: "pythagoras",
    satTraps: [{ trapTitle: "Gipotenuzani adashtirish", mistakeText: "Ixtiyoriy tomonni c deb olish.", correctWay: "Faqat 90° burchak ro'parasidagi eng uzun tomon c dir!", satLifehack: "3-4-5, 5-12-13, 7-24-25, 8-15-17 ni yoddan biling." }],
    miniPractice: [{ id: "m9-p1", prompt: "30-60-90 uchburchakda gipotenuza 10 ga teng. 60° burchak qarshisidagi katetni toping:", options: [{ id: "A", text: "5√3" }, { id: "B", text: "5" }, { id: "C", text: "10√3" }, { id: "D", text: "5√2" }], correct: "A", solution: "Gipotenuza 2x = 10 ⇒ x = 5 (30° qarshisi). 60° qarshisi esa x√3 = 5√3." }],
    aiSummary: { cheatSheetTitle: "Pifagor va maxsus uchburchaklar", takeaways: ["a² + b² = c².", "45-45-90: x, x, x√2.", "30-60-90: x, x√3, 2x."], quickRules: ["3-4-5 karralilari: 6-8-10, 9-12-15."], suggestedAiPrompt: "Talaba AI, 30-60-90 qoidasini yodda saqlashning eng oson yo'li qaysi?" },
  },
  {
    id: 10,
    slug: "yuzlar-perimetr",
    title: "10. Yuzlar, perimetr va ko'pburchaklar",
    branch: "geometry",
    isFree: false,
    shortDesc: "Trapetsiya, parallelogramm, romb yuzlari, muntazam ko'pburchak ichki burchaklari (n-2)·180°.",
    badge: "Pro Campus",
    theory: {
      headline: "Har qanday ko'pburchak — uchburchaklar to'plamidir",
      intuition: "Ixtiyoriy n-burchakli shaklni bitta cho'qqisidan (n - 2) ta uchburchakka ajratish mumkin.",
      paragraphs: ["Ichki burchaklar yig'indisi: (n - 2) · 180°. Har qanday qavariq ko'pburchak tashqi burchaklari yig'indisi esa doimo 360°!"],
      realWorldAnalogy: "Asalarilar inidagi oltiburchaklar — eng kam mum bilan eng katta hajm beruvchi optimal shakl.",
    },
    proof: {
      title: "Trapetsiya yuzi formulasi",
      mainFormulas: [{ label: "Trapetsiya yuzi", formula: "S = ((a + b) / 2) · h", note: "O'rta chiziq ko'paytirilgan balandlik" }],
      proofSteps: [{ stepNumber: 1, title: "Ikkita trapetsiyani birlashtirish", latex: "2S = (a + b) \\cdot h  \\implies  S = \\frac{a + b}{2}h", explanation: "Parallelogramm hosil bo'ladi." }],
      conclusion: "O'rta chiziq m = (a + b) / 2.",
    },
    visualType: "polygon",
    satTraps: [{ trapTitle: "Trapetsiya yuzida yon tomonni balandlik deb olish", mistakeText: "Yon tomonni h o'rniga qo'yish.", correctWay: "Faqat asosga tushirilgan 90° perpendikulyar balandlikdir!", satLifehack: "Balandlikni topish uchun Pifagordan foydalaning." }],
    miniPractice: [{ id: "m10-p1", prompt: "Muntazam sakkizburchakning (octagon) bitta ichki burchagi necha gradus?", options: [{ id: "A", text: "135°" }, { id: "B", text: "140°" }, { id: "C", text: "120°" }, { id: "D", text: "108°" }], correct: "A", solution: "Tashqi burchak: 360° / 8 = 45°. Ichki burchak: 180° - 45° = 135°." }],
    aiSummary: { cheatSheetTitle: "Ko'pburchaklar", takeaways: ["(n - 2) · 180° — ichki burchaklar.", "Tashqi burchaklar doimo 360°."], quickRules: ["Muntazam shakl burchagi: 180° - (360° / n)."], suggestedAiPrompt: "Talaba AI, ko'pburchaklar bo'yicha SAT shortcutlarini ko'rsat." },
  },
  {
    id: 11,
    slug: "aylana-sektor",
    title: "11. Aylana, vatar va sektor geometriyasi",
    branch: "geometry",
    isFree: false,
    shortDesc: "Doira yuzi πr², aylana uzunligi 2πr, markaziy va ichki chizilgan burchaklar, yoy uzunligi.",
    badge: "Pro Campus",
    theory: {
      headline: "Aylana — cheksiz simmetriya va π siri",
      intuition: "Doira yuzi πr², aylana uzunligi 2πr. Markaziy burchak yoyga teng, ichki chizilgan burchak esa yoyning yarmiga teng!",
      paragraphs: ["Diametrga tiralgan har qanday ichki chizilgan burchak doimo to'g'ri burchak (90°) bo'ladi."],
      realWorldAnalogy: "Pitsa bo'lagi (sektor) va uning cheti (yoy uzunligi).",
    },
    proof: {
      title: "Sektor yuzi formulasi",
      mainFormulas: [
        { label: "Doira yuzi", formula: "A = πr²", note: "To'liq 360°" },
        { label: "Sektor yuzi", formula: "A_sektor = (θ / 360°) · πr²", note: "θ — markaziy burchak" },
        { label: "Yoy uzunligi", formula: "L = (θ / 360°) · 2πr", note: "Aylana qismi" },
      ],
      proofSteps: [{ stepNumber: 1, title: "Proporsiya", latex: "\\frac{A_{sektor}}{\\pi r^2} = \\frac{\\theta}{360^\\circ}", explanation: "Butun doiraning burchak ulushi." }],
      conclusion: "Radianlarda: A = (1/2)r²θ.",
    },
    visualType: "circle",
    satTraps: [{ trapTitle: "Ichki va markaziy burchakni adashtirish", mistakeText: "Aylana chetidagi burchakni markaziy deb olish.", correctWay: "Ichki burchak markaziy burchakning yarmi: θ_ichki = θ_markaziy / 2.", satLifehack: "Diametrga tayangan burchakni ko'rsangiz darhol 90° qo'ying." }],
    miniPractice: [{ id: "m11-p1", prompt: "Radiusi 6 bo'lgan doirada 60° li sektorning yuzini toping:", options: [{ id: "A", text: "6π" }, { id: "B", text: "12π" }, { id: "C", text: "36π" }, { id: "D", text: "3π" }], correct: "A", solution: "(60 / 360) · π(6²) = (1/6) · 36π = 6π." }],
    aiSummary: { cheatSheetTitle: "Aylana formulalari", takeaways: ["L = 2πr, A = πr².", "Ichki chizilgan burchak = Yoy / 2."], quickRules: ["Diametrga tiralgan burchak = 90°."], suggestedAiPrompt: "Talaba AI, aylanaga o'tkazilgan urinma xossalarini tushuntir." },
  },
  {
    id: 12,
    slug: "fazoviy-jismlar",
    title: "12. Fazoviy jismlar va hajm (3D Geometry)",
    branch: "geometry",
    isFree: false,
    shortDesc: "Silindr, konus, piramida, shar hajmi va to'liq sirt yuzlari. SAT Reference Sheet.",
    badge: "Pro Campus",
    theory: {
      headline: "3D Geometriya — tekislikdan fazoga qadam",
      intuition: "Har qanday to'g'ri prizma va silindr hajmi: V = S_asos · h. Konus va piramida esa uning uchdan bir qismi: V = (1/3)S_asos · h.",
      paragraphs: ["Shar hajmi: V = (4/3)πr³, shar sirti: S = 4πr²."],
      realWorldAnalogy: "Suv idishi yoki qahva stakanining sig'imi.",
    },
    proof: {
      title: "Konus hajmining silindrga nisbati",
      mainFormulas: [
        { label: "Silindr hajmi", formula: "V = πr²h", note: "Asos doirasi yuzi ko'paytirilgan balandlik" },
        { label: "Konus hajmi", formula: "V = (1/3)πr²h", note: "Silindr hajmining 1/3 qismi" },
        { label: "Shar hajmi", formula: "V = (4/3)πr³", note: "Shar radiusi r" },
      ],
      proofSteps: [{ stepNumber: 1, title: "Kavaleri prinsipi", latex: "V_{konus} = \\frac{1}{3}V_{silindr}", explanation: "Uchli jismlar doimo 1/3 koeffitsiyentga ega." }],
      conclusion: "Formulalar SAT Reference Sheet'da berilgan, ularni faqat to'g'ri qo'llash kerak.",
    },
    visualType: "polygon",
    satTraps: [{ trapTitle: "Diametr va radiusni almashtirib qo'yish", mistakeText: "Diametr 10 berilsa r = 10 deb formulaga qo'yish.", correctWay: "Doimo avval r = d / 2 = 5 ni hisoblab oling!", satLifehack: "SAT 3D masalalarida 70% xato radius o'rniga diametr qo'yilishidan bo'ladi." }],
    miniPractice: [{ id: "m12-p1", prompt: "Asos radiusi 3 va balandligi 8 bo'lgan silindr hajmini toping:", options: [{ id: "A", text: "72π" }, { id: "B", text: "24π" }, { id: "C", text: "48π" }, { id: "D", text: "36π" }], correct: "A", solution: "V = πr²h = π(3²)(8) = π(9)(8) = 72π." }],
    aiSummary: { cheatSheetTitle: "3D jismlar formulalari", takeaways: ["Silindr: πr²h.", "Konus: (1/3)πr²h.", "Shar: (4/3)πr³."], quickRules: ["Har doim avval radiusni tekshir."], suggestedAiPrompt: "Talaba AI, SAT Reference Sheet'dagi barcha 3D shakllarni eslat." },
  },
  {
    id: 13,
    slug: "trigonometriya",
    title: "13. Trigonometriya va birlik aylana",
    branch: "geometry",
    isFree: false,
    shortDesc: "SOH-CAH-TOA, sin(x) = cos(90°-x), birlik aylana, radian va gradus o'tishi.",
    badge: "Pro Campus",
    theory: {
      headline: "Trigonometriya — burchaklar va tomonlar ko'prigi",
      intuition: "Sinus — vertikal balandlik ulushi, Kosinus — gorizontal masofa ulushi, Tangens — qiyalik (slope).",
      paragraphs: ["SAT dagi eng mashhur qoida: sin(x) = cos(90° - x). Agar x + y = 90° bo'lsa, sin(x) = cos(y).", "π radian = 180°."],
      realWorldAnalogy: "Quyosh nuri ostidagi daraxt soyasi orqali daraxt balandligini o'lchash (h = L · tan(θ)).",
    },
    proof: {
      title: "Asosiy trigonometrik ayniyat: sin²(θ) + cos²(θ) = 1",
      mainFormulas: [
        { label: "SOH-CAH-TOA", formula: "sin=Qarshi/Gip, cos=Yopishgan/Gip, tan=Qarshi/Yopishgan", note: "To'g'ri burchakli uchburchakda" },
        { label: "Kofunksiya", formula: "sin(x) = cos(90° - x)", note: "Qo'shimcha burchaklar uchun" },
      ],
      proofSteps: [{ stepNumber: 1, title: "Pifagor bilan bog'lash", latex: "a^2 + b^2 = c^2  \\implies  \\left(\\frac{a}{c}\\right)^2 + \\left(\\frac{b}{c}\\right)^2 = 1", explanation: "sin²(θ) + cos²(θ) = 1 kelib chiqadi." }],
      conclusion: "Ayniyat isbotlandi.",
    },
    visualType: "pythagoras",
    satTraps: [{ trapTitle: "sin(x) = cos(y) tenglamada x + y = 90° ni eslamaslik", mistakeText: "Murakkab trigonometriya deb o'ylash.", correctWay: "sin(2x) = cos(3x) bo'lsa, darhol 2x + 3x = 90° ⇒ 5x = 90° ⇒ x = 18°!", satLifehack: "sin = cos tengligini ko'rsangiz, burchaklar yig'indisini 90° ga tenglang." }],
    miniPractice: [{ id: "m13-p1", prompt: "Agar sin(3x - 10°) = cos(40°) bo'lsa va 0° < x < 90° bo'lsa, x nechiga teng?", options: [{ id: "A", text: "20°" }, { id: "B", text: "15°" }, { id: "C", text: "25°" }, { id: "D", text: "30°" }], correct: "A", solution: "(3x - 10°) + 40° = 90° ⇒ 3x + 30° = 90° ⇒ 3x = 60° ⇒ x = 20°." }],
    aiSummary: { cheatSheetTitle: "Trigonometriya shpargalkasi", takeaways: ["sin(x) = cos(90° - x).", "tan(x) = sin(x) / cos(x).", "π = 180°."], quickRules: ["sin = cos bo'lsa yig'indisi 90°."], suggestedAiPrompt: "Talaba AI, SAT Math uchun eng zarur 3 ta trigonometrik lifehackni ayt." },
  },
  {
    id: 14,
    slug: "vektorlar-matritsalar",
    title: "14. Vektorlar, matritsalar va koordinatalar",
    branch: "algebra",
    isFree: false,
    shortDesc: "Vektorlar yig'indisi, skalyar ko'paytma, ikki nuqta orasidagi masofa va o'rtasi (Midpoint).",
    badge: "Pro Campus",
    theory: {
      headline: "Vektor — kattalik va yo'nalish uyg'unligi",
      intuition: "Oddiy son (skalyar) faqat miqdorni bildiradi (masalan, 5 metr). Vektor esa qayerga ketayotganingizni ham aytadi (5 metr shimolga).",
      paragraphs: ["Ikki nuqta o'rtasi: M = ((x₁ + x₂) / 2, (y₁ + y₂) / 2).", "Masofa formulasi: d = √((x₂ - x₁)² + (y₂ - y₁)²)."],
      realWorldAnalogy: "Samolyot harakati: shamol vektori samolyot tezligi vektoriga qo'shiladi.",
    },
    proof: {
      title: "Koordinatalar tekisligida masofa formulasi",
      mainFormulas: [{ label: "Masofa", formula: "d = √((x₂ - x₁)² + (y₂ - y₁)²)", note: "Pifagor teoremasining koordinatadagi ko'rinishi" }],
      proofSteps: [{ stepNumber: 1, title: "Katetlar", latex: "\\Delta x = x_2 - x_1,   \\Delta y = y_2 - y_1", explanation: "d² = (Δx)² + (Δy)²" }],
      conclusion: "d = √(Δx² + Δy²).",
    },
    visualType: "linear",
    satTraps: [{ trapTitle: "Midpoint formulasida ayirish", mistakeText: "(x₂ - x₁) / 2 deb hisoblash.", correctWay: "O'rta nuqta — o'rta arifmetikdir: (x₁ + x₂) / 2!", satLifehack: "O'rtani topishda qo'shasiz, masofada ayirasiz." }],
    miniPractice: [{ id: "m14-p1", prompt: "A(2, 8) va B(6, -2) nuqtalar orasidagi o'rta nuqta (Midpoint) koordinatasini toping:", options: [{ id: "A", text: "(4, 3)" }, { id: "B", text: "(4, 5)" }, { id: "C", text: "(2, 3)" }, { id: "D", text: "(3, 4)" }], correct: "A", solution: "x = (2 + 6) / 2 = 4, y = (8 + (-2)) / 2 = 3. Demak, (4, 3)." }],
    aiSummary: { cheatSheetTitle: "Koordinata formulalari", takeaways: ["Midpoint: ((x₁+x₂)/2, (y₁+y₂)/2).", "Distance: √((x₂-x₁)² + (y₂-y₁)²)."], quickRules: ["O'rta nuqtada arifmetik o'rtacha olinadi."], suggestedAiPrompt: "Talaba AI, koordinata sistemasida simmetriya qoidalarini tushuntir." },
  },
  {
    id: 15,
    slug: "analitik-geometriya",
    title: "15. Analitik geometriya va doira tenglamasi",
    branch: "geometry",
    isFree: false,
    shortDesc: "(x - h)² + (y - k)² = r², to'la kvadratga ajratish, markaz va radiusni aniqlash.",
    badge: "Pro Campus",
    theory: {
      headline: "Doira tenglamasi — tekislikdagi barcha teng uzoqlikdagi nuqtalar",
      intuition: "Doira markazi (h, k) va radiusi r bo'lsa, uning har bir nuqtasi markazdan aynan r masofada joylashadi: Pifagor bo'yicha (x - h)² + (y - k)² = r².",
      paragraphs: ["SAT dagi eng mashhur savol: x² + y² - 6x + 8y = 0 tenglamani berib, radiusni so'rashadi. Buning uchun x va y ni alohida to'la kvadratga ajratish kerak."],
      realWorldAnalogy: "Radar yoki Wi-Fi routerining tarmoq qamrovi hududi.",
    },
    proof: {
      title: "Doira tenglamasining Pifagordan kelib chiqishi",
      mainFormulas: [{ label: "Doira tenglamasi", formula: "(x - h)² + (y - k)² = r²", note: "Markaz: (h, k), Radius: r" }],
      proofSteps: [
        { stepNumber: 1, title: "Masofa", latex: "d = \\sqrt{(x - h)^2 + (y - k)^2} = r", explanation: "Ikkala tomonni kvadratga ko'taramiz: (x - h)² + (y - k)² = r²." },
      ],
      conclusion: "Tenglama isbotlandi.",
    },
    visualType: "circle",
    satTraps: [{ trapTitle: "O'ng tomondagi sonni radius deb o'ylash", mistakeText: "(x - 1)² + (y + 2)² = 25 tenglamada r = 25 deb olish.", correctWay: "O'ng tomonda r² turadi! Demak r² = 25 ⇒ r = 5.", satLifehack: "Har doim o'ng tomondagi sondan ildiz chiqaring!" }],
    miniPractice: [{ id: "m15-p1", prompt: "(x + 4)² + (y - 3)² = 49 doiraning markazi va radiusi qanday?", options: [{ id: "A", text: "Markaz: (-4, 3), Radius: 7" }, { id: "B", text: "Markaz: (4, -3), Radius: 7" }, { id: "C", text: "Markaz: (-4, 3), Radius: 49" }, { id: "D", text: "Markaz: (4, 3), Radius: 7" }], correct: "A", solution: "h = -4, k = 3, r² = 49 ⇒ r = 7. Markaz: (-4, 3), radius: 7." }],
    aiSummary: { cheatSheetTitle: "Doira tenglamasi shpargalkasi", takeaways: ["(x - h)² + (y - k)² = r².", "Markaz (h, k), radius r."], quickRules: ["O'ng tomondan ildiz chiqarib radiusni ol."], suggestedAiPrompt: "Talaba AI, doira tenglamasini to'la kvadratga ajratishni 3 qadamda o'rgat." },
  },
];
