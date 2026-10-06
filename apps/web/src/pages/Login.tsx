import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { AuthResponse } from "../lib/types";

export default function Login({ onLogin }: { onLogin: (user: AuthResponse["user"]) => void }) {
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
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">3Talab</h1>
          <p className="text-muted-foreground text-sm">
            Tinch, sabrli va samarali o‘rganish muhiti
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border rounded-2xl p-6 shadow-sm space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
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
              Parol
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
            {loading ? "Kutilmoqda…" : "Kirish"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Hisob yo‘qmi?{" "}
          <Link to="/register" className="underline underline-offset-4 hover:text-foreground">
            Ro‘yxatdan o‘tish
          </Link>
        </p>
      </div>
    </div>
  );
}