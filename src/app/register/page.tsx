"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { animate } from "animejs";
import {
  Sparkles,
  User,
  Calendar,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Brain,
  Layers,
  Sigma,
  BookOpen,
  Compass,
} from "lucide-react";
import { UZBEK_REGIONS, GRADE_OPTIONS } from "@/lib/validations/auth";
import { useUIPreferences } from "@/components/providers/AppProviders";
import { JarvisVoiceButton } from "@/components/voice/JarvisVoiceAgent";

interface DiagnosticQuestion {
  id: string;
  subject: string;
  title: string;
  prompt: string;
  options: { id: "A" | "B" | "C" | "D"; text: string }[];
  correct: "A" | "B" | "C" | "D";
  explanation: string;
}

const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "diag-math-1",
    subject: "Digital SAT Matematika",
    title: "Chiziqli Funksiyalar va Tenglamalar",
    prompt: "Agar 4x + 12 = 36 bo'lsa, 2x + 5 ning qiymati nechiga teng?",
    options: [
      { id: "A", text: "15" },
      { id: "B", text: "17" },
      { id: "C", text: "19" },
      { id: "D", text: "21" },
    ],
    correct: "B",
    explanation: "4x = 24 ⇒ x = 6. Demak, 2(6) + 5 = 12 + 5 = 17.",
  },
  {
    id: "diag-rw-1",
    subject: "SAT Reading & Writing",
    title: "Grammatika va Mantiqiy Bog'lovchilar",
    prompt: "Qaysi so'z ikki qarama-qarshi fikrni bog'lash uchun to'g'ri ishlatiladi?",
    options: [
      { id: "A", text: "Furthermore (Bundan tashqari)" },
      { id: "B", text: "Consequently (Natijada)" },
      { id: "C", text: "However (Biroq, ammo)" },
      { id: "D", text: "Similarly (Xuddi shunday)" },
    ],
    correct: "C",
    explanation: "However ziddiyatni bildiradi. Furthermore fikrni kuchaytiradi, Consequently esa natijani ko'rsatadi.",
  },
];

export default function RegisterWizardPage() {
  const router = useRouter();
  const { reduceMotion } = useUIPreferences();
  const cardRef = useRef<HTMLDivElement | null>(null);

  // 1 dan 10 gacha sahifalar (har bir ma'lumot uchun alohida sahifa)
  const [page, setPage] = useState<number>(1);

  // Foydalanuvchi kiritadigan ma'lumotlar
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [age, setAge] = useState(16);
  const [grade, setGrade] = useState<string>(GRADE_OPTIONS[3]); // 10-sinf
  const [region, setRegion] = useState<string>(UZBEK_REGIONS[0]); // Toshkent sh.
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Savollar banki javoblari
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [mathFeedback, setMathFeedback] = useState<boolean | null>(null);
  const [rwFeedback, setRwFeedback] = useState<boolean | null>(null);

  // Holatlar
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  // Sahifa o'zgarganda silliq animatsiya
  useEffect(() => {
    if (reduceMotion || !cardRef.current) return;
    animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 450,
      ease: "outExpo",
    });
  }, [page, reduceMotion]);

  const triggerShake = () => {
    if (reduceMotion || !cardRef.current) return;
    animate(cardRef.current, {
      translateX: [-8, 8, -6, 6, -3, 3, 0],
      duration: 380,
      ease: "outSine",
    });
  };

  // Navigatsiya
  const goNext = () => {
    setErrorMsg(null);
    setPage((prev) => Math.min(prev + 1, 10));
  };

  const goBack = () => {
    setErrorMsg(null);
    setPage((prev) => Math.max(prev - 1, 1));
  };

  // 1-Sahifa tekshiruvi: Ism
  const handlePage1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg("Iltimos, ismingizni to'liq kiriting (kamida 2 ta harf)");
      triggerShake();
      return;
    }
    goNext();
  };

  // 6-Sahifa: Telefon
  const handlePage6 = (e: React.FormEvent) => {
    e.preventDefault();
    goNext();
  };

  // 7-Sahifa: Email va Parol orqali hisob ochish
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Iltimos, to'g'ri email manzil kiriting");
      triggerShake();
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          gender,
          age: Number(age),
          grade,
          region,
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setErrorMsg(data.error ?? "Ro'yxatdan o'tishda xatolik yuz berdi");
        setLoading(false);
        triggerShake();
        return;
      }

      // Avtomatik tizimga kiritish
      await signIn("credentials", {
        redirect: false,
        identifier: email.trim().toLowerCase(),
        password,
      });

      setRegistered(true);
      setLoading(false);
      // Keyingi sahifaga: 1-Mashq (Savollar banki)
      setPage(8);
    } catch {
      setErrorMsg("Server bilan bog'lanishda xatolik. Qaytadan urinib ko'ring.");
      setLoading(false);
      triggerShake();
    }
  };

  // 8-Sahifa: 1-Mashq tanlanganda
  const handleChooseMath = (optId: "A" | "B" | "C" | "D") => {
    setSelectedAnswers((prev) => ({ ...prev, math: optId }));
    setMathFeedback(optId === DIAGNOSTIC_QUESTIONS[0].correct);
    setTimeout(() => {
      setPage(9);
    }, 1200);
  };

  // 9-Sahifa: 2-Mashq tanlanganda
  const handleChooseRw = (optId: "A" | "B" | "C" | "D") => {
    setSelectedAnswers((prev) => ({ ...prev, rw: optId }));
    setRwFeedback(optId === DIAGNOSTIC_QUESTIONS[1].correct);
    setTimeout(() => {
      setPage(10);
    }, 1200);
  };

  const progressPercent = Math.round((page / 10) * 100);

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8 sm:px-6">
      <div
        ref={cardRef}
        className="glass-card w-full max-w-xl p-8 sm:p-12 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.7)]"
      >
        {/* Yuqori bosqich va progress indikatori */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>RO&apos;YXATDAN O&apos;TISH &amp; MASHQLAR</span>
            </span>
            <span className="font-mono text-emerald-300">
              Sahifa {page} / 10 ({progressPercent}%)
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Xatolik xabari */}
        {errorMsg && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-2.5 rounded-2xl border border-red-500/40 bg-red-500/15 p-4 text-xs sm:text-sm font-semibold text-red-300"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ====================================================================
            SAHIFA 1: ISMINGIZ NIMA?
            ==================================================================== */}
        {page === 1 && (
          <form onSubmit={handlePage1} className="space-y-6">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                1-SAVOL (1 MA&apos;LUMOT)
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight">
                Ismingiz nima?
              </h1>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                JARVIS AI murabbiy siz bilan do&apos;stona va hurmat bilan muloqot qiladi.
              </p>
            </div>

            <div className="relative pt-2">
              <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
              <input
                type="text"
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ismingizni yozing..."
                className="w-full rounded-2xl border border-white/20 bg-white/5 py-4 pl-14 pr-4 text-lg font-bold text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>

            <button
              type="submit"
              className="btn-neon w-full flex items-center justify-center gap-2 py-4 text-base font-bold shadow-xl"
            >
              <span>Davom etish</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        )}

        {/* ====================================================================
            SAHIFA 2: JINSINGIZ (MUROJAAT OHANGI)
            ==================================================================== */}
        {page === 2 && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                2-SAVOL (1 MA&apos;LUMOT)
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight">
                Murojaat ohangini tanlang
              </h1>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Sizga mos hurmat va to&apos;g&apos;ri murojaat shaklini belgilash uchun.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setGender("MALE");
                  goNext();
                }}
                className={`group flex flex-col items-center justify-center rounded-3xl border p-6 text-center transition-all ${
                  gender === "MALE"
                    ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                    : "border-white/10 bg-white/5 hover:border-emerald-400/40 hover:bg-white/10"
                }`}
              >
                <span className="text-5xl mb-3">👨</span>
                <span className="text-lg font-black text-white">O&apos;g&apos;il bola</span>
                <span className="text-xs text-slate-400 mt-1">«Ukamiz / Og&apos;amiz»</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGender("FEMALE");
                  goNext();
                }}
                className={`group flex flex-col items-center justify-center rounded-3xl border p-6 text-center transition-all ${
                  gender === "FEMALE"
                    ? "border-amber-400 bg-amber-500/20 shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                    : "border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-white/10"
                }`}
              >
                <span className="text-5xl mb-3">👩</span>
                <span className="text-lg font-black text-white">Qiz bola</span>
                <span className="text-xs text-slate-400 mt-1">«Singlimiz / Bonumiz»</span>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Orqaga</span>
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            SAHIFA 3: YOSHINGIZ NECHIDA?
            ==================================================================== */}
        {page === 3 && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                3-SAVOL (1 MA&apos;LUMOT)
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight">
                Yoshingiz nechida?
              </h1>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Kunlik dars davomiyligi va o&apos;quv rejangizni yoshingizga moslaymiz.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              <div className="font-mono text-6xl font-black text-emerald-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                {age} <span className="text-2xl text-slate-300">yosh</span>
              </div>

              <input
                type="range"
                min={12}
                max={30}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full mt-6 h-2 rounded-full appearance-none bg-white/10 accent-emerald-400 cursor-pointer"
              />

              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {[14, 15, 16, 17, 18, 19, 20, 22].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setAge(num)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-mono font-bold transition-all ${
                      age === num
                        ? "border border-emerald-400 bg-emerald-500/25 text-emerald-300"
                        : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-bold text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Orqaga</span>
              </button>

              <button
                type="button"
                onClick={goNext}
                className="btn-neon flex-1 flex items-center justify-center gap-2 py-3.5 text-base font-bold shadow-xl"
              >
                <span>Davom etish</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            SAHIFA 4: QAYSI SINF YOKI BOSQICHDA O'QIYSIZ?
            ==================================================================== */}
        {page === 4 && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                4-SAVOL (1 MA&apos;LUMOT)
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight">
                Qaysi sinf yoki bosqichdasiz?
              </h1>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Imtihongacha qolgan vaqtingizni to&apos;g&apos;ri hisoblash uchun.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {GRADE_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGrade(g);
                    goNext();
                  }}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                    grade === g
                      ? "border-emerald-400 bg-emerald-500/20 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:bg-white/10"
                  }`}
                >
                  <GraduationCap className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-sm font-bold">{g}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-bold text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Orqaga</span>
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            SAHIFA 5: QAYSI HUDUDDANSIZ?
            ==================================================================== */}
        {page === 5 && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                5-SAVOL (1 MA&apos;LUMOT)
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight">
                Qaysi viloyat / hududdansiz?
              </h1>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Test markazlari va dars vaqtlaringizni mintaqangizga moslaymiz.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
              {UZBEK_REGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRegion(r);
                    goNext();
                  }}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
                    region === r
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:bg-white/10"
                  }`}
                >
                  <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold truncate">{r}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-bold text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Orqaga</span>
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            SAHIFA 6: TELEFON RAQAMINGIZ
            ==================================================================== */}
        {page === 6 && (
          <form onSubmit={handlePage6} className="space-y-6">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                6-SAVOL (1 MA&apos;LUMOT)
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight">
                Telefon raqamingiz
              </h1>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Muhim dars eslatmalari va hisob xavfsizligi uchun (ixtiyoriy).
              </p>
            </div>

            <div className="relative pt-2">
              <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
              <input
                type="tel"
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full rounded-2xl border border-white/20 bg-white/5 py-4 pl-14 pr-4 text-lg font-bold text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-bold text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Orqaga</span>
              </button>

              <button
                type="submit"
                className="btn-neon flex-1 flex items-center justify-center gap-2 py-3.5 text-base font-bold shadow-xl"
              >
                <span>{phone ? "Davom etish" : "O'tkazib yuborish"}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </form>
        )}

        {/* ====================================================================
            SAHIFA 7: EMAIL VA XAVFSIZ PAROL (HISOBNI YARATISH)
            ==================================================================== */}
        {page === 7 && (
          <form onSubmit={handleCreateAccount} className="space-y-6">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                7-SAVOL (KIRISH HISOBI)
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight">
                Email va Parolingiz
              </h1>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Platformaga har qanday qurilmadan kirish uchun foydalanasiz.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email manzilingiz (masalan: talaba@mail.uz)"
                  className="w-full rounded-2xl border border-white/20 bg-white/5 py-3.5 pl-12 pr-4 text-sm font-semibold text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Xavfsiz parol (kamida 6 ta belgi)"
                  className="w-full rounded-2xl border border-white/20 bg-white/5 py-3.5 pl-12 pr-4 text-sm font-semibold text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-bold text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Orqaga</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-neon flex-1 flex items-center justify-center gap-2 py-3.5 text-base font-bold shadow-xl disabled:opacity-60"
              >
                <span>{loading ? "Hisob yaratilmoqda..." : "Yaratish & Mashqlarga O'tish"}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </form>
        )}

        {/* ====================================================================
            SAHIFA 8: 1-MASHQ (SAVOLLAR BANKI — DIGITAL SAT MATEMATIKA)
            ==================================================================== */}
        {page === 8 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                  <Sigma className="h-3.5 w-3.5" />
                  <span>SAVOLLAR BANKI • 1-MASHQ</span>
                </span>
                <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white">
                  {DIAGNOSTIC_QUESTIONS[0].subject}
                </h1>
              </div>

              <JarvisVoiceButton
                text={`${DIAGNOSTIC_QUESTIONS[0].prompt}. Variantlar: ${DIAGNOSTIC_QUESTIONS[0].options.map(o => o.id + ': ' + o.text).join('. ')}`}
                label="Ovozda tinglash"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-lg font-bold text-white sm:text-xl">
                {DIAGNOSTIC_QUESTIONS[0].prompt}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {DIAGNOSTIC_QUESTIONS[0].options.map((opt) => {
                const isSelected = selectedAnswers.math === opt.id;
                let btnStyle = "border-white/15 bg-white/5 text-white hover:border-emerald-400/50 hover:bg-white/10";
                if (isSelected) {
                  btnStyle = mathFeedback
                    ? "border-emerald-400 bg-emerald-500/25 text-emerald-300 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "border-red-400 bg-red-500/25 text-red-300 font-bold";
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChooseMath(opt.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${btnStyle}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 font-mono text-sm font-extrabold text-emerald-400">
                      {opt.id}
                    </span>
                    <span className="text-base font-bold">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {mathFeedback !== null && (
              <div
                className={`rounded-2xl border p-4 text-xs font-semibold ${
                  mathFeedback
                    ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
                    : "border-amber-400 bg-amber-500/15 text-amber-300"
                }`}
              >
                <span>{DIAGNOSTIC_QUESTIONS[0].explanation}</span>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            SAHIFA 9: 2-MASHQ (SAVOLLAR BANKI — SAT READING & WRITING)
            ==================================================================== */}
        {page === 9 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 px-3 py-1 font-mono text-xs font-bold text-amber-300">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>SAVOLLAR BANKI • 2-MASHQ</span>
                </span>
                <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white">
                  {DIAGNOSTIC_QUESTIONS[1].subject}
                </h1>
              </div>

              <JarvisVoiceButton
                text={`${DIAGNOSTIC_QUESTIONS[1].prompt}. Variantlar: ${DIAGNOSTIC_QUESTIONS[1].options.map(o => o.id + ': ' + o.text).join('. ')}`}
                label="Ovozda tinglash"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-lg font-bold text-white sm:text-xl">
                {DIAGNOSTIC_QUESTIONS[1].prompt}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {DIAGNOSTIC_QUESTIONS[1].options.map((opt) => {
                const isSelected = selectedAnswers.rw === opt.id;
                let btnStyle = "border-white/15 bg-white/5 text-white hover:border-amber-400/50 hover:bg-white/10";
                if (isSelected) {
                  btnStyle = rwFeedback
                    ? "border-emerald-400 bg-emerald-500/25 text-emerald-300 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "border-red-400 bg-red-500/25 text-red-300 font-bold";
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChooseRw(opt.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${btnStyle}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 font-mono text-sm font-extrabold text-amber-300">
                      {opt.id}
                    </span>
                    <span className="text-base font-bold">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {rwFeedback !== null && (
              <div
                className={`rounded-2xl border p-4 text-xs font-semibold ${
                  rwFeedback
                    ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
                    : "border-amber-400 bg-amber-500/15 text-amber-300"
                }`}
              >
                <span>{DIAGNOSTIC_QUESTIONS[1].explanation}</span>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            SAHIFA 10: NATIJA VA SHAXSIY SINFXONAGA KIRISH
            ==================================================================== */}
        {page === 10 && (
          <div className="text-center space-y-6 py-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
                MASHQLAR YAKUNLANDI • TAYYOR!
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight">
                Tabriklaymiz, {name || "Aziz o'quvchi"}!
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Hisobingiz ochildi va dastlabki bilim darajangiz aniqlandi. 12 oylik xalqaro tayyorgarlik sinfxonangizga xush kelibsiz!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-2">
              <div className="glass-pill rounded-2xl p-4 text-center">
                <span className="block font-mono text-xl font-black text-emerald-400">
                  {mathFeedback ? "100%" : "Boshlang'ich"}
                </span>
                <span className="text-xs text-slate-400 font-semibold">SAT Matematika</span>
              </div>
              <div className="glass-pill rounded-2xl p-4 text-center">
                <span className="block font-mono text-xl font-black text-amber-300">
                  {rwFeedback ? "100%" : "Boshlang'ich"}
                </span>
                <span className="text-xs text-slate-400 font-semibold">SAT Reading &amp; Writing</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/roadmap")}
              className="btn-neon w-full flex items-center justify-center gap-3 py-4 text-lg font-bold shadow-2xl mt-4"
            >
              <Compass className="h-5 w-5" />
              <span>12 Oylik Shaxsiy Xaritamga Kirish</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Kirishga qaytish havolasi (faqat dastlabki sahifalarda) */}
        {page <= 6 && (
          <div className="mt-8 border-t border-white/10 pt-5 text-center">
            <p className="text-xs text-slate-400">
              Allaqachon hisobingiz bormi?{" "}
              <Link
                href="/login"
                className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Tizimga kirish →
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
