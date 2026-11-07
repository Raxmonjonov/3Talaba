import {
  extractPaceDirective,
  type AICoachMetadata,
  type AICoachMode,
  type WritingRubricBreakdown,
} from "@/lib/ai";

export type CoachSubjectId =
  | "sat-math"
  | "sat-rw"
  | "ielts"
  | "deep-math"
  | "admissions";

export interface SmartFallbackParams {
  subjectId: CoachSubjectId;
  subjectLabel: string;
  mode: AICoachMode;
  message: string;
  honorific: string;
  turnIndex: number;
  pace?: "SODDA" | "STANDART" | "TEZKOR";
}

export interface SmartFallbackResult {
  reply: string;
  metadata: AICoachMetadata;
}

interface SubjectGuide {
  firstQuestion: string;
  hint: string;
  stepExample: string;
  stepTitle: string;
}

const SUBJECT_GUIDES: Record<CoachSubjectId, SubjectGuide> = {
  "sat-math": {
    firstQuestion:
      "masalada sizdan aynan nima topish so'ralganini va qaysi formula mos kelishini ajratib ko'rsata olasizmi?",
    hint:
      "Avval berilgan sonlarni, keyin noma'lumni yozib chiqing. SAT Math'da ko'pincha javobni to'liq hisoblash shart emas — ifodani soddalashtirish yetarli bo'ladi.",
    stepTitle: "SAT Math: chiziqli tenglamani 4 qadamda yechish",
    stepExample: [
      "**Masala:** $3x + 5 = 20$ tenglamani yeching.",
      "",
      "**1-qadam — Ozod hadni ajratish:**",
      "Ikkala tomondan $5$ ni ayiramiz:",
      "$$3x + 5 - 5 = 20 - 5$$",
      "$$3x = 15$$",
      "",
      "**2-qadam — Koeffitsiyentga bo'lish:**",
      "Ikkala tomonni $3$ ga bo'lamiz:",
      "$$x = \\frac{15}{3} = 5$$",
      "",
      "**3-qadam — Tekshirish:**",
      "$$3 \\cdot 5 + 5 = 15 + 5 = 20$$",
      "",
      "✅ **Javob:** $x = 5$",
      "",
      "**SAT shortcut:** Agar savolda $3x + 5$ emas, balki $6x + 10$ so'ralsa — bu birinchi ifodaning ikki barobari. Demak javob ham $20 \\cdot 2 = 40$ bo'ladi. Har doim ifodalar orasidagi munosabatni qidiring!",
    ].join("\n"),
  },
  "sat-rw": {
    firstQuestion:
      "matn muallifining asosiy da'vosini (claim) bitta gap bilan qanday ifodalagan bo'lardingiz?",
    hint:
      "Avval savol o'zagini toping: so'ralayotgan narsa dalil, maqsad yoki mantiqiy bog'liqlikmi? Keyin faqat shu vazifaga xizmat qiladigan variantni tanlang.",
    stepTitle: "SAT Reading & Writing: dalilga asoslangan javob strategiyasi",
    stepExample: [
      "**1-qadam — Savol turini aniqlash:**",
      "Savol sizdan *asosiy fikr*, *dalil* yoki *bog'lovchi* ni so'rayaptimi? Har bir tur o'z strategiyasiga ega.",
      "",
      "**2-qadam — Matndagi kalit gapni belgilash:**",
      "Ko'pincha javob birinchi yoki oxirgi gapda emas, balki *burilish* (however, although, yet) dan keyin keladi.",
      "",
      "**3-qadam — Variantlarni elakdan o'tkazish:**",
      "• Matnda umuman aytilmagan variantni darhol chiqarib tashlang.",
      "• Juda keng yoki juda tor da'vo qilgan variantni ham olib tashlang.",
      "• Matn aynan tasdiqlaydigan variantni tanlang.",
      "",
      "**4-qadam — Javobni matn bilan tekshirish:**",
      "Tanlagan variantingiz uchun matndan bitta aniq jumla ko'rsata olsangiz, javob to'g'ri.",
      "",
      "💡 **Muhim:** O'z bilimingizdan emas, faqat matnda berilgan dalildan kelib chiqing.",
    ].join("\n"),
  },
  ielts: {
    firstQuestion:
      "javobingizda qaysi fikrni birinchi, qaysi fikrni dalil sifatida berishni rejalashtirdingiz?",
    hint:
      "IELTS'da baho murakkab so'zlar uchun emas, aniq tuzilma va mantiqiy bog'liqlik uchun beriladi. Avval reja, keyin jumla.",
    stepTitle: "IELTS Academic: Writing va Speaking uchun tizimli yondashuv",
    stepExample: [
      "**1-qadam — Savolni parafraz qilish:**",
      "Savoldagi asosiy so'zlarni sinonimlar bilan qayta yozing. Bu Task Response uchun birinchi ball.",
      "",
      "**2-qadam — Pozitsiyani aniq aytish:**",
      "Kirish qismining oxirida \"This essay argues that...\" kabi aniq thesis bering.",
      "",
      "**3-qadam — Ikki asosiy fikr + dalil:**",
      "Har bir paragraf: Topic sentence → Explanation → Example → Link.",
      "",
      "**4-qadam — Bog'lovchilarni tabiiy qo'llash:**",
      "Furthermore, However, Consequently, In contrast — lekin har gapda emas, faqat mantiqiy o'tish joylarida.",
      "",
      "**5-qadam — Xulosa:**",
      "Yangi fikr qo'shmang. Asosiy pozitsiyani qayta tasdiqlang va istiqbol bering.",
    ].join("\n"),
  },
  "deep-math": {
    firstQuestion:
      "bu masalada qaysi kattalik o'zgaruvchi, qaysi biri esa berilgan son ekanini ajratdingizmi?",
    hint:
      "Chuqur algebra masalalarida avval tenglamani standart ko'rinishga keltiring. Keyin diskriminant yoki Viyeta teoremasi qaysi biri tezroq ishlashini tanlang.",
    stepTitle: "Chuqur algebra: kvadrat tenglamani to'liq tahlil qilish",
    stepExample: [
      "**Masala:** $x^2 - 7x + 12 = 0$",
      "",
      "**1-qadam — Standart ko'rinish:**",
      "Tenglama allaqachon $ax^2 + bx + c = 0$ ko'rinishida: $a = 1$, $b = -7$, $c = 12$.",
      "",
      "**2-qadam — Diskriminant:**",
      "$$D = b^2 - 4ac = (-7)^2 - 4 \\cdot 1 \\cdot 12 = 49 - 48 = 1$$",
      "$D > 0$ bo'lgani uchun ikkita haqiqiy ildiz bor.",
      "",
      "**3-qadam — Ildizlar:**",
      "$$x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a} = \\frac{7 \\pm 1}{2}$$",
      "$$x_1 = 4, \\qquad x_2 = 3$$",
      "",
      "**4-qadam — Viyeta teoremasi bilan tekshirish:**",
      "$$x_1 + x_2 = -\\frac{b}{a} = 7, \\qquad x_1 \\cdot x_2 = \\frac{c}{a} = 12$$",
      "$4 + 3 = 7$ va $4 \\cdot 3 = 12$ — javob to'g'ri.",
      "",
      "💡 **Chuqur tushuncha:** Viyeta teoremasi ildizlarni topmasdan ham ularning yig'indisi va ko'paytmasini beradi. SAT'da aynan shu xossa vaqtni tejaydi.",
    ].join("\n"),
  },
  admissions: {
    firstQuestion:
      "qaysi davlat universitetini (AQSH Full-Ride, Janubiy Koreya KAIST, Yevropa Stipendium Hungaricum yoki El-Yurt Umidi) va qaysi mutaxassislikni maqsad qilgansiz?",
    hint:
      "Top universitetlar faqat SAT va IELTS balliga emas, balki sizning shaxsiy hikoyangiz (Personal Statement), intellektual qiziqishingiz va jamiyatga foydali loyihalaringizga (Extracurriculars) qarab 100% grant ajratadi.",
    stepTitle: "0 dan Top Universitet va 100% Grantgacha 5 Qadamli Strategiya",
    stepExample: [
      "**1-qadam — Akademik ko'rsatkichlar (GPA + SAT + IELTS):**",
      "• Maktab/litsey baholari (GPA): **4.8+ / 5.0** bo'lishi shart.",
      "• Digital SAT: **1500+ (Math 800)** — akademik salohiyat isboti.",
      "• IELTS Academic: **Band 7.5+** (har bir bo'lim kamida 6.5–7.0).",
      "",
      "**2-qadam — Extracurricular Portfolio (Darsdan tashqari faoliyat):**",
      "10 ta tarqoq to'garakdan ko'ra, tanlagan sohangizga oid **2–3 ta chuqur loyiha** kuchliroq: fan olimpiadasi, shaxsiy IT/ilmiy loyiha, maqola yoki ijtimoiy volontyorlik tashabbusi.",
      "",
      "**3-qadam — Common App & Personal Statement (650 so'z):**",
      "• **Hook (Kirish):** O'quvchini jalb qiluvchi hayotiy lahza yoki muammo.",
      "• **Growth (Rivojlanish):** Qiyinchilikni qanday yengganingiz va nimani anglaganingiz.",
      "• **Impact & Vision (Maqsad):** Universitet resurslari orqali kelajakda qanday muammoni hal qilmoqchisiz.",
      "",
      "**4-qadam — Tavsiyanomalar (Recommendation Letters):**",
      "Sizni yaqindan taniydigan 2 nafar fan ustozi (masalan, Matematika va Ingliz tili) hamda maktab maslahatchisidan aniq misollarga boy tavsiyanoma oling.",
      "",
      "**5-qadam — Moliyaviy Grant (CSS Profile / Need-Blind / Stipendiya):**",
      "• **AQSH:** Early Action/Decision (1-Noyabr) va CSS Profile orqali 100% Full-Ride.",
      "• **Koreya & Osiyo:** KAIST / UNIST / HKUST ichki grant arizasi (100% kontrakt + stipendiya).",
      "• **Yevropa & O'zbekiston:** Stipendium Hungaricum (15-Yanvar) va \"El-Yurt Umidi\" jamg'armasi.",
    ].join("\n"),
  },
};

function buildMetadata(
  mode: AICoachMode,
  honorificUsed: string,
  socraticStep: AICoachMetadata["socraticStep"],
  extra?: Partial<AICoachMetadata>
): AICoachMetadata {
  return {
    providerUsed: "local",
    mode,
    honorificUsed,
    socraticStep,
    ...extra,
  };
}

function buildVietaAnswer(honorific: string, subjectLabel: string): string {
  return [
    `🧭 **${honorific}, Viyeta teoremasi — SAT'dagi eng kuchli 10 soniyalik qurol!**`,
    "",
    `**Asosiy formula:**`,
    `Kvadrat tenglama $ax^2 + bx + c = 0$ bo'lsa:`,
    `$$x_1 + x_2 = -\\frac{b}{a}$$`,
    `$$x_1 \\cdot x_2 = \\frac{c}{a}$$`,
    "",
    `**Nega bu ishlaydi?**`,
    `Tenglamani $a(x - x_1)(x - x_2) = 0$ ko'rinishida yozsak, qavslarni ochganda $b = -a(x_1 + x_2)$ va $c = a x_1 x_2$ hosil bo'ladi. Shu sababli yig'indi va ko'paytma formulalari to'g'ri.`,
    "",
    `**SAT misoli:**`,
    `$2x^2 - 10x + 8 = 0$ tenglamada ildizlar yig'indisini toping.`,
    `$$x_1 + x_2 = -\\frac{-10}{2} = 5$$`,
    `Javob: $5$. Ildizlarni alohida topish shart emas!`,
    "",
    `**10 soniyalik tekshirish usuli:**`,
    `1. $a$, $b$, $c$ ni yozing.`,
    `2. Yig'indi uchun $-b/a$, ko'paytma uchun $c/a$ ni hisoblang.`,
    `3. Savolda aynan nima so'ralganini tekshiring — ba'zan $x_1^2 + x_2^2$ so'raladi. U holda $(x_1 + x_2)^2 - 2x_1x_2$ dan foydalaning.`,
    "",
    `**Sizning navbatingiz:**`,
    `$3x^2 - 12x + 9 = 0$ tenglamada $x_1 + x_2$ va $x_1 \\cdot x_2$ ni topa olasizmi? Javobingizni yozing — birgalikda tekshiramiz.`,
    "",
    `_${subjectLabel} bo'yicha keyingi qadamni ham birgalikda tanlaymiz._`,
  ].join("\n");
}

function buildHardQuadratic(honorific: string): string {
  return [
    `🎯 **${honorific}, mana sizga "Hard" darajadagi kvadrat tenglama!**`,
    "",
    `**Savol:**`,
    `$$2x^2 - 8x + 5 = 0$$`,
    "",
    `**Sizdan so'raladi:**`,
    `1. Diskriminantni toping.`,
    `2. Ildizlar yig'indisi va ko'paytmasini Viyeta teoremasi orqali yozing.`,
    `3. Ildizlarning haqiqiy yoki kompleks ekanini asoslang.`,
    "",
    `**Maslahat (tayyor javob emas):**`,
    `Avval $a = 2$, $b = -8$, $c = 5$ ni yozib oling. Keyin $D = b^2 - 4ac$ formulasiga qo'ying.`,
    "",
    `**Socratic savol:**`,
    `$b^2$ va $4ac$ qiymatlarini alohida hisoblaganingizda qanday sonlar chiqadi? Yozing — keyingi qadamni birgalikda tekshiramiz.`,
    "",
    `⏱️ **SAT lifehack:** Diskriminantni hisoblashda avval $b^2$ ni, keyin $4ac$ ni alohida yozing. Bu belgi xatolarining oldini oladi.`,
  ].join("\n");
}

function buildIeltsIntro(honorific: string): string {
  return [
    `✍️ **${honorific}, IELTS Writing Task 2 uchun Band 7.5+ Introduction qolipi**`,
    "",
    `**1. Paraphrase (savolni qayta yozish):**`,
    `Savoldagi asosiy tushunchalarni sinonimlar bilan almashtiring.`,
    `> *Savol:* "Some people think online education is better than traditional education."`,
    `> *Paraphrase:* "While digital learning has become increasingly popular, many still value face-to-face instruction."`,
    "",
    `**2. Thesis statement (aniq pozitsiya):**`,
    `> *Qolip:* "This essay contends that ..., although ..."`,
    `> *Misol:* "This essay contends that a hybrid model is more effective, although online platforms offer flexibility."`,
    "",
    `**3. Outline (ikki asosiy fikr):**`,
    `> "This essay will first examine the benefits of ..., before evaluating the limitations of ..."`,
    "",
    `**To'liq tayyor qolip:**`,
    `"While some argue that [qarama-qarshi fikr], this essay contends that [sizning pozitsiyangiz]. This essay will first examine [1-fikr], before evaluating [2-fikr]."`,
    "",
    `**Band 7.5+ uchun 3 muhim qoida:**`,
    `1. Kirishda savolni so'zma-so'z takrorlamang — parafraz qiling.`,
    `2. Thesis aniq bo'lsin: o'quvchi sizning pozitsiyangizni birinchi o'qishda tushunsin.`,
    `3. Xulosa va kirish bir-biriga mos bo'lsin.`,
    "",
    `**Sizning navbatingiz:**`,
    `Qaysi mavzu bo'yicha kirish yozmoqchisiz? Mavzuni yuboring — birgalikda sizning shaxsiy qolipingizni tuzamiz.`,
  ].join("\n");
}

function buildCommandOfEvidence(honorific: string): string {
  return [
    `🔎 **${honorific}, "Command of Evidence" savollarining siri — dalilni emas, savol vazifasini o'qish!**`,
    "",
    `**1-qadam — Savol nima so'rayotganini aniqlang:**`,
    `Bu turdagi savollar ikki xil bo'ladi:`,
    `• **Dalilni tanlash:** qaysi jumla da'voni eng yaxshi qo'llab-quvvatlaydi?`,
    `• **Grafik/jadval:** qaysi ma'lumot da'voga mos keladi?`,
    "",
    `**2-qadam — Da'voni toping:**`,
    `Avval muallifning asosiy fikrini bitta gapda yozing. Bu sizning "filtr"ingiz bo'ladi.`,
    "",
    `**3-qadam — Har bir variantni da'voga bog'lang:**`,
    `Variant da'voni **to'g'ridan-to'g'ri** qo'llab-quvvatlashi kerak. Mavzuga aloqador, lekin da'voni isbotlamaydigan variant — tuzoq.`,
    "",
    `**4-qadam — Eng kuchli dalilni tanlang:**`,
    `Aniq raqam, tadqiqot natijasi yoki muallifning bevosita misoli — umumiy gapdan kuchliroq.`,
    "",
    `**Tipik tuzoqlar:**`,
    `• Matnda bor, lekin savolga javob bermaydigan jumla.`,
    `• Haddan tashqari keng umumlashtirish.`,
    `• Grafikdagi noto'g'ri o'qilgan qiymat.`,
    "",
    `**Sizning navbatingiz:**`,
    `Mashq uchun kichik passage va savol yuboring — men variantlarni birma-bir elakdan o'tkazishni ko'rsataman.`,
  ].join("\n");
}

function buildErrorAnalysis(honorific: string, subjectLabel: string): string {
  return [
    `🩺 **${honorific}, xatoni jazolamaymiz — uni 3 qatlamda tahlil qilamiz.**`,
    "",
    `**1-qatlam — Bilim xatosi:**`,
    `Qoida yoki formulani noto'g'ri eslab qolganmisiz? Masalan, ishora ($+$ / $-$) yoki kasr qoidasi.`,
    "",
    `**2-qatlam — Mantiq xatosi:**`,
    `Qoida to'g'ri, lekin uni noto'g'ri joyda qo'llaganmisiz? Masalan, tenglamaning faqat bir tomonini o'zgartirish.`,
    "",
    `**3-qatlam — Diqqat xatosi:**`,
    `Hisob-kitob to'g'ri, lekin savol shartini noto'g'ri o'qiganmisiz? Vaqt bosimi ostida bu eng ko'p uchraydigan holat.`,
    "",
    `**Xatoni topish uchun 3 savol:**`,
    `1. Yechimning qaysi qadamida to'xtab qoldingiz?`,
    `2. O'sha qadamda qaysi qoidaga tayandingiz?`,
    `3. Javobni teskarisi bilan tekshirsangiz, tenglik chiqadimi?`,
    "",
    `**${subjectLabel} bo'yicha mashq:**`,
    `O'z yechimingizni qadam-baqadam yozib yuboring. Men aynan qaysi qatlamda xato bo'lganini ko'rsataman va to'g'ri yo'lni birgalikda topamiz.`,
    "",
    `💡 **Muhim:** Xato — bu sizning eng qimmat o'quv materialingiz. Har bir xatoni daftarga yozib borsangiz, 2 haftada naqshni ko'rasiz.`,
  ].join("\n");
}

function buildMotivation(honorific: string): string {
  return [
    `🌿 **${honorific}, siz juda yaxshi mehnat qilyapsiz!**`,
    "",
    `Katta maqsad yo'lida charchash — bu zaiflik emas, bu tanangizning "dam olish vaqti" degan signali.`,
    "",
    `☕ **Ustozdan 10 daqiqalik tanaffus tavsiyasi:**`,
    `1. Hozir ekrandan 10 daqiqaga uzoqlashing.`,
    `2. Bir stakan iliq suv iching va 5 marta chuqur nafas oling.`,
    `3. Ko'zingizni yuming yoki derazadan uzoqqa qarang.`,
    `4. Qaytganingizda eng oson mashqdan boshlang — miya "g'alaba" bilan qayta ishga tushadi.`,
    "",
    `**Bugungi kichik maqsad:**`,
    `Faqat 25 daqiqa. Pomodoro taymerini qo'ying va bitta mashqni bajaring. Boshlash eng qiyin qism — qolganini birgalikda qilamiz.`,
    "",
    `Tayyor bo'lganingizda "davom etamiz" deb yozing, yangi kuch bilan o'qishni davom ettiramiz! ✨`,
  ].join("\n");
}

function estimateWritingRubric(text: string): WritingRubricBreakdown {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = text.toLowerCase();
  const connectors = [
    "however",
    "furthermore",
    "moreover",
    "therefore",
    "consequently",
    "in contrast",
    "although",
    "whereas",
    "not only",
    "in conclusion",
  ].filter((word) => lower.includes(word)).length;
  const complexWords = [
    "beneficial",
    "significant",
    "essential",
    "effective",
    "collaborative",
    "replicate",
    "cultivate",
    "consequently",
    "nevertheless",
    "substantial",
  ].filter((word) => lower.includes(word)).length;

  const base =
    4.5 +
    Math.min(1.6, wordCount / 160) +
    Math.min(0.8, connectors * 0.22) +
    Math.min(0.8, complexWords * 0.18);
  const band = Math.min(8.5, Math.max(4.5, base));

  const taskAchievement = Math.min(9, Math.max(4, band - 0.3));
  const coherenceCohesion = Math.min(9, Math.max(4, band + (connectors >= 3 ? 0.2 : -0.1)));
  const lexicalResource = Math.min(9, Math.max(4, band + (complexWords >= 3 ? 0.3 : 0)));
  const grammaticalRange = Math.min(9, Math.max(4, band - 0.1));

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wordCount >= 120) {
    strengths.push(`Matn hajmi yetarli: ${wordCount} ta so'z.`);
  } else {
    improvements.push("Matn hajmini oshiring: IELTS Task 2 uchun kamida 250 so'z maqsad qiling.");
  }
  if (connectors >= 3) {
    strengths.push("Bog'lovchilar mantiqiy va tabiiy qo'llangan.");
  } else {
    improvements.push("Paragraflar orasiga «However», «Furthermore», «Consequently» kabi bog'lovchilar qo'shing.");
  }
  if (complexWords >= 3) {
    strengths.push("Akademik leksika boy va mavzuga mos.");
  } else {
    improvements.push("Oddiy so'zlar o'rniga akademik sinonimlardan foydalaning.");
  }
  if (improvements.length === 0) {
    improvements.push("Xulosa va kirishdagi pozitsiya bir-biriga mosligini yana bir bor tekshiring.");
  }

  return {
    estimatedBand: band.toFixed(1),
    wordCount,
    taskAchievement: Number(taskAchievement.toFixed(1)),
    coherenceCohesion: Number(coherenceCohesion.toFixed(1)),
    lexicalResource: Number(lexicalResource.toFixed(1)),
    grammaticalRange: Number(grammaticalRange.toFixed(1)),
    strengthsUz: strengths,
    improvementsUz: improvements,
    socraticRewriteChallengeUz:
      "Kirish paragrafingizdagi asosiy da'voni «Not only does ..., but it also ...» inversiya qolipi bilan qayta yozib ko'ring.",
  };
}

function buildWritingReview(text: string, honorific: string): SmartFallbackResult {
  const rubric = estimateWritingRubric(text);
  const reply = [
    `✨ **Ofarin, ${honorific}! Yozma ishingizni diqqat bilan o'qib chiqdim.**`,
    "",
    `📊 **IELTS Writing tahlil natijasi:**`,
    `• **Taxminiy umumiy ball:** **Band ${rubric.estimatedBand}**`,
    `• **So'zlar soni:** ${rubric.wordCount} ta so'z`,
    `• **Task Achievement:** ${rubric.taskAchievement.toFixed(1)}/9.0`,
    `• **Coherence & Cohesion:** ${rubric.coherenceCohesion.toFixed(1)}/9.0`,
    `• **Lexical Resource:** ${rubric.lexicalResource.toFixed(1)}/9.0`,
    `• **Grammatical Range:** ${rubric.grammaticalRange.toFixed(1)}/9.0`,
    "",
    `🌟 **Kuchli tomonlaringiz:**`,
    ...rubric.strengthsUz.map((item) => `• ${item}`),
    "",
    `🎯 **O'sish nuqtalari:**`,
    ...rubric.improvementsUz.map((item) => `• ${item}`),
    "",
    `🧭 **Socratic vazifa:**`,
    rubric.socraticRewriteChallengeUz,
  ].join("\n");

  return {
    reply,
    metadata: buildMetadata("WRITING_REVIEW", honorific, "WRITING_FEEDBACK", {
      writingRubric: rubric,
    }),
  };
}

function buildSocraticOpening(
  honorific: string,
  subjectId: CoachSubjectId,
  subjectLabel: string
): SmartFallbackResult {
  const guide = SUBJECT_GUIDES[subjectId];
  const reply = [
    `🧭 **${honorific}, bu savolni birgalikda ochamiz!**`,
    "",
    `Men sizga tayyor javobni darhol berib qo'ymayman — avval siz o'ylab ko'rasiz, keyin birgalikda tekshiramiz.`,
    "",
    `**Yo'naltiruvchi savol:** ${subjectLabel} bo'yicha ${guide.firstQuestion}`,
    "",
    `**Maslahat:** ${guide.hint}`,
    "",
    `Javobingizni yozing — keyin har bir qadamni birgalikda ko'rib chiqamiz! ✨`,
  ].join("\n");

  return {
    reply,
    metadata: buildMetadata("SOCRATIC_TUTOR", honorific, "GUIDING_QUESTION"),
  };
}

function withPaceNote(
  result: SmartFallbackResult,
  pace?: "SODDA" | "STANDART" | "TEZKOR" | null
): SmartFallbackResult {
  if (pace === "SODDA") {
    return {
      ...result,
      reply: [
        result.reply,
        "",
        `🪜 **0 dan Sodda Xulosa:** Avval 1-qadamni daftarga yozib ko'ring — birorta joyi tushunarsiz bo'lsa, pastdagi **«Yanada soddaroq tushuntir»** tugmasini bosing!`,
      ].join("\n"),
    };
  }
  if (pace === "TEZKOR") {
    return {
      ...result,
      reply: [
        result.reply,
        "",
        `⚡ **10 Soniyalik Imtihon Siri:** Real testda avval savol oxirini o'qing va 50/50 usuli bilan 2 ta mantiqsiz variantni chiqarib tashlang.`,
      ].join("\n"),
    };
  }
  return result;
}

export function buildSmartFallback(params: SmartFallbackParams): SmartFallbackResult {
  const { subjectId, subjectLabel, mode, message, honorific, turnIndex, pace } = params;
  const parsed = extractPaceDirective(message);
  const cleanMessage = parsed.coreQuestion;
  const effectivePace = pace ?? parsed.paceHint;
  const lower = cleanMessage.toLowerCase();
  const learnedHonorific = turnIndex > 0 ? `Bilimdon ${honorific}` : honorific;
  const isFatigue =
    /(charcha|charchadim|boshim og|bosh og|tanaffus|dam ol|uyqum|kuchim yo)/i.test(
      lower
    );

  if (mode === "WRITING_REVIEW") {
    return buildWritingReview(cleanMessage, learnedHonorific);
  }

  if (mode === "MOTIVATION" || isFatigue) {
    return {
      reply: buildMotivation(learnedHonorific),
      metadata: buildMetadata(mode, learnedHonorific, "WELLNESS_CARE", {
        fatigueDetected: true,
      }),
    };
  }

  if (
    mode === "ERROR_EXPLAINER" ||
    /(xato|adash|noto'g'ri yech|qayerda xato)/i.test(lower)
  ) {
    const isSocratic = mode === "SOCRATIC_TUTOR";
    return withPaceNote({
      reply: buildErrorAnalysis(learnedHonorific, subjectLabel),
      metadata: buildMetadata(
        mode,
        learnedHonorific,
        isSocratic ? "GUIDING_QUESTION" : "STEP_BY_STEP"
      ),
    }, effectivePace);
  }

  if (/(viyet|vieta|ildizlar yig|ildizlar ko'payt)/i.test(lower)) {
    return withPaceNote({
      reply: buildVietaAnswer(learnedHonorific, subjectLabel),
      metadata: buildMetadata(
        mode,
        learnedHonorific,
        mode === "SOCRATIC_TUTOR" ? "GUIDING_QUESTION" : "STEP_BY_STEP"
      ),
    }, effectivePace);
  }

  if (/(kvadrat|quadratic)/i.test(lower) && /(qiyin|hard|savol|sinab)/i.test(lower)) {
    return withPaceNote({
      reply: buildHardQuadratic(learnedHonorific),
      metadata: buildMetadata(
        mode,
        learnedHonorific,
        mode === "SOCRATIC_TUTOR" ? "GUIDING_QUESTION" : "STEP_BY_STEP"
      ),
    }, effectivePace);
  }

  if (/command of evidence|dalilga asos|dalil savol/i.test(lower)) {
    return withPaceNote({
      reply: buildCommandOfEvidence(learnedHonorific),
      metadata: buildMetadata(
        mode,
        learnedHonorific,
        mode === "SOCRATIC_TUTOR" ? "GUIDING_QUESTION" : "STEP_BY_STEP"
      ),
    }, effectivePace);
  }

  if (/(introduction|kirish|writing task 2|qolip)/i.test(lower)) {
    return withPaceNote({
      reply: buildIeltsIntro(learnedHonorific),
      metadata: buildMetadata(
        mode,
        learnedHonorific,
        mode === "SOCRATIC_TUTOR" ? "GUIDING_QUESTION" : "STEP_BY_STEP"
      ),
    }, effectivePace);
  }

  if (
    subjectId === "admissions" ||
    /(universitet|grant|full-ride|common app|personal statement|css profile|kaist|harvard|mit|stipendium|el-yurt|portfolio|motivatsion)/i.test(
      lower
    )
  ) {
    if (mode === "SOCRATIC_TUTOR" && turnIndex === 0) {
      return withPaceNote(
        buildSocraticOpening(honorific, "admissions", "Universitet & Grant Yo'li"),
        effectivePace
      );
    }
    const admGuide = SUBJECT_GUIDES.admissions;
    const reply = [
      `🎓 **${learnedHonorific}, Universitet va 100% Grant Mentori tahlili:**`,
      "",
      `**${admGuide.stepTitle}**`,
      "",
      admGuide.stepExample,
      "",
      `**Amaliy keyingi qadam:**`,
      `Hozirgi sinfingiz, taxminiy SAT/IELTS darajangiz va qiziqqan sohangizni (masalan: *Computer Science, Iqtisodiyot, Muhandislik, Tibbiyot*) yozing — men siz uchun mos Top-5 universitetlar ro'yxati va Personal Statement g'oyasini tuzib beraman!`,
    ].join("\n");
    return withPaceNote({
      reply,
      metadata: buildMetadata(mode, learnedHonorific, "STEP_BY_STEP"),
    }, effectivePace);
  }

  if (mode === "SOCRATIC_TUTOR" && turnIndex === 0) {
    return withPaceNote(
      buildSocraticOpening(honorific, subjectId, subjectLabel),
      effectivePace
    );
  }

  if (mode === "FAST_SOLUTION") {
    const reply = [
      `⚡ **${learnedHonorific}, tezkor yechim rejimi yoqildi.**`,
      "",
      `**1. Savolda nima so'ralganini belgilang:**`,
      `Ko'pincha SAT va IELTS'da to'liq hisoblash emas, ifodani tanib olish so'raladi.`,
      "",
      `**2. Berilganlar orasidagi munosabatni qidiring:**`,
      `Agar bitta ifoda boshqasining ko'paytmasi, yig'indisi yoki kvadrati bo'lsa — to'g'ridan-to'g'ri o'sha munosabatdan foydalaning.`,
      "",
      `**3. Javobni orqaga qaytarib tekshiring:**`,
      `Topilgan qiymatni tenglamaga qo'ying. Bu 5 soniya vaqt oladi, lekin xatoni butunlay yo'q qiladi.`,
      "",
      `**Sizning navbatingiz:**`,
      `Aniq masalani yuboring — men eng qisqa yechim yo'lini ko'rsataman.`,
    ].join("\n");
    return withPaceNote({
      reply,
      metadata: buildMetadata(mode, learnedHonorific, "STEP_BY_STEP"),
    }, effectivePace);
  }

  const guide = SUBJECT_GUIDES[subjectId];
  const reply = [
    `📘 **${learnedHonorific}, ${subjectLabel} bo'yicha qadamma-qadam tushuntirish.**`,
    "",
    `**${guide.stepTitle}**`,
    "",
    guide.stepExample,
    "",
    `**Sizning navbatingiz:**`,
    `Shu usulni o'zingiz bitta misolda qo'llab ko'ring. Javobingizni yuboring — qaysi qadamda qiynalayotganingizni aniqlab, keyingi mashqni shaxsiylashtiraman.`,
  ].join("\n");

  return withPaceNote({
    reply,
    metadata: buildMetadata(mode, learnedHonorific, "STEP_BY_STEP"),
  }, effectivePace);
}
