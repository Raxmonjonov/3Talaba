export type Subject = "math" | "algebra" | "geometry" | "english" | "vocabulary" | "physics" | "general";

export interface LessonStep {
  /** What the tutor is currently trying to teach. */
  concept: string;
  /** Plain-language explanation. Deliberately short. */
  explain: string;
  /** A concrete example, in Uzbek. */
  example: string;
  /** The one question the student must answer to move forward. */
  ask: string;
  /** Accepted answers that mean "correct". */
  accept: string[];
  /** Hints shown when the student struggles. */
  hint: string;
  /** Follow-up offered after a correct answer. */
  deepen: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: Subject;
  /** Minimum level required before this lesson is offered. */
  fromLevel: number;
  /** Detects if the student's message is about this lesson. */
  keywords: string[];
  steps: LessonStep[];
}

export const LESSONS: Lesson[] = [
  {
    id: "math-zero-numbers",
    title: "Sonlar va arifmetika",
    subject: "math",
    fromLevel: 0,
    keywords: ["math", "matematika", "son", "raqam", "qo'shish", "ayirish", "ko'paytirish", "bo'lish", "noldan"],
    steps: [
      {
        concept: "Tabiiy sonlar",
        explain: "Tabiiy sonlar — bu sanash uchun ishlatiladigan sonlar: 1, 2, 3, 4, 5 …",
        example: "Misol: 3 + 2 = 5. Uchga ikki qo'shdi, besh bo'ldi.",
        ask: "5 + 4 nechaga teng?",
        accept: ["9", "9."],
        hint: "5 ga 4 qo'sh, o'ngdan birlikni qo'sh: 5+4=9.",
        deepen: "Zo'r. Endi ayirishni ko'ramiz: 9 - 4 nechaga teng?",
      },
      {
        concept: "Ko'paytirish",
        explain: "Ko'paytirish — takrorlan qo'shishning qisqasi.",
        example: "Misol: 4 + 4 + 4 = 12, demak 4 x 3 = 12.",
        ask: "6 x 4 nechaga teng?",
        accept: ["24", "24."],
        hint: "6 ni 4 marta qo'sh: 6+6+6+6=24.",
        deepen: "Ajoyib. Endi bo'lish: 24 / 6 nechaga teng?",
      },
      {
        concept: "Bo'lish",
        explain: "Bo'lish — ko'paytirishning teskarisi.",
        example: "Misol: 24 / 6 = 4, chunki 6 x 4 = 24.",
        ask: "18 / 3 nechaga teng?",
        accept: ["6", "6."],
        hint: "3 qancha marta 18 ichiga sig'adi? 3+3+3+3+3+3=18, ya'ni 6 marta.",
        deepen: "Yaxshi. Endi 10 dan 30 gacha sonlarni yodlab ko'ramiz.",
      },
      {
        concept: "Qoldiq",
        explain: "Bo'lganda qoldiq qolsa, uni 'qoldiq' deymiz.",
        example: "Misol: 17 / 5 = 3 qoldiq 2. Sababi: 5x3=15, 17-15=2.",
        ask: "20 / 6 bo'lsa, qoldiq necha?",
        accept: ["2", "2."],
        hint: "6 x 3 = 18. 20 - 18 = necha?",
        deepen: "Yaxshi. Matematika asoslari joyida turibdi.",
      },
    ],
  },
  {
    id: "math-algebra-basics",
    title: "Algebra — ifoda va tenglamalar",
    subject: "algebra",
    fromLevel: 2,
    keywords: ["algebra", "tenglam", "x", "ifoda", "kvadrat", "daraja"],
    steps: [
      {
        concept: "Noma'lum son",
        explain: "Noma'lum sonni har doim x bilan belgilaymiz.",
        example: "Misol: 'yashirgan son 5 qo'shilgan, natija 12' -> x + 5 = 12.",
        ask: "x + 5 = 12 bo'lsa, x nechaga teng?",
        accept: ["7", "7."],
        hint: "Ikkala tomondan 5 ni ayir: x = 12 - 5.",
        deepen: "To'g'ri. Endi ko'paytirishli tenglama: 3x = 21, x necha?",
      },
      {
        concept: "Ko'paytirilgan tenglama",
        explain: "Ikki tomon bir xil songa bo'linadi, tenglik saqlanadi.",
        example: "Misol: 3x = 21 -> x = 21 / 3 = 7.",
        ask: "5x = 40 bo'lsa, x nechaga teng?",
        accept: ["8", "8."],
        hint: "x = 40 / 5.",
        deepen: "Yaxshi. Endi kvadrat ildizi: x^2 = 49, x nechaga teng?",
      },
      {
        concept: "Kvadrat ildizi",
        explain: "x^2 = 49 ni x = 7 yoki x = -7 deb yechish mumkin.",
        example: "Misol: 7^2 = 49 va (-7)^2 = 49.",
        ask: "x^2 = 81 bo'lsa, x ning qiymatlari nima?",
        accept: ["9", "9 va -9", "9, -9", "9 -9"],
        hint: "9^2 = 81, lekin (-9)^2 ham 81 bo'ladi.",
        deepen: "Ajoyib. Algebra mustahkam.",
      },
    ],
  },
  {
    id: "math-geometry",
    title: "Geometriya — shakllar",
    subject: "geometry",
    fromLevel: 3,
    keywords: ["geometriya", "uchburchak", "doira", "kvadrat", "perimetr", "yuzasi", "burchak", "fi"],
    steps: [
      {
        concept: "Uchburchak burchaklari",
        explain: "Uchburchakning ichki burchaklari yig'indisi 180°.",
        example: "Misol: 60° + 70° + 50° = 180°.",
        ask: "Ikki burchagi 50° va 60° bo'lsa, uchinchisi necha?",
        accept: ["70", "70°", "70 gradus"],
        hint: "180 - 50 - 60 = ?",
        deepen: "To'g'ri. Endi perimetr: kvadrat tomoni 6, perimetri necha?",
      },
      {
        concept: "Perimetr va yuzasi",
        explain: "Perimetr — barcha tomlar yig'indisi. Yuzasi — ichki maydon.",
        example: "Misol: kvadrat tomoni 6 -> P = 24, S = 36.",
        ask: "Tomoni 9 bo'lgan kvadratning yuzasi necha?",
        accept: ["81", "81."],
        hint: "9 x 9 = ?",
        deepen: "Zo'r. Endi doira formulasi: S = pi x r^2.",
      },
    ],
  },
  {
    id: "english-grammar",
    title: "Ingliz tili grammatikasi",
    subject: "english",
    fromLevel: 1,
    keywords: ["ingliz", "english", "grammar", "grammatika", "present", "past", "tense", "article", "to", "inglizcha"],
    steps: [
      {
        concept: "Present Simple",
        explain: "Present Simple — odatdagi harakat yoki umumiy haqiqat uchun.",
        example: "Misol: I drink tea every day. / Water boils at 100°C.",
        ask: "'She ___ to school every day' — bo'sh joyga to'g'ri so'zni yozing.",
        accept: ["goes", "goes.", "go '"],
        hint: "U she → goes (3-shaxs -s qo'shiladi).",
        deepen: "Zo'r. Endi Present Continuous: 'I ___ a letter now.'",
      },
      {
        concept: "Present Continuous",
        explain: "Hozir, ayni paytda bo'layotgan harakat uchun.",
        example: "Misol: I am writing a letter right now.",
        ask: "'They ___ football at the moment' — bo'sh joyni to'ldiring.",
        accept: ["are playing", "are playing.", "play"],
        hint: "they → are + verb-ing",
        deepen: "Yaxshi. Endi Past Simple: 'I ___ to Rome last year.'",
      },
      {
        concept: "Past Simple",
        explain: "Past Simple — o'tgan zamonda tugallangan harakat.",
        example: "Misol: I visited Rome last year.",
        ask: "'He ___ to school yesterday' — to'g'ri javobni yozing.",
        accept: ["went", "went."],
        hint: "go ning o'tgan zamondagi shakli 'went'.",
        deepen: "Ajoyib. Inglizcha ishonchli qatlamaga ko'tarildi.",
      },
    ],
  },
  {
    id: "ielts-writing",
    title: "IELTS Writing — Task 2 tahlil",
    subject: "english",
    fromLevel: 5,
    keywords: ["ielts", "writing", "task 2", "essay", "essay", "band", "insight"],
    steps: [
      {
        concept: "Tahliliy tuzilma",
        explain: "IELTS Task 2 da to'rt qismli tuzilma ishlatiladi: Introduction, Body 1, Body 2, Conclusion.",
        example: "Misol: 'Discuss both views and give your opinion.' -> ikkala qarashni ham ko'rsating, keyin o'zingiznikini ayting.",
        ask: "Task 2 da kirish qismi odatda necha gapdan iborat bo'ladi?",
        accept: ["2", "2 gap", "ikki", "2 sentences", "2 ta gap"],
        hint: "Kirish qismi qisqa bo'ladi — 2 gap yetarli.",
        deepen: "To'g'ri. Endi asosiy fikr (thesis) qismini yozamiz.",
      },
      {
        concept: "Thesis statement",
        explain: "Thesis — sizning asosiy pozitsiyangiz, bir jumlada aniq.",
        example: "Misol: 'While technology improves learning, it cannot replace the motivation a student builds alone.'",
        ask: "O'zingizning yagona jumlalik xulosangizni yozing (masalan, onlayn ta'lim).",
        accept: ["*"],
        hint: "Masalan: 'Onlayn ta'lim qulay, lekin o'z-o'zidan motivatsiya bermaydi.'",
        deepen: "Yaxshi. Endi ikki xulosa — counter-argument va ruhan.",
      },
    ],
  },
  {
    id: "sat-math",
    title: "SAT Math — strategik yechish",
    subject: "math",
    fromLevel: 6,
    keywords: ["sat", "sat math", "data analysis", "advanced", "strategiya", "kalit"],
    steps: [
      {
        concept: "Kalit javob",
        explain: "SAT da ko'pincha to'liq yechim shart emas — boshlang'ich qiymatni sinab ko'rish yetarli.",
        example: "Misol: x^2 - 5x + 6 = 0 uchun x=1 ni sinab ko'ring: 1-5+6=2. x=2: 4-10+6=0. Demak x=2.",
        ask: "x^2 - 7x + 12 = 0 da x ni kichik qiymatdan sinab ko'ring. x=3chiqadimi?",
        accept: ["ha", "ha, 3", "yo'q", "yoq", "yo‘q", "3 chiqadi", "3 chiqadi, 9-21+12=0"],
        hint: "3^2 - 7x3 + 12 = 9 - 21 + 12 = 0. Chiqadi!",
        deepen: "To'g'ri, x=3 va x=4. Endi Data Analysis — o'rtacha qiymat.",
      },
      {
        concept: "O'rtacha va median",
        explain: "O'rtacha — barcha qiymatlar yig'indisi bo'linmasi. Mediya — o'rtadagi qiymat.",
        example: "Misol: 2, 4, 6, 8, 10 -> o'rtacha 6, mediya 6.",
        ask: "3, 5, 5, 9, 14 sonlarining o'rtachasini toping.",
        accept: ["7", "7."],
        hint: "Yig'indisi: 3+5+5+9+14 = 36. 36 / 5 = ?",
        deepen: "Zo'r. Endi imtihon vaqtini boshqarish.",
      },
    ],
  },
];

/**
 * A short diagnostic used for level placement.
 *
 * Questions MUST stay ordered from easiest to hardest. Scoring relies on that
 * order: a student earns the level of the last question in their unbroken
 * correct streak, so a lucky correct answer on a hard question cannot outrank
 * a genuine gap in the fundamentals.
 */
export interface PlacementQuestion {
  id: string;
  level: number;
  question: string;
  options: string[];
  correct: number;
  explain: string;
}

export const PLACEMENT: PlacementQuestion[] = [
  {
    id: "p1",
    level: 0,
    question: "3 + 5 nechaga teng?",
    options: ["6", "8", "9", "10"],
    correct: 1,
    explain: "3 + 5 = 8. Bu — boshlang'ich daraja.",
  },
  {
    id: "p2",
    level: 1,
    question: "72 / 9 nechaga teng?",
    options: ["6", "7", "8", "9"],
    correct: 2,
    explain: "72 / 9 = 8. Bo'lish darajasi.",
  },
  {
    id: "p3",
    level: 2,
    question: "x + 7 = 15 bo'lsa, x nechaga teng?",
    options: ["6", "7", "8", "22"],
    correct: 2,
    explain: "x = 15 - 7 = 8. Oddiy tenglamalar.",
  },
  {
    id: "p4",
    level: 3,
    question: "Qaysi javob to'g'ri: 'She ___ to school every day'?",
    options: ["go", "goes", "going", "gone"],
    correct: 1,
    explain: "Uchchinchi shaxs uchun -s qo'shiladi: she goes.",
  },
  {
    id: "p5",
    level: 4,
    question: "2x + 3 = 11. x nechaga teng?",
    options: ["4", "5", "7", "14"],
    correct: 0,
    explain: "2x = 8, x = 4. Ko'paytirilgan tenglamalar.",
  },
  {
    id: "p6",
    level: 5,
    question: "Uchburchakning burchaklari 50° va 60°. Uchinchi burchak?",
    options: ["60°", "70°", "80°", "110°"],
    correct: 1,
    explain: "180 - 50 - 60 = 70°. Geometriya asoslari.",
  },
  {
    id: "p7",
    level: 6,
    question: "3, 5, 5, 9, 14 — o'rtacha qiymat qancha?",
    options: ["6", "7", "8", "9"],
    correct: 1,
    explain: "36 / 5 = 7. Data Analysis darajasi.",
  },
  {
    id: "p8",
    level: 7,
    question: "IELTS Writing Task 2 da qaysi qism eng qisqa bo'lishi kerak?",
    options: ["Kirish (Introduction)", "Asosiy qismlar", "Xulosa", "Barchasi teng"],
    correct: 0,
    explain: "Kirish qismi qisqa — taxminan 2 gap.",
  },
  {
    id: "p9",
    level: 8,
    question: "x^2 - 7x + 12 = 0 — x ning qiymatlari?",
    options: ["2 va 6", "3 va 4", "1 va 12", "6 va 7"],
    correct: 1,
    explain: "(x-3)(x-4) = 0 -> x = 3, 4. Advanced Math.",
  },
  {
    id: "p10",
    level: 9,
    question: "SAT Data Analysis: f(x) = 2x - 3. f(5) nechaga teng?",
    options: ["5", "6", "7", "13"],
    correct: 2,
    explain: "2 x 5 - 3 = 7. Funktsional qiymat.",
  },
  {
    id: "p11",
    level: 10,
    question: "x^2 - 5x + 6 = 0 ning ildizlar yig'indisi?",
    options: ["5", "6", "11", "-5"],
    correct: 0,
    explain: "Viyetaga: ildizlar yig'indisi = 5. Chuqur algebra.",
  },
];

export function scorePlacement(answers: Record<string, number>) {
  let earned = 0;
  let possible = 0;

  // Walk from easiest to hardest while answers stay correct. The last
  // question in this unbroken streak sets the level.
  let streakLevel = 0;
  for (const q of PLACEMENT) {
    if (answers[q.id] === undefined) continue;
    possible += 1;

    if (answers[q.id] === q.correct) {
      earned += 1;
      streakLevel = q.level;
    } else {
      break;
    }
  }

  // Missing later questions are not penalised — the streak already stops at
  // the first gap, which is the honest signal.
  const level = Math.max(0, Math.min(10, streakLevel));

  return {
    earned,
    possible,
    level,
    detail: PLACEMENT.filter((q) => answers[q.id] !== undefined).map((q) => ({
      id: q.id,
      correct: answers[q.id] === q.correct,
      chosen: answers[q.id],
      explain: q.explain,
    })),
  };
}