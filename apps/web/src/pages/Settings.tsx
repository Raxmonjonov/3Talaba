import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { set3DEnabled } from "../lib/featureFlags";
import { use3DEnabled } from "@/components/3d/hooks/usePerfFlags";
import type { ProfileResponse, SettingsResponse, User } from "../lib/types";
import { AppShell } from "@/components/AppShell";

const GENDERS: Array<{ value: "MALE" | "FEMALE" | "OTHER"; label: string }> = [
  { value: "MALE", label: "Erkak" },
  { value: "FEMALE", label: "Ayol" },
  { value: "OTHER", label: "Boshqa" },
];

const TARGETS: Array<{ value: string; label: string }> = [
  { value: "GENERAL", label: "Umumiy bilim" },
  { value: "SAT", label: "SAT" },
  { value: "IELTS", label: "IELTS" },
  { value: "UNIVERSITY", label: "Oliygoh kirish" },
];

export default function Settings({
  user,
  onUserChange,
}: {
  user: User;
  onUserChange: (next: User) => void;
}) {
  const [profile, setProfile] = useState({
    firstName: user.firstName,
    lastName: user.lastName ?? "",
    email: user.email,
    gender: user.gender,
    age: user.age != null ? String(user.age) : "",
    target: user.target ?? "GENERAL",
  });
  const [title, setTitle] = useState(user.preferredTitle ?? "");
  const threeDEnabled = use3DEnabled();
  const [focusMode, setFocusMode] = useState(user.focusMode);
  const [softConfirm, setSoftConfirm] = useState(user.softConfirm);
  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setProfile({
      firstName: user.firstName,
      lastName: user.lastName ?? "",
      email: user.email,
      gender: user.gender,
      age: user.age != null ? String(user.age) : "",
      target: user.target ?? "GENERAL",
    });
    setTitle(user.preferredTitle ?? "");
    setFocusMode(user.focusMode);
    setSoftConfirm(user.softConfirm);
  }, [user]);

  function flash(setter: (v: boolean) => void) {
    setter(true);
    setTimeout(() => setter(false), 2500);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setError("");
    try {
      const updated = await api<ProfileResponse>("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName || null,
          email: profile.email,
          gender: profile.gender,
          age: profile.age ? Number(profile.age) : null,
          target: profile.target || null,
        }),
      });
      onUserChange(updated);
      flash(setProfileSaved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profil saqlanmadi");
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveSoftSettings() {
    setSavingSettings(true);
    setError("");
    try {
      const updated = await api<SettingsResponse>("/api/user/settings", {
        method: "PATCH",
        body: JSON.stringify({ preferredTitle: title, focusMode, softConfirm }),
      });
      onUserChange({
        ...user,
        preferredTitle: updated.preferredTitle,
        focusMode: updated.focusMode,
        softConfirm: updated.softConfirm,
      });
      flash(setSettingsSaved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sozlama saqlanmadi");
    } finally {
      setSavingSettings(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.next !== password.confirm) {
      setError("Yangi parollar mos emas");
      return;
    }
    setSavingPassword(true);
    try {
      await api("/api/user/password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.next,
        }),
      });
      setPassword({ current: "", next: "", confirm: "" });
      flash(setPasswordSaved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parol o'zgartirilmadi");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <AppShell
      title="Hisob sozlamalari"
      subtitle={user.email}
      maxWidth="max-w-2xl"
    >
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <form onSubmit={saveProfile} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Profil</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                Ism
              </label>
              <input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                className="field"
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Familiya
              </label>
              <input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                className="field"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className="field"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="age" className="text-sm font-medium">
                Yosh
              </label>
              <input
                id="age"
                type="number"
                min={10}
                max={90}
                value={profile.age}
                onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value }))}
                className="field"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-medium">
                Jins
              </label>
              <select
                id="gender"
                value={profile.gender}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, gender: e.target.value as ProfileResponse["gender"] }))
                }
                className="field"
              >
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="target" className="text-sm font-medium">
                Maqsad
              </label>
              <select
                id="target"
                value={profile.target}
                onChange={(e) => setProfile((p) => ({ ...p, target: e.target.value }))}
                className="field"
              >
                {TARGETS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? "Saqlanmoqda…" : "Profilni saqlash"}
            </button>
            {profileSaved ? <span className="text-sm text-muted-foreground">Saqlandi</span> : null}
          </div>
        </form>

        <section className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Murojaat va rejim</h2>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Sizni qanday murojaat qilay?
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                user.gender === "FEMALE"
                  ? "Malikam"
                  : user.gender === "MALE"
                    ? "Shag‘zodam"
                    : user.firstName
              }
              maxLength={40}
              className="field"
            />
          </div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={focusMode}
              onChange={(e) => setFocusMode(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">Fokus rejimi</span>
              <span className="block text-xs text-muted-foreground">
                Ortiqcha chalg‘ituvchilarni kamaytiradi.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={softConfirm}
              onChange={(e) => setSoftConfirm(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">Yumshoq eslatmalar</span>
              <span className="block text-xs text-muted-foreground">
                Dam olish vaqti kelganda yumshoq taklif qilamiz.
              </span>
            </span>
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={saveSoftSettings}
              disabled={savingSettings}
              className="btn-primary"
              type="button"
            >
              {savingSettings ? "Saqlanmoqda…" : "Saqlash"}
            </button>
            {settingsSaved ? <span className="text-sm text-muted-foreground">Saqlandi</span> : null}
          </div>
        </section>

        {/* Ko'rinish: the 3D toggle lives here as well as on the dashboard, and
            because it is a local preference it applies the moment it flips — no
            save button, no round trip. Phones that struggle simply switch it off. */}
        <section className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Ko‘rinish</h2>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={!threeDEnabled}
              onChange={(e) => set3DEnabled(!e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">3D effektlarni o‘chirish</span>
              <span className="block text-xs text-muted-foreground">
                Sahifalardagi harakatlanuvchi sahnalar o‘rniga oddiy tinch ko‘rinish
                qaytadi. Barcha ma’lumotlar o‘z joyida qoladi.
              </span>
            </span>
          </label>
        </section>

        <form onSubmit={savePassword} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Parolni o‘zgartirish</h2>
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="text-sm font-medium">
              Joriy parol
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={password.current}
              onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
              className="field"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                Yangi parol
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={password.next}
                onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))}
                className="field"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Yangi parolni tasdiqlang
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={password.confirm}
                onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
                className="field"
                required
                minLength={6}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={savingPassword} className="btn-primary">
              {savingPassword ? "O‘zgarmoqda…" : "Parolni yangilash"}
            </button>
            {passwordSaved ? (
              <span className="text-sm text-muted-foreground">Parol yangilandi</span>
            ) : null}
          </div>
        </form>
    </AppShell>
  );
}
