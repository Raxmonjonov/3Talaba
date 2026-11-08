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
    "Buni oddiy hayotiy qoida kabi tasavvur qiling: har bir belgi o'rniga masalada berilgan aniq qiymatni qo'yamiz.";

  return {
    SODDA: [
      `Assalomu alaykum! Bugungi mavzumiz: ${topicTitle}. Qo'rqmang, buni mutlaqo noldan juda sodda tilda o'rganamiz. ${formulaText}`,
      `Endi doskaning chap qismiga qarang: ${leftSummary} Sodda qilib aytganda: ${simpleAnalogy}`,
      `O'ng tomonda esa sizga imtihonda vaqt yutib beradigan oltin qoidani yozdim: ${rightSummary}`,
      `Pastki kursiv qismdagi xulosani eslab qoling: ${bottomSummary} Birorta joyi tushunarsiz bo'lsa, pastdagi qator orqali mendan so'rang!`,
    ],
    STANDART: [
      `Diqqat doskaga! Mavzu: ${topicTitle}. ${formulaText}`,
      `Chap blokda nazariy asos va har bir parametrning ma'nosini yozib chiqdim: ${leftSummary}`,
      `O'ng blokda imtihonning oltin qoidasi joylashgan: ${rightSummary}`,
      `Pastki kursiv qismda esa eng muhim xossalar va xulosa keltirilgan: ${bottomSummary}`,
    ],
    TEZKOR: [
      `Tezkor imtihon tahlili! Mavzu: ${topicTitle}. Asosiy model: ${formulas.join(" | ") || topicTitle}.`,
      `Asosiy parametrlar mantiqi: ${leftSummary}`,
      `5 soniyalik imtihon usuli — o'ng tomonga qarang: ${rightSummary}`,
      `Eng ko'p ball yo'qotiladigan tuzoq va xossa pastda: ${bottomSummary}`,
    ],
  };
}

interface PresetBoardSpec {
  subjectBadge: string;
  topicTitle: string;
  formulas: [string, string];
  leftIntro: string;
  leftBullets: [string, string];
  rightHeading: string;
  rightParagraph: string;
  bottomHeading: string;
  bottomBullets: [string, string];
  analogyHint?: string;
}

function createSlideFromSpec(id: string, spec: PresetBoardSpec): ChalkboardSlideData {
  const leftConcept: ChalkboardZoneContent = {
    paragraphs: [spec.leftIntro, "Bu yerda:"],
    bullets: [spec.leftBullets[0], spec.leftBullets[1]],
  };
  const rightGoldenRule: ChalkboardZoneContent = {
    heading: spec.rightHeading,
    paragraphs: [spec.rightParagraph],
    bullets: [],
  };
  const bottomSpecialRule: ChalkboardZoneContent = {
    heading: spec.bottomHeading,
    paragraphs: [],
    bullets: [spec.bottomBullets[0], spec.bottomBullets[1]],
  };

  return {
    id,
    subjectBadge: spec.subjectBadge,
    topicTitle: spec.topicTitle,
    formulas: [spec.formulas[0], spec.formulas[1]],
    leftConcept,
    rightGoldenRule,
    bottomSpecialRule,
    teacherNarration: buildTeacherNarration({
      topicTitle: spec.topicTitle,
      formulas: spec.formulas,
      leftSummary: `${spec.leftIntro} ${spec.leftBullets.join(" ")}`,
      rightSummary: `${spec.rightHeading}. ${spec.rightParagraph}`,
      bottomSummary: `${spec.bottomHeading}. ${spec.bottomBullets.join(" ")}`,
      analogyHint: spec.analogyHint,
    }),
  };
}

/**
 * Namuna rasmdagi ("mavzu :Chiziqli Funksiya Nima?") 1:1 shablon asosida
 * barcha darslar va 15 ta matematika moduli uchun aniq o'lchamdagi doska ma'lumotlari.
 */
const LINEAR_FUNCTION_SPEC: PresetBoardSpec = {
  subjectBadge: "SAT Matematika",
  topicTitle: "Chiziqli Funksiya Nima?",
  formulas: ["f(x) = mx + b", "m = (y2 - y1) / (x2 - x1)"],
  leftIntro:
    "Digital SAT Matematika bo'limida eng ko'p uchraydigan model bu chiziqli funksiya bo'lib, u quyidagi standart ko'rinishda yoziladi:",
  leftBullets: [
    "m (Slope / Qiyalik koeffitsiyenti): x qiymati 1 birlikka oshganda y ning qanchaga o'zgarish tezligi. Ikki nuqta (x1, y1) va (x2, y2) berilganda:",
    "b (Y-intercept / Boshlang'ich qiymat): x = 0 bo'lgandagi boshlang'ich nuqta (0, b).",
  ],
  rightHeading: "SAT Imtihonidagi Oltin Qoida (Ifodani butunligicha topish)",
  rightParagraph:
    "Ko'pincha SAT savolida x ning o'zini emas, balki 3x + 2 kabi ifodani topish so'raladi. Bunday paytda x ni kasr qilib hisoblab o'tirmasdan, tenglamaning ikkala tomonini bir xil songa bo'lish yoki ko'paytirish orqali javobni 5 soniyada topish mumkin!",
  bottomHeading: "Parallel va Perpendikulyar To'g'ri Chiziqlar",
  bottomBullets: [
    "Parallel chiziqlar (hech qachon kesishmaydi / yechimga ega emas): Qiyaliklari teng (m1 = m2), ammo boshlang'ich nuqtalari farqli (b1 ≠ b2).",
    "Perpendikulyar chiziqlar (90^° burchak ostida kesishadi): Qiyaliklari ko'paytmasi -1 ga teng (m1 · m2 = -1).",
  ],
  analogyHint:
    "Taksi chaqirganda boshlang'ich to'lov b ga, har bir kilometr uchun qo'shiladigan narx esa m ga teng.",
};

const CORE_LESSON_SPECS: Record<string, PresetBoardSpec> = {
  "sat-math-linear-equations": LINEAR_FUNCTION_SPEC,
  "sat-rw-transitions-evidence": {
    subjectBadge: "SAT Reading & Writing",
    topicTitle: "Mantiqiy Bog'lovchilar (Transitions)",
    formulas: [
      "Gap1 (+) ⇒ Gap2 (+) : Davom",
      "Gap1 (+) ↔ Gap2 (-) : Zidlik",
    ],
    leftIntro:
      "Digital SAT Reading & Writing bo'limida har 5 ta savoldan 1 tasi ikki gap o'rtasidagi mantiqiy ko'prikni topishga bag'ishlanadi:",
    leftBullets: [
      "Davom ettiruvchi va natija bog'lovchilar (Moreover, Furthermore, Consequently, Therefore): ikkinchi gap birinchi fikrni kuchaytirganda yoki natija bo'lganda qo'llanadi.",
      "Ziddiyat bog'lovchilar (However, Nevertheless, On the other hand): ikkinchi gap oldingi fikrga qarama-qarshi ma'no berganda tanlanadi.",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (Sinonimlar Tuzog'i)",
    rightParagraph:
      "Variantlarga qaramasdan avval bo'shliqdan oldingi va keyingi gapni o'qib, ularga '+' yoki '-' belgisini qo'ying. Agar variantlarda bir xil ma'noli ikkita bog'lovchi (masalan, Therefore va Consequently) tursa, ikkalasi ham xato — ularni darhol o'chirib, 5 soniyada javobni toping!",
    bottomHeading: "Tinish Belgilari va Nuqtali Vergul Qoidasi",
    bottomBullets: [
      "Nuqtali vergul (;) faqat ikkita to'liq mustaqil gapni (Subject + Verb) bog'laydi: ' Gap 1 ; however, Gap 2 ' ko'rinishi to'g'ri.",
      "Ikki mustaqil gap orasiga bog'lovchisiz yolg'iz vergul qo'yish (Comma Splice) — SAT grammatikasidagi eng katta xato hisoblanadi.",
    ],
  },
  "ielts-reading-paraphrasing": {
    subjectBadge: "IELTS Academic",
    topicTitle: "IELTS Reading: TRUE / FALSE / NOT GIVEN",
    formulas: [
      "TRUE = Mos | FALSE = Teskari",
      "NOT GIVEN = Matnda yo'q",
    ],
    leftIntro:
      "IELTS Academic Reading imtihonida eng ko'p ball yo'qotiladigan savol turi bu savol jumlasini matndagi fakt bilan solishtirishdir:",
    leftBullets: [
      "FALSE (Xato): Matnda aynan shu mavzu haqida aniq gap bor, ammo savoldagi ma'lumot matnga 100% teskari (masalan, matnda 'kamaydi', savolda 'oshdi' deyilgan).",
      "NOT GIVEN (Berilmagan): Savoldagi asosiy da'vo yoki solishtirma matnda umuman tilga olinmagan — uni o'zingizdan taxmin qilib bo'lmaydi.",
    ],
    rightHeading: "IELTS Imtihonidagi Oltin Qoida (Kuchli So'zlar Siri)",
    rightParagraph:
      "Savol jumlasidagi 'always, only, never, all, the most' kabi keskin chegaralovchi so'zlarni darhol doiraga oling! Akademik matnlarda mualliflar odatda 'often, some, can' kabi ehtiyotkor so'zlarni ishlatadi — bunday zidlik 90% holatda FALSE yoki NOT GIVEN bo'ladi!",
    bottomHeading: "Savollarni Ketma-ketlikda Topish Qonuniyati",
    bottomBullets: [
      "TRUE / FALSE / NOT GIVEN savollari matnda har doim qat'iy ketma-ketlikda (1-savol yuqorida, 2-savol undan pastda) joylashadi.",
      "Agar 1-savol va 3-savol javobini topgan bo'lsangiz, 2-savol javobi aniq shu ikki abzats orasida bo'ladi — butun matnni qayta o'qimang!",
    ],
  },
  "foundation-math-ratios-percents": {
    subjectBadge: "Fundamental Matematika",
    topicTitle: "Foizlar, Nisbat va Proporsiya Qoidalari",
    formulas: [
      "Yangi = Asl · (1 ± p/100)",
      "Δ% = ((Yangi - Asl)/Asl)·100",
    ],
    leftIntro:
      "Har qanday foizli o'sish, chegirma va proporsiya masalalarini 1 qatorda yechish uchun o'nli ko'paytuvchi modelidan foydalaniladi:",
    leftBullets: [
      "Ko'paytuvchi (Multiplier): Qiymat 20% ga oshsa 1.20 ga, 15% ga kamaysa 0.85 ga ko'paytiriladi. Ketma-ket o'zgarishda ko'paytuvchilar o'zaro ko'paytiriladi.",
      "Proporsiya qoidasi (a / b = c / d): Krest-nakrest ko'paytmasi har doim teng bo'ladi (a · d = b · c).",
    ],
    rightHeading: "Imtihondagi Oltin Qoida (Ketma-ket Foiz Tuzog'i)",
    rightParagraph:
      "Narx avval 20% ga oshib, keyin 20% ga arzonlashsa, u asl holiga qaytmaydi! Bunday masalada asl sonni 100 deb oling: 100 · 1.20 = 120, so'ngra 120 · 0.80 = 96 chiqadi. Demak, natija 0% emas, balki 4% ga kamayganini 5 soniyada ko'rasiz!",
    bottomHeading: "Og'zaki Tez Hisoblash va Nisbat Bo'laklari",
    bottomBullets: [
      "Istalgan sonning 10% ini topish uchun vergulni 1 xona chapga suring; 5% esa o'sha 10% ning yarmiga teng (masalan, 240 ning 15% i = 24 + 12 = 36).",
      "Agar a : b = 3 : 5 va ularning yig'indisi 80 bo'lsa, jami bo'laklar 3k + 5k = 8k = 80 ⇒ 1 bo'lak k = 10 bo'ladi.",
    ],
  },
  "academic-writing-thesis-essay": {
    subjectBadge: "Akademik Yozuv",
    topicTitle: "Akademik Insho: PEEL Paragraf Formulasi",
    formulas: [
      "PEEL = Point + Explain",
      "+ Example + Link (4–5 gap)",
    ],
    leftIntro:
      "IELTS Writing Task 2 (Band 7.5+) va xalqaro universitet insholarida har bir asosiy abzats (Body Paragraph) PEEL qolipida quriladi:",
    leftBullets: [
      "P (Point) va E (Explain): 1-gapda abzatsning asosiy da'vosi aytiladi, 2-gapda esa 'Nega bu fikr to'g'ri?' degan savolga sabab-oqibat orqali izoh beriladi.",
      "E (Example) va L (Link): 3-gapda aniq hayotiy yoki ilmiy misol keltirilib, 4-gapda fikr inshoning bosh mavzusiga qayta bog'lanadi.",
    ],
    rightHeading: "IELTS Writing Oltin Qoidasi (Coherence & Cohesion 25%)",
    rightParagraph:
      "Imtihon oluvchi (Examiner) abzatsning birinchi gapini (Topic Sentence) o'qigandayoq butun paragraf nima haqida ekanini tushunishi shart! Bir abzats ichiga 3-4 ta turli fikrni aralashtirib yubormang — bitta kuchli g'oyani chuqur ochib berish Band 7.5+ kafolatidir!",
    bottomHeading: "Akademik Uslub vaSo'z Boyligi (Lexical Resource)",
    bottomBullets: [
      "Oddiy og'zaki so'zlar ('a lot of, good, bad, big') o'rniga akademik birikmalar ('a significant proportion of, beneficial, detrimental') ishlating.",
      "Misol keltirayotganda soxta statistika ('98.7% odamlar...') to'qimang — umumiy real tendensiyani ('For instance, in many metropolitan cities...') yozing.",
    ],
  },
};

const MATH_MODULE_SPECS: Record<number, PresetBoardSpec> = {
  1: LINEAR_FUNCTION_SPEC,
  2: {
    subjectBadge: "SAT Algebra",
    topicTitle: "Kvadrat Tenglama va Viyet Teoremasi",
    formulas: [
      "ax² + bx + c = 0  |  D = b² - 4ac",
      "x1 + x2 = -b / a  |  x1 · x2 = c / a",
    ],
    leftIntro:
      "Digital SAT Matematika bo'limida kvadrat tenglamalar va ularning ildizlari xossasi quyidagi standart qonuniyatga bo'ysunadi:",
    leftBullets: [
      "D (Diskriminant = b² - 4ac): D > 0 bo'lsa 2 ta haqiqiy ildiz, D = 0 bo'lsa 1 ta karrali ildiz, D < 0 bo'lsa haqiqiy ildiz mavjud emas.",
      "Viyet teoremasi: Ildizlar yig'indisi (-b / a) ga, ildizlar ko'paytmasi esa (c / a) ga teng.",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (Ildizlar Yig'indisi Siri)",
    rightParagraph:
      "SAT savolida 'tenglamaning barcha yechimlari yig'indisini toping' deyilsa, diskriminant hisoblab vaqt yo'qotmang! Shartda D > 0 ekanini tekshirib, darhol x1 + x2 = -b / a formulasini qo'llang — javob 3 soniyada tayyor bo'ladi!",
    bottomHeading: "Ishora Xatosi va Karrali Ildiz Sharti",
    bottomBullets: [
      "Eng ko'p uchraydigan tuzoq: x² - 8x + 12 = 0 tenglamada ildizlar yig'indisi -8 emas, balki -(-8) / 1 = +8 ga teng!",
      "Masala shartida 'tenglama yagona yechimga ega' yoki 'parabola OX o'qiga urinadi' deyilsa, darhol b² - 4ac = 0 tenglamasini tuzing.",
    ],
  },
  3: {
    subjectBadge: "SAT Algebra",
    topicTitle: "Kvadrat Funksiya va Parabola Shakli",
    formulas: [
      "f(x) = a(x - h)² + k",
      "h = -b / (2a)  |  k = f(h)",
    ],
    leftIntro:
      "Parabola grafigining eng yuqori (maksimum) yoki eng quyi (minimum) nuqtasini topishda cho'qqi ko'rinishi (Vertex Form) asosiy model hisoblanadi:",
    leftBullets: [
      "(h, k) — Parabolaning uchi (Vertex): h simmetriya o'qi tenglamasi (x = h), k esa funksiyaning eng katta yoki eng kichik qiymati.",
      "a (Bosh koeffitsiyent): a > 0 bo'lsa parabola shoxlari yuqoriga (minimum = k), a < 0 bo'lsa pastga (maksimum = k) yo'naladi.",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (Maksimum va Minimum)",
    rightParagraph:
      "Matnli masalada 'maksimal daromad', 'eng baland nuqta' yoki 'minimal xarajat' so'ralsa, sizdan parabolaning uchi (h, k) so'ralyapti! Agar 'qaysi vaqtda' deyilsa h = -b / (2a) ni, 'qancha balandlikka' deyilsa k = f(h) ni darhol toping!",
    bottomHeading: "Parabolaning Uch Xil Ko'rinishi va Simmetriya",
    bottomBullets: [
      "Standart shakl (ax² + bx + c) — OY kesishuvni (0, c); Ko'paytuvchi shakl a(x - r1)(x - r2) — OX kesishuvlarni (r1, r2) darhol ko'rsatadi.",
      "Parabola simmetrik bo'lgani uchun uchi h har doim ikki ildizning o'rta arifmetigiga teng: h = (r1 + r2) / 2.",
    ],
  },
  4: {
    subjectBadge: "SAT Algebra",
    topicTitle: "Ko'phadlar va Bezu (Qoldiq) Teoremasi",
    formulas: [
      "P(x) = (x - a) · Q(x) + R",
      "Qoldiq: R = P(a)",
    ],
    leftIntro:
      "Ko'phadlarni chiziqli ikkihadga bo'lish va ularning ildizlarini grafikdagi xulqi bilan bog'lash SATning yuqori balli savollarida uchraydi:",
    leftBullets: [
      "Bezu teoremasi: P(x) ko'phadni (x - a) ga bo'lgandagi qoldiq R ni topish uchun ko'phadni ustunlab bo'lmaymiz, shunchaki x o'rniga a ni qo'yamiz: R = P(a).",
      "Karralik (Multiplicity): (x - a)^k ko'paytuvchida k toq bo'lsa grafik OX o'qini kesib o'tadi, k juft bo'lsa OX o'qiga urinib qaytadi.",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (x = 0 va x = 1 Usuli)",
    rightParagraph:
      "Ikki murakkab ko'phad ayniyat (barcha x larda teng) bo'lib, noma'lum koeffitsiyentlar so'ralsa, qavslarni ochib o'tirmang! Tenglikning ikkala tomoniga x = 0 yoki x = 1 qiymatlarini qo'ysangiz, javob 5 soniyada kelib chiqadi!",
    bottomHeading: "Qisqa Ko'paytirish Formulalari (SAT Favoritlari)",
    bottomBullets: [
      "Kvadratlar ayirmasi: a² - b² = (a - b)(a + b) — SATda kasrlarni qisqartirish va tenglamani yechishda eng ko'p ishlatiladigan qolip.",
      "To'la kvadrat: (a ± b)² = a² ± 2ab + b² — o'rtadagi ±2ab hadini unutib qo'ymaslik kerak!",
    ],
  },
  5: {
    subjectBadge: "SAT Algebra",
    topicTitle: "Ratsional Ifodalar va Maxraj Cheklovi",
    formulas: [
      "P(x) / Q(x) = 0 (Q(x) ≠ 0)",
      "1 / t = 1 / t1 + 1 / t2",
    ],
    leftIntro:
      "Maxrajida noma'lum qatnashgan kasr-ratsional tenglamalarni yechishda eng birinchi qadam aniqlanish sohasini (maxraj ≠ 0) belgilashdir:",
    leftBullets: [
      "Chet ildiz (Extraneous solution): Tenglamani umumiy maxrajga ko'paytirib topilgan ildiz asl maxrajni 0 ga aylantirsa, u yechim hisoblanmaydi.",
      "Birgalikda bajarilgan ish modeli: 1 / t1 va 1 / t2 — har bir ishchining 1 soatdagi unumdorligi bo'lib, ular har doim qo'shiladi.",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida ('Undefined' Kalit So'zi)",
    rightParagraph:
      "SAT savolida 'For what value of x is the function undefined?' (x ning qanday qiymatida ifoda aniqlanmagan?) deyilsa, suratga umuman qaramang! Faqat maxrajni 0 ga tenglashtiring (Q(x) = 0) va javobni bir necha soniyada belgilang!",
    bottomHeading: "Kasrlarni Qisqartirish va Asimptota Qoidasi",
    bottomBullets: [
      "Surat va maxrajdagi ifodalarni faqat ko'paytuvchilarga ajratgandan keyingina qisqartirish mumkin (yig'indining bitta hadini qisqartirib bo'lmaydi).",
      "Maxrajni 0 ga aylantiruvchi x qiymat grafikda vertikal asimptota (funksiya hech qachon kesib o'tmaydigan chiziq) hosil qiladi.",
    ],
  },
  6: {
    subjectBadge: "SAT Algebra",
    topicTitle: "Darajalar va Kasr Ko'rsatkichli Ildizlar",
    formulas: [
      "a^(m / n) = ⁿ√(a^m)",
      "a^m · a^n = a^(m + n)",
    ],
    leftIntro:
      "Murakkab ildizli va darajali ifodalarni soddalashtirish uchun barcha ildizlarni kasr daraja ko'rinishiga o'tkazish eng universal usuldir:",
    leftBullets: [
      "Kasr daraja (m / n): Kasrning surati m — sonning darajasini, maxraji n esa ildiz ko'rsatkichini bildiradi (masalan, x^(3/2) = √(x³)).",
      "Manfiy daraja (-n): Sonni manfiy qilmaydi, balki uni kasr chizig'ining ikkinchi tomoniga (maxrajga) tushiradi: 2^(-3) = 1 / 8.",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (Yagona Asosga Keltirish)",
    rightParagraph:
      "Agar tenglamada 4^x, 8^y yoki 16^z kabi sonlar qatnashsa, ularning barchasini eng kichik tub asosga (2 ning darajasiga: 4 = 2², 8 = 2³, 16 = 2⁴) keltiring! Asoslar tenglashishi bilan daraja ko'rsatkichlari oddiy chiziqli tenglamaga aylanadi!",
    bottomHeading: "Ildizli Tenglamalarda Chet Ildiz Xavfi",
    bottomBullets: [
      "Juft darajali arifmetik ildiz natijasi har doim nomanfiy bo'ladi (√(x - 1) = -3 tenglama haqiqiy yechimga ega emas!).",
      "Tenglamaning ikkala tomonini kvadratga oshirib topilgan javobni albatta asl tenglamaga qo'yib tekshirish shart.",
    ],
  },
  7: {
    subjectBadge: "SAT Algebra",
    topicTitle: "Ko'rsatkichli O'sish va Logarifm Qonuni",
    formulas: [
      "y(t) = a · (1 ± r)^(t / T)",
      "log_a(b) = c  ⇔  a^c = b",
    ],
    leftIntro:
      "Aholi soni ko'payishi, bank foizi va radioaktiv yemirilish kabi jarayonlar ko'rsatkichli (eksponensial) funksiya bilan modellashtiriladi:",
    leftBullets: [
      "a (Boshlang'ich miqdor): t = 0 vaqtdagi dastlabki qiymat; (1 + r) — o'sish ko'paytuvchisi, (1 - r) — kamayish (decay) ko'paytuvchisi.",
      "t / T (Daraja ko'rsatkichi): T — o'zgarish yuz beradigan bitta davr uzunligi (masalan, 'har 5 yilda ikki barobar oshsa', darajada t / 5 yoziladi).",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (Chiziqli vs Ko'rsatkichli)",
    rightParagraph:
      "Matnli masalada 'har oyda bir xil songa (masalan, 50 taga) oshadi' deyilsa — Chiziqli funksiya; 'har oyda bir xil foizga yoki marta (masalan, 12% ga yoki 2 barobar) oshadi' deyilsa — Ko'rsatkichli funksiya tanlanadi!",
    bottomHeading: "Logarifmning Asosiy Xossalari",
    bottomBullets: [
      "Ko'paytma logarifmi yig'indiga, bo'linma esa ayirmaga ajraladi: log(x · y) = log(x) + log(y) hamda log(x / y) = log(x) - log(y).",
      "Daraja ko'rsatkichi logarifm oldiga ko'paytuvchi bo'lib tushadi: log(x^k) = k · log(x), shuningdek log_a(1) = 0 va log_a(a) = 1.",
    ],
  },
  8: {
    subjectBadge: "SAT Geometriya",
    topicTitle: "Parallel Chiziqlar va Uchburchak Burchaklari",
    formulas: [
      "α + β + γ = 180°  |  γ_tashqi = α + β",
      "Yig'indi (n-burchak) = (n - 2) · 180°",
    ],
    leftIntro:
      "Ikki parallel to'g'ri chiziq kesuvchi bilan kesishganda hosil bo'ladigan 8 ta burchak va uchburchak burchaklari o'rtasida qat'iy bog'liqlik mavjud:",
    leftBullets: [
      "Parallel chiziqlar qoidasi: Barcha o'tkir burchaklar o'zaro teng, barcha o'tmas burchaklar o'zaro teng, har qanday o'tkir va o'tmas burchak yig'indisi 180° ga teng.",
      "Tashqi burchak teoremasi: Uchburchakning tashqi burchagi o'ziga qo'shni bo'lmagan ikkita ichki burchak yig'indisiga teng (γ_tashqi = α + β).",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (Tashqi Burchak Shortcuti)",
    rightParagraph:
      "Chizmada uchburchakning ikkita ichki burchagi berilib, uchinchi uchidagi tashqi burchak so'ralsa, 180° dan ayirib ikki marta hisoblamang! Shunchaki ichki ikkita burchakni bir-biriga qo'shing — bu usul vaqtni va arifmetik xatoni tejaydi!",
    bottomHeading: "Uchburchaklar O'xshashligi va Tengyonli Uchburchak",
    bottomBullets: [
      "Tengyonli uchburchakda teng yonlar qarshisidagi asos burchaklari teng bo'ladi; uchidan tushirilgan balandlik ham mediana, ham bissektrisadir.",
      "Agar ikkita uchburchakning 2 tadan burchagi o'zaro teng bo'lsa (AA alomati), ular o'xshashdir va mos tomonlari proporsional bo'ladi.",
    ],
  },
  9: {
    subjectBadge: "SAT Geometriya",
    topicTitle: "Pifagor Teoremasi va Maxsus Uchburchaklar",
    formulas: [
      "a² + b² = c² (45°: x, x, x√2)",
      "30°-60°-90° : x, x√3, 2x",
    ],
    leftIntro:
      "To'g'ri burchakli uchburchaklarda tomonlar nisbati Pifagor teoremasi hamda ikki maxsus burchakli uchburchak qoidasi orqali topiladi:",
    leftBullets: [
      "45°-45°-90° (Tengyonli to'g'ri burchakli uchburchak / kvadrat diagonali): Katetlari o'zaro teng (x va x), gipotenuzasi esa katetdan √2 marta katta (x√2).",
      "30°-60°-90° (Teng tomonli uchburchakning yarmi): 30° qarshisida eng kichik katet (x), 60° qarshisida (x√3), gipotenuza esa (2x) bo'ladi.",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (Pifagor Uchliklari)",
    rightParagraph:
      "SAT geometriya savollarining 80% qismida ildiz chiqarib o'tirmaslik uchun tayyor Pifagor uchliklari yashiringan bo'ladi: (3, 4, 5), (5, 12, 13), (8, 15, 17) va (7, 24, 25) hamda ularning karralilarini (6-8-10, 9-12-15) ko'rgan zahoti javobni yozing!",
    bottomHeading: "Gipotenuzani Aniqlash va Balandlik Xossasi",
    bottomBullets: [
      "c (Gipotenuza) har doim 90° li to'g'ri burchak qarshisida yotuvchi eng uzun tomondir — katet bilan gipotenuzani adashtirmang!",
      "Teng tomonli uchburchakning tomoni a bo'lsa, uning balandligi h = (a√3) / 2 ga, yuzi esa S = (a²√3) / 4 ga teng.",
    ],
  },
  10: {
    subjectBadge: "SAT Geometriya",
    topicTitle: "Yuzlar, Perimetr va O'xshashlik Koeffitsiyenti",
    formulas: [
      "S_uchburchak = (1 / 2) · a · h",
      "L1 / L2 = k ⇒ S1 / S2 = k²",
    ],
    leftIntro:
      "Tekis shakllarning yuzi va o'xshash figuralarning o'lchamlari o'rtasidagi darajali o'zgarish qonuniyati SATda eng ko'p so'raladigan mavzulardandir:",
    leftBullets: [
      "Asosiy yuz formulalari: To'g'ri to'rtburchak S = a · b; Parallelogramm S = a · h; Trapetsiya S = ((a + b) / 2) · h.",
      "Masshtab (Scale factor k): Shaklning barcha chiziqli o'lchamlari (tomoni, perimetri, radiusi) k marta oshsa, uning yuzi k² marta, hajmi esa k³ marta oshadi!",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (k² va k³ Tuzog'i)",
    rightParagraph:
      "Agar savolda 'uchburchakning har bir tomoni 3 marta uzaytirilsa, uning yuzi necha marta oshadi?' deyilsa, aslo 3 deb belgilamang! Yuz kvadrat birlikda o'lchangani uchun k² = 3² = 9 marta, hajm esa k³ = 3³ = 27 marta oshadi!",
    bottomHeading: "Muntazam Ko'pburchaklar va Diagonallar",
    bottomBullets: [
      "Har qanday qavariq ko'pburchakning tashqi burchaklari yig'indisi tomonlar soniga bog'liq emas va har doim 360° ga teng.",
      "Kvadratning diagonali d berilgan bo'lsa, tomonni topmasdan turib ham uning yuzini S = d² / 2 formulasi bilan topish mumkin.",
    ],
  },
  11: {
    subjectBadge: "SAT Geometriya",
    topicTitle: "Aylana Yoyi, Sektor Yuzi va Urinma Xossasi",
    formulas: [
      "L_yoy = (θ / 360°) · 2πr",
      "S_sektor = (θ / 360°) · πr²",
    ],
    leftIntro:
      "Aylana va doira masalalarida har qanday yoy uzunligi yoki sektor yuzi butun aylananing (θ / 360°) ulushi sifatida hisoblanadi:",
    leftBullets: [
      "Markaziy va ichki chizilgan burchak: Bitta yoyga tiralgan ichki chizilgan burchak (uchlari aylanada) markaziy burchakning aynan yarmiga teng.",
      "Urinma (Tangent) va Diametr: Aylanaga o'tkazilgan urinma urinish nuqtasidagi radiusga 90° tik bo'ladi; diametrga tiralgan ichki burchak har doim 90° dir.",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (Ulush Proporsiyasi)",
    rightParagraph:
      "Yoy uzunligi, sektor yuzi va markaziy burchak uchun alohida-alohida murakkab formula yodlamang! Ularning hammasi bitta proporsiyaga bo'ysunadi: (Markaziy burchak / 360°) = (Yoy uzunligi / 2πr) = (Sektor yuzi / πr²).",
    bottomHeading: "Radian va Gradus O'rtasida Tezkor O'tish",
    bottomBullets: [
      "Radiandan gradusga o'tishning eng oson yo'li: ifodadagi π harfi o'rniga to'g'ridan-to'g'ri 180° sonini qo'yib hisoblang (masalan, π / 3 = 180° / 3 = 60°).",
      "Radian o'lchovida yoy uzunligi L = r · θ ga, sektor yuzi esa S = (1 / 2) · r² · θ ga teng bo'ladi.",
    ],
  },
  12: {
    subjectBadge: "SAT Geometriya",
    topicTitle: "Fazoviy Jismlar: Silindr, Konus va Shar Hajmi",
    formulas: [
      "V_silindr = πr²h",
      "V_konus = (1 / 3)πr²h",
    ],
    leftIntro:
      "Fazoviy jismlar (3D Geometry) hajmini hisoblashda barcha shakllar ikkita asosiy guruhga — uchi tekis va uchi uchli jismlarga bo'linadi:",
    leftBullets: [
      "Tekis asosli jismlar (To'g'ri burchakli parallelepiped, Prizma, Silindr): Hajmi asos yuzi bilan balandlik ko'paytmasiga teng (V = S_asos · h).",
      "Uchli jismlar (Konus va Piramida): Hajmi xuddi shunday asos va balandlikka ega silindr yoki prizma hajmining aynan uchdan biriga (1 / 3) teng.",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (Suyuqlik Quyish Masalalari)",
    rightParagraph:
      "Bir idishdagi suv ikkinchi idishga quyilganda yoki metall shar eritilib silindr yasalganida jismning shakli o'zgaradi, ammo HAJMI o'zgarmaydi (V1 = V2)! Tenglikning ikkala tomonidagi π larni darhol qisqartirib yuboring — hisob-kitob 3 barobar osonlashadi!",
    bottomHeading: "Zichlik, Massa va Fazoviy Diagonal",
    bottomBullets: [
      "Fizik-matematik bog'liqlik: Massa = Zichlik · Hajm (m = ρ · V). SATda jism massasini topish uchun avval hajmni topib, zichlikka ko'paytiriladi.",
      "To'g'ri burchakli qutining eng uzun fazoviy diagonali 3 o'lchamli Pifagor teoremasi bilan topiladi: d = √(a² + b² + c²).",
    ],
  },
  13: {
    subjectBadge: "SAT Geometriya",
    topicTitle: "Trigonometriya: SIN, COS, TAN va Kofunksiya",
    formulas: [
      "sin(α) = a / c , cos(α) = b / c",
      "sin(x) = cos(90° - x)",
    ],
    leftIntro:
      "To'g'ri burchakli uchburchakda o'tkir burchakning trigonometrik funksiyalari tomonlar nisbati (SOH-CAH-TOA qoidasi) bilan aniqlanadi:",
    leftBullets: [
      "SOH-CAH-TOA: sin(α) = qarshisidagi katet / gipotenuza; cos(α) = yopishgan katet / gipotenuza; tan(α) = qarshi katet / yopishgan katet.",
      "To'ldiruvchi burchaklar (Complementary Angles): To'g'ri burchakli uchburchakda bir o'tkir burchakning sinusi ikkinchi o'tkir burchakning kosinusiga teng!",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (sin x = cos y Tengligi)",
    rightParagraph:
      "SATda har doim tushadigan mashhur savol: 'Agar sin(4x + 10°) = cos(2x + 20°) bo'lsa, x ni toping'. Bunda hech qanday trigonometrik hisob qilmang — shunchaki ikkala burchak yig'indisini 90° ga tenglashtiring: (4x + 10) + (2x + 20) = 90° ⇒ 6x = 60° ⇒ x = 10°!",
    bottomHeading: "O'xshash Uchburchaklarda Trigonometrik Nisbat",
    bottomBullets: [
      "Burchakning sin, cos va tan qiymati uchburchakning katta-kichikligiga bog'liq emas — o'xshash uchburchaklarda mos burchaklar sinusi bir xil qoladi!",
      "Birlik aylanada nuqtaning X koordinatasi cos(θ) ga, Y koordinatasi esa sin(θ) ga teng (tan(θ) = sin(θ) / cos(θ) = to'g'ri chiziq qiyaligi m).",
    ],
  },
  14: {
    subjectBadge: "SAT Algebra",
    topicTitle: "Tekislikda Masofa, O'rta Nuqta va Vektorlar",
    formulas: [
      "d = √((x2 - x1)² + (y2 - y1)²)",
      "M = ((x1 + x2) / 2 , (y1 + y2) / 2)",
    ],
    leftIntro:
      "Dekart koordinatalar tekisligida ikki nuqta orasidagi masofa va kesmaning o'rta nuqtasi Pifagor teoremasi hamda o'rta arifmetik qoidaga asoslanadi:",
    leftBullets: [
      "Masofa formulasi (d): gorizontal farq Δx = (x2 - x1) va vertikal farq Δy = (y2 - y1) dan tuzilgan to'g'ri burchakli uchburchak gipotenuzasidir.",
      "O'rta nuqta (Midpoint M): Kesma uchlarining mos X va Y koordinatalarini qo'shib, 2 ga bo'lish orqali topiladi.",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (Ikkinchi Uchini Topish)",
    rightParagraph:
      "Kesmaning bir uchi A(2, 3) va o'rta nuqtasi M(5, 7) berilib, ikkinchi uchi B(x, y) so'ralsa, tenglama tuzib o'tirmang! A dan M gacha X koordinata +3 ga (2 → 5), Y esa +4 ga (3 → 7) oshgan; M ga yana shuncha qo'shing: B(5 + 3, 7 + 4) = B(8, 11)!",
    bottomHeading: "Grafiklarni Siljitish (Transformatsiya) Qoidalari",
    bottomBullets: [
      "f(x) + k funksiyasi grafikni k birlik yuqoriga, f(x) - k esa k birlik pastga siljitadi (Y koordinata o'zgaradi).",
      "f(x - h) grafikni h birlik O'NGGA, f(x + h) esa h birlik CHAPGA siljitadi (qavs ichidagi ishora teskari ishlaydi!).",
    ],
  },
  15: {
    subjectBadge: "SAT Geometriya",
    topicTitle: "Aylana Standart Tenglamasi va To'la Kvadrat",
    formulas: [
      "(x - h)² + (y - k)² = r²",
      "x² + bx = (x + b / 2)² - (b / 2)²",
    ],
    leftIntro:
      "Digital SAT Matematika bo'limining eng oxirgi (800 ballik) savollarida aylananing koordinata tekisligidagi tenglamasi so'raladi:",
    leftBullets: [
      "(h, k) — Aylana markazi koordinatalari: Tenglamaning qavslari ichida minus ishorasi turgani uchun markaz koordinatalari teskari ishora bilan olinadi!",
      "r (Aylana radiusi): Tenglikning o'ng tomonida r ning o'zi emas, balki r² (radiusning kvadrati) turadi — diametr esa d = 2r ga teng.",
    ],
    rightHeading: "SAT Imtihonidagi Oltin Qoida (To'la Kvadratga Ajratish)",
    rightParagraph:
      "Agar tenglama x² + bx + y² + dy = c kabi yoyilgan ko'rinishda berilsa, x va y oldidagi koeffitsiyentlarning yarmini olib kvadratga oshiring va tenglamaning ikkala tomoniga qo'shing: r² = c + (b / 2)² + (d / 2)². Markaz esa darhol (-b / 2, -d / 2) bo'ladi!",
    bottomHeading: "Markaz Ishorasi va Nuqtaning Aylanaga Tegishliligi",
    bottomBullets: [
      "Misol: (x + 4)² + (y - 3)² = 25 aylananing markazi (4, -3) EMAS, balki (-4, 3) nuqtadir, radiusi esa 25 emas, r = √25 = 5 ga teng!",
      "Agar nuqta koordinatalarini tenglamaga qo'yganda chap tomon < r² chiqsa nuqta aylana ichida, = r² chiqsa aylana ustida, > r² chiqsa tashqarida yotadi.",
    ],
  },
};

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
  const preset = CORE_LESSON_SPECS[input.slug];
  if (preset) {
    return createSlideFromSpec(input.slug, preset);
  }

  // Agar yangi dars qo'shilgan bo'lsa, u ham aynan 4 blokli rasmdagi formatda chiqadi
  const firstExample = input.examples?.[0];
  const fallbackSpec: PresetBoardSpec = {
    subjectBadge: input.subjectName,
    topicTitle: cleanChalkText(input.lessonTitle),
    formulas: [
      cleanChalkText(input.lessonTitle),
      "Qoida  ⇒  Namuna  ⇒  5 Soniyalik Yechim",
    ],
    leftIntro: `Ushbu darsda «${cleanChalkText(input.lessonTitle)}» mavzusining imtihonda eng ko'p uchraydigan asosiy qonuniyati o'rganiladi:`,
    leftBullets: [
      firstExample
        ? `Namunaviy shart: ${cleanChalkText(firstExample.problem)}`
        : "Asosiy tushuncha: masala shartidagi berilganlarni standart formula ko'rinishiga keltiramiz.",
      firstExample?.stepByStepSolution[0]
        ? `Yechim qadami: ${cleanChalkText(firstExample.stepByStepSolution[0])}`
        : "Har bir parametrning ma'nosini aniqlab, noma'lum ifodani ajratib olamiz.",
    ],
    rightHeading: "Imtihondagi Oltin Qoida (Tezkor Yondashuv)",
    rightParagraph: firstExample?.takeaway
      ? cleanChalkText(firstExample.takeaway)
      : "Savol shartining oxirgi jumlasini birinchi o'qing va ikkita chalg'ituvchi variantni darhol chiqarib tashlang — bu vaqtni 2 barobar tejaydi!",
    bottomHeading: "Muhim Xossalar va Tekshirish Qoidasi",
    bottomBullets: [
      firstExample?.stepByStepSolution[1]
        ? cleanChalkText(firstExample.stepByStepSolution[1])
        : "Topilgan natijani har doim masala shartiga qo'yib, ishora va birliklarni tekshiring.",
      "Murakkab hisob-kitobga kirishishdan oldin ifodaning qisqaradigan qismlarini toping.",
    ],
  };

  return createSlideFromSpec(input.slug, fallbackSpec);
}

export function buildChalkboardFromMathModule(
  mod: MathModuleLesson
): ChalkboardSlideData {
  const preset = MATH_MODULE_SPECS[mod.id] ?? LINEAR_FUNCTION_SPEC;
  return createSlideFromSpec(mod.slug, {
    ...preset,
    analogyHint: mod.theory.realWorldAnalogy,
  });
}
