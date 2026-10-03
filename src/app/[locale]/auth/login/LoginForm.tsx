'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';

type Copy = {
  title: string;
  subtitle: string;
  email: string;
  password: string;
  submit: string;
  submitting: string;
  noAccount: string;
  register: string;
  forgot: string;
  invalid: string;
  registered: string;
};

const COPY = {
  uz: {
    title: 'Kirish',
    subtitle: 'Hisobingizga kiring',
    email: 'Email',
    password: 'Parol',
    submit: 'Kirish',
    submitting: 'Tekshirilmoqda…',
    noAccount: 'Hisobingiz yo‘qmi?',
    register: 'Ro‘yxatdan o‘tish',
    forgot: 'Parolni unutdingizmi?',
    invalid: 'Email yoki parol noto‘g‘ri',
    registered: 'Ro‘yxatdan o‘tdingiz. Endi tizimga kiring.',
  },
  en: {
    title: 'Sign in',
    subtitle: 'Welcome back',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    submitting: 'Checking…',
    noAccount: 'No account yet?',
    register: 'Create one',
    forgot: 'Forgot your password?',
    invalid: 'Email or password is incorrect',
    registered: 'Account created. Please sign in.',
  },
} as const satisfies Record<string, Copy>;

type Locale = keyof typeof COPY;

function LoginForm({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const router = useRouter();
  const params = useSearchParams();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setPending(true);

    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');

    try {
      const result = await signIn('credentials', { email, password, redirect: false });

      if (!result || result.error) {
        setError(copy.invalid);
        setPending(false);
        return;
      }

      const next = params.get('next');
      router.push(next && next.startsWith('/') ? `${next}` : `/${locale}/app/dashboard`);
      router.refresh();
    } catch {
      setError(copy.invalid);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {params.get('registered') ? (
        <p className="rounded-md border border-sky-800 bg-sky-950/40 px-3 py-2 text-sm text-sky-300">
          {copy.registered}
        </p>
      ) : null}

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
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-200">
          {copy.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-sky-500"
        />
      </div>

      <div className="flex justify-end">
        <Link href={`/${locale}/auth/forgot-password`} className="text-xs text-slate-400 hover:text-slate-200">
          {copy.forgot}
        </Link>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-sky-500 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? copy.submitting : copy.submit}
      </button>

      <p className="text-center text-sm text-slate-400">
        {copy.noAccount}{' '}
        <Link href={`/${locale}/auth/register`} className="text-sky-400 hover:underline">
          {copy.register}
        </Link>
      </p>
    </form>
  );
}

export function LoginFormWithSearch({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={null}>
      <LoginForm locale={locale} />
    </Suspense>
  );
}