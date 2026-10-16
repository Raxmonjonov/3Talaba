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

export interface SeedSubjectBundle {
  slug: string;
  nameUz: string;
  descriptionUz: string;
  icon: string;
  color: string;
  order: number;
  topic: {
    slug: string;
    titleUz: string;
    descriptionUz: string;
    level: "ZERO" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    estHours: number;
    lesson: {
      slug: string;
      titleUz: string;
      summaryUz: string;
      estMinutes: number;
      xpReward: number;
      theoryMarkdown: string;
      examples: SeedLessonExample[];
      questions: SeedQuestionData[];
    };
  };
}

export const SEED_BADGES = [
  {
    slug: "first-step",
    titleUz: "Ilk Qadam",
    descriptionUz: "3Talab platformasida shaxsiy profil yaratib o'qishni boshlagani uchun.",
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
  // ── 1. SAT MATEMATIKA ──────────────────────────────────────────────────────
  {
    slug: "sat-math",
    nameUz: "SAT Matematika",
    descriptionUz: "Digital SAT Math (800 ballgacha): Algebra, funksiyalar, geometriya va ma'lumotlar tahlili.",
    icon: "Calculator",
    color: "#10B981",
    order: 1,
    topic: {
      slug: "sat-math-linear",
      titleUz: "Algebraik Tenglamalar va Chiziqli Funksiyalar",
      descriptionUz: "Digital SAT imtihonining 35% qismini tashkil etuvchi chiziqli modellar va funksiyalar.",
      level: "BEGINNER",
      estHours: 6,
      lesson: {
        slug: "sat-math-linear-equations",
        titleUz: "Chiziqli Tenglamalar, Funksiyalar va Grafik Qiyalik (Slope)",
        summaryUz: "y = mx + b chiziqli modelini hayotiy masalalarda qo'llash va SAT tuzoqlarini tez yechish usullari.",
        estMinutes: 35,
        xpReward: 80,
        theoryMarkdown: `### 1. Chiziqli Funksiya Nima?
Digital SAT Matematika bo'limida eng ko'p uchraydigan model bu **chiziqli funksiya** bo'lib, u quyidagi standart ko'rinishda yoziladi:

$$f(x) = mx + b$$

Bu yerda:
- **$m$ (Slope / Qiyalik koeffitsiyenti):** $x$ qiymati $1$ birlikka oshganda $y$ ning qanchaga o'zgarish tezligi. Ikki nuqta $(x_1, y_1)$ va $(x_2, y_2)$ berilganda:
  $$m = \\frac{y_2 - y_1}{x_2 - x_1}$$
- **$b$ (Y-intercept / Boshlang'ich qiymat):** $x = 0$ bo'lgandagi boshlang'ich nuqta $(0, b)$.

### 2. SAT Imtihonidagi Oltin Qoida (Ifodani butunligicha topish)
Ko'pincha SAT savolida $x$ ning o'zini emas, balki $3x + 2$ kabi ifodani topish so'raladi. Bunday paytda $x$ ni kasr qilib hisoblab o'tirmasdan, tenglamaning ikkala tomonini bir xil songa bo'lish yoki ko'paytirish orqali javobni **5 soniyada** topish mumkin!

### 3. Parallel va Perpendikulyar To'g'ri Chiziqlar
- **Parallel chiziqlar (hech qachon kesishmaydi / yechimga ega emas):** Qiyaliklari teng ($m_1 = m_2$), ammo boshlang'ich nuqtalari farqli ($b_1 \\neq b_2$).
- **Perpendikulyar chiziqlar ($90^\\circ$ burchak ostida kesishadi):** Qiyaliklari ko'paytmasi $-1$ ga teng ($m_1 \\cdot m_2 = -1$).`,
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
          {
            id: "q-sm-lesson-3",
            difficulty: 3,
            promptUz: "kx + 3y = 12 va 4x + 6y = 15 chiziqli tenglamalar sistemasi hech qanday yechimga ega bo'lmasligi (no solution) uchun k ning qiymati nechaga teng bo'lishi kerak?",
            options: [
              { id: "A", text: "1" },
              { id: "B", text: "2" },
              { id: "C", text: "4" },
              { id: "D", text: "8" },
            ],
            correctAnswer: "B",
            explanationUz: "Sistema yechimga ega bo'lmasligi uchun to'g'ri chiziqlar parallel bo'lishi kerak: k / 4 = 3 / 6 -> k / 4 = 1 / 2 -> k = 2.",
            hints: [
              "Tenglamalar sistemasi yechimga ega bo'lmasligi uchun chiziqlar parallel bo'lishi shart.",
              "x va y oldidagi koeffitsiyentlar nisbatini tenglashtiring: k / 4 = 3 / 6.",
            ],
          },
          {
            id: "q-sm-lesson-4",
            difficulty: 4,
            promptUz: "f(x) chiziqli funksiya uchun f(2) = 10 va f(6) = 22 bo'lsa, f(10) ning qiymatini toping.",
            options: [
              { id: "A", text: "30" },
              { id: "B", text: "32" },
              { id: "C", text: "34" },
              { id: "D", text: "36" },
            ],
            correctAnswer: "C",
            explanationUz: "x qiymati 2 dan 6 ga (+4) oshganda, f(x) qiymati 10 dan 22 ga (+12) oshdi. Demak x yana +4 ga oshib 10 bo'lganda, f(x) ham +12 ga oshadi: 22 + 12 = 34.",
            hints: [
              "Chiziqli funksiyada bir xil qadamda qiymat ham bir xil miqdorga o'zgaradi.",
              "2 dan 6 gacha o'zgarish +12 bo'lsa, 6 dan 10 gacha ham aynan +12 bo'ladi!",
            ],
          },
        ],
      },
    },
  },

  // ── 2. SAT READING & WRITING ───────────────────────────────────────────────
  {
    slug: "sat-rw",
    nameUz: "SAT Reading & Writing",
    descriptionUz: "Digital SAT Reading & Writing: Mantiqiy bog'lovchilar, matn dalillari va akademik grammatika.",
    icon: "BookOpen",
    color: "#F59E0B",
    order: 2,
    topic: {
      slug: "sat-rw-transitions",
      titleUz: "Mantiqiy Bog'lovchilar (Transitions) va Dalillar",
      descriptionUz: "Gaplar o'rtasidagi sabab-oqibat, zidlik va misol munosabatlarini aniq topish.",
      level: "BEGINNER",
      estHours: 5,
      lesson: {
        slug: "sat-rw-transitions-evidence",
        titleUz: "Transitions (Bog'lovchilar) va Command of Evidence Strategiyasi",
        summaryUz: "Digital SATda 4–5 ta savolni 20 soniyada xatosiz yechishga yordam beruvchi 3 guruhli bog'lovchilar jadvali.",
        estMinutes: 30,
        xpReward: 75,
        theoryMarkdown: `### 1. Transitions Savollarini Yechishning 3 Qadamli Algoritmi
1. **Bo'sh joyni yoping:** Variantlarga qaramasdan avval 1-gap va 2-gapni o'qing.
2. **Munosabat turini belgilang:**
   - **Davom ettirish / Qo'shimcha (+ / +):** *Moreover, Furthermore, In addition, Similarly*
   - **Qarama-qarshilik / Zidlik (+ / -):** *However, Nevertheless, Conversely, On the other hand*
   - **Sabab va Natija (→):** *Therefore, Consequently, Thus, As a result*
   - **Misol keltirish (Misol):** *For instance, For example, Specifically*
3. **Egizak variantlarni o'chiring:** Agar ikkita variant bir xil ma'noni bersa (masalan, *Therefore* va *Consequently*), ikkalasi ham xato bo'ladi!`,
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
          {
            id: "q-srw-lesson-2",
            difficulty: 2,
            passageUz: "Early telescopes suffered from chromatic aberration, which blurred the edges of planets. _____, Isaac Newton designed a reflecting telescope using curved mirrors rather than glass lenses.",
            promptUz: "Ikki gapni mantiqan bog'lovchi so'zni tanlang:",
            options: [
              { id: "A", text: "Similarly," },
              { id: "B", text: "To address this limitation," },
              { id: "C", text: "Regardless," },
              { id: "D", text: "In other words," },
            ],
            correctAnswer: "B",
            explanationUz: "Birinchi gapda muammo (linzalardagi xiralik), ikkinchi gapda esa Nyutonning bu muammoni hal qilish uchun yaratgan yechimi keltirilgan.",
            hints: [
              "1-gapda muammo, 2-gapda esa shu kamchilikni bartaraf etish yo'li aytilgan.",
            ],
          },
          {
            id: "q-srw-lesson-3",
            difficulty: 3,
            passageUz: "Studying marine bioluminescence in deep-sea trenches is notoriously difficult because extreme water pressure crushes standard cameras. _____, marine biologists have documented over 150 new glowing species in the past decade.",
            promptUz: "Bo'sh joyni to'ldiring:",
            options: [
              { id: "A", text: "Consequently," },
              { id: "B", text: "For instance," },
              { id: "C", text: "Nevertheless," },
              { id: "D", text: "Specifically," },
            ],
            correctAnswer: "C",
            explanationUz: "Birinchi gapda katta qiyinchilik aytilgan, ammo shunga qaramasdan ('Nevertheless') olimlar 150 dan ortiq yangi turni kashf etishgan.",
            hints: [
              "Qiyinchilikka qaramay ijobiy natijaga erishilgan bo'lsa, qaysi zidlov bog'lovchisi ishlatiladi?",
            ],
          },
        ],
      },
    },
  },

  // ── 3. IELTS ACADEMIC ──────────────────────────────────────────────────────
  {
    slug: "ielts",
    nameUz: "IELTS Academic",
    descriptionUz: "IELTS 7.5–8.5+: Reading, Listening, Writing Task 1/2 va Speaking strategiyalari.",
    icon: "Globe2",
    color: "#00E676",
    order: 3,
    topic: {
      slug: "ielts-reading",
      titleUz: "IELTS Reading: Paraphrasing va True / False / Not Given",
      descriptionUz: "Matndagi kalit so'zlarning sinonimlarini topish va Not Given tuzoqlaridan saqlanish.",
      level: "INTERMEDIATE",
      estHours: 6,
      lesson: {
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
          {
            id: "q-ie-lesson-2",
            difficulty: 3,
            passageUz: "Passage: 'The municipal library digitized its historical newspaper archive in 2024, allowing university students to access nineteenth-century records remotely.'",
            promptUz: "Statement: 'Only university students are permitted to view the digitized newspaper archive.'",
            options: [
              { id: "A", text: "TRUE" },
              { id: "B", text: "FALSE" },
              { id: "C", text: "NOT GIVEN" },
              { id: "D", text: "PARTIALLY TRUE" },
            ],
            correctAnswer: "C",
            explanationUz: "Matnda talabalar foydalana olishi aytilgan, ammo 'faqatgina talabalarga ruxsat berilgani' ('Only university students') haqida ma'lumot berilmagan (NOT GIVEN).",
            hints: [
              "Savoldagi 'Only' (faqat) so'zi matnda bormi yoki bu haqda hech narsa aytilmaganmi?",
            ],
          },
          {
            id: "q-ie-lesson-3",
            difficulty: 3,
            passageUz: "Passage: 'Contrary to popular belief, adult brain cells continue to form new synaptic connections throughout life when stimulated by complex learning tasks.'",
            promptUz: "Statement: 'The human brain stops forming new synaptic connections once a person reaches adulthood.'",
            options: [
              { id: "A", text: "TRUE" },
              { id: "B", text: "FALSE" },
              { id: "C", text: "NOT GIVEN" },
              { id: "D", text: "NOT SURE" },
            ],
            correctAnswer: "B",
            explanationUz: "Matnda 'continue to form throughout life' (butun umr davom etadi) deyilgan, savolda esa 'stops' (to'xtaydi) deyilgan — bu to'g'ridan-to'g'ri zidlikdir (FALSE).",
            hints: [
              "'Continue throughout life' va 'stops once a person reaches adulthood' bir-biriga zidmi?",
            ],
          },
        ],
      },
    },
  },

  // ── 4. FUNDAMENTAL MATEMATIKA ──────────────────────────────────────────────
  {
    slug: "foundation-math",
    nameUz: "Fundamental Matematika",
    descriptionUz: "Noldan boshlovchilar uchun kasrlar, foizlar, proporsiya va mantiqiy masalalar.",
    icon: "Compass",
    color: "#38BDF8",
    order: 4,
    topic: {
      slug: "foundation-math-basics",
      titleUz: "Noldan Boshlovchilar: Kasrlar, Foizlar va Proporsiya",
      descriptionUz: "Murakkab formulalarsiz hayotiy misollar yordamida matematika poydevorini qurish.",
      level: "ZERO",
      estHours: 4,
      lesson: {
        slug: "foundation-math-ratios-percents",
        titleUz: "Kasrlar, Foiz O'zgarishi va Hayotiy Proporsiyalar",
        summaryUz: "Noldan boshlab foizlarni 10 soniyada og'zaki hisoblash va ketma-ket foiz o'zgarishi tuzog'i.",
        estMinutes: 25,
        xpReward: 70,
        theoryMarkdown: `### 1. Foizni Og'zaki Tez Hisoblash Usuli
Har qanday sonning:
- **10% i** — sonni $10$ ga bo'lish (oxiridan bitta nolni olib tashlash). Masalan, $240\\,000$ ning $10\\%$ i $= 24\\,000$.
- **5% i** — $10\\%$ ning yarmi ($12\\,000$).
- **15% i** — $10\\% + 5\\%$ ($24\\,000 + 12\\,000 = 36\\,000$).

### 2. Ketma-ket Foiz O'zgarishi Tuzog'i!
Mahsulot narxi avval $20\\%$ ga oshib, keyin yangi narx $20\\%$ ga arzonlashsa, narx o'z holiga qaytmaydi!
- Boshlang'ich narx $= 100$.
- $+20\\%$ dan keyin: $100 \\cdot 1.20 = 120$.
- Endi $120$ dan $-20\\%$ chegiriladi: $120 \\cdot 0.80 = 96$ (ya'ni $4\\%$ ga kamayadi!).`,
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
          {
            id: "q-fm-lesson-2",
            difficulty: 2,
            promptUz: "Noutbuk narxi avval 10% ga oshirildi, bir oydan so'ng yangi narx 10% ga tushirildi. Yakuniy narx dastlabki narxga nisbatan qanday o'zgardi?",
            options: [
              { id: "A", text: "O'zgarmadi" },
              { id: "B", text: "1% ga kamaydi" },
              { id: "C", text: "1% ga oshdi" },
              { id: "D", text: "2% ga kamaydi" },
            ],
            correctAnswer: "B",
            explanationUz: "1.10 * 0.90 = 0.99 (ya'ni dastlabki narxning 99% i qoldi — 1% ga kamaydi).",
            hints: [
              "Boshlang'ich narxni 100 deb olib hisoblab ko'ring: 100 + 10% = 110. Endi 110 ning 10% i nechaga teng?",
            ],
          },
        ],
      },
    },
  },

  // ── 5. AKADEMIK YOZUV ──────────────────────────────────────────────────────
  {
    slug: "academic-writing",
    nameUz: "Akademik Yozuv",
    descriptionUz: "IELTS Writing Task 2, SAT Essay tahlili va Universitetlar uchun Personal Statement.",
    icon: "PenTool",
    color: "#A855F7",
    order: 5,
    topic: {
      slug: "academic-writing-essay",
      titleUz: "Akademik Insho Arxitekturasi va Personal Statement",
      descriptionUz: "PEEL paragraf modeli, Thesis Statement va qabul komissiyasi uchun insho yozish.",
      level: "INTERMEDIATE",
      estHours: 5,
      lesson: {
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
          {
            id: "q-aw-lesson-2",
            difficulty: 3,
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
    },
  },
];
