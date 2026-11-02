import { BRAND, TARGETS } from "@/lib/site-config";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** FAQ ma'lumotlari — accordion va SEO (FAQPage JSON-LD) uchun yagona manba. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "ai-coach",
    question: `${BRAND.aiName} murabbiyi qanday ishlaydi?`,
    answer: `${BRAND.aiName} Sokratik usulda ishlaydi: tayyor javobni darhol bermaydi, balki yo'naltiruvchi savollar va qisqa ishoralar orqali sizni mustaqil yechimga olib boradi. U xatolaringizni tahlil qiladi, mavzuni o'zbek tilida (kerak bo'lsa ovoz bilan) tushuntiradi va 12 oylik xaritangizdagi zaif mavzularni takrorlashga yo'naltiradi.`,
  },
  {
    id: "prerequisites",
    question: "Kursni boshlash uchun ingliz tili va matematikadan qanday daraja kerak?",
    answer:
      "Samarali boshlash uchun bazaviy maktab matematikasi va ingliz tilidan A2/B1 daraja tavsiya etiladi. Darajangiz pastroq bo'lsa ham, bepul Diagnostika testi natijasiga ko'ra tizim sizga poydevor modullaridan boshlanadigan shaxsiy reja tuzib beradi.",
  },
  {
    id: "mobile",
    question: "Telefon orqali ham darslarni bajarsa bo'ladimi?",
    answer:
      "Ha. Platforma to'liq moslashuvchan (responsive) — darslar, kunlik mashqlar, AI murabbiy va ovozli tushuntirishlar telefon brauzerida ham qulay ishlaydi. Full Mock testlarni esa imtihon sharoitiga yaqinlashtirish uchun kompyuterda topshirish tavsiya etiladi.",
  },
  {
    id: "results",
    question: "12 oyda natija bo'lmasa nima bo'ladi?",
    answer: `${TARGETS.program} — bu kafolatlangan ball emas, balki tizimli yo'l. Natija kunlik reja bajarilishiga bog'liq. Agar rejani muntazam bajarib, maqsadingizga (masalan, ${TARGETS.sat} yoki ${TARGETS.ielts}) yetmasangiz, Mock test natijalaringiz asosida zaif bo'limlar uchun qayta reja tuziladi va qo'llab-quvvatlash jamoamiz bilan individual yechim topiladi.`,
  },
  {
    id: "payment",
    question: "To'lov qanday amalga oshiriladi?",
    answer:
      "Boshlang'ich tarif butunlay bepul. Pro Campus oylik obuna sifatida onlayn — bank kartasi yoki mahalliy to'lov tizimlari orqali to'lanadi. Obunani istalgan vaqtda bekor qilishingiz mumkin — keyingi oy uchun to'lov olinmaydi. To'lov bo'yicha savollar uchun Support botga yozing.",
  },
];
