import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { CONTACTS } from "@/lib/site-config";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati",
  description: "3Talaba Campus platformasida shaxsiy ma'lumotlar qanday yig'ilishi va himoyalanishi.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Qanday ma'lumotlar yig'iladi",
    body: "Ro'yxatdan o'tishda kiritilgan ism, email va o'quv maqsadlaringiz; diagnostika va mashq natijalari; Talaba AI murabbiy bilan suhbatlar hamda platformadan foydalanish statistikasi.",
  },
  {
    heading: "Ma'lumotlardan foydalanish",
    body: "Ma'lumotlar shaxsiy 12 oylik yo'l xaritasini tuzish, progressni kuzatish, AI tushuntirishlarni moslashtirish va xizmat sifatini yaxshilash uchun ishlatiladi.",
  },
  {
    heading: "Uchinchi shaxslar",
    body: "Shaxsiy ma'lumotlaringiz sotilmaydi. Ular faqat xizmatni ko'rsatish uchun zarur bo'lgan texnik hamkorlarga (hosting, AI xizmati, to'lov tizimi) minimal hajmda uzatilishi mumkin.",
  },
  {
    heading: "Xavfsizlik",
    body: "Parollar shifrlangan holda saqlanadi, ma'lumotlar himoyalangan ulanish (HTTPS) orqali uzatiladi.",
  },
  {
    heading: "Sizning huquqlaringiz",
    body: `Ma'lumotlaringizni ko'rish, tuzatish yoki hisobingizni o'chirishni so'rash uchun ${CONTACTS.email.handle} manziliga murojaat qilishingiz mumkin.`,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Maxfiylik siyosati"
      updatedAt="2026-yil noyabr"
      intro="3Talaba Campus sizning shaxsiy ma'lumotlaringiz xavfsizligini jiddiy qabul qiladi."
      sections={SECTIONS}
    />
  );
}
