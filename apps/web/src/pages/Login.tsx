import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { authPath } from "@/i18n/config";
import { useAuthLocale } from "@/i18n/useAuthLocale";
import { api } from "../lib/api";
import type { AuthResponse } from "../lib/types";

export default function Login({ onLogin }: { onLogin: (user: AuthResponse["user"]) => void }) {
  const { locale, t } = useAuthLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("3talab_token", res.token);
      onLogin(res.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || t.auth.errorFallback);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      tagline={t.auth.loginTagline}
      footnote={
        <>
          {t.auth.noAccount}{" "}
          <Link
            to={authPath("register", locale)}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {t.auth.registerCta}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              {t.auth.email}
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              {t.auth.password}
            </label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}

          <button
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:bg-secondary disabled:text-secondary-foreground disabled:cursor-not-allowed transition"
          >
            {loading ? t.auth.loading : t.auth.loginSubmit}
          </button>
        </form>
    </AuthShell>
  );
}
