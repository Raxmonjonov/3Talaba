import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";

interface Method {
  title: string;
  desc: string;
  to: string;
  cta: string;
}

interface Group {
  title: string;
  blurb: string;
  items: Method[];
}

const GROUPS: Group[] = [
  {
    title: "Xotira va takrorlash",
    blurb: "Ma’lumotni uzoq muddatga saqlash usullari.",
    items: [
      {
        title: "Interval takrorlash (FSRS)",
        desc: "Har bir savol uchun eng yaxshi qayta ko‘rish vaqti hisoblanadi — kuchli joylar kamdan-kam, zaif joylar tez-tez chiqadi.",
        to: "/practice?review=1",
        cta: "Takrorlashni ochish",
      },
      {
        title: "Faol eslash (active recall)",
        desc: "Javobni ko‘rmasdan yoddan aytish — o‘qib chiqishdan ko‘ra eslab qolishni yaxshilaydi.",
        to: "/practice",
        cta: "Mashqni ochish",
      },
      {
        title: "Aralashtirish (interleaving)",
        desc: "Turli mavzular savollari aralashtiriladi, shunda miya mavzuni tanib, mos usulni o‘zi tanlashni o‘rganadi.",
        to: "/practice",
        cta: "Aralash mashq",
      },
      {
        title: "Yopib eslash (read–cover–recall–check)",
        desc: "Dars matnini o‘qib, yopib, yoddan aytib, keyin tekshirish — o‘qishni tez mustahkamlaydi.",
        to: "/courses",
        cta: "Darsni ochish",
      },
      {
        title: "Oldindan sinash (pretesting)",
        desc: "Materialni o‘qishdan oldin savolga urinish — xato qilsangiz ham eslab qolish kuchayadi.",
        to: "/courses",
        cta: "Darsni ochish",
      },
    ],
  },
  {
    title: "Chuqur tushunish",
    blurb: "Materialni o‘z so‘zlaringiz bilan qayta ishlash.",
    items: [
      {
        title: "Feynman texnikasi",
        desc: "Mavzuni oddiy tilda tushuntirish — tushunmagan joyingiz darhol ko‘rinadi.",
        to: "/practice",
        cta: "Mashqni ochish",
      },
      {
        title: "So‘roq qilish (elaborative interrogation)",
        desc: "“Nega bu shunday?” deb so‘rab, sababini bog‘lash — ma’noli o‘rganish.",
        to: "/study",
        cta: "Tutorni ochish",
      },
      {
        title: "Konspekt (xulosa yozish)",
        desc: "Har bir darsdan keyin qisqa xulosa yozish — mazmunni saralab, eslab qolishni kuchaytiradi.",
        to: "/notes",
        cta: "Konspektlarni ochish",
      },
    ],
  },
  {
    title: "Xatolardan o‘rganish",
    blurb: "Xatoni tahlil qilish bilimni eng tez o‘stiradi.",
    items: [
      {
        title: "Xatolar daftari",
        desc: "Noto‘g‘ri javoblar mavzu bo‘yicha saqlanadi va qayta mashq qilinadi.",
        to: "/mistakes",
        cta: "Xatolarni ochish",
      },
      {
        title: "Xato tahlili (o‘z-o‘zini tushuntirish)",
        desc: "“Nima uchun xato qildim?” deb yozish — kelasi safar ayni xatoni takrorlamaslik uchun.",
        to: "/mistakes",
        cta: "Tahlil yozish",
      },
      {
        title: "Imtihon tahlili (exam wrapper)",
        desc: "Sinovdan keyin: nima qiyin bo‘ldi, qanday tayyorlanaman — keyingi urinishni yaxshilaydi.",
        to: "/mock-exams",
        cta: "Imtihonlarni ochish",
      },
    ],
  },
  {
    title: "Generatsiya va o‘zini boshqarish",
    blurb: "O‘zingiz material yaratib, vaqt va maqsadni boshqaring.",
    items: [
      {
        title: "O‘z savollaringiz (generatsiya effekti)",
        desc: "O‘zingiz savol tuzib, javobini yozing va keyin o‘zingizni sinang — o‘z savolingiz yaxshiroq esda qoladi.",
        to: "/self-questions",
        cta: "Savollarimni ochish",
      },
      {
        title: "Bugungi reja",
        desc: "Kunlik eng foydali tartib: takrorlash → zaif mavzular → xatolarni tuzatish.",
        to: "/dashboard",
        cta: "Rejani ko‘rish",
      },
      {
        title: "Kunlik maqsad",
        desc: "Kunda necha daqiqa mashq qilishni belgilang — maqsad harakatni ushlab turadi.",
        to: "/settings",
        cta: "Maqsadni sozlash",
      },
      {
        title: "Vaqtli mashq",
        desc: "Har bir savolga taymer — imtihon tezligi uchun foydali.",
        to: "/practice?timed=1",
        cta: "Vaqtli mashqni boshlash",
      },
      {
        title: "Ishonch aniqligi (kalibrlash)",
        desc: "Javobdan oldin ishonchingizni belgilang — o‘zingizga ortiqcha ishonishni payqaysiz.",
        to: "/practice?confidence=1",
        cta: "Ishonch rejimini ochish",
      },
      {
        title: "Pomodoro / fokus",
        desc: "Diqqatni bo‘laklarga bo‘lib ishlash — charchamasdan samarali mashq.",
        to: "/study",
        cta: "Fokus sessiyasi",
      },
    ],
  },
];

const TOTAL = GROUPS.reduce((sum, group) => sum + group.items.length, 0);

export default function Methods() {
  const navigate = useNavigate();

  return (
    <AppShell
      title="O‘quv usullari"
      subtitle={`${TOTAL} ta usul saytga qo‘llangan`}
      maxWidth="max-w-2xl"
    >
      <section className="space-y-3 rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Bu sahifada saytga joriy qilingan ilmiy asoslangan o‘qish usullari
          jamlangan. Har biri qaysi bo‘limda ishlatilishini ko‘rsatib, to‘g‘ridan
          to‘g‘ri o‘sha yerga olib boradi.
        </p>
      </section>

      {GROUPS.map((group) => (
        <section key={group.title} className="space-y-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold">{group.title}</h2>
            <p className="text-sm text-muted-foreground">{group.blurb}</p>
          </div>
          <ul className="space-y-3">
            {group.items.map((method) => (
              <li
                key={method.title}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-medium">{method.title}</h3>
                  <p className="text-sm text-muted-foreground">{method.desc}</p>
                </div>
                <button
                  onClick={() => navigate(method.to)}
                  className="btn-secondary shrink-0 text-sm"
                >
                  {method.cta}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </AppShell>
  );
}
