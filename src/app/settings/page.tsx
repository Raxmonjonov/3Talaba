"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  EyeOff,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import { useUIPreferences } from "@/components/providers/AppProviders";

interface ReminderSettingsPayload {
  name: string;
  email: string;
  honorific: string;
  guardianShareCode: string;
  reminderEnabled: boolean;
  reminderTime: string;
  dailyGoalMinutes: number;
  reduceMotion: boolean;
  theme: "dark" | "light";
}

interface NotificationPreview {
  titleUz: string;
  bodyUz: string;
  channels: string[];
}

export default function SettingsAndRemindersPage() {
  const { theme, toggleTheme, reduceMotion, toggleReduceMotion } =
    useUIPreferences();
  const [settings, setSettings] = useState<ReminderSettingsPayload | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("19:00");
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [preview, setPreview] = useState<NotificationPreview | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/reminders");
      if (res.ok) {
        const data = (await res.json()) as ReminderSettingsPayload;
        setSettings(data);
        setReminderEnabled(data.reminderEnabled);
        setReminderTime(data.reminderTime);
      }
    }
    load();
  }, []);

  const handleSaveReminders = async (triggerTest = false) => {
    setSaving(true);
    setSavedNotice(false);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderEnabled,
          reminderTime,
          reduceMotion,
          theme,
          triggerTestNotification: triggerTest,
        }),
      });
      if (res.ok) {
        const result = (await res.json()) as {
          saved: boolean;
          notificationPreview: NotificationPreview | null;
        };
        setSavedNotice(true);
        if (result.notificationPreview) {
          setPreview(result.notificationPreview);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-fg-muted">Sozlamalar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
              <Bell className="h-3.5 w-3.5" />
              <span>KUNLIK O&apos;QISH ESLATMALARI VA SOZLAMALAR</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">
              <span className="text-gold">{settings.honorific}</span>, o&apos;qish
              tartibi va bildirishnomalar
            </h1>
          </div>

          <Link
            href="/progress"
            className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-fg hover:border-neon"
          >
            ← Progress paneliga qaytish
          </Link>
        </div>

        {/* Jonli Test Bildirishnoma Banneri */}
        {preview && (
          <div
            id="live-notification-banner"
            className="mt-6 rounded-2xl border border-neon bg-neon-soft/20 p-5 shadow-neon"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-neon px-2.5 py-0.5 font-mono text-[10px] font-extrabold text-canvas">
                  JONLI PUSH & EMAIL BILDIRISHNOMA SINOVI
                </span>
                <h3 className="mt-2 text-base font-extrabold text-fg">
                  {preview.titleUz}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-fg sm:text-sm">
                  {preview.bodyUz}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-gold">
                  {preview.channels.map((ch, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg border border-gold/40 bg-canvas px-2.5 py-1"
                    >
                      <Mail className="h-3 w-3" />
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. Kunlik O'qish Vaqti Eslatmalari (Email & Push) */}
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-extrabold text-fg">
                <Clock className="h-5 w-5 text-neon" />
                <span>Kunlik O&apos;qish Eslatmasi (Email & Web Push)</span>
              </h2>
              <p className="mt-1 text-xs text-fg-muted">
                Tanlangan vaqtda sizga kunlik {settings.dailyGoalMinutes} daqiqalik
                rejani eslatuvchi bildirishnoma yuboriladi.
              </p>
            </div>

            <button
              type="button"
              id="reminder-toggle-btn"
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`rounded-xl border px-4 py-2 text-xs font-extrabold transition-all ${
                reminderEnabled
                  ? "border-neon bg-neon text-canvas shadow-neon"
                  : "border-border bg-elevated text-fg-muted"
              }`}
            >
              {reminderEnabled ? "Eslatma Yoqilgan" : "Eslatma O'chiq"}
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-fg-muted">
                Har kuni eslatish vaqti (HH:MM):
              </label>
              <input
                id="reminder-time-input"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 font-mono text-sm font-bold text-neon"
              />
            </div>

            <div className="flex items-end gap-2.5">
              <button
                type="button"
                id="save-reminder-settings-btn"
                disabled={saving}
                onClick={() => handleSaveReminders(false)}
                className="btn-neon flex-1 py-2.5 text-xs font-bold"
              >
                {saving ? "Saqlanmoqda..." : "Vaqtni Saqlash"}
              </button>
              <button
                type="button"
                id="send-test-reminder-btn"
                disabled={saving}
                onClick={() => handleSaveReminders(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gold/50 bg-gold-soft px-4 py-2.5 text-xs font-bold text-gold hover:bg-gold hover:text-canvas"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Sinov Xabari</span>
              </button>
            </div>
          </div>

          {savedNotice && (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-neon">
              <CheckCircle2 className="h-4 w-4" />
              <span>Kunlik eslatma sozlamalari muvaffaqiyatli saqlandi!</span>
            </p>
          )}
        </div>

        {/* 2. Qulaylik (Accessibility) — Animatsiyalarni kamaytirish va Mavzu */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-extrabold text-fg">
                <EyeOff className="h-4 w-4 text-gold" />
                <span>Animatsiyalarni kamaytirish</span>
              </span>
              <button
                type="button"
                id="settings-reduce-motion-btn"
                onClick={toggleReduceMotion}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                  reduceMotion
                    ? "border-gold bg-gold text-canvas"
                    : "border-border bg-canvas text-fg-muted"
                }`}
              >
                {reduceMotion ? "Yoqilgan" : "O'chiq"}
              </button>
            </div>
            <p className="mt-2 text-xs text-fg-muted">
              Ko&apos;z charchashini kamaytirish va past quvvatli qurilmalarda
              tezlikni oshirish uchun fon zarrachalarini o&apos;chiradi.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-extrabold text-fg">
                <Sun className="h-4 w-4 text-neon" />
                <span>Interfeys Mavzusi</span>
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-lg border border-neon/40 bg-neon-soft px-3 py-1.5 text-xs font-bold text-neon"
              >
                {theme === "dark" ? "Qorong'u sinfxona" : "Yorug' sinfxona"}
              </button>
            </div>
            <p className="mt-2 text-xs text-fg-muted">
              Qorong&apos;u va yorug&apos; rejim o&apos;rtasida bir tugma bilan
              almashish.
            </p>
          </div>
        </div>

        {/* 3. Ota-ona va Ustoz Monitoring Havolasi */}
        <div className="mt-6 rounded-2xl border border-gold/40 bg-gold-soft/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-gold">
                <Users className="h-4 w-4" />
                <span>Ota-ona va Ustoz Ko&apos;rinishi (Maxsus Kod)</span>
              </span>
              <h3 className="mt-1 text-base font-extrabold text-fg">
                Maxsus ulashish kodi:{" "}
                <span className="font-mono text-neon">
                  {settings.guardianShareCode}
                </span>
              </h3>
              <p className="mt-1 text-xs text-fg-muted">
                Ota-onangiz yoki ustozingiz ushbu havola orqali kunlik o&apos;sishingiz
                va haftalik hisobotni ko&apos;ra oladi.
              </p>
            </div>

            <Link
              id="guardian-share-link"
              href={`/guardian?code=${settings.guardianShareCode}`}
              className="btn-neon inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Ota-ona Ko&apos;rinishini Ochish →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
