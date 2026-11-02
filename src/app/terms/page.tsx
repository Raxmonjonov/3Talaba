import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { CONTACTS } from "@/lib/site-config";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Foydalanish shartlari",
  description: "3Talaba Campus platformasidan foydalanish shartlari.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Umumiy qoidalar",
    body: "3Talaba Campus platformasida ro'yxatdan o'tish yoki undan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz. Shartlarga rozi bo'lmasangiz, platformadan foydalanmang.",
  },
  {
    heading: "Hisob va xavfsizlik",
    body: "Ro'yxatdan o'tishda to'g'ri ma'lumot kiritishingiz va parolingizni maxfiy saqlashingiz shart. Hisobingiz orqali amalga oshirilgan barcha harakatlar uchun o'zingiz javobgarsiz.",
  },
  {
    heading: "Ta'lim kontenti",
    body: "Darslar, savollar banki, mock testlar va AI tushuntirishlari faqat shaxsiy o'quv maqsadlarida foydalanish uchun taqdim etiladi. Kontentni nusxalash, tarqatish yoki tijoriy maqsadda ishlatish taqiqlanadi.",
  },
  {
    heading: "Natijalar",
    body: "Platforma tizimli 12 oylik tayyorgarlik yo'lini taqdim etadi. Imtihon natijalari (SAT, IELTS) va universitetga qabul o'quvchining shaxsiy mehnatiga bog'liq bo'lib, aniq ball kafolatlanmaydi.",
  },
  {
    heading: "To'lov va obuna",
    body: "Pro Campus oylik obuna asosida ishlaydi. Obunani istalgan vaqtda bekor qilishingiz mumkin; bekor qilingandan so'ng keyingi davr uchun to'lov olinmaydi.",
  },
  {
    heading: "Aloqa",
    body: `Shartlar bo'yicha savollaringiz bo'lsa, ${CONTACTS.email.handle} manziliga yoki ${CONTACTS.supportBot.handle} botiga murojaat qiling.`,
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Foydalanish shartlari"
      updatedAt="2026-yil noyabr"
      intro="Ushbu hujjat 3Talaba Campus ta'lim platformasidan foydalanish tartibini belgilaydi."
      sections={SECTIONS}
    />
  );
}
