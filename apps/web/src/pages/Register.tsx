import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <div className="min-h-screen flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">3Talab</h1>
          <p className="text-muted-foreground text-sm">
            Ro‘yxatdan o‘ting — sizning darajangizni aniqlab, reja tuzamiz
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border rounded-2xl p-6 shadow-sm space-y-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ism</label>
              <input
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                required
                minLength={2}
                className="w-full px-3 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Familiya</label>
              <input
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              type="email"
              required
              className="w-full px-3 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Parol</label>
            <input
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              type="password"
              required
              minLength={6}
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
            <label className="text-sm font-medium">Yosh (ixtiyoriy)</label>
            <input
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
                      form.target === g.id
                        ? "opacity-80"
                        : "text-muted-foreground"
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
            className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Kutilmoqda…" : "Davom etish"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Hisobingiz bormi?{" "}
          <Link to="/login" className="underline underline-offset-4 hover:text-foreground">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}