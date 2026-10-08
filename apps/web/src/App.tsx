import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { api } from "./lib/api";
import type { User } from "./lib/types";
import { DEFAULT_LOCALE, landingPath, LOCALES } from "./i18n/config";
import { AuthLocaleProvider } from "./i18n/AuthLocaleProvider";

// Keeps the translation dictionaries and each routed page out of the initial
// bundle so the app shell paints before any page code arrives.
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Study = lazy(() => import("./pages/Study"));
const Placement = lazy(() => import("./pages/Placement"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Yuklanmoqda…</p>
    </div>
  );
}

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
            element={
              <Suspense fallback={<RouteFallback />}>
                <Landing locale={option.code} user={user} onLogout={logout} />
              </Suspense>
            }
          />
        ))}

        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthLocaleProvider>
                <Suspense fallback={<RouteFallback />}>
                  <Login onLogin={setUser} />
                </Suspense>
              </AuthLocaleProvider>
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthLocaleProvider>
                <Suspense fallback={<RouteFallback />}>
                  <Register onLogin={setUser} />
                </Suspense>
              </AuthLocaleProvider>
            )
          }
        />
        <Route
          path="/placement"
          element={
            user ? (
              <Suspense fallback={<RouteFallback />}>
                <Placement
                  onFinish={(level) =>
                    setUser((prev) => (prev ? { ...prev, currentLevel: level } : prev))
                  }
                />
              </Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Suspense fallback={<RouteFallback />}>
                <Dashboard
                  user={user}
                  onLogout={logout}
                  onStartPlacement={() => {
                    window.location.href = "/placement";
                  }}
                />
              </Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/study/:id?"
          element={
            user ? (
              <Suspense fallback={<RouteFallback />}>
                <Study user={user} />
              </Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
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