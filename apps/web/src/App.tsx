import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Study from "./pages/Study";
import Placement from "./pages/Placement";
import Landing from "./pages/Landing";
import { api } from "./lib/api";
import type { User } from "./lib/types";
import { DEFAULT_LOCALE, landingPath, LOCALES } from "./i18n/config";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function checkSession() {
      if (!localStorage.getItem("3talab_token")) {
        setLoading(false);
        return;
      }
      try {
        setUser(await api<User>("/api/auth/me"));
      } catch {
        localStorage.removeItem("3talab_token");
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  function logout() {
    localStorage.removeItem("3talab_token");
    setUser(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Yuklanmoqda…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Localized landing pages */}
        <Route path="/" element={<Navigate to={landingPath(DEFAULT_LOCALE)} replace />} />
        {LOCALES.map((option) => (
          <Route
            key={option.code}
            path={landingPath(option.code)}
            element={<Landing locale={option.code} user={user} onLogout={logout} />}
          />
        ))}

        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={setUser} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register onLogin={setUser} />
            )
          }
        />
        <Route
          path="/placement"
          element={
            user ? (
              <Placement
                onFinish={(level) =>
                  setUser((prev) => (prev ? { ...prev, currentLevel: level } : prev))
                }
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard
                user={user}
                onLogout={logout}
                onStartPlacement={() => {
                  window.location.href = "/placement";
                }}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/study/:id?"
          element={user ? <Study user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="*"
          element={
            // Any other unknown locale prefix falls back to the default landing
            // page instead of a redirect loop.
            <Navigate to={landingPath(DEFAULT_LOCALE)} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}