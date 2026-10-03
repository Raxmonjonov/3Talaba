import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { LOCALES, isLocale, type Locale } from '@/lib/i18n/config';

type Copy = {
  metaTitle: string;
  metaDescription: string;
  brand: string;
  tagline: string;
  intro: string;
  featuresTitle: string;
  features: { title: string; text: string }[];
  examTitle: string;
  exams: string[];
  howTitle: string;
  how: { step: string; text: string }[];
  startCta: string;
  loginCta: string;
  languageLabel: string;
  stats: { value: string; label: string }[];
  footer: string;
};

const COPY: Record<Locale, Copy> = {
  uz: {
    metaTitle: "3talab — AI-ustozli oliygohga tayyorlov",
    metaDescription:
      'SAT, IELTS, akademik ingliz, matematika, mantiq va yozish fanlarida AI-ustoz bilan shaxsiy ta’lim. Boshlang‘ich daraja aniqlanadi, kunlik reja tuziladi.',
    brand: '3talab',
    tagline: 'Oliygohga tayyorlanish — sun’iy intellekt yordamida',
    intro:
      'Rasmni kiritmaysiz, javobni topmaysiz. 3talab savollarni beradi, siz ularga javob berasiz — tizim esa nima uchun shunday qaror qabul qilganingizni tushuntiradi.',
    featuresTitle: 'Nima taklif qilamiz',
    features: [
      {
        title: 'Aniq daraja aniqlash',
        text: '15–25 ta adaptiv savol orqali darajangiz o‘lchanadi va shu asosda o‘qish rejasi tuziladi.',
      },
      {
        title: 'Sokrat usuli',
        text: 'AI to‘g‘ri javobni berish o‘rniga savol bilan yo‘naltiradi — tushunish mustaqil shakllanadi.',
      },
      {
        title: 'Ko‘rinib turgan natija',
        text: 'XP, daraja va statistika. O‘z vaqtingizda qancha vaqt sarflaganingiz aniq ko‘rinadi.',
      },
      {
        title: 'Keyingi takrorlash',
        text: 'Xotira kuchayganligi bo‘yicha takrorlash rejasi — xato qilingan savol qayta-qayta uchrashmaydi.',
      },
      {
        title: 'O‘zbek va ingliz',
        text: 'To‘liq ikki tilli interfeys va mazmun — har bir tushuntirish tildan tanlanadi.',
      },
      {
        title: 'Qurilma bo‘yicha emas',
        text: 'Mobil, planshet va kompyuterda bir xil ishlaydi. Qancha vaqt ishlaganingiz — qancha.',
      },
    ],
    examTitle: 'Yo‘nalishlar',
    exams: ['SAT', 'IELTS', 'Akademik ingliz', 'Matematika', 'Mantiq va tahlil', 'Yozish'],
    howTitle: 'Qanday ishlaydi',
    how: [
      { step: '1', text: 'Ro‘yxatdan o‘ting — telefon yoki email orqali.' },
      { step: '2', text: 'Adaptiv testni to‘ldiring, daraja aniqlansin.' },
      { step: '3', text: 'Sizga kunlik reja tuziladi.' },
      { step: '4', text: 'Darslar, mashqlar va AI-ustoz bilan ishlang.' },
    ],
    startCta: 'Boshladim',
    loginCta: 'Kirish',
    languageLabel: 'Til',
    stats: [
      { value: '15–25', label: 'adaptiv savol' },
      { value: '6', label: 'fan yo‘nalishi' },
      { value: '2', label: 'til' },
    ],
    footer: '3talab — o‘rganish, majburiyatsiz.',
  },
  en: {
    metaTitle: '3talab — AI-powered university preparation',
    metaDescription:
      'Prepare for SAT, IELTS, academic English, mathematics, logic and writing with an AI tutor. We assess your level first, then build a daily plan.',
    brand: '3talab',
    tagline: 'University preparation, powered by AI',
    intro:
      'We never hand you the answer. 3talab asks the questions, you answer them, and the system explains why your reasoning led there.',
    featuresTitle: 'What we offer',
    features: [
      {
        title: 'Accurate level assessment',
        text: '15–25 adaptive questions measure your level, and the study plan is built from that.',
      },
      {
        title: 'The Socratic method',
        text: 'The AI guides you with questions instead of answers, so understanding forms independently.',
      },
      {
        title: 'Visible progress',
        text: 'XP, levels and statistics. You see exactly how much time you invested and where.',
      },
      {
        title: 'Spaced repetition',
        text: 'Review intervals follow memory strength, so a question you got wrong will not vanish.',
      },
      {
        title: 'Uzbek and English',
        text: 'A fully bilingual interface and content — every explanation in the language you choose.',
      },
      {
        title: 'Device agnostic',
        text: 'Works the same on mobile, tablet and desktop. Stop whenever you like.',
      },
    ],
    examTitle: 'Tracks',
    exams: ['SAT', 'IELTS', 'Academic English', 'Mathematics', 'Logic and analysis', 'Writing'],
    howTitle: 'How it works',
    how: [
      { step: '1', text: 'Sign up with your phone number or email.' },
      { step: '2', text: 'Complete the adaptive test so we can place you.' },
      { step: '3', text: 'We generate a daily plan for your level.' },
      { step: '4', text: 'Work through lessons, exercises and your AI tutor.' },
    ],
    startCta: 'Get started',
    loginCta: 'Sign in',
    languageLabel: 'Language',
    stats: [
      { value: '15–25', label: 'adaptive questions' },
      { value: '6', label: 'subject tracks' },
      { value: '2', label: 'languages' },
    ],
    footer: '3talab — learning, without pressure.',
  },
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = COPY[isLocale(locale) ? locale : 'uz'];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: {
      canonical: '/',
      languages: { uz: '/uz', en: '/en' },
    },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      type: 'website',
      siteName: '3talab',
    },
  };
}

export default async function LocalizedLanding({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = COPY[locale];
  const otherLocale: Locale = locale === 'uz' ? 'en' : 'uz';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href={`/${locale}`} className="text-lg font-semibold tracking-tight">
          {copy.brand}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href={`/${otherLocale}`}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            {otherLocale === 'uz' ? "O'zbekcha" : 'English'}
          </Link>
          <Link href={`/${locale}/auth/login`} className="text-slate-300 transition hover:text-white">
            {copy.loginCta}
          </Link>
          <Link
            href={`/${locale}/auth/register`}
            className="rounded-md bg-sky-500 px-3 py-1.5 font-medium text-slate-950 transition hover:bg-sky-400"
          >
            {copy.startCta}
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="py-16 sm:py-24">
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {copy.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">{copy.intro}</p>

          <dl className="mt-10 grid grid-cols-3 gap-4 sm:max-w-md">
            {copy.stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <dt className="text-2xl font-semibold text-sky-400">{stat.value}</dt>
                <dd className="mt-1 text-sm text-slate-400">{stat.label}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/auth/register`}
              className="rounded-md bg-sky-500 px-5 py-2.5 font-medium text-slate-950 transition hover:bg-sky-400"
            >
              {copy.startCta}
            </Link>
            <Link
              href={`/${locale}/auth/login`}
              className="rounded-md border border-slate-700 px-5 py-2.5 text-slate-200 transition hover:border-slate-500"
            >
              {copy.loginCta}
            </Link>
          </div>
        </section>

        <section className="border-t border-slate-800 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">{copy.featuresTitle}</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {copy.features.map((feature) => (
              <li key={feature.title} className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="font-medium text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-slate-800 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">{copy.examTitle}</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {copy.exams.map((exam) => (
              <li
                key={exam}
                className="rounded-full border border-slate-800 bg-slate-900/60 px-4 py-1.5 text-sm text-slate-300"
              >
                {exam}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-slate-800 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">{copy.howTitle}</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {copy.how.map((item) => (
              <li key={item.step} className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-sm font-semibold text-sky-400">
                  {item.step}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-slate-800 px-6 py-8">
        <p className="mx-auto max-w-5xl text-sm text-slate-500">
          {copy.footer} · {copy.languageLabel}: {locale === 'uz' ? "O'zbekcha" : 'English'}
        </p>
      </footer>
    </div>
  );
}