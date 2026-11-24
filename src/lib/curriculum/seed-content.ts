export interface SeedLessonExample {
  title: string;
  problem: string;
  stepByStepSolution: string[];
  takeaway: string;
}

export interface SeedQuestionData {
  id: string;
  difficulty: 1 | 2 | 3 | 4;
  promptUz: string;
  passageUz?: string;
  options: { id: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanationUz: string;
  hints: string[];
}

export interface SeedLesson {
  slug: string;
  titleUz: string;
  summaryUz: string;
  estMinutes: number;
  xpReward: number;
  theoryMarkdown: string;
  examples: SeedLessonExample[];
  questions: SeedQuestionData[];
}

export interface SeedTopic {
  slug: string;
  titleUz: string;
  descriptionUz: string;
  level: "ZERO" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estHours: number;
  lessons: SeedLesson[];
}

export interface SeedSubjectBundle {
  slug: string;
  nameUz: string;
  descriptionUz: string;
  icon: string;
  color: string;
  order: number;
  topics: SeedTopic[];
}

export const SEED_BADGES = [
  {
    slug: "first-step",
    titleUz: "Ilk Qadam",
    descriptionUz: "3Talaba platformasida shaxsiy profil yaratib o'qishni boshlagani uchun.",
    icon: "Sparkles",
    xpBonus: 50,
    conditionType: "FIRST_STEP",
    conditionValue: 1,
  },
  {
    slug: "first-lesson",
    titleUz: "Ilk Dars G'olibi",
    descriptionUz: "Birinchi kunlik dars va mashqlarni to'liq yakunlagani uchun.",
    icon: "BookOpen",
    xpBonus: 100,
    conditionType: "LESSON_COMPLETE",
    conditionValue: 1,
  },
  {
    slug: "sharp-shooter",
    titleUz: "Bejirim Aniqlik",
    descriptionUz: "Dars mashqlarida yuqori aniqlik (kamida 75%) ko'rsatgani uchun.",
    icon: "Trophy",
    xpBonus: 120,
    conditionType: "ACCURACY_75",
    conditionValue: 75,
  },
  {
    slug: "streak-3",
    titleUz: "Mustahkam Intizom",
    descriptionUz: "Kunlik o'qish zanjirini (Streak) uzmasdan davom ettirgani uchun.",
    icon: "Flame",
    xpBonus: 150,
    conditionType: "STREAK",
    conditionValue: 3,
  },
  {
    slug: "sat-challenger",
    titleUz: "SAT Izlanuvchisi",
    descriptionUz: "SAT Matematika va Reading & Writing mashqlarini bajargani uchun.",
    icon: "Calculator",
    xpBonus: 100,
    conditionType: "SAT_PRACTICE",
    conditionValue: 1,
  },
  {
    slug: "ielts-scholar",
    titleUz: "IELTS Bilimdoni",
    descriptionUz: "IELTS Academic va Akademik Yozuv mashqlarida faol qatnashgani uchun.",
    icon: "Globe2",
    xpBonus: 100,
    conditionType: "IELTS_PRACTICE",
    conditionValue: 1,
  },
];

export const SEED_CURRICULUM: SeedSubjectBundle[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // 1. SAT MATEMATIKA
  // ═════════════════════════════════════════════════════════════════════════
  {
    slug: "sat-math",
    nameUz: "SAT Matematika",
    descriptionUz: "Digital SAT Math (800 ballgacha): algebra, chiziqli va kvadrat funksiyalar, geometriya va ma'lumotlar tahlili.",
    icon: "Calculator",
    color: "#c6f432",
    order: 1,
    topics: [
      {
        slug: "sat-math-linear",
        titleUz: "Algebraik Tenglamalar va Chiziqli Funksiyalar",
        descriptionUz: "Digital SAT imtihonining 35% qismini tashkil etuvchi chiziqli modellar va funksiyalar.",
        level: "BEGINNER",
        estHours: 6,
        lessons: [
          {
            slug: "sat-math-linear-equations",
            titleUz: "Chiziqli Tenglamalar, Funksiyalar va Grafik Qiyalik (Slope)",
            summaryUz: "y = mx + b chiziqli modelini hayotiy masalalarda qo'llash va SAT tuzoqlarini tez yechish usullari.",
            estMinutes: 35,
            xpReward: 80,
            theoryMarkdown: `### 1. Chiziqli Funksiya Nima?
Digital SAT Matematika bo'limida eng ko'p uchraydigan model bu **chiziqli funksiya** bo'lib, u quyidagi standart ko'rinishda yoziladi:

\$$f(x) = mx + b\$$

Bu yerda:
- **\$m\$ (Slope / Qiyalik koeffitsiyenti):** \$x\$ qiymati 1 birlikka oshganda \$y\$ ning qanchaga o'zgarish tezligi. Ikki nuqta \$(x_1, y_1)\$ va \$(x_2, y_2)\$ berilganda:
  $$\$m = \\frac{y_2 - y_1}{x_2 - x_1}$$
- **\$b\$ (Y-intercept / Boshlang'ich qiymat):** \$x = 0\$ bo'lgandagi boshlang'ich nuqta \$(0, b)\$.

### 2. SAT Imtihonidagi Oltin Qoida (Ifodani butunligicha topish)
Ko'pincha SAT savolida \$x\$ ning o'zini emas, balki 3x + 2 kabi ifodani topish so'raladi. Bunday paytda \$x\$ ni kasr qilib hisoblab o'tirmasdan, tenglamaning ikkala tomonini bir xil songa bo'lish yoki ko'paytirish orqali javobni **5 soniyada** topish mumkin!

### 3. Parallel va Perpendikulyar To'g'ri Chiziqlar
- **Parallel chiziqlar (hech qachon kesishmaydi / yechimga ega emas):** Qiyaliklari teng (\$m_1 = m_2\$), ammo boshlang'ich nuqtalari farqli (\$b_1 \\neq b_2\$).
- **Perpendikulyar chiziqlar (\$90^\\circ\$ burchak ostida kesishadi):** Qiyaliklari ko'paytmasi \$-1\$ ga teng (\$m_1 \\cdot m_2 = -1\$).`,
            examples: [
              {
                title: "1-misol: Ifodani tezkor usulda topish (SAT 5-soniya usuli)",
                problem: "Agar 6x + 10 = 34 bo'lsa, 3x + 5 ifodaning qiymati nechaga teng?",
                stepByStepSolution: [
                  "Odatiy usulda x ni topishga shoshilmang — e'tibor bering, 6x + 10 ifoda 3x + 5 ning aynan 2 barobaridir!",
                  "Tenglamaning ikkala qismini 2 ga bo'lamiz: (6x + 10) / 2 = 34 / 2.",
                  "Natija darhol chiqadi: 3x + 5 = 17.",
                ],
                takeaway: "SATda har doim so'ralayotgan ifoda bilan berilgan tenglama o'rtasidagi karralikni tekshiring.",
              },
              {
                title: "2-misol: Hayotiy masalada m va b ma'nosi",
                problem: "Toshkentdagi kuryer xizmati yetkazib berish narxini C(d) = 4500d + 12000 formula bilan hisoblaydi (d — masofa km da). 12000 va 4500 sonlari nimani anglatadi?",
                stepByStepSolution: [
                  "Masofa d = 0 bo'lganda C(0) = 12000 so'm chiqadi — bu chaqiruvning boshlang'ich qat'iy to'lovi (b).",
                  "Har 1 km qo'shilganda narx 4500 so'mga oshadi — bu 1 km uchun tarif tezligi (m - slope).",
                ],
                takeaway: "Ozod had (b) — boshlang'ich qiymat, x oldidagi koeffitsiyent (m) — har bir birlik uchun o'zgarish tezligi.",
              },
            ],
            questions: [
              {
                id: "q-sm-lesson-1",
                difficulty: 1,
                promptUz: "Agar 8x - 6 = 26 bo'lsa, 4x - 3 ifodaning qiymatini toping.",
                options: [
                  { id: "A", text: "11" },
                  { id: "B", text: "13" },
                  { id: "C", text: "15" },
                  { id: "D", text: "16" },
                ],
                correctAnswer: "B",
                explanationUz: "8x - 6 ifodani 2 ga bo'lsak aynan 4x - 3 hosil bo'ladi: 26 / 2 = 13.",
                hints: [
                  "x ni alohida topish shart emas: 8x - 6 va 4x - 3 o'rtasida qanday bog'liqlik bor?",
                  "Tenglamaning ikkala tomonini 2 ga bo'lib ko'ring!",
                ],
              },
              {
                id: "q-sm-lesson-2",
                difficulty: 2,
                promptUz: "Chiziqli funksiya grafigi (1, 7) va (4, 19) nuqtalardan o'tadi. Ushbu to'g'ri chiziqning qiyalik koeffitsiyenti (slope m) nechaga teng?",
                options: [
                  { id: "A", text: "3" },
                  { id: "B", text: "4" },
                  { id: "C", text: "5" },
                  { id: "D", text: "6" },
                ],
                correctAnswer: "B",
                explanationUz: "m = (y2 - y1) / (x2 - x1) = (19 - 7) / (4 - 1) = 12 / 3 = 4.",
                hints: [
                  "Qiyalik formulasi: m = (y2 - y1) / (x2 - x1).",
                  "19 dan 7 ni ayiring va natijani (4 - 1) ga bo'ling.",
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "sat-math-systems",
        titleUz: "Chiziqli Tenglamalar Tizimi: Yechimlar soni aniqlash",
        descriptionUz: "Ikki chiziqli tenglamadan iborat tizim uchun yechimlar sonini (bitta, cheksiz yoki yo'q) aniqlash.",
        level: "BEGINNER",
        estHours: 5,
        lessons: [
          {
            slug: "sat-math-systems-of-equations",
            titleUz: "Ikki O'zgaruvchili Chiziqli Tenglamalar Tizimi",
            summaryUz: "Tizimning yechimini topish (o'tkirish usuli) va parallel chiziqlarga bog'liq 'yechim yo'q' holatini aniqlash.",
            estMinutes: 30,
            xpReward: 75,
            theoryMarkdown: `### 1. Chiziqli Tenglamalar Tizimi Nima?
Ikki chiziqli tenglamadan iborat tizim quyidagi ko'rinishda bo'ladi:

\$$\\begin{cases} ax + by = c \\\\ dx + ey = f \\end{cases}\$$

Tizimning yechimi — bu ikki tenglamani bir vaqtda qanoatlantiruvchi \$(x, y)\$ juftligi bo'ladi. Grafikda bu ikki chiziqning kesishish nuqtasi bo'ladi.

### 2. Yechimlar soni
- **Bitta yechim:** Chiziqlar bir marta kesishadi (qiyaliklari farqli).
- **Cheksiz yechim:** Chiziqlar bir xil (parallel emas, bir xil chiziq).
- **Yechim yo'q:** Chiziqlar parallel (qiyaliklari teng, ammo boshlang'ich nuqtalar farqli).

### 3. SAT Oltin Qoidi (O'tkirish usuli)
Birinchi tenglamadan \$(x\$ yoki \$(y\$ ni ifodalab, ikkinchisiga qo'shing. Agar natija \$(0 = 0\$ ga teng bo'lsa — cheksiz yechim; agar \$(0 = 5\$ kabi zidlik chiqsa — yechim yo'q.`,
            examples: [
              {
                title: "1-misol: Tizimni yechish",
                problem: "Tizimni yeching: x + y = 10 va x - y = 2.",
                stepByStepSolution: [
                  "Ikki tenglamani bir-biriga qo'shing: (x + y) + (x - y) = 10 + 2 ⇒ 2x = 12 ⇒ x = 6.",
                  "x = 6 ni birinchi tenglamaga qo'shing: 6 + y = 10 ⇒ y = 4.",
                  "Javob: (x, y) = (6, 4).",
                ],
                takeaway: "O'tkirish usulida bir xil belgiqli hadlarni birgalikda qo'shish yoki ayirish orqali biror o'zgaruvchini o'chirib tashlaymiz.",
              },
            ],
            questions: [
              {
                id: "q-sys-1",
                difficulty: 2,
                promptUz: "x + 2y = 8 va 2x - y = 1 tenglamalar tizimining yechimi qaysi nuqta?",
                options: [
                  { id: "A", text: "(2, 3)" },
                  { id: "B", text: "(2, 3)" },
                  { id: "C", text: "(3, 2)" },
                  { id: "D", text: "(4, 1)" },
                ],
                correctAnswer: "A",
                explanationUz: "x = 2, y = 3 ni qo'shganda: 2 + 2(3) = 8 ✓ va 2(2) - 3 = 1 ✓. Ikki tenglama ham to'g'ri.",
                hints: [
                  "Variantlardan birinchisiniqiq tinglang: x + 2y = 8 ga (2, 3) mos keladimi?",
                  "Keyin ikkinchisiga tekshirang: 2x - y = 1.",
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "sat-math-quadratics",
        titleUz: "Kvadrat Funksiyalar va Tenglamalar",
        descriptionUz: "Kvadrat tenglamalar, diskriminant, ildizlar va parabola shakli haqida SAT savollari.",
        level: "INTERMEDIATE",
        estHours: 6,
        lessons: [
          {
            slug: "sat-math-quadratic-equations",
            titleUz: "Kvadrat Tenglama va Diskriminant",
            summaryUz: "Diskriminant (D = b² - 4ac) orqali ildizlar sonini aniqlash va SATning 'ildizlar yig'indisi' tuzoqidan saqlanish.",
            estMinutes: 35,
            xpReward: 85,
            theoryMarkdown: `### 1. Kvadrat Tenglama
Kvadrat tenglama quyidagi ko'rinimda:

\$$ax^2 + bx + c = 0\$$

Unda \$(a \\neq 0)\$. Ildizlarni topish formulasi:

\$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\$$

### 2. Diskriminant (D = b² - 4ac)
- **D > 0:** 2 ta farqli haqiqiy ildiz bor.
- **D = 0:** 1 ta karrali (takrorlanuvchi) ildiz bor.
- **D < 0:** Haqiqiy ildiz mavjud emas.

### 3. SAT Oltin Qoidi (Ildizlar yig'indisi)
SAT savolida 'tenglamaning barcha yechimleri yig'indisini toping' deyilsa, diskriminant hisoblab vaqt yo'qotmang! Viyet teoremasi bo'yicha ildizlar yig'indisi \$-b / a\$ ga teng. Masalan, x² - 8x + 12 = 0 uchun yig'ilma -(-8) / 1 = +8 ga teng (x1 + x2 = 8).`,
            examples: [
              {
                title: "1-misol: Diskriminant orqali ildizlar soni",
                problem: "2x² - 4x + 2 = 0 tenglamada nechta haqiqiy ildiz bor?",
                stepByStepSolution: [
                  "a = 2, b = -4, c = 2.",
                  "Diskriminant: D = b² - 4ac = (-4)² - 4(2)(2) = 16 - 16 = 0.",
                  "D = 0 bo'lgani uchun, 1 ta karrali haqiqiy ildiz bor.",
                ],
                takeaway: "D = 0 — bu 'yagona yechim' belgisidir; SATda bu holat ko'p uchraydi.",
              },
            ],
            questions: [
              {
                id: "q-quad-1",
                difficulty: 2,
                promptUz: "x² - 6x + 9 = 0 tenglamaning yechimi qanday?",
                options: [
                  { id: "A", text: "x = 3 (yagona)" },
                  { id: "B", text: "x = -3" },
                  { id: "C", text: "x = 6" },
                  { id: "D", text: "Yechim yo'q" },
                ],
                correctAnswer: "A",
                explanationUz: "x² - 6x + 9 = (x - 3)², deyarli (x - 3)² = 0 ⇒ x = 3 yagona yechim.",
                hints: [
                  "To'la kvadratga ajrating: x² - 6x + 9 = (x - 3)².",
                  "Kvadrat nolga teng bo'lsa, ichki ifoda nolga teng bo'ladi.",
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 2. SAT READING & WRITING (SAT INGLIZ TILI)
  // ═════════════════════════════════════════════════════════════════════════
  {
    slug: "sat-rw",
    nameUz: "SAT Reading & Writing",
    descriptionUz: "Digital SAT Reading & Writing: mantiqiy bog'lovchilar, matndagi dalillar, kontekstdagi so'z ma'nosi va ingliz til grammatikasi.",
    icon: "FileText",
    color: "#F59E0B",
    order: 2,
    topics: [
      {
        slug: "sat-rw-transitions",
        titleUz: "Mantiqiy Bog'lovchilar (Transitions) va Dalillar",
        descriptionUz: "Gaplar o'rtasidagi sabab-oqibat, zidlik va misol munosabatlarini aniq topish.",
        level: "BEGINNER",
        estHours: 5,
        lessons: [
          {
            slug: "sat-rw-transitions-evidence",
            titleUz: "Transitions (Bog'lovchilar) va Command of Evidence Strategiyasi",
            summaryUz: "Digital SATda 4–5 ta savolni 20 soniyada xatosiz yechishga yordam beruvchi 3 guruhli bog'lovchilar jadvali.",
            estMinutes: 30,
            xpReward: 75,
            theoryMarkdown: `### 1. Transitions Savollarini Yechishning 3 Qadamli Algoritmi
1. **Bo'sh joyni yoping:** Variantlarga qaramasdan avval 1-gap va 2-gapni o'qing.
2. **Munosabat turini belgilang:**
   - **Davom ettirish / Qo'shimcha (+ / +):** Moreover, Furthermore, In addition, Similarly
   - **Qarama-qarshilik / Zidlik (+ / -):** However, Nevertheless, Conversely, On the other hand
   - **Sabab va Natija (→):** Therefore, Consequently, Thus, As a result
   - **Misol keltirish (Misol):** For instance, For example, Specifically
3. **Egizak variantlarni o'chiring:** Agar ikkita variant bir xil ma'noni bersa (masalan, Therefore va Consequently), ikkalasi ham xato bo'ladi!`,
            examples: [
              {
                title: "1-misol: Zidlik va Sabab-oqibatni farqlash",
                problem: "Ancient Samarkand paper mills required abundant flowing water to power their wooden hammers. _____, artisans constructed the workshops directly along the banks of the Siyob river.",
                stepByStepSolution: [
                  "1-gap: Qog'oz tegirmonlari uchun oqar suv kerak edi (Sabab).",
                  "2-gap: Ustalar ustaxonalarni Siyob daryosi bo'yiga qurishdi (Natija).",
                  "Sababdan natijaga o'tish uchun 'Consequently' yoki 'Therefore' tanlanadi.",
                ],
                takeaway: "Birinchi gap sabab bo'lib, ikkinchi gap uning mantiqiy yechimi bo'lsa 'Consequently / Therefore' ishlatiladi.",
              },
            ],
            questions: [
              {
                id: "q-srw-lesson-1",
                difficulty: 1,
                passageUz: "Many desert cacti keep their stomata closed during the scorching daytime heat to prevent water loss. _____, they open these microscopic pores at night to absorb carbon dioxide.",
                promptUz: "Bo'sh joyga qaysi bog'lovchi eng mos keladi?",
                options: [
                  { id: "A", text: "Instead," },
                  { id: "B", text: "For example," },
                  { id: "C", text: "Therefore," },
                  { id: "D", text: "In addition," },
                ],
                correctAnswer: "A",
                explanationUz: "Kunduzi yopiq tutish o'rniga ('Instead'), kechasi ochishi zid/muqobil harakatni bildiradi.",
                hints: [
                  "Birinchi gapda kunduzi nima qilmasligi, ikkinchi gapda esa uning o'rniga kechasi nima qilishi aytilgan.",
                  "'Buning o'rniga' ma'nosini beruvchi so'zni toping.",
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "sat-rw-command-of-evidence",
        titleUz: "Command of Evidence: Matndagi To'g'ri Dalilni Tanlash",
        descriptionUz: "Savolga javob beradigan aniq matn ajratini 10 soniya ichida topish va 'best evidence' savollarini yechish.",
        level: "INTERMEDIATE",
        estHours: 5,
        lessons: [
          {
            slug: "sat-rw-command-of-evidence",
            titleUz: "Command of Evidence — Eng Yaxsheyligi Qaysi Dalil?",
            summaryUz: "Matndagi qaysi jumla yoki abzats savolga to'g'ri javob beradiga aniqlash va 'weak' variantlarni chiqarib tashlash.",
            estMinutes: 30,
            xpReward: 80,
            theoryMarkdown: `### 1. Command of Evidence Nima?
Ushbu savol turida sizga birhta da'vo beriladi va uning to'g'riligini isbotlash uchun matndagi 4 ta variantdan birini tanlashingiz kerak.

### 2. Yechish usuli
1. Da'voni (savolda aytilgan fikrni) aniqlang.
2. Matnda u da'vozga mos keladigan kalit so'zlarni qidirng.
3. Variantlarni solishtiring: faqat bitta variant da'voni to'liq va xatolisiz isbotlamaydi.

### 3. SAT Oltin Qoidi
Agar variantlarda ikkita bir xil ma'noda bo'lsa, ikkalasi ham xato. To'g'ri javob faqat bitta bo'ladi va u matndagi aynan shu fikrni aytadigan jumlaga bog'lanadi.`,
            examples: [
              {
                title: "1-misol: To'g'ri dalilni tanlash",
                problem: "Matn: 'Urban trees reduce air temperature by up to 5°F, making city neighborhoods cooler.' Savol: Which finding, if true, would most directly support the claim that planting trees cools city neighborhoods?",
                stepByStepSolution: [
                  "Da'vo: darakhtlarni yashlash shahri qisqartiradi.",
                  "Matnda shu da'vozga mos keluvchi jumla: 'Urban trees reduce air temperature by up to 5°F'.",
                  "Buning sababi — ular havani qisqartiradi va mahallani sovuk qiladi.",
                ],
                takeaway: "Da'vozga to'g'ridan-to'g'ri mos keluvchi matn ajratini toping, umumiy yoki noto'g'ri variantlarni chiqarib tashlang.",
              },
            ],
            questions: [
              {
                id: "q-coe-1",
                difficulty: 2,
                passageUz: "Studies show that students who sleep at least 8 hours before an exam score significantly higher than those who sleep less than 6 hours.",
                promptUz: "Qaysi jumla yuqori da'vozga eng to'g'ri dalil beradi?",
                options: [
                  { id: "A", text: "Uyqu o'quvchilarga muhim." },
                  { id: "B", text: "8 soatdan kam uyquган talabalar bahosi past." },
                  { id: "C", text: "8 soat uyqugan talabalar bahosi yuqori." },
                  { id: "D", text: "Imtihon oldi uyqu kerak." },
                ],
                correctAnswer: "C",
                explanationUz: "Variant C matndagi aytilgan fikrning aynan shu shaklida takrorlanadi va da'vozga to'g'ri dalil beradi.",
                hints: [
                  "Matnda '8 soatdan kam uyqu' va 'yuqori baho' qaysi variantda to'g'ridan-to'g'ri aytilgan?",
                  "Umumiy ifodalar (variant A) — juda kichroq, u to'liq dalil emas.",
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "sat-rw-words-in-context",
        titleUz: "Words in Context: Kontekstdagi So'z Ma'nosi",
        descriptionUz: "Matnda so'zning qaysi ma'nosi ishlatilgandani aniqlash va 'Precision' va 'Style' savollarini yechish.",
        level: "INTERMEDIATE",
        estHours: 4,
        lessons: [
          {
            slug: "sat-rw-words-in-context",
            titleUz: "Kontekstdagi So'zning To'g'ri Ma'nosi",
            summaryUz: "Bir necha ma'nosi bor so'zni matndagi qaysi ma'nosida ishlatganini aniqlash va yengil almashtirish variantlarini chiqarish.",
            estMinutes: 25,
            xpReward: 70,
            theoryMarkdown: `### 1. Words in Context Nima?
Matnda ishlatilgan so'zning ma'nosini kontekst (birqatta so'z va gaplar o'rtasidagi bog'liq) orqali aniqlaydigan savol turi.

### 2. Yechish usuli
1. So'zni o'zining gapida o'qing.
2. So'zdan oldin va keyingi so'zlarni ko'rib chiqing (kontekst).
3. So'zning qaysi ma'nosi shu gapga mos keladigini tanlang.

### 3. SAT Oltin Qoidi
So'zni alohida yodlab olmasdan, o'rniga boshqa mos so'zni qo'yib qarang: agar gapning ma'nosi saqlansa — u to'g'ri variant.`,
            examples: [
              {
                title: "1-misol: 'Direct' so'zning ma'nosi",
                problem: "Matnda 'The manager gave a direct order.' gapida 'direct' so'zi nimani anglatadi?",
                stepByStepSolution: [
                  "1-variant: 'to'g'ri, To'g'ridan-to'g'ri' (aralashmas).",
                  "2-variant: 'doimiy' (makoniy ma'noda).",
                  "Kontekstda buyruq 'to'g'ridan-to'g'ri' berilmoqda, deyarli 'direct' = to'g'ri, aralmas.",
                ],
                takeaway: "So'zning barcha ma'nosini bilmas ham, kontekstdan qarab to'g'ri variantni tanlash mumkin.",
              },
            ],
            questions: [
              {
                id: "q-wic-1",
                difficulty: 2,
                passageUz: "The artist's work was described as 'bold' because it used bright colors and large shapes.",
                promptUz: "Matnda 'bold' so'zi nimani anglatadi?",
                options: [
                  { id: "A", text: "Qalin, kattaga chuqur" },
                  { id: "B", text: "Yengil, past rangli" },
                  { id: "C", text: "Eski, yozilgan" },
                  { id: "D", text: "Kichik, unchalik" },
                ],
                correctAnswer: "A",
                explanationUz: "'Bold' = chuqur, qalin, kattaga (bright colors and large shapes ga mos).",
                hints: [
                  "'Bright colors' va 'large shapes' — bu chuqur va ko'rinishli xususiyatlar.",
                  "So'zni o'rniga 'chuqur' qo'ying: gap ma'nosini saqlaydimi?",
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "sat-rw-boundaries",
        titleUz: "Standart Ingliz Tili: Belgilash Belgilari (Boundaries)",
        descriptionUz: "Vergul, nuqta-vergul, ikki nuqta va qirrog' qoidalari; run-on va fragment xatolarini bartaraf etish.",
        level: "INTERMEDIATE",
        estHours: 5,
        lessons: [
          {
            slug: "sat-rw-boundaries-punctuation",
            titleUz: "Vergul, Nuqta-vergul va Ikki Nuqta Qoidalari",
            summaryUz: "Ikki mustaqil gapni to'g'ri bog'lash, ro'yxatdagi elementlarni ajratish va vergul bilan bog'liq xatolarni aniqlash.",
            estMinutes: 30,
            xpReward: 75,
            theoryMarkdown: `### 1. Belgilash Belgilari (Boundaries)
SAT grammatikasida ikki mustaqil gap (Subject + Verb) orasiga faqat vergul qo'yish (Comma Splice) eng katta xato hisoblanadi.

### 2. Asosiy qoidalari
- **Nuqta (.)** yoki **nuqta-vergul (;)** — ikki mustaqil gapni ajratadi.
- **Vergul (,)** + bog'lovchi (and, but, or, so) — ikki mustaqil gapni bog'laydi.
- **Ikki nuqta (:)** — keyin-kekeyintiruv, ro'yxat yoki izoh uchun ishlatiladi.

### 3. SAT Oltin Qoidi
Ikki mustaqil gap orasiga yolg'iz vergul qo'ymang! Shunchaki variant xato hisoblanadi. To'g'ri usul: 'Gap 1; Gap 2' yoki 'Gap 1, and Gap 2'.`,
            examples: [
              {
                title: "1-misol: Comma Splice xatosi",
                problem: "Samarkand shahri tarixi bilan boy, uning madaniyati esa juda chuqur. Qaysi variant to'g'ri?",
                stepByStepSolution: [
                  "Ikki mustaqil gap: 'Samarkand shahri tarixi bilan boy' + 'uning madaniyati esa juda chuqur'.",
                  "Yolg'iz vergul bilan bog'lash xato.",
                  "To'g'ri: 'Samarkand shahri tarixi bilan boy; uning madaniyati esa juda chuqur.'",
                ],
                takeaway: "Ikki mustaqil gap orasiga hech qachon yolg'iz vergul qo'ymang.",
              },
            ],
            questions: [
              {
                id: "q-bound-1",
                difficulty: 2,
                promptUz: "Qaysi gap vergul bilan to'g'ri bog'langan?",
                options: [
                  { id: "A", text: "O'tgan hafta men kitob o'qidim, u juda qiziqarli edi." },
                  { id: "B", text: "Men kitob o'qidim, va u juda qiziqarli edi." },
                  { id: "C", text: "Kitob juda qiziqarli, men unga chuqur edim." },
                  { id: "D", text: "O'qish yoqimi, kitob qiziqarli." },
                ],
                correctAnswer: "B",
                explanationUz: "Variant B ikki mustaqil gapni 'vergul + and' bilan to'g'ri bog'laydi.",
                hints: [
                  "Har bir gapda fayl (subject) va amaliy (verb) bormi?",
                  "Vergul oldinda bog'lovchi bormi?",
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 3. IELTS ACADEMIC
  // ═════════════════════════════════════════════════════════════════════════
  {
    slug: "ielts",
    nameUz: "IELTS Academic",
    descriptionUz: "IELTS 7.5–8.5+: Reading, Listening, Writing Task 1/2 va Speaking strategiyalari.",
    icon: "Globe2",
    color: "#d6f766",
    order: 3,
    topics: [
      {
        slug: "ielts-reading",
        titleUz: "IELTS Reading: Paraphrasing va True / False / Not Given",
        descriptionUz: "Matndagi kalit so'zlarning sinonimlarini topish va Not Given tuzoqlaridan saqlanish.",
        level: "INTERMEDIATE",
        estHours: 6,
        lessons: [
          {
            slug: "ielts-reading-paraphrasing",
            titleUz: "Sinonimlar Zanjiri va True / False / Not Given Tuzoqlari",
            summaryUz: "IELTS Readingda vaqtni tejash va FALSE bilan NOT GIVEN farqini 100% aniqlikda ajratish.",
            estMinutes: 35,
            xpReward: 85,
            theoryMarkdown: `### 1. FALSE va NOT GIVEN o'rtasidagi aniq farq
Ko'pchilik o'quvchilar **FALSE** va **NOT GIVEN** ni adashtiradi. Quyidagi oltin qoidani eslab qoling:
- **TRUE:** Savoldagi fikr matnda sinonimlar orqali **tasdiqlangan**.
- **FALSE:** Matnda savoldagi fikrning **mutlaqo teskarisi** aytilgan (rad etilgan).
- **NOT GIVEN:** Matnda bu xususiyat, sabab yoki solishtirish haqida **umumiy ma'lumot yo'q** (o'zingizdan taxmin qilmang!).

### 2. Eng ko'p uchraydigan IELTS tuzoq so'zlari (Qualifiers)
Savolda *always, only, all, never, main reason, more than* kabi kuchaytiruvchi yoki qiyoslovchi so'zlar bo'lsa, diqqatni ikki barobar oshiring!`,
            examples: [
              {
                title: "1-misol: 'More than' solishtirish tuzog'i",
                problem: "Matn: 'Both solar and wind energy expanded rapidly in 2025.' Savol: 'Solar energy expanded more rapidly than wind energy in 2025.'",
                stepByStepSolution: [
                  "Matnda ikkala energiya turi ham tez o'sgani aytilgan.",
                  "Ammo qaysi biri ikkinchisidan tezroq ('more rapidly than') o'sgani haqida hech qanday taqqoslash yo'q.",
                  "Shuning uchun javob FALSE emas, balki NOT GIVEN bo'ladi!",
                ],
                takeaway: "Matnda taqqoslash bo'lmasa-yu, savolda 'more/less than' qatnashsa — javob NOT GIVEN.",
              },
            ],
            questions: [
              {
                id: "q-ie-lesson-1",
                difficulty: 2,
                passageUz: "Passage: 'Although early electric vehicles were limited by short battery range, recent solid-state prototypes can travel over 700 kilometers on a single charge.'",
                promptUz: "Statement: 'Modern solid-state battery prototypes have overcome the range limitations of early electric cars.'",
                options: [
                  { id: "A", text: "TRUE" },
                  { id: "B", text: "FALSE" },
                  { id: "C", text: "NOT GIVEN" },
                  { id: "D", text: "NONE" },
                ],
                correctAnswer: "A",
                explanationUz: "Avvalgi qisqa masofa cheklovi 700 km dan oshiq yuradigan yangi prototiplar orqali yengib o'tilgani ('overcome') matnda tasdiqlangan (TRUE).",
                hints: [
                  "Avvalgi cheklov va hozirgi 700 km natijani solishtiring.",
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "ielts-listening",
        titleUz: "IELTS Listening: Eshim qoralishi va Kalit So'zlarni Aniqlash",
        descriptionUz: "IELTS tinglash bo'limida kalit so'zlarni aniqlash, rejalashtirilgan ma'lumot va 'distractor'lar bilan ishlash.",
        level: "INTERMEDIATE",
        estHours: 5,
        lessons: [
          {
            slug: "ielts-listening-basics",
            titleUz: "IELTS Listening: Asosiy Strategiya va Tuzoqlar",
            summaryUz: "Tinglashda javobni oldindan taxmin qilib olish, kalit so'zga e'tibor berish va o'tkirish (distractor)lardan saqlanish.",
            estMinutes: 30,
            xpReward: 80,
            theoryMarkdown: `### 1. IELTS Listening bo'limi haqida
IELTS Academic Listening 4 ta qismdan iborat va har birida 10 ta savol bor. Jami 40 ta savol, 30 daqa tinglash va 10 daqa javoblarni yechish (papirda).

### 2. Asosiy strategiya
- **Javobni oldindan taxmin qiling:** Savolni o'qib, qanday turdagi ma'lumot kerakligini (ism, raqam, sana, joy) aniqlang.
- **Kalit so'zlarga e'tibor bering:** Savolda bor so'zlarni audio'da tinglang, ammo sinonimlarga ham diqqat qiling.
- **Distractor (o'tkirish):** Audio'da avval bir javob aytiledi, keyin 'lekin, ammo, esa' deb o'zgartirilsa — ikkinchisi to'g'ri bo'lishi ehtimoli katta.

### 3. IELTS Oltin Qoidi
Audio bir marta yo'llanadi. Agar biror savolni yo'qtirasangiz, darhol keyingisiga o'ting — xato javob berishdar barqaror, ammo quizni to'xtatish zarar keltiradi.`,
            examples: [
              {
                title: "1-misol: Distractor ni aniqlash",
                problem: "Audio: 'The meeting was planned for Monday, but it has been moved to Wednesday.' Savol: Meeting qachon?",
                stepByStepSolution: [
                  "Avval 'Monday' aytildi (distractor).",
                  "Keyin 'but it has been moved to Wednesday' — o'zgartirildi.",
                  "To'g'ri javob: Wednesday.",
                ],
                takeaway: "Avval aytilgan ma'lumot hami da to'g'ri javob emas; 'but', 'however', 'changed to' kabi so'zlarga quloq soling.",
              },
            ],
            questions: [
              {
                id: "q-listen-1",
                difficulty: 2,
                passageUz: "Audio transkript: 'The library opens at 9:00 AM on weekdays, but on weekends it opens at 10:00 AM.'",
                promptUz: "Kutubxona dam olish kunlarida necha daqda ochiladi?",
                options: [
                  { id: "A", text: "9:00 AM" },
                  { id: "B", text: "10:00 AM" },
                  { id: "C", text: "8:00 AM" },
                  { id: "D", text: "11:00 AM" },
                ],
                correctAnswer: "B",
                explanationUz: "'on weekends it opens at 10:00 AM' — dam olish kuni uchun 10:00 AM.",
                hints: [
                  "Savol 'weekends' (dam olish kunlari) haqida, 'weekdays' emas.",
                  "Audio'da 'weekends' so'zi keyin kelgan vaqtnu tanlang.",
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 4. FUNDAMENTAL MATEMATIKA
  // ═════════════════════════════════════════════════════════════════════════
  {
    slug: "foundation-math",
    nameUz: "Fundamental Matematika",
    descriptionUz: "Noldan boshlovchilar uchun kasrlar, foizlar, proporsiya va mantiqiy masalalar.",
    icon: "Compass",
    color: "#38BDF8",
    order: 4,
    topics: [
      {
        slug: "foundation-math-basics",
        titleUz: "Noldan Boshlovchilar: Kasrlar, Foizlar va Proporsiya",
        descriptionUz: "Murakkab formulalarsiz hayotiy misollar yordamida matematika poydevorini qurish.",
        level: "ZERO",
        estHours: 4,
        lessons: [
          {
            slug: "foundation-math-ratios-percents",
            titleUz: "Kasrlar, Foiz O'zgarishi va Hayotiy Proporsiyalar",
            summaryUz: "Noldan boshlab foizlarni 10 soniyada og'zaki hisoblash va ketma-ket foiz o'zgarishi tuzog'i.",
            estMinutes: 25,
            xpReward: 70,
            theoryMarkdown: `### 1. Foizni Og'zaki Tez Hisoblash Usuli
Har qanday sonning:
- **10% i** — sonni 10 ga bo'lish (oxiridan bitta nolni olib tashlash). Masalan, 240 000 ning 10% i = 24 000.
- **5% i** — 10% ning yarmi (12 000).
- **15% i** — 10% + 5% (24 000 + 12 000 = 36 000).

### 2. Ketma-ket Foiz O'zgarishi Tuzog'i!
Mahsulot narxi avval 20% ga oshib, keyin yangi narx 20% ga arzonlashsa, narx o'z holiga qaytmaydi!
- Boshlang'ich narx = 100.
- +20% dan keyin: 100 · 1.20 = 120.
- Endi 120 dan -20% chegiriladi: 120 · 0.80 = 96 (ya'ni 4% ga kamayadi!).`,
            examples: [
              {
                title: "1-misol: 15% ni og'zaki topish",
                problem: "160 sonining 15% ini kalkulyatorsiz toping.",
                stepByStepSolution: [
                  "160 ning 10% i = 16.",
                  "160 ning 5% i = 16 ning yarmi = 8.",
                  "15% = 10% + 5% = 16 + 8 = 24.",
                ],
                takeaway: "Murakkab foizlarni 10%, 5% va 1% bo'laklarga ajratib og'zaki hisoblang.",
              },
            ],
            questions: [
              {
                id: "q-fm-lesson-1",
                difficulty: 1,
                promptUz: "200 000 so'mlik kurs obunasiga 15% chegirma berildi. Chegirma miqdori necha so'm?",
                options: [
                  { id: "A", text: "20 000 so'm" },
                  { id: "B", text: "25 000 so'm" },
                  { id: "C", text: "30 000 so'm" },
                  { id: "D", text: "35 000 so'm" },
                ],
                correctAnswer: "C",
                explanationUz: "10% = 20 000 so'm, 5% = 10 000 so'm. Jami 15% = 30 000 so'm.",
                hints: [
                  "Avval 200 000 ning 10% ini (20 000), keyin 5% ini (10 000) topib qo'shing.",
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "foundation-math-fractions",
        titleUz: "Kasrlar: Qayta Yo'llashtirish, Solishtirish va Amalda Ishtirok",
        descriptionUz: "Oddiy va aralash kasrlarni qisqartirish, solishtirish va qo'shish-ayirish usulini 0 dan o'rganish.",
        level: "ZERO",
        estHours: 4,
        lessons: [
          {
            slug: "foundation-math-fractions-basics",
            titleUz: "Kasrlar: Asoslar va Qisqartirish",
            summaryUz: "Kasrning surati va maxrajini aniqlash, kasrlarni eng sodda ko'rinishga keltirish va solishtirish.",
            estMinutes: 30,
            xpReward: 75,
            theoryMarkdown: `### 1. Kasr Nima?
Kasr — bir butunning qismini bildiradi: \\(\\frac{a}{b}\\), unda:
- **a (surati)** — necha qism olingan.
- **b (maxraji)** — butun necha teng qismga bo'lingan (b ≠ 0).

### 2. Kasrni Qisqartirish
Suratni va maxrajini bittamonlab bo'luvchi eng katta son (EKUB) ga bo'ling. Masalan, \\(\\frac{12}{18}\\) ni 6 ga bo'lsak \\(\\frac{2}{3}\\) chiqadi.

### 3. Kasrlarni Solishtirish
Agar maxrajlar bir xal bo'lsa, suratini solishtiring: \\(\\frac{3}{8} > \\frac{2}{8}\\) chunki 3 > 2.
Agar suratlar bir xal bo'lsa, maxraj kichikroq bo'lgan kasr katta bo'ladi: \\(\\frac{1}{3} > \\frac{1}{5}\\).`,
            examples: [
              {
                title: "1-misol: Kasrni qisqartirish",
                problem: "\\(\\frac{24}{36}\\) kasrini eng sodda ko'rinishga keltiring.",
                stepByStepSolution: [
                  "24 va 36 ning EKUBi 12 bo'ladi.",
                  "24 / 12 = 2, 36 / 12 = 3.",
                  "Javob: \\(\\frac{2}{3}\\).",
                ],
                takeaway: "Har doim EKUBni topib, surat va maxrajni undan bo'ling.",
              },
            ],
            questions: [
              {
                id: "q-frac-1",
                difficulty: 1,
                promptUz: "Qaysi kasr eng kichik?",
                options: [
                  { id: "A", text: "\\(\\frac{1}{4}\\)" },
                  { id: "B", text: "\\(\\frac{1}{6}\\)" },
                  { id: "C", text: "\\(\\frac{1}{3}\\)" },
                  { id: "D", text: "\\(\\frac{1}{2}\\)" },
                ],
                correctAnswer: "B",
                explanationUz: "Suratlar barcha 1 ga teng, maxraj eng kattasi bo'lgan kasr eng kichik bo'ladi: 1/6.",
                hints: [
                  "Maxraj kattaroq bo'lsa, kasr kichikroq bo'ladi.",
                  "1/6 da maxraj 6 — bu eng katta maxraj.",
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 5. AKADEMIK YOZUV
  // ═════════════════════════════════════════════════════════════════════════
  {
    slug: "academic-writing",
    nameUz: "Akademik Yozuv",
    descriptionUz: "IELTS Writing Task 2, SAT Essay tahlili va Universitetlar uchun Personal Statement.",
    icon: "PenTool",
    color: "#A855F7",
    order: 5,
    topics: [
      {
        slug: "academic-writing-essay",
        titleUz: "Akademik Insho Arxitekturasi va Personal Statement",
        descriptionUz: "PEEL paragraf modeli, Thesis Statement va qabul komissiyasi uchun insho yozish.",
        level: "INTERMEDIATE",
        estHours: 5,
        lessons: [
          {
            slug: "academic-writing-thesis-essay",
            titleUz: "Kuchli Thesis Statement, PEEL Paragraf va Show Don't Tell",
            summaryUz: "Har qanday akademik inshoni Band 7.5–8.5 darajada mantiqiy qurish formulasi.",
            estMinutes: 30,
            xpReward: 80,
            theoryMarkdown: `### 1. PEEL Paragraf Formulasi
Akademik inshoning har bir asosiy paragrafi (Body Paragraph) **PEEL** qolipida qurilsa, fikringiz uzilmaydi va yuqori ball oladi:
- **P (Point / Topic Sentence):** Paragrafning asosiy da'vosi (1-gap).
- **E (Explanation):** Nega bunday ekanini mantiqiy tushuntirish (2–3-gaplar).
- **E (Example / Evidence):** Aniq real yoki mantiqiy misol keltirish.
- **L (Link):** Paragrafni umumiy Thesis Statement bilan bog'lab yakunlash.`,
            examples: [
              {
                title: "1-misol: Zaif va Kuchli Topic Sentence",
                problem: "Mavzu: Masofaviy ta'limning afzalliklari.",
                stepByStepSolution: [
                  "Zaif: 'Internet orqali o'qish juda foydali.' (Juda umumiy)",
                  "Kuchli (PEEL - Point): 'Onlayn ta'lim platformalari chekka hududdagi o'quvchilarga ham jahon standartidagi darsliklardan teng foydalanish imkonini yaratadi.'",
                ],
                takeaway: "Topic Sentence aniq sabab yoki ta'sir yo'nalishini ko'rsatishi kerak.",
              },
            ],
            questions: [
              {
                id: "q-aw-lesson-1",
                difficulty: 2,
                promptUz: "PEEL paragraf modelidagi ikkinchi 'E' (Evidence / Example) qismining asosiy maqsadi nima?",
                options: [
                  { id: "A", text: "Yangi mavzuga o'tib ketish" },
                  {
                    id: "B",
                    text: "Oldingi gapda aytilgan nazariy fikrni aniq misol yoki dalil bilan isbotlash",
                  },
                  { id: "C", text: "Kirish gapini so'zma-so'z takrorlash" },
                  { id: "D", text: "O'quvchiga savol berish" },
                ],
                correctAnswer: "B",
                explanationUz: "Evidence/Example qismi abstrakt fikrni real misol bilan mustahkamlaydi.",
                hints: [
                  "Nega tushuntirishdan keyin misol ('For instance...') keltiriladi?",
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "academic-writing-personal-statement",
        titleUz: "Personal Statement: Qabul Komissiyasiga Mo'ljallanadigan Insho",
        descriptionUz: "Xalqaro universitet uchun Personal Statement (motivatsiya xati) yozish formulasi va 3 qismli tuzilma.",
        level: "INTERMEDIATE",
        estHours: 5,
        lessons: [
          {
            slug: "academic-writing-personal-statement",
            titleUz: "Personal Statement (Motivatsiya Xati) Yazish Usulii",
            summaryUz: "Kirish, asosiy qism va yakun qismidan iborat 3 qismli Personal Statement yozish va qabul komissiyasiga ta'sir qoldirish.",
            estMinutes: 30,
            xpReward: 80,
            theoryMarkdown: `### 1. Personal Statement Nima?
Universitetga qabul komissiyasiga yuboriluvchi shaxsiy xat (motivatsiya xati). Unda siz kim ekansiz, nima uchun bu yo'nalishni tanladingiz va nima qilmoqchisiz aytiladi.

### 2. 3 Qismli Tuzilma
1. **Kirish:** O'zingizni tanishtiring va qaysi fakultet/universitetga o'qimoqchiligingizni aytng.
2. **Asosiy qism:** Tajribangiz, mavjud ko'nikmalaringiz va bu yo'nalishda nima o'rganmoqchligingizni yoritng.
3. **Yakun:** Kelajakdagi maqsadingiz va bu universitet nima uchun sizga mos ekanligingizni ko'rsating.

### 3. Oltin Qoidi
'Universitet nima uchun aynan sizni tanlaydi?' va 'Siz u yerda qanday foyda berasiz?' savollarga javob bering. Umumiy va sezadigan gaplarni ('men seviman', 'juda qiziq') chiqarib tashlang.`,
            examples: [
              {
                title: "1-misol: Zaif va Kuchli Yakun",
                problem: "Personal Statement yakunini yaxshilash.",
                stepByStepSolution: [
                  "Zaif: 'Iltimos, meni universitetga qabul qiling.' (Juda sezgir)",
                  "Kuchli: 'MIT-da robotikada ilmiy taqqiqatlarni boshqarish va yuqori texnologiyalarga erishish maqsadim.'",
                ],
                takeaway: "Yakunda o'z maqsadingizni aniq va amaliy ko'rsating.",
              },
            ],
            questions: [
              {
                id: "q-ps-1",
                difficulty: 2,
                promptUz: "Personal Statement (Motivation Letter) yakunida qaysi xulosa qabul komissiyasida eng kuchli taassurot qoldiradi?",
                options: [
                  { id: "A", text: "Iltimos, meni universitetga qabul qiling deb yolvorgan jumla" },
                  {
                    id: "B",
                    text: "O'z tajribangizni universitetning aniq ilmiy laboratoriyasi yoki dasturi bilan bog'lab, kelajakda jamiyatga qanday hissa qo'shishingizni ko'rsatish",
                  },
                  { id: "C", text: "Maktabdagi barcha baholarni qayta sanab o'tish" },
                  { id: "D", text: "Mashhur faylasufning uzun iqtibosini keltirish" },
                ],
                correctAnswer: "B",
                explanationUz: "Universitetlar nomzodning maqsadi ularning resurslari bilan qanday uyg'unlashishini va kelajakdagi amaliy ta'sirini ko'rishni xohlaydi.",
                hints: [
                  "Universitet nima uchun aynan sizni tanlashi va siz u yerda nima yaratishingiz haqida o'ylang.",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
