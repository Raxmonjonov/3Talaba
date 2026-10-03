import type { SeedCourse } from '../../types';

/** Matematika kursi: 5 dars. */
export const MATHEMATICS_COURSE: SeedCourse = {
  slug: 'mathematics',
  subject: 'MATHEMATICS',
  title: ['Matematika', 'Mathematics'],
  description: [
    'Arifmetikadan boshlab, algebra, geometriya va matnli masalalar.',
    'From arithmetic through algebra, geometry and word problems.',
  ],
  modules: [
    {
      slug: 'math-foundations',
      title: ['Matematika asoslari', 'Mathematical Foundations'],
      description: ['Arifmetika va algebra.', 'Arithmetic and algebra.'],
      levelRange: '0-4',
      lessons: [
        {
          slug: 'math-arithmetic-fractions',
          title: ['Kasrlar, foizlar va nisbatlar', 'Fractions, Percentages and Ratios'],
          summary: ['Kasrlarni soddalashtirish, foiz o‘sish va nisbat.', 'Simplifying fractions, percentage change and ratios.'],
          objectives: [
            ['Kasrlarni soddalashtirish va taqqoslash', 'Simplify and compare fractions'],
            ['Foizli o‘zgarishni hisoblash', 'Compute percentage change'],
          ],
          storyAct: 1,
          storyTitle: ['Foiz minorasi', 'The Percentage Mine'],
          levelRange: '0-2',
          estMinutes: 45,
          xpReward: 35,
          skills: ['math-arithmetic'],
          blocks: [
            {
              kind: 'STORY',
              title: ['Foiz minorasi', 'The Percentage Mine'],
              minMinutes: 5,
              content: {
                uz: 'Narxlar har kuni o‘zgaradi. Siz noto‘g‘ri hisoblagan narsa uchun narxni to‘lashingiz kerak.',
                en: 'Prices change daily. You will pay for any figure you miscalculate.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Foizli o‘zgarish', 'Percentage Change'],
              minMinutes: 12,
              content: {
                uz: 'foiz = (o‘zgarish / asl qiymat) × 100. 12 000 so‘mga 20% chegirma = 12 000 × 0.8 = 9 600. Keyin 25% oshirilsa, 9 600 × 1.25 = 12 000. Ketma-ket o‘zgarishlar asl qiymatga qaytaradi — bu tasodif emas, matematik natija.',
                en: 'percentage = (change / original) × 100. A 20% discount on 12 000 is 12 000 × 0.8 = 9 600. Increasing that by 25% gives 9 600 × 1.25 = 12 000. Chained changes can return to the original — that is a mathematical consequence, not a coincidence.',
              },
            },
            {
              kind: 'EXAMPLE',
              title: ['Kasrlarni taqqoslash', 'Comparing Fractions'],
              minMinutes: 10,
              content: {
                uz: '7/12 ≈ 0.583, 5/8 = 0.625, 3/5 = 0.6, 4/7 ≈ 0.571. Eng kattasi 5/8. Usul: umumiy zaminaga keltiring yoki 100ga ko‘paytiring.',
                en: '7/12 ≈ 0.583, 5/8 = 0.625, 3/5 = 0.6, 4/7 ≈ 0.571. The largest is 5/8. Method: convert to a common denominator or to percentages.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Kasr va foiz drill', 'Fraction & Percentage Drill'],
              minMinutes: 14,
              content: {
                uz: '10 ta kasr, foiz va nisbat masalasi.',
                en: 'Ten fraction, percentage and ratio problems.',
              },
              skills: ['math-arithmetic'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 10,
              content: {
                uz: '8 ta aralash arifmetik savoli.',
                en: 'Eight mixed arithmetic questions.',
              },
              skills: ['math-arithmetic'],
            },
          ],
        },
        {
          slug: 'math-algebra-core',
          title: ['Algebra yadrosi', 'The Core of Algebra'],
          summary: ['Tenglamalar, tizimlar va chiziqli funksiyalar.', 'Equations, systems and linear functions.'],
          objectives: [
            ['Bir va ikki noma’lumli tenglamalarni yechish', 'Solve one- and two-variable equations'],
            ['Chiziqli funksiyaning qiyaligini topish', 'Find the slope of a linear function'],
          ],
          storyAct: 2,
          storyTitle: ['Ikki nuqtadagi chiziq', 'The Line Through Two Points'],
          levelRange: '0-3',
          estMinutes: 55,
          xpReward: 45,
          skills: ['math-algebra'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Ikki nuqtadan chiziq', 'A Line Through Two Points'],
              minMinutes: 14,
              content: {
                uz: 'A(2,5) va B(6,13) nuqtalaridan o‘tgan chiziq uchun m = (13−5)/(6−2) = 2. Y-intercept: 5 = 2·2 + b → b = 1. Chiziq: y = 2x + 1. Umumiy formula: m = (y₂−y₁)/(x₂−x₁).',
                en: 'For the line through A(2,5) and B(6,13): m = (13−5)/(6−2) = 2. The y-intercept: 5 = 2·2 + b → b = 1. So y = 2x + 1. General formula: m = (y₂−y₁)/(x₂−x₁).',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Tizimlar va almashtirish', 'Systems and Substitution'],
              minMinutes: 12,
              content: {
                uz: 'Ikki tenglama, ikki noma’lum bo‘lganda bittasini boshqasining ustiga qo‘ying. 2x + 3y = 12 va x = y + 1 bo‘lsa, 2(y+1) + 3y = 12 → 5y = 10 → y = 2, x = 3. Javob (3, 2).',
                en: 'With two equations and two unknowns, substitute. If 2x + 3y = 12 and x = y + 1, then 2(y+1) + 3y = 12 → 5y = 10 → y = 2, x = 3. Answer (3, 2).',
              },
            },
            {
              kind: 'DRILL',
              title: ['Algebra drilli', 'Algebra Drill'],
              minMinutes: 16,
              content: {
                uz: '8 ta masala: 3 ta tenglama, 2 ta tizim, 2 ta funksiya, 1 ta tengsizlik.',
                en: 'Eight problems: three equations, two systems, two functions, one inequality.',
              },
              skills: ['math-algebra'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 13,
              content: {
                uz: '8 ta aralash algebra savoli.',
                en: 'Eight mixed algebra questions.',
              },
              skills: ['math-algebra'],
            },
          ],
        },
        {
          slug: 'math-geometry-core',
          title: ['Geometriya', 'Geometry'],
          summary: ['Yuzalar, hajmlar, uchburchaklar va aylanalar.', 'Areas, volumes, triangles and circles.'],
          objectives: [
            ['Asosiy shakllarning yuzasi va hajmini hisoblash', 'Compute areas and volumes of standard shapes'],
            ['Pifagor teoremasi va trigonometrik nisbatlar', 'Apply Pythagoras and trigonometric ratios'],
          ],
          storyAct: 3,
          storyTitle: ['Geometriya sarzoni', 'The Geometry Vault'],
          levelRange: '0-3',
          estMinutes: 55,
          xpReward: 45,
          skills: ['math-geometry'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Yuzalar va hajmlar jadvali', 'Areas and Volumes Table'],
              minMinutes: 14,
              content: {
                uz: 'To‘g‘ri to‘rtburchak: S = ab. Doira: S = πr², L = 2πr. Uchburchak: S = ½bh. Trapetsiya: S = ½(a+b)h. Kub: V = a³. Silindr: V = πr²h, S_umumiy = 2πr(r+h). Bu jadvalni yodlash kerak.',
                en: 'Rectangle: S = ab. Circle: S = πr², L = 2πr. Triangle: S = ½bh. Trapezium: S = ½(a+b)h. Cube: V = a³. Cylinder: V = πr²h, total surface = 2πr(r+h). Memorise this table.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Pifagor teoremasi', 'Pythagoras'],
              minMinutes: 12,
              content: {
                uz: 'To‘g‘ri uchburchakda a² + b² = c². O‘qlar 6 va 8 bo‘lsa, c = √(36+64) = 10. Tekshirish: eng uzun tomon kvadrati boshqalar yig‘indisiga teng.',
                en: 'In a right triangle a² + b² = c². With legs 6 and 8, c = √(36+64) = 10. Check: the square of the longest side equals the sum of the others.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Geometriya drill', 'Geometry Drill'],
              minMinutes: 16,
              content: {
                uz: '8 ta masala: yuzalar, hajmlar, uchburchaklar, aylanalar.',
                en: 'Eight problems: areas, volumes, triangles, circles.',
              },
              skills: ['math-geometry'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 13,
              content: {
                uz: '8 ta aralash geometriya savoli.',
                en: 'Eight mixed geometry questions.',
              },
              skills: ['math-geometry'],
            },
          ],
        },
        {
          slug: 'math-probability-core',
          title: ['Ehtimollik va statistika', 'Probability and Statistics'],
          summary: ['Ehtimollik qoidalari, kombinatorika va markaziy tendensiya.', 'Probability rules, combinatorics and measures of centre.'],
          objectives: [
            ['Ehtimollik qo‘shish va ko‘paytirish qoidalari', 'Apply the addition and multiplication rules'],
            ['O‘rtacha, mediana va chastotalarni hisoblash', 'Compute mean, median and frequencies'],
          ],
          storyAct: 4,
          storyTitle: ['Ehtimollik to‘r', 'The Probability Net'],
          levelRange: '1-4',
          estMinutes: 55,
          xpReward: 45,
          skills: ['math-probability'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Qo‘shish va ko‘paytirish', 'Addition and Multiplication Rules'],
              minMinutes: 14,
              content: {
                uz: 'Disjunktiv hodisa uchun P(A ∪ B) = P(A) + P(B) − P(A ∩ B). Mustaqil hodisa uchun P(A ∩ B) = P(A)·P(B). Ikki teng ehtimollikli tanga tushsa, P(ikkalasi ham yozuv) = 1/2 · 1/2 = 1/4.',
                en: 'For disjoint events P(A ∪ B) = P(A) + P(B) − P(A ∩ B). For independent events P(A ∩ B) = P(A)·P(B). With two fair coins, P(both heads) = 1/2 · 1/2 = 1/4.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Markaziy tendensiya tanlovi', 'Choosing a Measure of Centre'],
              minMinutes: 12,
              content: {
                uz: 'Simmetrik taqsimotda o‘rtacha va mediana teng. Chiqindi bo‘lsa, mediana to‘g‘riroq. Og‘irlikli o‘rtacha = Σ(qiymat × chastota) / Σ chastota — jadval shaklidagi ma’lumot uchun.',
                en: 'For symmetric distributions the mean equals the median. With outliers, the median is safer. The weighted mean = Σ(value × frequency) / Σ frequency is the right tool for tabular data.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Ehtimollik drill', 'Probability Drill'],
              minMinutes: 16,
              content: {
                uz: '8 ta masala: ehtimollik, kombinatorika, o‘rtacha, mediana.',
                en: 'Eight problems: probability, combinatorics, mean, median.',
              },
              skills: ['math-probability'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 13,
              content: {
                uz: '8 ta aralash statistika savoli.',
                en: 'Eight mixed statistics questions.',
              },
              skills: ['math-probability'],
            },
          ],
        },
        {
          slug: 'math-word-problems',
          title: ['Matnli masalalar', 'Word Problems'],
          summary: ['Shartni o‘qish, model tuzish va javobni tekshirish.', 'Reading the setup, building a model and checking the answer.'],
          objectives: [
            ['Shartdan tenglamani tuzish', 'Translate a setup into an equation'],
            ['Javobning mantiqini tekshirish', 'Sanity-check the answer'],
          ],
          storyAct: 5,
          storyTitle: ['Shart sahifasi', 'The Page of Setups'],
          levelRange: '0-4',
          estMinutes: 50,
          xpReward: 40,
          skills: ['math-word-problems'],
          blocks: [
            {
              kind: 'EXPLAIN',
              title: ['Tenglamani qurish', 'Building the Equation'],
              minMinutes: 14,
              content: {
                uz: 'Ish o‘zgaruvchisini tanlang va nima berilganini yozing. Masalan: ish 12 kunda bajariladi, ikkinchisi bilan 4 kunda → 1/12 + 1/t = 1/4 → 1/t = 1/6 → t = 6. Boshlang‘ich vaqtdan boshlash tez usul.',
                en: 'Choose the work variable and list what is given. A job takes 12 days alone, 4 days together: 1/12 + 1/t = 1/4 → 1/t = 1/6 → t = 6. Starting from the time units is the fast route.',
              },
            },
            {
              kind: 'EXPLAIN',
              title: ['Javobni tekshirish', 'Sanity-Checking'],
              minMinutes: 12,
              content: {
                uz: 'Javobni mantiqiy tekshiring: tezlik 80 km/h bo‘lsa, 240 km 3 soatda — to‘g‘ri. Tekshiruv yarim vaqtni yoki oraliq bosqichni qayta hisoblab bajariladi.',
                en: 'Check plausibility: a speed of 80 km/h over 240 km in 3 hours is correct. Verification means recomputing half the values or an intermediate step.',
              },
            },
            {
              kind: 'DRILL',
              title: ['Matnli masala drill', 'Word Problem Drill'],
              minMinutes: 14,
              content: {
                uz: '6 ta matnli masala: har birida tenglamani yozib, javobni tekshiring.',
                en: 'Six word problems: write the equation for each and verify the answer.',
              },
              skills: ['math-word-problems'],
            },
            {
              kind: 'QUIZ',
              title: ['Tekshiruv', 'Check'],
              minMinutes: 10,
              content: {
                uz: '6 ta aralash matnli masala.',
                en: 'Six mixed word problems.',
              },
              skills: ['math-word-problems'],
            },
          ],
        },
      ],
    },
  ],
};