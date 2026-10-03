import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';

import { RegisterForm } from './RegisterForm';

type Copy = { title: string; subtitle: string; brand: string };

const COPY = {
  uz: { title: 'Ro‘yxatdan o‘tish', subtitle: 'Bitta hisob — barcha yo‘nalishlar uchun.', brand: '3talab' },
  en: { title: 'Create an account', subtitle: 'One account, every track.', brand: '3talab' },
} as const satisfies Record<string, Copy>;

export const metadata: Metadata = {
  title: 'Ro‘yxatdan o‘tish · 3talab',
  robots: { index: false },
};

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = COPY[locale];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <main className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-white">{copy.title}</h1>
        <p className="mt-2 text-center text-sm text-slate-400">{copy.subtitle}</p>

        <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/60 p-6">
          <RegisterForm locale={locale} />
        </div>
      </main>
    </div>
  );
}