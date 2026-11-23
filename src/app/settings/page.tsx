"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  History as HistoryIcon,
  LayoutGrid,
  LogIn,
  LogOut,
  Mail,
  Moon,
  PenTool,
  Send,
  Settings as SettingsIcon,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
  Target,
  User,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { useUIPreferences } from "@/components/providers/AppProviders";
import { QuickGuideButton } from "@/components/learning/QuickGuideModal";
import { useLearningAdaptation } from "@/lib/learning/easy-adaptation";
import { loadSecureLocal, removeSecureLocal } from "@/lib/security/client-storage";
import {
  loadStoredPlan,
  saveStoredPlan,
  type BillingCycle,
  type PaymentMethod,
  type StoredPlanState,
} from "@/lib/billing/plan-storage";
import {
  BRAND,
  CONTACTS,
  LEGAL_LINKS,
  SETTINGS_EXTRA_SECTIONS,
  type SettingsSectionLink,
} from "@/lib/site-config";

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

type SettingsFilterTab =
  | "all"
  | "billing"
  | "sections"
  | "appearance"
  | "reminders"
  | "account";

const VALID_TABS: SettingsFilterTab[] = [
  "all",
  "billing",
  "sections",
  "appearance",
  "reminders",
  "account",
];

const DEFAULT_SETTINGS: ReminderSettingsPayload = {
  name: "Bo'lajak Talaba",
  email: "talaba@3talaba.uz",
  honorific: "Bo'lajak Talaba",
  guardianShareCode: "3TALABA-DEMO",
  reminderEnabled: true,
  reminderTime: "19:00",
  dailyGoalMinutes: 60,
  reduceMotion: false,
  theme: "dark",
};

const SECTION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "/profile": User,
  "/progress": Award,
  "/roadmap": Compass,
  "/history": HistoryIcon,
  "/examiner": PenTool,
  "/placement": Target,
  "/onboarding": Sliders,
  "/guardian": Users,
  "/admin": Shield,
  "/settings?tab=billing": Crown,
  "/#pricing": CreditCard,
  "/#faq": HelpCircle,
};

const CATEGORY_META: Array<{
  id: SettingsSectionLink["category"];
  title: string;
  subtitle: string;
}> = [
  {
    id: "personal",
    title: "Shaxsiy Kabinet va O'sish",
    subtitle: "Profil, XP reytingi, 12 oylik xarita va o'tilgan darslar konspekti",
  },
  {
    id: "tools",
    title: "Qo'shimcha Imtihon va AI Asboblari",
    subtitle: "AI Writing Examiner, bilim diagnostikasi va maqsad sozlamalari",
  },
  {
    id: "info",
    title: "Nazorat, Boshqaruv va Ma'lumot",
    subtitle: "Ota-ona monitoringi, admin panel, tariflar va ko'p so'raladigan savollar",
  },
];

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  hint: string;
}> = [
  { id: "click", label: "Click", hint: "Uzcard / Humo tezkor to'lov" },
  { id: "payme", label: "Payme", hint: "Mobil ilova orqali tasdiqlash" },
  { id: "uzum", label: "Uzum / Karta", hint: "Bank kartasi orqali" },
  { id: "telegram", label: "Telegram Admin", hint: "@talaba3_support_bot orqali" },
];

const PRO_FEATURES = [
  "Barcha 15+ matematika, SAT va IELTS modullari",
  "SAT & IELTS to'liq savollar banki",
  `24/7 cheksiz ${BRAND.aiName} murabbiy va ovozli tushuntirish`,
  "To'liq CD-IELTS & SAT Mock imtihonlar",
  "Grant strategiyasi va shaxsiy 12 oylik reja",
];

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { theme, toggleTheme, reduceMotion, toggleReduceMotion } = useUIPreferences();
  const { pace, setPace, options: paceOptions } = useLearningAdaptation();

  const tabParam = searchParams.get("tab") as SettingsFilterTab | null;
  const upgradeParam = searchParams.get("upgrade");

  const initialTab: SettingsFilterTab =
    tabParam && VALID_TABS.includes(tabParam)
      ? tabParam
      : upgradeParam === "pro"
        ? "billing"
        : "all";

  const [activeTab, setActiveTab] = useState<SettingsFilterTab>(initialTab);
  const [settings, setSettings] = useState<ReminderSettingsPayload | null>(null);
  const [localUser, setLocalUser] = useState<{ name?: string; email?: string } | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("19:00");
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [preview, setPreview] = useState<NotificationPreview | null>(null);

  // Tarif va Obuna holati
  const [planState, setPlanState] = useState<StoredPlanState>({
    plan: "free",
    billingCycle: "monthly",
  });
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("click");
  const [planLoading, setPlanLoading] = useState(false);
  const [planNotice, setPlanNotice] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (upgradeParam === "pro") {
      setActiveTab("billing");
    }
  }, [tabParam, upgradeParam]);

  useEffect(() => {
    const parsed = loadSecureLocal<{ name?: string; email?: string }>("3talaba_user");
    if (parsed?.name || parsed?.email) setLocalUser(parsed);

    const savedPlan = loadStoredPlan();
    setPlanState(savedPlan);
    setBillingCycle(savedPlan.billingCycle);
    if (savedPlan.paymentMethod) {
      setPaymentMethod(savedPlan.paymentMethod);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/reminders");
        if (res.ok && active) {
          const data = (await res.json()) as ReminderSettingsPayload;
          setSettings(data);
          setReminderEnabled(data.reminderEnabled);
          setReminderTime(data.reminderTime);
          return;
        }
      } catch {
        // fallback below
      }
      if (active) {
        setSettings(DEFAULT_SETTINGS);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const switchTab = (tab: SettingsFilterTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") {
      params.delete("tab");
      params.delete("upgrade");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    router.replace(qs ? `/settings?${qs}` : "/settings", { scroll: false });
  };

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

  const handleUpdatePlan = async (targetPlan: "free" | "pro") => {
    setPlanLoading(true);
    setPlanNotice(null);
    try {
      const res = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: targetPlan,
          billingCycle,
          paymentMethod,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        orderId?: string;
        activatedAt?: string;
        error?: string;
      };

      const nextState: StoredPlanState = {
        plan: targetPlan,
        billingCycle,
        paymentMethod,
        orderId: data.orderId ?? `3T-${targetPlan.toUpperCase()}`,
        activatedAt: data.activatedAt ?? new Date().toISOString(),
      };

      saveStoredPlan(nextState);
      setPlanState(nextState);

      if (targetPlan === "pro") {
        setPlanNotice(
          `Pro Campus muvaffaqiyatli faollashtirildi! Buyurtma raqami: ${nextState.orderId}. Qayta ro'yxatdan o'tish shart emas — barcha modullar ochiq.`
        );
      } else {
        setPlanNotice("Obuna bekor qilindi. Siz Boshlang'ich (Bepul) tarifga o'tdingiz.");
      }
    } catch {
      const fallbackState: StoredPlanState = {
        plan: targetPlan,
        billingCycle,
        paymentMethod,
        orderId: `3T-${targetPlan.toUpperCase()}-LOCAL`,
        activatedAt: new Date().toISOString(),
      };
      saveStoredPlan(fallbackState);
      setPlanState(fallbackState);
      setPlanNotice(
        targetPlan === "pro"
          ? "Pro Campus hisobingizda faollashtirildi!"
          : "Boshlang'ich (Bepul) tarifga qaytdingiz."
      );
    } finally {
      setPlanLoading(false);
    }
  };

  const handleCopyGuardianCode = async () => {
    if (!settings?.guardianShareCode) return;
    try {
      await navigator.clipboard.writeText(settings.guardianShareCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const handleSignOut = () => {
    removeSecureLocal("3talaba_user");
    removeSecureLocal("3talaba_plan");
    setLocalUser(null);
    if (session?.user) {
      signOut({ callbackUrl: "/" });
    } else {
      window.location.href = "/";
    }
  };

  if (!settings) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-fg-muted">Sozlamalar yuklanmoqda...</p>
      </div>
    );
  }

  const activeUserName = session?.user?.name ?? localUser?.name ?? null;
  const activeUserEmail = session?.user?.email ?? localUser?.email ?? settings.email;
  const isLoggedIn = Boolean(session?.user || localUser?.name || localUser?.email);

  const showBilling = activeTab === "all" || activeTab === "billing";
  const showSections = activeTab === "all" || activeTab === "sections";
  const showAppearance = activeTab === "all" || activeTab === "appearance";
  const showReminders = activeTab === "all" || activeTab === "reminders";
  const showAccount = activeTab === "all" || activeTab === "account";

  const isPro = planState.plan === "pro";
  const displayedPrice = billingCycle === "yearly" ? "119 000 so'm" : "149 000 so'm";
  const displayedTotal = billingCycle === "yearly" ? "1 428 000 so'm / yil" : "149 000 so'm / oy";

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      {/* ====================================================================
          YUQORI SARLAVHA VA FILTR TABLARI
          ==================================================================== */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
              <SettingsIcon className="h-3.5 w-3.5" />
              <span>SOZLAMALAR VA QO&apos;SHIMCHA BO&apos;LIMLAR MARKAZI</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">
              <span className="text-gold">{activeUserName ?? settings.honorific}</span>, o&apos;qish
              tartibi va bildirishnomalar
            </h1>
            <p className="mt-1 text-xs text-fg-muted sm:text-sm">
              Asosiy menyu toza qolishi uchun tarif boshqaruvi, barcha qo&apos;shimcha
              bo&apos;limlar, interfeys sozlamalari va hisob shu yerga jamlandi.
            </p>
          </div>

          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-fg transition-colors hover:border-neon hover:text-neon"
          >
            <BookOpen className="h-4 w-4" />
            <span>← Darslarga qaytish</span>
          </Link>
        </div>

        {/* Kategoriya filtri */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all" as const, label: "Barchasi", icon: LayoutGrid },
            { id: "billing" as const, label: "Tarif & Obuna", icon: Crown },
            { id: "sections" as const, label: "Qo'shimcha Bo'limlar", icon: Compass },
            { id: "appearance" as const, label: "Ko'rinish & Usul", icon: Sliders },
            { id: "reminders" as const, label: "Eslatmalar & Nazorat", icon: Bell },
            { id: "account" as const, label: "Hisob & Aloqa", icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  active
                    ? "bg-neon text-canvas shadow-neon"
                    : "border border-border bg-surface text-fg-muted hover:border-neon/50 hover:text-fg"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          0. TARIF VA OBUNA (RO'YXATDAN O'TGAN PROFILNI PRO'GA O'TKAZISH)
          ==================================================================== */}
      {showBilling && (
        <section
          id="billing-section"
          className={`glass-card p-6 sm:p-8 space-y-6 ${
            upgradeParam === "pro" ? "border-neon/60 shadow-neon" : ""
          }`}
          aria-labelledby="billing-heading"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-gold">
                <Crown className="h-4 w-4" />
                <span>Tarif va Obuna Boshqaruvi</span>
              </span>
              <h2 id="billing-heading" className="mt-1 text-xl font-extrabold text-fg">
                Joriy tarif:{" "}
                <span className={isPro ? "text-neon" : "text-gold"}>
                  {isPro ? "Pro Campus (Faol)" : "Boshlang'ich (Bepul)"}
                </span>
              </h2>
              <p className="mt-1 text-xs text-fg-muted">
                {isLoggedIn
                  ? `Faol profil: ${activeUserName ?? settings.name} (${activeUserEmail}) — qayta ro'yxatdan o'tmasdan shu yerning o'zida tarifni o'zgartiring.`
                  : "Pullik tarifga o'tish uchun avval mavjud hisobingizga kiring yoki yangi hisob oching."}
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs font-extrabold ${
                isPro
                  ? "border-neon/50 bg-neon-soft text-neon"
                  : "border-border bg-surface text-fg-muted"
              }`}
            >
              {isPro ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              <span>{isPro ? "PRO FAOL" : "BEPUL REJA"}</span>
            </span>
          </div>

          {planNotice && (
            <div className="rounded-2xl border border-neon/50 bg-neon-soft/20 p-4 text-xs sm:text-sm font-bold text-neon flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{planNotice}</span>
            </div>
          )}

          {!isLoggedIn ? (
            <div className="rounded-2xl border border-gold/40 bg-gold-soft/10 p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-fg">
                  Avval hisobingizga kiring
                </h3>
                <p className="mt-1 text-xs text-fg-muted">
                  Allaqachon ro&apos;yxatdan o&apos;tgan bo&apos;lsangiz, qaytadan ro&apos;yxatdan
                  o&apos;tmang — shunchaki tizimga kiring va Pro Campus&apos;ni faollashtiring.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/login?next=${encodeURIComponent("/settings?tab=billing&upgrade=pro")}`}
                  className="btn-neon inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Hisobga kirish</span>
                </Link>
                <Link
                  href="/register?plan=pro"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-fg hover:border-neon"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Yangi hisob ochish</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Chap: Pro Campus imkoniyatlari */}
              <div className="rounded-2xl border border-neon/40 bg-surface p-5 sm:p-6 lg:col-span-5 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-black text-fg">
                      <Crown className="h-4 w-4 text-gold" />
                      <span>Pro Campus</span>
                    </span>
                    <span className="rounded-md bg-neon-soft px-2 py-0.5 font-mono text-[10px] font-extrabold text-neon">
                      TO&apos;LIQ KIRISH
                    </span>
                  </div>

                  <div className="mt-4 flex items-end gap-2">
                    <span className="font-mono text-3xl font-black text-neon">
                      {displayedPrice}
                    </span>
                    <span className="pb-1 text-xs font-semibold text-fg-muted">/ oyiga</span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-gold">
                    Jami to&apos;lov: {displayedTotal}
                  </p>

                  <ul className="mt-5 space-y-2.5 border-t border-border pt-4">
                    {PRO_FEATURES.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-xs text-fg">
                        <Check className="h-4 w-4 shrink-0 text-neon mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isPro && planState.orderId && (
                  <div className="rounded-xl border border-neon/30 bg-neon-soft/15 px-3.5 py-2.5 text-[11px] font-mono text-neon">
                    Faol buyurtma: <strong>{planState.orderId}</strong>
                  </div>
                )}
              </div>

              {/* O'ng: Muddat, to'lov usuli va faollashtirish */}
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 lg:col-span-7 space-y-5">
                {/* Oylik / Yillik tanlov */}
                <div className="space-y-2">
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-fg-muted">
                    1. Obuna muddatini tanlang
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBillingCycle("monthly")}
                      className={`rounded-xl border p-3.5 text-left transition-all ${
                        billingCycle === "monthly"
                          ? "border-neon bg-neon-soft/20 text-fg shadow-neon"
                          : "border-border bg-canvas text-fg-muted hover:border-neon/40"
                      }`}
                    >
                      <span className="block text-xs font-extrabold text-fg">Oylik reja</span>
                      <span className="mt-0.5 block font-mono text-sm font-black text-neon">
                        149 000 so&apos;m / oy
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBillingCycle("yearly")}
                      className={`relative rounded-xl border p-3.5 text-left transition-all ${
                        billingCycle === "yearly"
                          ? "border-neon bg-neon-soft/20 text-fg shadow-neon"
                          : "border-border bg-canvas text-fg-muted hover:border-neon/40"
                      }`}
                    >
                      <span className="absolute -top-2 right-3 rounded-full bg-gold px-2 py-0.5 font-mono text-[10px] font-black text-canvas">
                        -20% TEJASH
                      </span>
                      <span className="block text-xs font-extrabold text-fg">Yillik reja</span>
                      <span className="mt-0.5 block font-mono text-sm font-black text-neon">
                        119 000 so&apos;m / oy
                      </span>
                    </button>
                  </div>
                </div>

                {/* To'lov usuli */}
                <div className="space-y-2">
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-fg-muted">
                    2. To&apos;lov usulini tanlang
                  </span>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {PAYMENT_METHODS.map((pm) => {
                      const selected = paymentMethod === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`rounded-xl border p-3 text-left transition-all ${
                            selected
                              ? "border-neon bg-neon-soft/20"
                              : "border-border bg-canvas hover:border-neon/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-fg">{pm.label}</span>
                            {selected && <CheckCircle2 className="h-3.5 w-3.5 text-neon" />}
                          </div>
                          <span className="mt-0.5 block text-[11px] text-fg-muted">{pm.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Harakat tugmalari */}
                <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
                  {!isPro ? (
                    <button
                      type="button"
                      id="activate-pro-plan-btn"
                      disabled={planLoading}
                      onClick={() => handleUpdatePlan("pro")}
                      className="btn-neon flex-1 inline-flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-extrabold disabled:opacity-60"
                    >
                      <Crown className="h-4 w-4" />
                      <span>
                        {planLoading
                          ? "Faollashtirilmoqda..."
                          : `Pro Campus'ga o'tish (${displayedTotal})`}
                      </span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={planLoading}
                        onClick={() => handleUpdatePlan("pro")}
                        className="btn-neon flex-1 inline-flex items-center justify-center gap-2 py-3 text-xs font-extrabold disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{planLoading ? "Yangilanmoqda..." : "Reja parametrini saqlash"}</span>
                      </button>
                      <button
                        type="button"
                        disabled={planLoading}
                        onClick={() => handleUpdatePlan("free")}
                        className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300 hover:bg-red-500/20"
                      >
                        Obunani bekor qilish
                      </button>
                    </>
                  )}

                  <a
                    href={CONTACTS.supportBot.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-4 py-3 text-xs font-bold text-fg-muted hover:border-neon hover:text-neon"
                  >
                    <Bot className="h-4 w-4" />
                    <span>Admin yordami</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ====================================================================
          1. QO'SHIMCHA BO'LIMLAR (BARCHA KO'CHIRILGAN MENYULAR)
          ==================================================================== */}
      {showSections && (
        <section className="glass-card p-6 sm:p-8 space-y-6" aria-labelledby="extra-sections-heading">
          <div className="border-b border-border pb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-neon">
              <LayoutGrid className="h-4 w-4" />
              <span>Barcha Qo&apos;shimcha Bo&apos;limlar</span>
            </span>
            <h2 id="extra-sections-heading" className="mt-1 text-xl font-extrabold text-fg">
              Platforma Bo&apos;limlari va Asboblari
            </h2>
          </div>

          <div className="space-y-6">
            {CATEGORY_META.map((cat) => {
              const items = SETTINGS_EXTRA_SECTIONS.filter((s) => s.category === cat.id);
              return (
                <div key={cat.id} className="space-y-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-fg">{cat.title}</h3>
                    <p className="text-xs text-fg-muted">{cat.subtitle}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item) => {
                      const Icon = SECTION_ICON_MAP[item.href] ?? Compass;
                      const resolvedHref =
                        item.href === "/guardian" && settings.guardianShareCode
                          ? `/guardian?code=${settings.guardianShareCode}`
                          : item.href;

                      return (
                        <Link
                          key={item.href}
                          href={resolvedHref}
                          className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 transition-all hover:border-neon/60 hover:bg-elevated/80"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-neon/25 bg-neon-soft text-neon transition-transform group-hover:scale-105">
                                <Icon className="h-4 w-4" />
                              </span>
                              {item.badge && (
                                <span className="rounded-md border border-gold/30 bg-gold-soft px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase text-gold">
                                  {item.badge}
                                </span>
                              )}
                            </div>

                            <h4 className="mt-3 text-sm font-extrabold text-fg group-hover:text-neon transition-colors">
                              {item.label}
                            </h4>
                            <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                              {item.description}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-neon">
                            <span>Ochish</span>
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ====================================================================
          2. O'RGANISH USULI, YO'L-YO'RIQ VA INTERFEYS KO'RINISHI
          ==================================================================== */}
      {showAppearance && (
        <section className="glass-card p-6 sm:p-8 space-y-6" aria-labelledby="appearance-heading">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-gold">
                <Sparkles className="h-4 w-4" />
                <span>Moslashuv va Qulaylik</span>
              </span>
              <h2 id="appearance-heading" className="mt-1 text-xl font-extrabold text-fg">
                O&apos;rganish Usuli, Yo&apos;l-Yo&apos;riq va Interfeys Ko&apos;rinishi
              </h2>
            </div>

            <QuickGuideButton />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-neon">
                <Zap className="h-3.5 w-3.5" />
                <span>Tushuntirish Usuli (Barcha darslar va AI javoblariga qo&apos;llanadi)</span>
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {paceOptions.map((opt) => {
                const isSelected = pace === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPace(opt.id)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-neon bg-neon-soft/20 shadow-neon"
                        : "border-border bg-surface hover:border-neon/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-neon-soft px-2 py-0.5 font-mono text-[10px] font-extrabold text-neon">
                        {opt.badge}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-neon px-2 py-0.5 text-[10px] font-black text-canvas">
                          <CheckCircle2 className="h-3 w-3" />
                          Faol
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-sm font-extrabold text-fg">{opt.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-fg-muted">{opt.summary}</p>
                    <p className="mt-2 border-t border-border pt-2 font-mono text-[11px] text-neon">
                      ⏱ {opt.dailyPlan}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-extrabold text-fg">
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-neon" />
                  ) : (
                    <Moon className="h-4 w-4 text-gold" />
                  )}
                  <span>Interfeys Mavzusi</span>
                </span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === "dark" ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}
                  className="rounded-xl border border-neon/40 bg-neon-soft px-3.5 py-1.5 text-xs font-bold text-neon transition-colors hover:bg-neon hover:text-canvas"
                >
                  {theme === "dark" ? "Qorong'u sinfxona" : "Yorug' sinfxona"}
                </button>
              </div>
              <p className="mt-2 text-xs text-fg-muted">
                Qorong&apos;u va yorug&apos; rejim o&apos;rtasida bir tugma bilan
                almashish.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-extrabold text-fg">
                  {reduceMotion ? (
                    <EyeOff className="h-4 w-4 text-gold" />
                  ) : (
                    <Eye className="h-4 w-4 text-gold" />
                  )}
                  <span>Animatsiyalarni kamaytirish</span>
                </span>
                <button
                  type="button"
                  id="settings-reduce-motion-btn"
                  onClick={toggleReduceMotion}
                  aria-label="Animatsiyalarni kamaytirish"
                  className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    reduceMotion
                      ? "border-gold bg-gold text-canvas"
                      : "border-border bg-canvas text-fg-muted hover:border-gold/50 hover:text-fg"
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
          </div>
        </section>
      )}

      {/* ====================================================================
          3. KUNLIK ESLATMALAR VA OTA-ONA NAZORATI
          ==================================================================== */}
      {showReminders && (
        <section className="glass-card p-6 sm:p-8 space-y-6" aria-labelledby="reminders-heading">
          {preview && (
            <div
              id="live-notification-banner"
              className="rounded-2xl border border-neon bg-neon-soft/20 p-5 shadow-neon"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-neon px-2.5 py-0.5 font-mono text-[10px] font-extrabold text-canvas">
                    JONLI PUSH &amp; EMAIL BILDIRISHNOMA SINOVI
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

          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2
                  id="reminders-heading"
                  className="flex items-center gap-2 text-base font-extrabold text-fg"
                >
                  <Clock className="h-5 w-5 text-neon" />
                  <span>Kunlik O&apos;qish Eslatmasi (Email &amp; Web Push)</span>
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
                <label
                  htmlFor="reminder-time-input"
                  className="mb-1.5 block text-xs font-bold text-fg-muted"
                >
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

          <div className="rounded-2xl border border-gold/40 bg-gold-soft/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-gold">
                  <Users className="h-4 w-4" />
                  <span>Ota-ona va Ustoz Ko&apos;rinishi (Maxsus Kod)</span>
                </span>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-extrabold text-fg">
                    Maxsus ulashish kodi:{" "}
                    <span className="font-mono text-neon">
                      {settings.guardianShareCode}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyGuardianCode}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-bold text-fg-muted hover:border-neon hover:text-neon"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-3 w-3 text-neon" />
                        <span>Nusxalandi</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Nusxalash</span>
                      </>
                    )}
                  </button>
                </div>
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
        </section>
      )}

      {/* ====================================================================
          4. HISOB, ALOQA VA HUQUQIY HUJJATLAR
          ==================================================================== */}
      {showAccount && (
        <section className="glass-card p-6 sm:p-8 space-y-6" aria-labelledby="account-heading">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-neon">
                <User className="h-4 w-4" />
                <span>Hisob va Qo&apos;llab-quvvatlash</span>
              </span>
              <h2 id="account-heading" className="mt-1 text-xl font-extrabold text-fg">
                {activeUserName ? activeUserName : settings.name}
              </h2>
              <p className="text-xs text-fg-muted">{activeUserEmail}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="rounded-xl border border-neon/40 bg-neon-soft px-4 py-2 text-xs font-bold text-neon hover:bg-neon hover:text-canvas transition-colors"
                  >
                    Profilni Ochish
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Hisobdan chiqish</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-fg hover:border-neon"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Kirish</span>
                  </Link>
                  <Link
                    href="/register"
                    className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Ro&apos;yxatdan o&apos;tish</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { ...CONTACTS.telegramChannel, icon: Send, external: true },
              { ...CONTACTS.supportBot, icon: Bot, external: true },
              { ...CONTACTS.email, icon: Mail, external: false },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-neon/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neon-soft text-neon">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-fg-muted">
                      {item.label}
                    </span>
                    <span className="block truncate text-xs font-extrabold text-fg">
                      {item.handle}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-fg-muted">
            <div className="flex flex-wrap items-center gap-4">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 font-semibold hover:text-neon transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
            <span>3Talaba Campus • Barcha huquqlar himoyalangan</span>
          </div>
        </section>
      )}
    </div>
  );
}

export default function SettingsAndRemindersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-sm text-fg-muted">Sozlamalar yuklanmoqda...</p>
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}
