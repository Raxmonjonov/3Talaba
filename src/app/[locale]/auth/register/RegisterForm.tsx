'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

type Copy = {
  title: string;
  subtitle: string;
  name: string;
  email: string;
  password: string;
  consent: string;
  submit: string;
  submitting: string;
  haveAccount: string;
  login: string;
  errorGeneric: string;
  fieldName: string;
  fieldEmail: string;
  fieldPassword: string;
  terms: string;
};

const COPY = {
  uz: {
    title: 'Ro‘yxatdan o‘tish',
    subtitle: 'Bitta hisob — barcha yo‘nalishlar uchun.',
    name: 'Ism',
    email: 'Email',
    password: 'Parol',
    consent: 'Shartnomani o‘qidim va qabul qilaman',
    submit: 'Ro‘yxatdan o‘tish',
    submitting: 'Yuborilmoqda…',
    haveAccount: 'Hisobingiz bormi?',
    login: 'Kirish',
    errorGeneric: 'Nimaidir noto‘g‘ri ketdi. Qayta urinib ko‘ring.',
    fieldName: 'Ism kamida 2 ta belgi bo‘lishi kerak',
    fieldEmail: 'Email noto‘g‘ri',
    fieldPassword: 'Parol kamida 8 ta belgi bo‘lishi kerak',
    terms: 'Shartnomasi',
  },
  en: {
    title: 'Create an account',
    subtitle: 'One account, every track.',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    consent: 'I have read and accept the terms',
    submit: 'Create account',
    submitting: 'Sending…',
    haveAccount: 'Already have an account?',
    login: 'Sign in',
    errorGeneric: 'Something went wrong. Please try again.',
    fieldName: 'Name must be at least 2 characters',
    fieldEmail: 'Email is not valid',
    fieldPassword: 'Password must be at least 8 characters',
    terms: 'Terms',
  },
} as const satisfies Record<string, Copy>;

type Locale = keyof typeof COPY;

export function RegisterForm({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'name' | 'email' | 'password', string>>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);

    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      password: String(data.get('password') ?? ''),
      consent: data.get('consent') === 'on',
      locale,
    };

    const errors: typeof fieldErrors = {};
    if (payload.name.length < 2) errors.name = copy.fieldName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.email = copy.fieldEmail;
    if (payload.password.length < 8) errors.password = copy.fieldPassword;
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setPending(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setError(body?.error?.message ?? copy.errorGeneric);
        setPending(false);
        return;
      }

      router.push(`/${locale}/auth/login?registered=1`);
    } catch {
      setError(copy.errorGeneric);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-200">
          {copy.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="mt-1.5 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-sky-500"
        />
        {fieldErrors.name ? (
          <p className="mt-1 text-xs text-rose-400">{fieldErrors.name}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-200">
          {copy.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1.5 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-sky-500"
        />
        {fieldErrors.email ? (
          <p className="mt-1 text-xs text-rose-400">{fieldErrors.email}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-200">
          {copy.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="mt-1.5 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-sky-500"
        />
        {fieldErrors.password ? (
          <p className="mt-1 text-xs text-rose-400">{fieldErrors.password}</p>
        ) : null}
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-300">
        <input
          name="consent"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900"
        />
        <span>
          {copy.consent}{' '}
          <span className="text-slate-500">({copy.terms})</span>
        </span>
      </label>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-sky-500 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? copy.submitting : copy.submit}
      </button>

      <p className="text-center text-sm text-slate-400">
        {copy.haveAccount}{' '}
        <Link href={`/${locale}/auth/login`} className="text-sky-400 hover:underline">
          {copy.login}
        </Link>
      </p>
    </form>
  );
}