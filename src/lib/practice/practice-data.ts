export type SubjectSlug = "sat-math" | "sat-rw" | "ielts";
export type DifficultyLevel = "all" | "easy" | "medium" | "hard";

export interface PracticeQuestion {
  id: string;
  subjectSlug: SubjectSlug;
  subjectName: string;
  topicTitle: string;
  difficulty: "easy" | "medium" | "hard";
  difficultyLabel: string;
  passage?: string; // SAT RW va IELTS uchun matn
  prompt: string;
  options: { id: "A" | "B" | "C" | "D"; text: string }[];
  correct: "A" | "B" | "C" | "D";
  hint: string;
  explanation: string;
  wrongOptionsReason?: Record<"A" | "B" | "C" | "D", string>;
}

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  // =========================================================================
  // DIGITAL SAT MATH (5 ta savol)
  // =========================================================================
  {
    id: "sm-1",
    subjectSlug: "sat-math",
    subjectName: "Digital SAT Math",
    topicTitle: "Linear Equations & Shortcut",
    difficulty: "easy",
    difficultyLabel: "Oson (Foundation)",
    prompt: "Agar 4x + 6 = 26 bo'lsa, 8x + 5 ifodaning qiymati nechiga teng?",
    options: [
      { id: "A", text: "45" },
      { id: "B", text: "47" },
      { id: "C", text: "40" },
      { id: "D", text: "52" },
    ],
    correct: "A",
    hint: "4x ni toping: 4x = 20. So'ngra 8x = 2 · (4x) ekanligini qo'llang.",
    explanation:
      "4x = 26 - 6 = 20. Demak, 8x bu 4x ning 2 barobari: 8x = 40. U holda 8x + 5 = 40 + 5 = 45. (x = 5 deb topsa ham: 8(5) + 5 = 45).",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "8x + 7 hisoblangan.",
      C: "Faqat 8x hisoblanib, +5 unutilgan.",
      D: "4x ning o'rniga 26 qo'yib yuborilgan.",
    },
  },
  {
    id: "sm-2",
    subjectSlug: "sat-math",
    subjectName: "Digital SAT Math",
    topicTitle: "Quadratic Equations & Vieta",
    difficulty: "medium",
    difficultyLabel: "O'rta (Medium)",
    prompt: "x² - 16x + c = 0 tenglamaning bitta ildizi ikkinchisidan 6 ga katta. c koeffitsiyenti nechiga teng?",
    options: [
      { id: "A", text: "55" },
      { id: "B", text: "60" },
      { id: "C", text: "48" },
      { id: "D", text: "64" },
    ],
    correct: "A",
    hint: "Viyeta teoremasi: x₁ + x₂ = 16. Berilgan shart: x₁ - x₂ = 6. Ikkala tenglikdan x₁ va x₂ ni toping.",
    explanation:
      "Tizim: x₁ + x₂ = 16 va x₁ - x₂ = 6. Qo'shsak: 2x₁ = 22 ⇒ x₁ = 11. U holda x₂ = 5. Viyeta bo'yicha c = x₁ · x₂ = 11 · 5 = 55.",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "10 · 6 hisoblangan.",
      C: "Ildizlar 12 va 4 deb xato olingan.",
      D: "b²/4 hisoblangan.",
    },
  },
  {
    id: "sm-3",
    subjectSlug: "sat-math",
    subjectName: "Digital SAT Math",
    topicTitle: "Exponential Growth & Modeling",
    difficulty: "medium",
    difficultyLabel: "O'rta (Medium)",
    prompt:
      "Aholi soni P(t) = 45000 · (1.04)^t funksiya bilan modellashtiriladi (t — yillar soni). Quyidagi tasdiqlardan qaysi biri to'g'ri?",
    options: [
      { id: "A", text: "Boshlang'ich aholi 45 000 kishi va har yili 4% ga o'smoqda" },
      { id: "B", text: "Boshlang'ich aholi 45 000 kishi va har yili 1.04% ga o'smoqda" },
      { id: "C", text: "Boshlang'ich aholi 1040 kishi va har yili 45% ga o'smoqda" },
      { id: "D", text: "Har yili aholi soniga 1800 kishi qo'shilmoqda (chiziqli o'sish)" },
    ],
    correct: "A",
    hint: "Eksponensial formula P(t) = A · (1 + r)^t. Bu yerda A — boshlang'ich qiymat, r — o'sish ulushi.",
    explanation:
      "Standart model: A · (1 + r)^t. Boshlang'ich qiymat A = 45 000. O'sish koeffitsiyenti 1.04 = 1 + 0.04, ya'ni r = 0.04 (4% foiz). Bu eksponensial o'sishdir.",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "1.04 soni foiz deb adashtirilgan (aslida 0.04 = 4%).",
      C: "Koeffitsiyentlar o'rni almashtirilgan.",
      D: "Eksponensial o'sish chiziqli o'sish bilan yanglishtirilgan.",
    },
  },
  {
    id: "sm-4",
    subjectSlug: "sat-math",
    subjectName: "Digital SAT Math",
    topicTitle: "Circle Equation & Completing Square",
    difficulty: "hard",
    difficultyLabel: "Qiyin (Hard / 750+)",
    prompt: "x² + y² - 8x + 10y + 5 = 0 tenglama bilan berilgan doiraning radiusi nechiga teng?",
    options: [
      { id: "A", text: "6" },
      { id: "B", text: "√41" },
      { id: "C", text: "36" },
      { id: "D", text: "5" },
    ],
    correct: "A",
    hint: "x va y larni alohida to'la kvadratga ajrating: (x - 4)² + (y + 5)² = ...",
    explanation:
      "(x² - 8x + 16) + (y² + 10y + 25) = -5 + 16 + 25 ⇒ (x - 4)² + (y + 5)² = 36. O'ng tomon r² = 36 bo'lgani uchun r = √36 = 6.",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "O'ng tomonga faqat 16 va 25 qo'shilib, 5 ayirilmagan.",
      C: "r² ning qiymati radius deb belgilangan.",
      D: "Ozod had bilan adashtirilgan.",
    },
  },
  {
    id: "sm-5",
    subjectSlug: "sat-math",
    subjectName: "Digital SAT Math",
    topicTitle: "Systems of Linear Equations",
    difficulty: "hard",
    difficultyLabel: "Qiyin (Hard / 750+)",
    prompt:
      "3x - 5y = 11 va kx - 15y = 22 tenglamalar sistemasi yechimga ega bo'lmasligi (no solution) uchun k qanday songa teng bo'lishi kerak?",
    options: [
      { id: "A", text: "9" },
      { id: "B", text: "-9" },
      { id: "C", text: "6" },
      { id: "D", text: "3" },
    ],
    correct: "A",
    hint: "Yechim yo'q bo'lishi uchun to'g'ri chiziqlar parallel bo'lishi kerak: a₁/a₂ = b₁/b₂ ≠ c₁/c₂.",
    explanation:
      "Parallel chiziqlar sharti: 3 / k = (-5) / (-15) ⇒ 3 / k = 1 / 3 ⇒ k = 9. Bu holda ozod hadlar 11 / 22 = 1/2 ≠ 1/3 bo'lgani uchun sistema yechimga ega emas.",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "Ishora xatosi.",
      C: "Noto'g'ri koeffitsiyent nisbati.",
      D: "Birinchi tenglama bilan teng deb olingan.",
    },
  },

  // =========================================================================
  // SAT READING & WRITING (5 ta savol)
  // =========================================================================
  {
    id: "srw-1",
    subjectSlug: "sat-rw",
    subjectName: "SAT Reading & Writing",
    topicTitle: "Transitions (Logical Connectors)",
    difficulty: "easy",
    difficultyLabel: "Oson (Foundation)",
    passage:
      "Geologists historically believed that tectonic shifts occurred exclusively over millions of years through gradual plate movement. Recent seismic data from subduction zones, however, reveals that catastrophic fault slippages can instantaneously alter continental margins. ________, structural engineers are now revising coastal building codes to withstand sudden topological shifts.",
    prompt: "Qaysi bog'lovchi bo'shliqni eng mantiqiy to'ldiradi?",
    options: [
      { id: "A", text: "Consequently" },
      { id: "B", text: "In contrast" },
      { id: "C", text: "Nevertheless" },
      { id: "D", text: "For instance" },
    ],
    correct: "A",
    hint: "Birinchi gapdagi kashfiyot (sabab) ikkinchi gapdagi muhandislarning qaroriga (oqibat) olib kelmoqda. Sabab-oqibat bog'lovchisini qidiring.",
    explanation:
      "Yangi seysmik kashfiyot sababli muhandislar qurilish qoidalarini o'zgartirmoqda. Bu sabab-oqibat (cause-and-effect) munosabati bo'lgani uchun 'Consequently' (natijada, shu sababli) to'g'ri keladi.",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "Ziddiyat bildiradi, lekin bu yerda ziddiyat yo'q.",
      C: "Qarshilikka qaramay degan ma'noda, bu kontekstga zid.",
      D: "Misol keltirish uchun ishlatiladi.",
    },
  },
  {
    id: "srw-2",
    subjectSlug: "sat-rw",
    subjectName: "SAT Reading & Writing",
    topicTitle: "Command of Evidence",
    difficulty: "medium",
    difficultyLabel: "O'rta (Medium)",
    passage:
      "Ecologist Dr. Elena Vance hypothesized that urban green corridors reduce avian stress levels by mimicking natural canopy density. To evaluate this claim, her team measured corticosterone (a stress hormone) in European blackbirds across fragmented parks versus interconnected arbor paths. The researchers observed that blackbirds inhabiting continuous tree corridors demonstrated a 38% reduction in baseline corticosterone compared to counterparts in isolated city parks.",
    prompt: "Qaysi xulosa tadqiqot natijasini eng yaxshi aks ettiradi?",
    options: [
      { id: "A", text: "Continuous green corridors directly support Dr. Vance's hypothesis by mitigating physiological stress markers." },
      { id: "B", text: "Urban blackbirds are incapable of surviving in isolated municipal parks." },
      { id: "C", text: "Corticosterone levels are unaffected by tree canopy density in European metropolises." },
      { id: "D", text: "Dr. Vance's team disproved the necessity of urban ecological corridors." },
    ],
    correct: "A",
    hint: "Stress gormoni 38% kamaygani gipotezani (canopy density reduces stress) to'g'ridan-to'g'ri tasdiqlaydi.",
    explanation:
      "Tadqiqotda uzluksiz daraxt yo'laklarida yashagan qushlarda stress gormoni 38% past bo'lgani aniqlangan. Bu Dr. Vance ning gipotezasini bevosita tasdiqlaydi (A varianti).",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "Haddan tashqari ekstremal da'vo ('incapable of surviving').",
      C: "Matndagi natijaga butunlay teskari.",
      D: "Gipoteza inkor qilinmadi, aksincha isbotlandi.",
    },
  },
  {
    id: "srw-3",
    subjectSlug: "sat-rw",
    subjectName: "SAT Reading & Writing",
    topicTitle: "Vocabulary in Context",
    difficulty: "medium",
    difficultyLabel: "O'rta (Medium)",
    passage:
      "In classical literature, translation is rarely an act of mechanical substitution. Rather, an adept translator must cultivate a nuanced fidelity to the original text, balancing syntactical precision against the melodic cadence of the target language.",
    prompt: "Ushbu matnda 'cultivate' so'zi qanday ma'noda qo'llangan?",
    options: [
      { id: "A", text: "develop" },
      { id: "B", text: "harvest" },
      { id: "C", text: "fertilize" },
      { id: "D", text: "neglect" },
    ],
    correct: "A",
    hint: "'cultivate a nuanced fidelity' — matnga nozik sodiqlikni o'zida shakllantirish, rivojlantirish ma'nosida kelmoqda.",
    explanation:
      "'Cultivate' qishloq xo'jaligida ekin yetishtirish bo'lsa, intellektual kontekstda ko'nikma yoki munosabatni rivojlantirish (develop / foster) degan ma'noni bildiradi.",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "Hosil yig'ish (literal farming).",
      C: "O'g'itlash.",
      D: "E'tiborsiz qoldirish (teskari ma'no).",
    },
  },
  {
    id: "srw-4",
    subjectSlug: "sat-rw",
    subjectName: "SAT Reading & Writing",
    topicTitle: "Central Idea & Synthesis",
    difficulty: "hard",
    difficultyLabel: "Qiyin (Hard / 750+)",
    passage:
      "While neoclassical economists modeled consumer behavior under the premise of rational choice—assuming individuals consistently maximize utility—behavioral economists have demonstrated that cognitive biases routinely skew decision-making. Through empirical trials, researchers established that losses loom significantly larger than equivalent gains, causing market participants to exhibit irrational risk aversion during downturns.",
    prompt: "Matnning asosiy markaziy fikri nimadan iborat?",
    options: [
      { id: "A", text: "Behavioral economics challenges neoclassical rationality by demonstrating that cognitive biases dictate financial decisions." },
      { id: "B", text: "Market downturns are solely triggered by mathematical miscalculations in utility formulas." },
      { id: "C", text: "Neoclassical economics has completely superseded empirical decision research." },
      { id: "D", text: "Loss aversion is a theoretical anomaly that never appears in real-world trading." },
    ],
    correct: "A",
    hint: "Matn an'anaviy 'ratsional xaridor' modelining kognitiv xatolar (losses loom larger) tufayli o'zgarganini ta'kidlaydi.",
    explanation:
      "Matn an'anaviy neoklassik nazariya bilan zamonaviy xulq-atvor iqtisodiyotini solishtirib, insonlar har doim ratsional emas, balki psixologik biaslar ta'sirida qaror qabul qilishini isbotlaganini bayon qiladi.",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "Haddan tashqari bir tomonlama ('solely triggered').",
      C: "Teskari da'vo.",
      D: "Real dunyoda uchraydi, matn shuni tasdiqlagan.",
    },
  },
  {
    id: "srw-5",
    subjectSlug: "sat-rw",
    subjectName: "SAT Reading & Writing",
    topicTitle: "Rhetorical Synthesis",
    difficulty: "hard",
    difficultyLabel: "Qiyin (Hard / 750+)",
    passage:
      "Talaba quyidagi konspektdan foydalanib xulosa yozmoqchi:\n• James Webb Space Telescope (JWST) 2021-yil dekabrda koinotga uchirilgan.\n• U infraqizil to'lqin uzunligida koinotning dastlabki 300 million yilidagi galaktikalarni tasvirga oladi.\n• Hubble teleskopi asosan optik va ultrabinafsha nurlarda ishlagan.\n• JWST ning 6.5 metrli oynasi Hubble oynasidan deyarli 3 barobar katta va 100 barobar sezgirroq.",
    prompt: "Qaysi jumla JWST ning Hubble'dan ustunligini eng ixcham va samarali ta'kidlaydi?",
    options: [
      { id: "A", text: "Equipped with a mirror nearly three times larger and specialized infrared sensors, the JWST detects primordial galaxies far beyond Hubble's optical capabilities." },
      { id: "B", text: "The JWST was launched in December 2021, whereas Hubble was launched much earlier in the twentieth century." },
      { id: "C", text: "Hubble worked in ultraviolet spectrum while taking many famous space photographs." },
      { id: "D", text: "Both telescopes are orbiting in space to observe the universe from above Earth's atmosphere." },
    ],
    correct: "A",
    hint: "Savol 'ustunlik'ni (kattaroq oyna, yuqori sezgirlik, qadimiy galaktikalar) aniq sintez qilishni talab qiladi.",
    explanation:
      "A varianti JWST ning Hubble'dan asosiy ikki ustunligini (3 barobar katta oyna va infraqizil aniqlik) bitta jumlada professional sintez qilgan.",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "Faqat uchirilgan sanani aytadi, texnik ustunlikni emas.",
      C: "Faqat Hubble haqida gapiradi.",
      D: "Farqni emas, o'xshashlikni aytadi.",
    },
  },

  // =========================================================================
  // IELTS ACADEMIC (Reading & Vocabulary) (4 ta savol)
  // =========================================================================
  {
    id: "ielts-1",
    subjectSlug: "ielts",
    subjectName: "IELTS Academic",
    topicTitle: "Academic Reading (True / False / Not Given)",
    difficulty: "easy",
    difficultyLabel: "Oson (Foundation)",
    passage:
      "Desalination technology has proliferated throughout the Arabian Peninsula, where over 60% of the world's operational seawater processing plants reside. Although thermal distillation accounts for the majority of legacy facilities, modern installations predominantly utilize reverse osmosis due to its significantly lower energy expenditure.",
    prompt:
      "Matnga asosan quyidagi jumla: 'Reverse osmosis plants require less energy to operate than thermal distillation facilities.' — True, False yoki Not Given?",
    options: [
      { id: "A", text: "TRUE" },
      { id: "B", text: "FALSE" },
      { id: "C", text: "NOT GIVEN" },
      { id: "D", text: "NEITHER" },
    ],
    correct: "A",
    hint: "Matndagi 'due to its significantly lower energy expenditure' jumlasiga e'tibor bering.",
    explanation:
      "Matnda 'reverse osmosis due to its significantly lower energy expenditure' deyilgan. Demak, teskari osmos termik usuldan kamroq energiya talab qiladi. Tasdiq matnga to'liq mos — TRUE.",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "Matnga zid emas, mos keladi.",
      C: "Matnda bevosita aytilgan.",
      D: "IELTS mezonida yo'q variant.",
    },
  },
  {
    id: "ielts-2",
    subjectSlug: "ielts",
    subjectName: "IELTS Academic",
    topicTitle: "Academic Paraphrasing & Lexis",
    difficulty: "medium",
    difficultyLabel: "O'rta (Medium)",
    passage:
      "Task 2 inshosida o'quvchi 'Cars pollute the air, so the government should stop people from using them in cities' jumlasini Band 7.5+ akademik registerida yozmoqchi.",
    prompt: "Qaysi parafraz IELTS Band 7.5+ mezonlariga to'liq javob beradi?",
    options: [
      { id: "A", text: "Given that automotive emissions severely degrade urban air quality, municipal authorities ought to implement stringent vehicle-restriction policies." },
      { id: "B", text: "Because cars make dirty air, city mayors must tell all people to stop driving immediately." },
      { id: "C", text: "Cars are bad for health, therefore nobody should be allowed to go to city center by transport." },
      { id: "D", text: "Automobiles cause toxic smoke and everybody hates this in modern big cities." },
    ],
    correct: "A",
    hint: "Akademik leksika: 'automotive emissions', 'degrade urban air quality', 'municipal authorities', 'stringent policies'.",
    explanation:
      "A variantida barcha sodda so'zlar yuqori akademik ekvivalentlar bilan almashtirilgan (automotive emissions, stringent policies, municipal authorities). Bu Band 7.5–8.0 darajadir.",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "Juda so'zlashuv tilidagi leksika ('make dirty air', 'city mayors').",
      C: "Noadekvat uslub ('nobody should be allowed').",
      D: "Hissiy va norasmiy ('everybody hates this').",
    },
  },
  {
    id: "ielts-3",
    subjectSlug: "ielts",
    subjectName: "IELTS Academic",
    topicTitle: "Coherence & Sentence Structure",
    difficulty: "medium",
    difficultyLabel: "O'rta (Medium)",
    passage:
      "Insho paragrafi: 'Remote working affords employees greater temporal flexibility. It also mitigates overhead expenditures for corporations by decreasing physical office maintenance costs.'",
    prompt: "Ushbu ikki fikrni 'Not only... but also...' inversiya qolipi bilan qaysi variant eng to'g'ri bog'laydi?",
    options: [
      { id: "A", text: "Not only does remote working afford employees temporal flexibility, but it also substantially mitigates corporate overhead expenditures." },
      { id: "B", text: "Not only remote working affords employees flexibility, but also it mitigates company costs." },
      { id: "C", text: "Not only is remote working good, but also companies save money on rent." },
      { id: "D", text: "Remote working not only affords flexibility, it also decreases physical office maintenance costs without comma." },
    ],
    correct: "A",
    hint: "'Not only' gap boshida kelganda inversiya yasaladi: Not only + yordamchi fe'l (does) + ega + asosiy fe'l.",
    explanation:
      "'Not only does remote working afford...' — inversiya qoidasiga to'liq mos keladi. Bu Band 8.0 grammatical range mezonidir.",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "Inversiya fe'li ('does') qolib ketgan.",
      C: "Leksika juda sodda ('good', 'save money').",
      D: "Inversiya uslubi qo'llanmagan.",
    },
  },
  {
    id: "ielts-4",
    subjectSlug: "ielts",
    subjectName: "IELTS Academic",
    topicTitle: "Academic Reading Matching Headings",
    difficulty: "hard",
    difficultyLabel: "Qiyin (Hard / 750+)",
    passage:
      "Artificial intelligence algorithms applied in diagnostic oncology have achieved radiologist-level precision in detecting malignant pulmonary nodules. Nevertheless, the integration of these systems into hospital workflows remains hindered by 'black-box' opacity—clinicians are reluctant to act on prognostic outputs when the underlying neural pathway calculations cannot be clinically audited or interpreted.",
    prompt: "Ushbu paragraf uchun eng mos sarlavha (Heading) qaysi?",
    options: [
      { id: "A", text: "Technological prowess constrained by interpretability barriers" },
      { id: "B", text: "The complete obsolescence of human oncology specialists" },
      { id: "C", text: "Financial unaffordability of medical neural computing" },
      { id: "D", text: "Why radiologists consistently reject modern digital tools" },
    ],
    correct: "A",
    hint: "Paragraf AI ning yuksak aniqligi (prowess) va shifokorlar tushuna olmayotgani sababli yuzaga kelgan to'siqni (interpretability barrier) tasvirlaydi.",
    explanation:
      "Paragrafda texnologiya juda kuchli aniqlikka erishgani, lekin 'qora quti' bo'lgani sababli uni shifoxonalarga kiritish qiyin bo'layotgani aytilgan. Sarlavha: 'Technological prowess constrained by interpretability barriers'.",
    wrongOptionsReason: {
      A: "To'g'ri javob.",
      B: "Shifokorlar o'rnini to'liq egallash haqida gap yo'q.",
      C: "Moliyaviy narx haqida gap yo'q.",
      D: "Doimiy rad etish emas, tushuntirish talab qilinmoqda.",
    },
  },
];

// Rasmiy SAT Reference Sheet formulalari
export const SAT_MATH_REFERENCE_FORMULAS = [
  { label: "Doira yuzi", formula: "A = πr²" },
  { label: "Aylana uzunligi", formula: "C = 2πr" },
  { label: "To'g'ri to'rtburchak", formula: "A = l · w" },
  { label: "Uchburchak yuzi", formula: "A = 1/2 · b · h" },
  { label: "Pifagor teoremasi", formula: "c² = a² + b²" },
  { label: "Maxsus 45-45-90", formula: "x, x, x√2" },
  { label: "Maxsus 30-60-90", formula: "x, x√3, 2x" },
  { label: "To'g'ri burchakli parallelepiped", formula: "V = l · w · h" },
  { label: "Silindr hajmi", formula: "V = πr²h" },
  { label: "Shar hajmi", formula: "V = (4/3)πr³" },
  { label: "Konus hajmi", formula: "V = (1/3)πr²h" },
  { label: "Piramida hajmi", formula: "V = (1/3)l · w · h" },
];
