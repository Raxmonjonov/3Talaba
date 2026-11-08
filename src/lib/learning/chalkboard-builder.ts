import type { MathModuleLesson } from "@/lib/curriculum/math-modules-data";
import type { LearningPaceMode } from "@/lib/learning/easy-adaptation";

export interface ChalkboardZoneContent {
  heading?: string;
  paragraphs: string[];
  bullets: string[];
}

export interface ChalkboardSlideData {
  id: string;
  subjectBadge: string;
  /** Doskaning chap-yuqori qismida "mavzu :<topicTitle>" ko'rinishida chiqadi */
  topicTitle: string;
  /** Yuqori markaziy bo'r formulalari (masalan: f(x) = mx + b) */
  formulas: string[];
  /** Chap-o'rta asosiy tushuncha va ko'rsatkichlar */
  leftConcept: ChalkboardZoneContent;
  /** O'ng-o'rta oltin qoida / imtihon siri */
  rightGoldenRule: ChalkboardZoneContent;
  /** Pastki-markaziy kursiv muhim xossalar / eslatma */
  bottomSpecialRule: ChalkboardZoneContent;
  /** Har bir bosqichda (1..4) AI Ustoz og'zaki va subtitrda aytadigan jonli nutqi */
  teacherNarration: Record<LearningPaceMode, [string, string, string, string]>;
}

/**
 * LaTeX ifodalarni doskada o'qishga qulay bo'r yozuviga aylantiradi
 * (masalan: \frac{y_2 - y_1}{x_2 - x_1} -> (y2 - y1) / (x2 - x1))
 */
export function cleanChalkText(raw: string): string {
  return raw
    .replace(/\$\$(.*?)\$\$/g, "$1")
    .replace(/\$(.*?)\$/g, "$1")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1) / ($2)")
    .replace(/_\{([^}]+)\}/g, "$1")
    .replace(/_([0-9a-zA-Z])/g, "$1")
    .replace(/\^\\circ/g, "^°")
    .replace(/\\circ/g, "°")
    .replace(/\\cdot/g, " · ")
    .replace(/\\neq/g, " ≠ ")
    .replace(/\\leq/g, " ≤ ")
    .replace(/\\geq/g, " ≥ ")
    .replace(/\\pm/g, " ± ")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\,/g, " ")
    .replace(/\\%/g, "%")
    .replace(/\\implies/g, " ⇒ ")
    .replace(/[\*\_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface RawMarkdownSection {
  title: string;
  formulas: string[];
  bullets: string[];
  paragraphs: string[];
}

function parseMarkdownSections(theoryMarkdown: string): RawMarkdownSection[] {
  if (!theoryMarkdown.trim()) return [];
  const rawBlocks = theoryMarkdown.split(/(?=###\s+)/).filter((b) => b.trim().length > 0);

  return rawBlocks.map((block, idx) => {
    const lines = block.trim().split("\n");
    const firstLine = lines[0] ?? "";
    const hasHeading = firstLine.trim().startsWith("###");
    const title = hasHeading
      ? cleanChalkText(firstLine.replace(/^###\s*\d*\.?\s*/, ""))
      : `Asosiy Qoida ${idx + 1}`;
    const bodyLines = hasHeading ? lines.slice(1) : lines;

    const formulas: string[] = [];
    const bullets: string[] = [];
    const paragraphs: string[] = [];

    for (const rawLine of bodyLines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
        formulas.push(cleanChalkText(trimmed.slice(2, -2)));
        continue;
      }

      if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
        bullets.push(cleanChalkText(trimmed.replace(/^([-*]|\d+\.)\s+/, "")));
        continue;
      }

      paragraphs.push(cleanChalkText(trimmed));
    }

    return { title, formulas, bullets, paragraphs };
  });
}

function buildTeacherNarration(params: {
  topicTitle: string;
  formulas: string[];
  leftSummary: string;
  rightSummary: string;
  bottomSummary: string;
  analogyHint?: string;
}): Record<LearningPaceMode, [string, string, string, string]> {
  const {
    topicTitle,
    formulas,
    leftSummary,
    rightSummary,
    bottomSummary,
    analogyHint,
  } = params;

  const formulaText =
    formulas.length > 0
      ? `Doskaning yuqori qismidagi asosiy formulaga e'tibor bering: ${formulas.join(" hamda ")}.`
      : `Doskadagi mavzumizning asosiy qolipiga diqqat qiling.`;

  const simpleAnalogy =
    analogyHint ||
    "Buni oddiy hayotiy qoida kabi tasavvur qiling: har bir harf o'rniga masalada berilgan aniq sonni qo'yamiz.";

  return {
    SODDA: [
      `Assalomu alaykum! Bugungi mavzumiz: ${topicTitle}. Qo'rqmang, buni mutlaqo noldan juda sodda tilda o'rganamiz. ${formulaText}`,
      `Endi doskaning chap qismiga qarang: ${leftSummary} Sodda qilib aytganda: ${simpleAnalogy}`,
      `O'ng tomonda esa sizga vaqt yutib beradigan oltin qoidani yozdim: ${rightSummary}`,
      `Pastki qismdagi xulosani eslab qoling: ${bottomSummary} Birorta joyi tushunarsiz bo'lsa, mendan bevosita so'rang!`,
    ],
    STANDART: [
      `Diqqat doskaga! Mavzu: ${topicTitle}. ${formulaText}`,
      `Chap blokda nazariy asos va har bir hadning ma'nosini yozib chiqdim: ${leftSummary}`,
      `O'ng blokda imtihonning oltin qoidasi joylashgan: ${rightSummary}`,
      `Pastki kursiv qismda esa eng muhim xossalar va xulosa keltirilgan: ${bottomSummary}`,
    ],
    TEZKOR: [
      `Tezkor imtihon tahlili! Mavzu: ${topicTitle}. Asosiy model: ${formulas.join(" | ") || topicTitle}.`,
      `Asosiy parametrlar mantiqi: ${leftSummary}`,
      `5 soniyalik imtihon shortcuti — o'ng tomonga qarang: ${rightSummary}`,
      `Eng ko'p ball yo'qotiladigan tuzoq va xossa pastda: ${bottomSummary}`,
    ],
  };
}

export function buildChalkboardFromLesson(input: {
  slug: string;
  subjectName: string;
  lessonTitle: string;
  theoryMarkdown: string;
  examples?: Array<{
    title: string;
    problem: string;
    stepByStepSolution: string[];
    takeaway: string;
  }>;
}): ChalkboardSlideData {
  const sections = parseMarkdownSections(input.theoryMarkdown);
  const first = sections[0];
  const second = sections[1];
  const third = sections[2];
  const firstExample = input.examples?.[0];

  const topicTitle = first?.title || cleanChalkText(input.lessonTitle);

  // Formulalarni yig'ish (agar markdown ichida $$ bo'lmasa, kalit qolipni ajratamiz)
  const allFormulas = sections.flatMap((s) => s.formulas);
  const fallbackFormulas =
    allFormulas.length > 0
      ? allFormulas.slice(0, 3)
      : first?.bullets.length
        ? first.bullets.slice(0, 2).map((b) => (b.length > 56 ? `${b.slice(0, 54)}...` : b))
        : [cleanChalkText(input.lessonTitle)];

  const leftConcept: ChalkboardZoneContent = {
    paragraphs:
      first?.paragraphs && first.paragraphs.length > 0
        ? first.paragraphs
        : [cleanChalkText(input.lessonTitle)],
    bullets: first?.bullets ?? [],
  };

  const rightGoldenRule: ChalkboardZoneContent = second
    ? {
        heading: second.title,
        paragraphs: second.paragraphs,
        bullets: second.bullets,
      }
    : {
        heading: "Imtihondagi Oltin Qoida (Tezkor Usul)",
        paragraphs: firstExample
          ? [cleanChalkText(firstExample.takeaway)]
          : [
              "Savol shartining oxirgi jumlasini birinchi o'qing va ikkita chalg'ituvchi variantni darhol chiqarib tashlang.",
            ],
        bullets: [],
      };

  const bottomSpecialRule: ChalkboardZoneContent = third
    ? {
        heading: third.title,
        paragraphs: third.paragraphs,
        bullets: third.bullets,
      }
    : firstExample
      ? {
          heading: cleanChalkText(firstExample.title),
          paragraphs: [cleanChalkText(firstExample.problem)],
          bullets: firstExample.stepByStepSolution
            .slice(0, 2)
            .map((s) => cleanChalkText(s)),
        }
      : {
          heading: "Muhim Eslatma",
          paragraphs: [
            "Har bir qoidani kamida bitta amaliy misolda qo'llab tekshiring.",
          ],
          bullets: [],
        };

  const leftSummary = [
    ...leftConcept.paragraphs.slice(0, 1),
    ...leftConcept.bullets.slice(0, 2),
  ].join(" ");
  const rightSummary = [
    rightGoldenRule.heading,
    ...rightGoldenRule.paragraphs.slice(0, 1),
    ...rightGoldenRule.bullets.slice(0, 1),
  ]
    .filter(Boolean)
    .join(". ");
  const bottomSummary = [
    bottomSpecialRule.heading,
    ...bottomSpecialRule.bullets.slice(0, 2),
    ...bottomSpecialRule.paragraphs.slice(0, 1),
  ]
    .filter(Boolean)
    .join(". ");

  return {
    id: input.slug,
    subjectBadge: input.subjectName,
    topicTitle,
    formulas: fallbackFormulas,
    leftConcept,
    rightGoldenRule,
    bottomSpecialRule,
    teacherNarration: buildTeacherNarration({
      topicTitle,
      formulas: fallbackFormulas,
      leftSummary,
      rightSummary,
      bottomSummary,
    }),
  };
}

export function buildChalkboardFromMathModule(
  mod: MathModuleLesson
): ChalkboardSlideData {
  // 1-modul uchun aynan rasmdagi Chiziqli Funksiya namunaviy doska yozuvi
  if (mod.id === 1) {
    const formulas = ["f(x) = mx + b", "m = (y2 - y1) / (x2 - x1)"];
    const leftConcept: ChalkboardZoneContent = {
      paragraphs: [
        "Digital SAT Matematika bo'limida eng ko'p uchraydigan model bu chiziqli funksiya bo'lib, u quyidagi standart ko'rinishda yoziladi:",
        "Bu yerda:",
      ],
      bullets: [
        "m (Slope / Qiyalik koeffitsiyenti): x qiymati 1 birlikka oshganda y ning qanchaga o'zgarish tezligi. Ikki nuqta (x1, y1) va (x2, y2) berilganda:",
        "b (Y-intercept / Boshlang'ich qiymat): x = 0 bo'lgandagi boshlang'ich nuqta (0, b).",
      ],
    };
    const rightGoldenRule: ChalkboardZoneContent = {
      heading: "SAT Imtihonidagi Oltin Qoida (Ifodani butunligicha topish)",
      paragraphs: [
        "Ko'pincha SAT savolida x ning o'zini emas, balki 3x + 2 kabi ifodani topish so'raladi. Bunday paytda x ni kasr qilib hisoblab o'tirmasdan, tenglamaning ikkala tomonini bir xil songa bo'lish yoki ko'paytirish orqali javobni 5 soniyada topish mumkin!",
      ],
      bullets: [],
    };
    const bottomSpecialRule: ChalkboardZoneContent = {
      heading: "Parallel va Perpendikulyar To'g'ri Chiziqlar",
      paragraphs: [],
      bullets: [
        "Parallel chiziqlar (hech qachon kesishmaydi / yechimga ega emas): Qiyaliklari teng (m1 = m2), ammo boshlang'ich nuqtalari farqli (b1 ≠ b2).",
        "Perpendikulyar chiziqlar (90^° burchak ostida kesishadi): Qiyaliklari ko'paytmasi -1 ga teng (m1 · m2 = -1).",
      ],
    };

    return {
      id: mod.slug,
      subjectBadge: "SAT Algebra",
      topicTitle: "Chiziqli Funksiya Nima?",
      formulas,
      leftConcept,
      rightGoldenRule,
      bottomSpecialRule,
      teacherNarration: buildTeacherNarration({
        topicTitle: "Chiziqli Funksiya Nima?",
        formulas,
        leftSummary: `${leftConcept.paragraphs[0]} ${leftConcept.bullets.join(" ")}`,
        rightSummary: `${rightGoldenRule.heading}. ${rightGoldenRule.paragraphs[0]}`,
        bottomSummary: `${bottomSpecialRule.heading}. ${bottomSpecialRule.bullets.join(" ")}`,
        analogyHint: mod.theory.realWorldAnalogy,
      }),
    };
  }

  const cleanTitle = mod.title.replace(/^\d+\.\s*/, "").trim();
  const formulas = mod.proof.mainFormulas.map((f) => cleanChalkText(f.formula));

  const leftConcept: ChalkboardZoneContent = {
    paragraphs: [cleanChalkText(mod.theory.intuition)],
    bullets: mod.theory.paragraphs.slice(0, 2).map((p) => cleanChalkText(p)),
  };

  const trap = mod.satTraps[0];
  const rightGoldenRule: ChalkboardZoneContent = {
    heading: "SAT Imtihonidagi Oltin Qoida",
    paragraphs: [
      cleanChalkText(
        trap?.satLifehack ??
          mod.aiSummary.quickRules[0] ??
          mod.proof.conclusion
      ),
    ],
    bullets: mod.aiSummary.quickRules.slice(0, 1).map((r) => cleanChalkText(r)),
  };

  const bottomSpecialRule: ChalkboardZoneContent = {
    heading: trap ? cleanChalkText(trap.trapTitle) : cleanChalkText(mod.aiSummary.cheatSheetTitle),
    paragraphs: [],
    bullets: trap
      ? [
          `Keng tarqalgan xato: ${cleanChalkText(trap.mistakeText)}`,
          `To'g'ri yondashuv: ${cleanChalkText(trap.correctWay)}`,
        ]
      : mod.aiSummary.takeaways.slice(0, 2).map((t) => cleanChalkText(t)),
  };

  return {
    id: mod.slug,
    subjectBadge: mod.branch === "algebra" ? "SAT Algebra" : "SAT Geometriya",
    topicTitle: cleanTitle,
    formulas,
    leftConcept,
    rightGoldenRule,
    bottomSpecialRule,
    teacherNarration: buildTeacherNarration({
      topicTitle: cleanTitle,
      formulas,
      leftSummary: `${mod.theory.headline}. ${mod.theory.intuition}`,
      rightSummary: rightGoldenRule.paragraphs[0] ?? "",
      bottomSummary: bottomSpecialRule.bullets.join(" "),
      analogyHint: mod.theory.realWorldAnalogy,
    }),
  };
}
