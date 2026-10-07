import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { api } from "../lib/api";
import type { AuthResponse } from "../lib/types";

const GOALS = [
  { id: "SAT", label: "SAT", hint: "Matematika, o‘qish, yozish" },
  { id: "IELTS", label: "IELTS", hint: "Listening, Reading, Writing, Speaking" },
  { id: "UNIVERSITY", label: "Oliygoh kirish", hint: "Umumiy tayyorgarlik" },
  { id: "GENERAL", label: "Umumiy bilim", hint: "Noldan to‘liq qayta qurish" },
];

export default function Register({ onLogin }: { onLogin: (user: AuthResponse["user"]) => void }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    target: "GENERAL",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName || undefined,
          email: form.email,
          password: form.password,
          gender: form.gender,
          age: form.age ? Number(form.age) : undefined,
          target: form.target,
        }),
      });
      localStorage.setItem("3talab_token", res.token);
      onLogin(res.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      tagline="Ro‘yxatdan o‘ting — sizning darajangizni aniqlab, reja tuzamiz"
      footnote={
        <>
          Hisobingiz bormi?{" "}
          <Link
            to="/login"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Kirish
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="firstName">
                Ism
              </label>
              <input
                id="firstName"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                required
                minLength={2}
                autoComplete="given-name"
                className="w-full px-3 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="lastName">
                Familiya
              </label>
              <input
                id="lastName"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                autoComplete="family-name"
                className="w-full px-3 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Parol
            </label>
            <input
              id="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-3 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">Kamida 6 ta belgi</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Jins</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "MALE", l: "Erkak" },
                { v: "FEMALE", l: "Ayol" },
                { v: "OTHER", l: "Boshqa" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  aria-pressed={form.gender === o.v}
                  onClick={() => update("gender", o.v)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    form.gender === o.v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-secondary"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Bu sizga murojaat uslubini belgilaydi — keyin o‘zgartirishingiz mumkin.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="age">
              Yosh (ixtiyoriy)
            </label>
            <input
              id="age"
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
              type="number"
              min={10}
              max={80}
              className="w-full px-3 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Maqsadingiz</label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={form.target === g.id}
                  onClick={() => update("target", g.id)}
                  className={`px-3 py-2.5 rounded-lg border text-left transition-colors ${
                    form.target === g.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-secondary"
                  }`}
                >
                  <div className="text-sm font-medium">{g.label}</div>
                  <div
                    className={`text-xs ${
                      form.target === g.id ? "" : "text-muted-foreground"
                    }`}
                  >
                    {g.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}

          <button
            disabled={loading || !form.gender}
            className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:bg-secondary disabled:text-secondary-foreground disabled:cursor-not-allowed transition"
          >
            {loading ? "Kutilmoqda…" : "Davom etish"}
          </button>
        </form>
    </AuthShell>
  );
}