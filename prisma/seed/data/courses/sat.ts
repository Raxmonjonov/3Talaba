import type { SeedCourse } from '../../types';

/** SAT kursi: 5 dars (algebra, advanced, data, reading, writing/vocab). */
export const SAT_COURSE: SeedCourse = {
  slug: 'sat',
  subject: 'SAT',
  title: ['SAT tayyorgarlik', 'SAT Preparation'],
  description: [
    'SAT imtihonining barcha bo‘limlari: matematika, o‘qish, yozish va lug‘at. Har bir dars nazariya, drill va darhol tekshiruvdan iborat.',
    'All sections of the SAT exam: math, reading, writing and vocabulary. Each lesson combines theory, drills and an immediate check.',
  ],
  modules: [
    {
      slug: 'sat-math',
      title: ['SAT Matematika', 'SAT Math'],
      description: ['Algebra, advanced mathematics va data analysis.', 'Algebra, advanced mathematics and data analysis.'],
      levelRange: '0-5',
      lessons: [
        {
          slug: 'sat-algebra-basics',
          title: ['Algebra asoslari', 'Algebra Basics'],
          summary: [
            'Tenglamalar, ko‘p xadli ifodalar va chiziqli funksiyalar bilan ishlash.',
            'Working with equations, polynomials and linear functions.',
          ],
          objectives: [
            ['Bir hadli va ko‘p hadli tenglamalarni yechish', 'Solve linear and polynomial equations'],
            ['Ifodani yomonlashtirish va soddalashtirish', 'Expand and simplify expressions'],
            ['Chiziqli funksiyaning qiymati va y-intercept', 'Function values and y-intercepts'],
          ],
          storyAct: 1,
          storyTitle: ['Tenglamalar davrasi', 'Equation Gauntlet'],
          levelRange: '0-2',
          estMinutes: 50,
          xpReward: 40,
          skills: ['sat-algebra'],
          blocks: [
            {
              kind: 'STORY',
              title: ['Muqova: tenglamalar davrasi', 'Cover: Equation Gauntlet'],
              minMinutes: 5,
              content: {
                uz: 'Reyting oshgani sayin har bir kun yangi imtihon yaqinlashmoqda. Bugun siz tenglamalarni "tez korish"ga o‘qitishingiz mumkin: har bir ifodada qaysi qadam birinchi bo‘lishini aniqlash.',
                en: 'With your scores rising, a new exam date approaches every week. Today you will learn to "see" equations: which step to take first in any expression.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Tenglama va chiziqli funksiya', 'Equations and Linear Functions'],
              minMinutes: 12,
              content: {
                uz: 'Chiziqli funksiya f(x) = mx + c ko‘rinishida bo‘lib, m — chiziqning qiyaligi, c — y-intercept. Agar f(3) va f(5) berilgan bo‘lsa, ikki tenglamadan m ni topasiz: (f(5) − f(3)) / (5 − 3). Masalan f(3)=11, f(5)=19 bo‘lsa, m = (19−11)/2 = 4, so‘ng c = 11 − 12 = −1. Demak f(x) = 4x − 1. Bu usul barcha chiziqli funksiya savollarida ishlaydi.',
                en: 'A linear function has the form f(x) = mx + c, where m is the slope and c is the y-intercept. If f(3) and f(5) are given, subtract the two equations: m = (f(5) − f(3)) / (5 − 3). With f(3)=11 and f(5)=19, m = (19−11)/2 = 4, then c = 11 − 12 = −1, so f(x) = 4x − 1. This works for every linear-function question.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Ish qadamlarining namuna', 'Worked Walkthrough'],
              minMinutes: 8,
              content: {
                uz: '3x − 7 = 14: 1) Ikki tomonga ham 7 qo‘shing → 3x = 21. 2) 3 ga bo‘ling → x = 7. Tekshirish: 3·7 − 7 = 14 ✓. Tip: tenglamada qat’iy sonni qarama-qarshi tomonga ko‘chirishda belgisini almashtiring.',
                en: 'For 3x − 7 = 14: 1) Add 7 to both sides → 3x = 21. 2) Divide by 3 → x = 7. Check: 3·7 − 7 = 14 ✓. Tip: when you move a constant across the equals sign, its sign flips.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Tenglama drill', 'Equation Drill'],
              minMinutes: 15,
              content: {
                uz: 'Quyidagi turlarda 4 ta masala yeching: bir hadli tenglama, yomonlashtirish, f(x) qiymati, chiziqli funksiya qiyaligi. Har biriga qisqa javob yozing.',
                en: 'Solve four problems: a linear equation, an expansion, a function value, and a slope. Write a short answer for each.',
              },
              skills: ['sat-algebra'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 10,
              content: {
                uz: '5 ta aralash savol. Har birida javobni tanlang va keyin biror qator tushuntirish yozing — bu sizning zaif joyni ko‘rsatadi.',
                en: 'Five mixed questions. Choose an answer, then write one line of justification — this reveals your weak spot.',
              },
              skills: ['sat-algebra'],
            },
          ],
        },
        {
          slug: 'sat-factoring-polynomials',
          title: ['Ko‘phadlarni chiziqli ko‘rinishga keltirish', 'Factoring Polynomials'],
          summary: [
            'Chiziqli omilga ajratish, Paskal va guruhlash usullari.',
            'Factoring into linear factors using grouping and trinomials.',
          ],
          objectives: [
            ['Ikkhadli chiziqli omillarga ajratish', 'Factor binomials into linear factors'],
            ['Uchhadli va to‘rt hadli ifodalarni guruhlash', 'Group trinomials and four-term expressions'],
          ],
          storyAct: 1,
          storyTitle: ['Chiziqli omillar fabrikasi', 'The Linear Factor Factory'],
          levelRange: '0-3',
          estMinutes: 55,
          xpReward: 45,
          skills: ['sat-algebra'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Guruhlash texnikasi', 'The Grouping Technique'],
              minMinutes: 12,
              content: {
                uz: 'Ikki hadli noma’lumli ifodani yomonlashtirib, keyin umumiy omil topish kerak. Masalan 2x³ + 3x² − 2x − 3 ni guruhlab: x²(2x+3) − 1(2x+3) = (x² − 1)(2x+3) = (x − 1)(x + 1)(2x + 3). Natija: uchta chiziqli omil.',
                en: 'Expand the binomial expression, then find a common factor. For 2x³ + 3x² − 2x − 3, group: x²(2x+3) − 1(2x+3) = (x² − 1)(2x+3) = (x − 1)(x + 1)(2x + 3). Result: three linear factors.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Uchhadli omilga ajratish', 'Factoring a Trinomial'],
              minMinutes: 10,
              content: {
                uz: 'x² − 5x + 6 uchun ikki son qidiring, ularning yig‘indisi −5, ko‘paytuvchisi 6. Bu −2 va −3. Demak (x − 2)(x − 3). Tekshirish: (x−2)(x−3) = x² −5x +6 ✓.',
                en: 'For x² − 5x + 6, find two numbers whose sum is −5 and whose product is 6: −2 and −3. So (x − 2)(x − 3). Check: (x−2)(x−3) = x² −5x +6 ✓.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Omilga ajratish drill', 'Factoring Drill'],
              minMinutes: 18,
              content: {
                uz: '5 ta ifodani chiziqli omillarga to‘liq ajrating: kubik, kvadratik va to‘rt hadli ifodalar.',
                en: 'Factor five expressions completely: one cubic, one quadratic and one four-term expression.',
              },
              skills: ['sat-algebra'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 15,
              content: {
                uz: '6 ta aralash omilga ajratish va tenglama savollari. Xatolarni Error Review ga qoldiring — ular qaytib keladi.',
                en: 'Six mixed factoring and equation questions. Log your mistakes for error review — they will come back.',
              },
              skills: ['sat-algebra'],
            },
          ],
        },
        {
          slug: 'sat-exponents-logarithms',
          title: ['Darajalar va logarifmlar', 'Exponents and Logarithms'],
          summary: [
            'Daraja qoidalari, logarifm ta’rifi va logaritmik tenglamalar.',
            'Exponent rules, the definition of a logarithm and log equations.',
          ],
          objectives: [
            ['Daraja qoidalarini qo‘llash', 'Apply exponent rules'],
            ['Logarifm bilan ifodalarni o‘zgartirish', 'Convert between logarithmic and exponential forms'],
          ],
          storyAct: 2,
          storyTitle: ['Logarifm minorasi', 'The Logarithm Mines'],
          levelRange: '2-5',
          estMinutes: 60,
          xpReward: 50,
          skills: ['sat-advanced'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Logarifm nima qiladi', 'What a Logarithm Does'],
              minMinutes: 14,
              content: {
                uz: 'log₂(8) = 3 chunki 2³ = 8. Logarifm ko‘rinishi bilan ifodalash original qiymatni topishga imkon beradi. Masalan, 2^(x+1) = 32 bo‘lsa, log₂ qo‘llab, x+1 = 5, demak x = 4.',
                en: 'log₂(8) = 3 because 2³ = 8. Rewriting in logarithmic form lets you solve for the original value. If 2^(x+1) = 32, taking log₂ gives x+1 = 5, so x = 4.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Murakkab daraja ifodasi', 'Complex Exponent Expression'],
              minMinutes: 12,
              content: {
                uz: 'Qisqartirish uchun darajani ichkariga surish kerak: (2^(2/3) · 8^(1/3))^(3/2). Avval ichkariga suring: (2^(2/3) · 2) = 2^(5/3), keyin butunlayni 3/2 ga ko‘tarish → 2^(5/2) = 4√2.',
                en: 'To simplify, push exponents inside: (2^(2/3) · 8^(1/3))^(3/2). Inside: (2^(2/3) · 2) = 2^(5/3), then raise to 3/2 → 2^(5/2) = 4√2.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Daraja va logarifm drill', 'Exponent & Log Drill'],
              minMinutes: 20,
              content: {
                uz: '8 ta savol: 5 ta daraja qoidasi, 3 ta logaritmik tenglama.',
                en: 'Eight questions: five exponent-rule items and three logarithmic equations.',
              },
              skills: ['sat-advanced'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 14,
              content: {
                uz: '5 ta aralash savol. Har bir logaritmdagi asos (base) 2, 3 yoki 10 ekanini tekshiring — aralashtirib yuborish eng tez xato.',
                en: 'Five mixed questions. Check each log’s base (2, 3 or 10) — swapping bases is the fastest way to lose points.',
              },
              skills: ['sat-advanced'],
            },
          ],
        },
        {
          slug: 'sat-quadratics-complex',
          title: ['Kvadratik tenglamalar va kompleks sonlar', 'Quadratics and Complex Numbers'],
          summary: [
            'Diskriminant, parabolaning cho‘qqisi va kompleks sonlar.',
            'Discriminant, vertex form and complex numbers.',
          ],
          objectives: [
            ['Diskriminant orqali ildizlar sonini aniqlash', 'Use the discriminant to count roots'],
            ['Kompleks sonlarda arifmetika qilish', 'Do arithmetic with complex numbers'],
          ],
          storyAct: 2,
          storyTitle: ['Ildizsiz cho‘qqilar', 'The Rootless Peaks'],
          levelRange: '3-5',
          estMinutes: 60,
          xpReward: 50,
          skills: ['sat-advanced'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Diskriminant nima beradi', 'What the Discriminant Tells You'],
              minMinutes: 14,
              content: {
                uz: 'ax² + bx + c = 0 uchun D = b² − 4ac. D > 0 bo‘lsa ikki haqiqiy ildiz, D = 0 bitta takrorlangan ildiz, D < 0 bo‘lsa ikkita kompleks ildiz. Bu test imtihonda eng tez qo‘llanadigan usul.',
                en: 'For ax² + bx + c = 0, D = b² − 4ac. D > 0 gives two real roots, D = 0 one repeated root, D < 0 two complex roots. This is the fastest tool in the exam.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Kompleks sonlar bilan', 'Working with Complex Numbers'],
              minMinutes: 12,
              content: {
                uz: 'Modulli: z = 3 + 4i bo‘lsa |z| = √(9+16) = 5. Ko‘paytma: (3+4i)(1−2i) = 3 − 6i + 4i − 8i² = 3 − 2i + 8 = 11 − 2i. i² = −1 ekanini unutmang.',
                en: 'Modulus: for z = 3 + 4i, |z| = √(9+16) = 5. Product: (3+4i)(1−2i) = 3 − 6i + 4i − 8i² = 11 − 2i. Remember that i² = −1.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Kvadratik drill', 'Quadratic Drill'],
              minMinutes: 20,
              content: {
                uz: '6 ta masala: 3 ta diskriminant, 2 ta parabolaning cho‘qqisi, 1 ta kompleks son.',
                en: 'Six problems: three discriminant items, two vertex questions, one complex-number item.',
              },
              skills: ['sat-advanced'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 14,
              content: {
                uz: '4 ta aralash savol. Har bir javob uchun bir qator asos yozing.',
                en: 'Four mixed questions. Write one line of justification for each answer.',
              },
              skills: ['sat-advanced'],
            },
          ],
        },
        {
          slug: 'sat-trigonometry-geometry',
          title: ['Trigonometriya va geometriya', 'Trigonometry and Geometry'],
              summary: [
            'Sinus, kosinus, tangens va uchburchaklar, aylanalar.',
            'Sine, cosine, tangent, triangles and circles.',
          ],
          objectives: [
            ['Uchburchakdagi burchaklarda trigonometrik nisbatlarni qo‘llash', 'Apply trigonometric ratios in triangles'],
            ['Aylana va ko‘pburchak formulalarini ishlatish', 'Use circle and polygon formulas'],
          ],
          storyAct: 3,
          storyTitle: ['Burchaklar cho‘qqisi', 'Angles Peak'],
          levelRange: '3-5',
          estMinutes: 60,
          xpReward: 50,
          skills: ['sat-advanced'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['To‘g‘ri uchburchakdagi nisbatlar', 'Ratios in a Right Triangle'],
              minMinutes: 14,
              content: {
                uz: 'Gipotenuza qarshi burchak uchun: sin A = qarshi/gipotenuza, cos A = yon/gipotenuza, tan A = qarshi/yon. Natija doim yopiq (0–1) bo‘lishi kerak — bu tez tekshirish usuli.',
                en: 'For the angle A: sin A = opposite/hypotenuse, cos A = adjacent/hypotenuse, tan A = opposite/adjacent. Results for sin and cos must lie between 0 and 1 — a quick sanity check.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Aylana va ko‘pburchak', 'Circles and Polygons'],
              minMinutes: 12,
              content: {
                uz: 'Muntazam n burchaklarning ichki burchaklari yig‘indisi (n−2)·180°. Aylana uchun: uzunlik 2πr, maydon πr². Silindrning umumiy yuzasi 2πr(r + h).',
                en: 'The interior angles of a regular n-gon sum to (n−2)·180°. For circles: circumference 2πr, area πr². Total surface area of a cylinder: 2πr(r + h).',
              },
            },
            {
              kind: 'DRILL',
              title: ['Geometriya drill', 'Geometry Drill'],
              minMinutes: 20,
              content: {
                uz: '6 ta masala: 3 ta trigonometrik nisbat, 2 ta aylana, 1 ta ko‘pburchak.',
                en: 'Six problems: three trigonometric ratios, two circle items, one polygon item.',
              },
              skills: ['sat-advanced'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 14,
              content: {
                uz: '5 ta aralash savol. Hisob-kitobni ham, javobni ham yozing.',
                en: 'Five mixed questions. Show both the calculation and the answer.',
              },
              skills: ['sat-advanced'],
            },
          ],
        },
        {
          slug: 'sat-data-analysis',
          title: ['Ma’lumotlar tahlili', 'Data Analysis'],
          summary: [
            'O‘rtacha, mediana, dispersiya, chastotalar va grafiklar.',
            'Mean, median, variance, frequency tables and graphs.',
          ],
          objectives: [
            ['Markaziy tendensiya va tarqalishni hisoblash', 'Compute measures of centre and spread'],
            ['Jadval va grafiklarni o‘qish', 'Read tables and graphs'],
          ],
          storyAct: 4,
          storyTitle: ['Raqamlar arxi', 'The Archive of Numbers'],
          levelRange: '0-4',
          estMinutes: 50,
          xpReward: 45,
          skills: ['sat-data'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['O‘rtacha va mediana', 'Mean vs Median'],
              minMinutes: 12,
              content: {
                uz: 'O‘rtacha — barcha qiymatlar yig‘indisi bo‘linma soniga. Mediana — tartiblangan ro‘yxatdagi o‘rta qiymat. Chiqindi qiymatlar bo‘lsa mediana o‘rtachadan ishonchliroq.',
                en: 'Mean = sum divided by count. Median = the middle value once ordered. With outliers, the median is more reliable than the mean.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Vaznli o‘rtacha va dispersiya', 'Weighted Mean and Spread'],
              minMinutes: 12,
              content: {
                uz: 'Vaznli o‘rtacha = Σ(qiymat × chastota) / Σ(chastota). Standart chetlanma o‘rtachadan qancha uzoqlikda qiymatlar tarqalganini ko‘rsatadi: barcha qiymat o‘rtachaga yaqin bo‘lsa, kichik bo‘ladi.',
                en: 'Weighted mean = Σ(value × frequency) / Σ(frequency). Standard deviation shows how spread values are around the mean: it is small when values cluster near the mean.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Jadvaldan o‘rtacha', 'Mean from a Table'],
              minMinutes: 10,
              content: {
                uz: 'Qiymatlar: 2 (3 marta), 4 (5 marta), 6 (2 marta). Vaznli yig‘indi = 2·3 + 4·5 + 6·2 = 6 + 20 + 12 = 38. Umumiy soni = 3 + 5 + 2 = 10. O‘rtacha = 38 / 10 = 3.8.',
                en: 'Values: 2 (×3), 4 (×5), 6 (×2). Weighted sum = 2·3 + 4·5 + 6·2 = 6 + 20 + 12 = 38. Total count = 3 + 5 + 2 = 10. Mean = 38 / 10 = 3.8.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Ma‘lumotlar drilli', 'Data Drill'],
              minMinutes: 16,
              content: {
                uz: '6 ta masala: o‘rtacha, mediana, vaznli o‘rtacha, standart chetlanma ta’rifi, chastota jadvali.',
                en: 'Six problems: mean, median, weighted mean, standard deviation definition, frequency tables.',
              },
              skills: ['sat-data'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 12,
              content: {
                uz: '6 ta aralash savol. Har bir javobda usulni bir so‘z bilan yozing.',
                en: 'Six mixed questions. Write one word naming the method used.',
              },
              skills: ['sat-data'],
            },
          ],
        },
      ],
    },
    {
      slug: 'sat-rw',
      title: ['SAT O‘qish va Yozish', 'SAT Reading & Writing'],
      description: ['Matn tahlili, grammatika, inshoot va lug‘at.', 'Text analysis, grammar, rhetoric and vocabulary.'],
      levelRange: '0-5',
      lessons: [
        {
          slug: 'sat-reading-main-idea',
          title: ['Asosiy fikr va tuzilma', 'Main Idea and Structure'],
          summary: ['Matn markaziy g‘oyasini va qismlarini ajratish.', 'Separating a text’s central claim from its parts.'],
          objectives: [
            ['Markaziy g‘oyani topish', 'Identify the central claim'],
            ['Insho tuzilmasini aniqlash', 'Identify rhetorical structure'],
          ],
          storyAct: 1,
          storyTitle: ['Matn ichidagi xarita', 'Maps Inside the Text'],
          levelRange: '0-2',
          estMinutes: 45,
          xpReward: 40,
          skills: ['sat-reading'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Markaziy fikr vs batafsil qismlar', 'Central Claim vs Details'],
              minMinutes: 12,
              content: {
                uz: 'Markaziy fikr barcha qismlarni qamrab oladi, lekin hech bir qism uning o‘rnini bosmaydi. Tekshirish usuli: har bir qism markaziy fikrga mos keladimi? Kelmasa, siz qismni markaziy fikr deb xato qabul qilgansiz.',
                en: 'The central claim covers all parts, but no single part replaces it. Test: does each paragraph fit the claim? If not, you have mistaken a detail for the main idea.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Insho tuzilmalari', 'Rhetorical Structures'],
              minMinutes: 12,
              content: {
                uz: 'Eng ko‘p uchraydigan tuzilmalar: qarama-qarshi (butun → qarshi → butun), sabab-natija (tasdiq + dalil), vaqt o‘tishi (dastlab → keyin → natija), taqqoslash.',
                en: 'Common structures: counterclaim (claim → rebuttal → claim), cause and effect (assertion + evidence), timeline (first → then → result), and comparison.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Matn tahlil drill', 'Text Analysis Drill'],
              minMinutes: 14,
              content: {
                uz: '3 ta qisqa matn o‘qing va har biri uchun markaziy fikrni hamda tuzilmani yozing.',
                en: 'Read three short passages; write the central claim and structure for each.',
              },
              skills: ['sat-reading'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 9,
              content: {
                uz: '6 ta savol. Har biriga qisqa javob (1–2 jumla) bering.',
                en: 'Six questions. Answer each in one or two sentences.',
              },
              skills: ['sat-reading'],
            },
          ],
        },
        {
          slug: 'sat-grammar',
          title: ['Grammatika va inshoot', 'Grammar and Rhetoric'],
          summary: ['Tuzilma, zamon va o‘zaro bog‘lanish.', 'Structure, tense and cohesion.'],
          objectives: [
            ['To‘g‘ri grammatik qurilmani tanlash', 'Choose the correct grammatical construction'],
            ['Insho o‘tishini tuzatish', 'Repair transitions between ideas'],
          ],
          storyAct: 2,
          storyTitle: ['Tuzilma vaqt jadvali', 'The Timeline of Syntax'],
          levelRange: '0-3',
          estMinutes: 50,
          xpReward: 40,
          skills: ['sat-writing'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Zamon mosligi', 'Tense Consistency'],
              minMinutes: 12,
              content: {
                uz: 'Matn vaqt o‘lchoviga qarab bitta zamonni talab qiladi. "By 2020 the city had built…" — o‘tgan zamon emas, oldingi zamon. "Since 2015 the city has built…" — hozirga bog‘liq natija.',
                en: 'A passage requires one tense tied to its time reference. “By 2020 the city had built…” is past perfect; “Since 2015 the city has built…” is present perfect.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Insho o‘tishi', 'Transitions Between Ideas'],
              minMinutes: 12,
              content: {
                uz: 'Bog‘lanish so‘zi gapni emas, mantiqiy aloqani bildiradi. "However" qarshi, "therefore" natija, "for example" misol, "nevertheless" kutilmagan natija.',
                en: 'A transition signals a logical relation, not just adjacency. “However” = contrast, “therefore” = result, “for example” = instance, “nevertheless” = unexpected result.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Grammatika drill', 'Grammar Drill'],
              minMinutes: 16,
              content: {
                uz: '8 ta grammatik savol va 4 ta bog‘lanish tanlash.',
                en: 'Eight grammar questions and four transition choices.',
              },
              skills: ['sat-writing'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 12,
              content: {
                uz: '8 ta aralash savol.',
                en: 'Eight mixed questions.',
              },
              skills: ['sat-writing'],
            },
          ],
        },
        {
          slug: 'sat-vocab-context',
          title: ['Lug‘at va kontekst', 'Vocabulary in Context'],
          summary: ['So‘z ma’nosini kontekstdan aniqlash.', 'Inferring word meaning from context.'],
          objectives: [
            ['Kontekstdan ma’no aniqlash', 'Infer meaning from context'],
            ['Eng aniq javob variantini tanlash', 'Select the most precise option'],
          ],
          storyAct: 3,
          storyTitle: ['So‘z minorasi', 'The Word Mine'],
          levelRange: '0-4',
          estMinutes: 45,
          xpReward: 40,
          skills: ['sat-vocab'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Kontekst signal so‘zlari', 'Context Signals'],
              minMinutes: 12,
              content: {
                uz: '"og‘ib boradi" (diminish), "tartibsiz" (turbulent), "natijada" (as a result), "bunday holda" (given that). Bu so‘zlar atrofidagi izohlarga qarang — ular ma’noning yo‘nalishini ko‘rsatadi.',
                en: '“Wane” (diminish), “turbulent” (chaotic), “as a result” (conclusion), “given that” (condition). Read the surrounding glosses — they point to the meaning.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Aniq tanlov', 'Choosing Precisely'],
              minMinutes: 12,
              content: {
                uz: 'Variantlar orasida eng aniq (precise) javobni tanlang. "Odatda" va "har doim" farq qiladi; "ba’zi" va "barcha" ham. imtihon bu farqlarni tekshiradi.',
                en: 'Choose the most precise option. “Usually” differs from “always”; “some” differs from “all”. The exam tests exactly these distinctions.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Lug‘at drill', 'Vocabulary Drill'],
              minMinutes: 16,
              content: {
                uz: '10 ta kontekstli lug‘at savoli.',
                en: 'Ten context-based vocabulary questions.',
              },
              skills: ['sat-vocab'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 11,
              content: {
                uz: '8 ta aralash lug‘at savoli.',
                en: 'Eight mixed vocabulary questions.',
              },
              skills: ['sat-vocab'],
            },
          ],
        },
      ],
    },
  ],
};