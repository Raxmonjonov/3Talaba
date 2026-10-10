import { useEffect } from "react";
import { Link } from "react-router-dom";

export type LegalKind = "privacy" | "terms";

const COPY: Record<
  LegalKind,
  { title: string; sections: { heading: string; body: string }[] }
> = {
  privacy: {
    title: "Maxfiylik siyosati",
    sections: [
      {
        heading: "Qanday ma’lumot yig‘iladi",
        body: "Ro‘yxatdan o‘tishda ism, email va parolingiz kerak bo‘ladi. Parolingiz serverda shifrlanadi. Test javoblari, daraja, o‘quv statistikasi va yutuqlar faqat hisobingizga bog‘lanadi.",
      },
      {
        heading: "Ma’lumotdan foydalanish",
        body: "Ma’lumotlar sizga shaxsiy reja tuzlash, darajangizni saqlash va ustoz-suhbatini yuritish uchun ishlatiladi. Reklama uchun uchinchi tomonga berilmaydi.",
      },
      {
        heading: "AI ustoz",
        body: "Suhbat xabarlari mavzuni tushuntirish uchun ishlatiladi. Javoblar sizning darajangizga moslashtiriladi; ularni tayyorlashda umumiy o‘quv namunalari qo‘llanishi mumkin.",
      },
      {
        heading: "O‘chirish huquqi",
        body: "Hisobingiz va ma’lumotlaringizni o‘chirishni so‘rasangiz, izzat bilan bajaramiz. Yozing — javob beramiz.",
      },
    ],
  },
  terms: {
    title: "Foydalanish shartlari",
    sections: [
      {
        heading: "Xizmat haqida",
        body: "3Talab — o‘zbek va ingliz tillaridagi onlayn o‘quv platformasi. U SAT, IELTS va oliygohga tayyorgarlik uchun moslashuvchan mashqlar va AI ustoz taklif qiladi.",
      },
      {
        heading: "Hisob",
        body: "Bir odam — bir hisob. Parolingizni o‘zingiz saqlaysiz. Hisob orqali bajarilgan harakatlar uchun javobgarlik sizda.",
      },
      {
        heading: "Bepul xizmat",
        body: "Hozircha platforma bepul. To‘lov yoki obuna talab qilinmaydi. Kelajakda pullik bo‘lim qo‘shilsa, oldindan xabar beriladi.",
      },
      {
        heading: "Mas’uliyat",
        body: "Platforma o‘quv yordam beradi, lekin imtihon natijasiga kafolat bermaydi. Javoblar o‘quv maqsadida, rasmiy hujjat emas.",
      },
    ],
  },
};

/** Minimal legal page for the footer links. Uzbek matches the rest of the app shell. */
export default function LegalPage({ kind }: { kind: LegalKind }) {
  const copy = COPY[kind];

  useEffect(() => {
    document.title = `${copy.title} — 3Talab`;
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, follow");
  }, [copy.title]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link to="/uz" className="text-lg font-semibold tracking-tight">
            3Talab
          </Link>
          <Link
            to="/uz"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Bosh sahifa
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-5 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
        {copy.sections.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-lg font-medium">{section.heading}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </main>
    </div>
  );
}
