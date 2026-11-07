"use client";

import { useCallback, useEffect, useState } from "react";
import { loadSecureLocal, saveSecureLocal } from "@/lib/security/client-storage";

export type LearningPaceMode = "SODDA" | "STANDART" | "TEZKOR";

export interface LearningPaceOption {
  id: LearningPaceMode;
  badge: string;
  title: string;
  whoFor: string;
  summary: string;
  dailyPlan: string;
  aiPromptPrefix: string;
}

export const LEARNING_PACE_OPTIONS: LearningPaceOption[] = [
  {
    id: "SODDA",
    badge: "0 DAN BOSHLOVCHI",
    title: "0 dan Sodda Tilda",
    whoFor: "7–11-sinf, poydevorini mustahkamlamoqchi yoki endi boshlagan o'quvchilar uchun",
    summary:
      "Qiyin ilmiy so'zlarsiz, hayotiy o'xshatishlar va 1 → 2 → 3 tartibdagi eng sodda qadamlar bilan tushuntiriladi.",
    dailyPlan: "Kuniga 35–45 daq: 15 daq ovozli qoida + 15 daq namuna misol + 10 daq oson mashq",
    aiPromptPrefix:
      "[O'quvchi darajasi: 0 dan boshlovchi. Iltimos, juda sodda o'zbek tilida, hayotiy o'xshatish va 1-2-3 qadamlar bilan tushuntir]: ",
  },
  {
    id: "STANDART",
    badge: "O'RTA TIZIMLI",
    title: "Bosqichma-Bosqich Metod",
    whoFor: "Bazaviy bilimi bor va tizimli ravishda yuqori ballga chiqmoqchi bo'lganlar uchun",
    summary:
      "Asosiy qoida → Formula ma'nosi → Yechilgan namuna → Mustaqil mashq va xatolar tahlili ketma-ketligida olib boradi.",
    dailyPlan: "Kuniga 60 daq: 20 daq metodlar + 25 daq amaliyot + 15 daq Talaba AI tahlili",
    aiPromptPrefix:
      "[O'quvchi darajasi: O'rta tizimli. Qoida, formula va qadamma-qadam yechim mantiqini ko'rsat]: ",
  },
  {
    id: "TEZKOR",
    badge: "IMTIHON SIRI",
    title: "10 Soniyalik Tezkor Usul",
    whoFor: "SAT 1500+ va IELTS 7.5+ maqsad qilgan, vaqtni tejash va tuzoqlarni bilmoqchi bo'lganlar uchun",
    summary:
      "Imtihon tuzoqlari, xato javoblarni chiqarib tashlash (50/50 Elimination), Desmos sirlari va Band 8.0 qoliplariga urg'u beradi.",
    dailyPlan: "Kuniga 90 daq: 15 daq SAT/IELTS tuzoqlari + 50 daq taymerli test + 25 daq xato tahlili",
    aiPromptPrefix:
      "[O'quvchi darajasi: Yuqori / SAT 1500+ & IELTS 7.5+. Eng tezkor imtihon usuli va tipik tuzoqlarni ko'rsat]: ",
  },
];

export interface StudentPersonaTrack {
  id: string;
  title: string;
  subtitle: string;
  recommendedPace: LearningPaceMode;
  dailyMinutes: number;
  firstHref: string;
  firstButtonLabel: string;
  steps: Array<{
    step: string;
    title: string;
    detail: string;
    href: string;
    actionText: string;
  }>;
}

export const STUDENT_PERSONA_TRACKS: StudentPersonaTrack[] = [
  {
    id: "zero-start",
    title: "1. Mutlaqo 0 dan boshlayapman",
    subtitle: "Nimadan boshlashni bilmayman, menga aniq va oson yo'l kerak",
    recommendedPace: "SODDA",
    dailyMinutes: 45,
    firstHref: "/placement",
    firstButtonLabel: "1-Qadam: 5 daqiqalik Diagnostika Testidan o'tish",
    steps: [
      {
        step: "01",
        title: "Hozirgi darajangizni 5 daqiqada aniqlang",
        detail: "6 tagina savol orqali tizim sizning hozirgi nuqtangizni va 4 choraklik shaxsiy rejangizni tuzib beradi.",
        href: "/placement",
        actionText: "Diagnostikani ochish",
      },
      {
        step: "02",
        title: "Matematikani 1-moduldan sodda grafiklar bilan boshlang",
        detail: "Yodlamang — tarozi o'xshatishi va jonli harakatlanuvchi chizmalar bilan formulani o'zingiz ko'rasiz.",
        href: "/math",
        actionText: "1-modulga kirish",
      },
      {
        step: "03",
        title: "Har bir darsda ovozli tinglash va qoida kartalaridan foydalaning",
        detail: "Uzun matn o'qish shart emas: har bir qoida alohida kartaga bo'lingan va Talaba AI uni ovozli o'qib beradi.",
        href: "/learn",
        actionText: "Oson darslarni ko'rish",
      },
      {
        step: "04",
        title: "Tushunmagan joyingizni uyalmasdan Talaba AI dan so'rang",
        detail: "«Menga yanada soddaroq tushuntir» tugmasini bossangiz, AI Ustoz barmoqda sanagandek tushuntirib beradi.",
        href: "/coach",
        actionText: "Talaba AI ga o'tish",
      },
    ],
  },
  {
    id: "math-boost",
    title: "2. Matematikaga tez moslashmoqchiman",
    subtitle: "Formulalarni unutib qo'yaman, masalani ko'rsam qayerdan boshlashni bilmayman",
    recommendedPace: "SODDA",
    dailyMinutes: 60,
    firstHref: "/math",
    firstButtonLabel: "Matematika Akademiyasini 1-moduldan boshlash",
    steps: [
      {
        step: "01",
        title: "6 Bosqichli Matematika Metodini 1-moduldan oching",
        detail: "Har bir mavzu: 1. Hayotiy ma'no → 2. Formula siri → 3. Jonli SVG grafik → 4. Tuzoqlar → 5. Mashq → 6. Xulosa.",
        href: "/math",
        actionText: "Matematikani ochish",
      },
      {
        step: "02",
        title: "Slayderlarni surib grafik qanday o'zgarishini ko'ring",
        detail: "3-tabdagi a, b, c sonlarini o'zgartirganingizda chiziq va parabola ko'z oldingizda jonlanadi.",
        href: "/math",
        actionText: "Vizual modelni ko'rish",
      },
      {
        step: "03",
        title: "Oson filtrdagi SAT Math savollarida 50/50 va Maslahatni ishlating",
        detail: "Amaliyot bo'limida «Oson» filtrini yoqing va «💡 Maslahat» yordamida birinchi yechimlarni bajaring.",
        href: "/practice?subject=sat-math",
        actionText: "Oson mashq ishlash",
      },
      {
        step: "04",
        title: "Xato chiqqan misolni Talaba AI bilan tahlil qiling",
        detail: "Xato — eng yaxshi ustoz: AI qaysi qadamda ishora almashganini topib, xotira qoidasini beradi.",
        href: "/coach",
        actionText: "Xatoni tahlil qilish",
      },
    ],
  },
  {
    id: "ielts-english",
    title: "3. IELTS 7.5+ va SAT English kerak",
    subtitle: "Reading matnlarida vaqt yetmaydi va Writing Task 2 inshosini boshlashga qiynalaman",
    recommendedPace: "STANDART",
    dailyMinutes: 60,
    firstHref: "/practice?subject=ielts",
    firstButtonLabel: "IELTS Reading & Writing Markazini ochish",
    steps: [
      {
        step: "01",
        title: "IELTS Academic va SAT R&W qoida kartalarini o'rganing",
        detail: "Uzun matnni to'liq o'qimasdan kalit so'zlar (Skimming & Scanning) orqali javob topish usulini o'rganing.",
        href: "/learn",
        actionText: "Ingliz tili darslari",
      },
      {
        step: "02",
        title: "Writing Task 2 Simulyatorida tayyor 4-abzas qolipini oling",
        detail: "«Tayyor Insho Qolipi» tugmasi orqali Kirish, 2 ta Asosiy abzas va Xulosa yozish tartibini darhol ko'rasiz.",
        href: "/practice?subject=ielts",
        actionText: "Writing Simulyatori",
      },
      {
        step: "03",
        title: "50/50 usuli bilan tuzoq (Distractor) javoblarni ajrating",
        detail: "Reading savollarida ikkita chalg'ituvchi variantni olib tashlab, dalilga asoslanib javob belgilang.",
        href: "/practice?subject=sat-rw",
        actionText: "SAT R&W mashqlari",
      },
      {
        step: "04",
        title: "Yozgan inshoingizni 4 mezon bo'yicha AI tekshiruvidan o'tkazing",
        detail: "Task Response, Coherence, Lexical Resource va Grammar bo'yicha Band Score hamda tuzatish oling.",
        href: "/coach",
        actionText: "Insho tekshirtirish",
      },
    ],
  },
  {
    id: "full-grant",
    title: "4. SAT 1500+ va 100% Xalqaro Grant",
    subtitle: "Top universitetlarga to'liq grant yutish uchun 12 oylik aniq strategiya kerak",
    recommendedPace: "TEZKOR",
    dailyMinutes: 90,
    firstHref: "/roadmap",
    firstButtonLabel: "12 Oylik Xarita va Grant Yo'lini ochish",
    steps: [
      {
        step: "01",
        title: "12 Oylik Xarita va 5 Davlat Grant Talablarini ko'rib chiqing",
        detail: "AQSh Full-Ride, Koreya KAIST, Yevropa Stipendium, Yaqin Sharq va El-Yurt Umidi muddatlari bitta joyda.",
        href: "/learn",
        actionText: "Grantlar Atlasini ko'rish",
      },
      {
        step: "02",
        title: "Kunlik rejangizni Profil → 12 Oylik Xarita bo'limida belgilang",
        detail: "Har hafta qaysi dars, qaysi mashq va qachon Mock test ishlashingiz haftama-hafta yozib qo'yilgan.",
        href: "/profile?tab=roadmap",
        actionText: "Haftalik rejani ochish",
      },
      {
        step: "03",
        title: "Qiyin (750+) filtrda taymer bilan real imtihon mashqlarini ishlang",
        detail: "Bluebook formatida Reference Sheet va Qoralama (Scratchpad) bilan tezlikni chiniqtiring.",
        href: "/practice?subject=sat-math",
        actionText: "750+ savollarni ishlash",
      },
      {
        step: "04",
        title: "Talaba AI bilan Personal Statement va universitet ro'yxatini tuzing",
        detail: "«Universitet & 100% Grant Yo'li» fanini tanlab, o'zingizga mos Reach/Match/Safety OTM ro'yxatini oling.",
        href: "/coach",
        actionText: "Grant Mentorini ochish",
      },
    ],
  },
];

const PACE_STORAGE_KEY = "3talaba_learning_pace_v1";
const PACE_EVENT_NAME = "3talaba-pace-change";

export function useLearningAdaptation() {
  const [pace, setPaceState] = useState<LearningPaceMode>("SODDA");

  useEffect(() => {
    const saved = loadSecureLocal<{ pace?: LearningPaceMode }>(PACE_STORAGE_KEY);
    if (saved?.pace && ["SODDA", "STANDART", "TEZKOR"].includes(saved.pace)) {
      setPaceState(saved.pace);
    }

    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<LearningPaceMode>;
      if (custom.detail) {
        setPaceState(custom.detail);
      }
    };

    window.addEventListener(PACE_EVENT_NAME, handleSync);
    return () => window.removeEventListener(PACE_EVENT_NAME, handleSync);
  }, []);

  const setPace = useCallback((next: LearningPaceMode) => {
    setPaceState(next);
    saveSecureLocal(PACE_STORAGE_KEY, { pace: next });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent<LearningPaceMode>(PACE_EVENT_NAME, { detail: next }));
    }
  }, []);

  const activeOption =
    LEARNING_PACE_OPTIONS.find((opt) => opt.id === pace) ?? LEARNING_PACE_OPTIONS[0]!;

  return {
    pace,
    setPace,
    activeOption,
    options: LEARNING_PACE_OPTIONS,
  };
}

/**
 * Formuladagi matematik belgilarni 0-dan boshlovchi o'quvchi uchun oddiy o'zbek tilida izohlab beradi.
 */
export function explainFormulaSimply(formula: string): string {
  const hints: string[] = [];
  if ((/\bm\s*x\b|\bm\b/.test(formula) && /\bb\b/.test(formula)) || /\bm\s*=/.test(formula)) {
    hints.push("m — o'zgarish tezligi (qiyalik), b — boshlang'ich qiymat");
  }
  if (/b\^2\s*-\s*4ac|b²\s*-\s*4ac|D\s*=/.test(formula)) {
    hints.push("D > 0 bo'lsa 2 ta yechim, D = 0 bo'lsa 1 ta yechim, D < 0 bo'lsa haqiqiy yechim yo'q");
  }
  if (/x[₁1]\s*\+\s*x[₂2]/.test(formula)) {
    hints.push("x₁ va x₂ — tenglamaning ikkita javobi (ildizlari)");
  }
  if (/\^2|²/.test(formula)) {
    hints.push("kvadrat (² ) — sonni o'zini o'ziga ko'paytirish degani");
  }
  if (/√|sqrt/i.test(formula)) {
    hints.push("«√» kvadrat ildiz — qaysi musbat sonni o'ziga ko'paytirsak shu son chiqishini bildiradi");
  }
  if (/±/.test(formula)) {
    hints.push("«±» ishorasi formulani bir marta qo'shib (+), bir marta ayirib (-) hisoblashni anglatadi");
  }
  if (/\//.test(formula)) {
    hints.push("«/» kasr chizig'i — chap qismni o'ng qismga bo'lish amali");
  }
  if (/≠/.test(formula)) {
    hints.push("«≠» teng emas (masalan, maxraj 0 bo'lishi mumkin emas)");
  }
  if (hints.length === 0) {
    return "Qiymatlarni harflar o'rniga qavs bilan qo'ying va amallarni chapdan o'ngga hisoblang.";
  }
  return hints.join(" • ");
}
