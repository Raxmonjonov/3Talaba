"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Filter,
  History,
  Lightbulb,
  Printer,
  Search,
  Sparkles,
  Trophy,
  Volume2,
  ArrowRight,
  BookMarked,
  FileText,
} from "lucide-react";
import { JarvisVoiceButton } from "@/components/voice/JarvisVoiceAgent";

interface LessonHistoryItem {
  id: string;
  slug: string;
  titleUz: string;
  summaryUz: string;
  theoryMarkdown: string;
  examples: Array<{
    title: string;
    problem: string;
    stepByStepSolution: string[];
    takeaway: string;
  }>;
  estMinutes: number;
  xpReward: number;
  subjectSlug: string;
  subjectNameUz: string;
  topicTitleUz: string;
  isCompleted: boolean;
  questionsCount: number;
}


const FALLBACK_LESSONS: LessonHistoryItem[] = [
  {
    id: "fb-1",
    slug: "chiziqli-tenglamalar-sat",
    titleUz: "Digital SAT: Chiziqli Tenglamalar va Grafik Tahlili",
    summaryUz: "SAT Math 1-modulida eng ko'p uchraydigan chiziqli tenglamalar, burchak koeffitsiyenti (slope) va kesishish nuqtalarini topish sirlari.",
    theoryMarkdown: "Chiziqli tenglamalarning umumiy ko'rinishi: y = mx + b. Bu yerda m — to'g'ri chiziqning qiyaligi (slope = (y₂ - y₁) / (x₂ - x₁)), b esa y-o'qi bilan kesishish nuqtasi (y-intercept). Agar ikki to'g'ri chiziq parallel bo'lsa, ularning qiyaliklari teng bo'ladi (m₁ = m₂). Agar perpendikulyar bo'lsa, ularning qiyaliklari ko'paytmasi -1 ga teng bo'ladi.",
    examples: [
      {
        title: "SAT Savoli: Burchak koeffitsiyenti",
        problem: "Agar to'g'ri chiziq (2, 5) va (6, 13) nuqtalardan o'tsa, uning burchak koeffitsiyentini va tenglamasini toping.",
        stepByStepSolution: [
          "1. Qiyalik formulasi: m = (13 - 5) / (6 - 2) = 8 / 4 = 2.",
          "2. y = mx + b tenglamasiga (2, 5) nuqtani qo'yamiz: 5 = 2(2) + b => b = 1.",
          "3. Yechim: y = 2x + 1.",
        ],
        takeaway: "SAT da qiyalikni topish orqali 10 soniyada to'g'ri javobni variantlardan ajratib olish mumkin.",
      },
    ],
    estMinutes: 20,
    xpReward: 50,
    subjectSlug: "sat-math",
    subjectNameUz: "Digital SAT Matematika",
    topicTitleUz: "Algebraik Asoslar",
    isCompleted: true,
    questionsCount: 12,
  },
  {
    id: "fb-2",
    slug: "kvadrat-tenglamalar-viyet",
    titleUz: "Algebra: Kvadrat Tenglamalar va Viyet Teoremasi",
    summaryUz: "Kvadrat tenglamalarni diskriminantsiz, Viyet teoremasi yordamida soniyalar ichida yechish uslubi.",
    theoryMarkdown: "ax² + bx + c = 0 kvadrat tenglamasi uchun, agar a = 1 bo'lsa (x² + px + q = 0):\nIldizlar yig'indisi: x₁ + x₂ = -p\nIldizlar ko'paytmasi: x₁ · x₂ = q.\nDiskriminant D = b² - 4ac. Agar D > 0 bo'lsa, ikkita haqiqiy ildiz; D = 0 bo'lsa, bitta karrali ildiz; D < 0 bo'lsa, haqiqiy ildiz yo'q.",
    examples: [
      {
        title: "Tezkor Yechim Misoli",
        problem: "x² - 9x + 20 = 0 tenglamaning ildizlarini Viyet orqali toping.",
        stepByStepSolution: [
          "1. Ildizlar yig'indisi: 9.",
          "2. Ildizlar ko'paytmasi: 20.",
          "3. 20 ning ko'paytuvchilari: 4 va 5 (4 + 5 = 9). Demak, x₁ = 4, x₂ = 5.",
        ],
        takeaway: "Kvadrat tenglamani og'zaki yechish imtihonda 1.5 daqiqa vaqtni tejaydi.",
      },
    ],
    estMinutes: 25,
    xpReward: 60,
    subjectSlug: "math-foundations",
    subjectNameUz: "Algebra & Geometriya",
    topicTitleUz: "Tenglamalar va Funksiyalar",
    isCompleted: true,
    questionsCount: 15,
  },
  {
    id: "fb-3",
    slug: "ielts-writing-task2-structure",
    titleUz: "IELTS Academic: Task 2 Essay 4-Paragraf Qolipi",
    summaryUz: "Band 7.5+ insho yozishning aniq arxitekturasi: Kirish, 2 ta Asosiy Tanaviy Abzas va Xulosa.",
    theoryMarkdown: "Academic Essay tuzilishi:\n1. Introduction (2 gap): Savolni parafraz qilish + Thesis statement (shaxsiy pozitsiya).\n2. Body Paragraph 1 (4-5 gap): Topic sentence + Tushuntirish + Hayotiy yoki ilmiy misol + Xulosa.\n3. Body Paragraph 2 (4-5 gap): Qarshi dalil yoki ikkinchi sabab + Isbot + Tahlil.\n4. Conclusion (2 gap): Thesis statementni yangi so'zlar bilan takrorlash + Kelajak xulosasi.",
    examples: [
      {
        title: "Paraphrase Namunasi",
        problem: "Savol: Some people think universities should focus on graduates' employment, while others think education is valuable in itself.",
        stepByStepSolution: [
          "1. Parafraz: While it is argued that higher education institutions ought to prioritize career preparation, others believe knowledge has inherent value.",
          "2. Shaxsiy pozitsiya: In my view, while employability is vital for economic progress, fostering critical thinking is the primary purpose of academia.",
        ],
        takeaway: "Aniq va boy so'z boyligi (lexical resource) orqali darhol 7.0+ ball kafolatlanadi.",
      },
    ],
    estMinutes: 30,
    xpReward: 70,
    subjectSlug: "ielts",
    subjectNameUz: "IELTS Academic",
    topicTitleUz: "Writing & Lexical Resource",
    isCompleted: true,
    questionsCount: 8,
  },
  {
    id: "fb-4",
    slug: "sat-rw-transitions-punctuation",
    titleUz: "SAT Reading & Writing: Tinish Belgilari va Bog'lovchilar",
    summaryUz: "Semicolon (;), Em-dash (—), Colon (:) va vergullardan foydalanish qoidalari bo'yicha mukammal qo'llanma.",
    theoryMarkdown: "1. Nuqtali vergul (;) faqat ikkita mustaqil gapni (independent clauses) bog'laydi: [Mustaqil gap] ; [Mustaqil gap].\n2. Ikki nuqta (:) oldida ALBATTA to'liq mustaqil gap bo'lishi kerak. Ikki nuqtadan keyin esa tushuntirish, ro'yxat yoki bitta so'z kelishi mumkin.\n3. Em-dash (—) qo'shimcha izoh yoki kutilmagan to'xtalish uchun ishlatiladi.\n4. Bog'lovchilar: However / Therefore / Furthermore gap boshida yoki ikki nuqtali verguldan keyin vergul bilan ajratiladi.",
    examples: [
      {
        title: "SAT Original Test Savoli",
        problem: "The scientist conducted the experiment three times (____) the results were inconclusive.",
        stepByStepSolution: [
          "A) ; but (Xato, nuqtali verguldan keyin 'but' kerak emas)",
          "B) ; however, (To'g'ri, ikki mustaqil fikr ziddiyati)",
          "C) , however (Xato, comma splice xatosi)",
          "D) : however (Xato)",
        ],
        takeaway: "Mustaqil gaplar orasida tinish belgilarini ajratish SAT Writing bo'limida 60+ ball beradi.",
      },
    ],
    estMinutes: 20,
    xpReward: 45,
    subjectSlug: "sat-rw",
    subjectNameUz: "SAT Reading & Writing",
    topicTitleUz: "Grammar & Conventions",
    isCompleted: true,
    questionsCount: 10,
  },
];

export default function LessonHistoryPage() {
  const [lessons, setLessons] = useState<LessonHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<"all" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.lessons && data.lessons.length > 0) {
          setLessons(data.lessons);
          setActiveLessonId(data.lessons[0].id);
        } else {
          setLessons(FALLBACK_LESSONS);
          setActiveLessonId(FALLBACK_LESSONS[0].id);
        }
      })
      .catch(() => {
        setLessons(FALLBACK_LESSONS);
        setActiveLessonId(FALLBACK_LESSONS[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of lessons) {
      if (!map.has(l.subjectSlug)) {
        map.set(l.subjectSlug, l.subjectNameUz);
      }
    }
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return lessons.filter((l) => {
      if (selectedSubject !== "all" && l.subjectSlug !== selectedSubject) return false;
      if (filterMode === "completed" && !l.isCompleted) return false;
      if (!q) return true;
      return (
        l.titleUz.toLowerCase().includes(q) ||
        l.summaryUz.toLowerCase().includes(q) ||
        l.theoryMarkdown.toLowerCase().includes(q) ||
        l.topicTitleUz.toLowerCase().includes(q) ||
        l.subjectNameUz.toLowerCase().includes(q)
      );
    });
  }, [lessons, selectedSubject, filterMode, searchQuery]);

  const activeLesson = useMemo(() => {
    return lessons.find((l) => l.id === activeLessonId) || filteredLessons[0] || null;
  }, [lessons, activeLessonId, filteredLessons]);

  const handleCopyText = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const completedCount = lessons.filter((l) => l.isCompleted).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Sarlavha (Glass Card) */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
                <History className="h-3.5 w-3.5" />
                <span>DARS TARIXI VA ARXIVI • MATN & OVOZLI O&apos;QISh</span>
              </div>
              <Link
                href="/profile?tab=history"
                className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-400/20 transition-all"
              >
                <span>Mening Profilimda ochish</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-4xl tracking-tight">
              Barcha O&apos;tilgan va Tugatilgan Darslar Matni
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-fg-muted max-w-3xl">
              Har bir dars to&apos;liq nazariy matni, formulalari, hayotiy misollari va Talaba AI ovozli audiosi bilan
              bir joyda. Istalgan darsni qayta o&apos;qing, nusxalang yoki tinglang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="glass-pill rounded-2xl px-4 py-2.5 text-center flex items-center gap-2.5">
              <Trophy className="h-5 w-5 text-gold" />
              <div className="text-left">
                <span className="block font-mono text-xs font-bold text-gold">
                  {completedCount} / {lessons.length}
                </span>
                <span className="block text-[10px] text-fg-muted">Tugatilgan darslar</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="glass-pill inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-fg hover:text-neon"
              title="Dars matnini chop etish yoki PDF sifatida saqlash"
            >
              <Printer className="h-4 w-4" />
              <span>Chop etish / PDF</span>
            </button>
          </div>
        </div>

        {/* Filtrlar va Qidiruv */}
        <div className="mt-6 grid gap-4 sm:grid-cols-12 items-center">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-fg-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Dars matnidan qidirish (mavzu, formula, qoida)..."
              className="w-full rounded-2xl border border-white/10 bg-canvas/80 py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-muted focus:border-neon focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-canvas/80 px-3.5 py-2.5 text-xs sm:text-sm text-fg focus:border-neon focus:outline-none"
            >
              <option value="all">Barcha fanlar ({lessons.length} ta dars)</option>
              {subjects.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex gap-2">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                filterMode === "all"
                  ? "bg-neon text-slate-950 font-extrabold shadow-neon"
                  : "glass-pill text-fg-muted hover:text-fg"
              }`}
            >
              Barchasi ({lessons.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("completed")}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                filterMode === "completed"
                  ? "bg-gold text-slate-950 font-extrabold shadow-gold"
                  : "glass-pill text-fg-muted hover:text-fg"
              }`}
            >
              Tugatilgan ({completedCount})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-sm text-fg-muted">
          Darslar tarixi yuklanmoqda...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Chap ustun: Darslar ro'yxati */}
          <aside className="glass-card p-4 h-fit max-h-[820px] overflow-y-auto space-y-2.5">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-white/10 text-xs font-bold text-fg-muted">
              <span>Darslar ({filteredLessons.length})</span>
              <span>Holat</span>
            </div>

            {filteredLessons.map((lesson) => {
              const active = lesson.id === activeLesson?.id;
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    active
                      ? "border-neon bg-neon-soft/30 shadow-neon"
                      : "border-white/5 bg-surface/50 hover:border-white/20 hover:bg-surface/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-gold uppercase tracking-wider line-clamp-1">
                      {lesson.subjectNameUz}
                    </span>
                    {lesson.isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neon">
                        <CheckCircle2 className="h-3 w-3" /> Tugatilgan
                      </span>
                    ) : (
                      <span className="text-[10px] text-fg-muted">O&apos;qilmoqda</span>
                    )}
                  </div>

                  <h3 className={`mt-1.5 text-sm font-bold line-clamp-2 ${active ? "text-neon" : "text-fg"}`}>
                    {lesson.titleUz}
                  </h3>

                  <div className="mt-2.5 flex items-center gap-3 text-[11px] text-fg-muted">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" /> {lesson.estMinutes} daq
                    </span>
                    <span className="font-mono text-gold">+{lesson.xpReward} XP</span>
                  </div>
                </button>
              );
            })}

            {filteredLessons.length === 0 && (
              <div className="p-6 text-center text-xs text-fg-muted">
                Ushbu filtr bo&apos;yicha darslar topilmadi.
              </div>
            )}
          </aside>

          {/* O'ng ustun: Tanlangan darsning to'liq matnli kitobxonasi */}
          <main className="glass-card p-6 sm:p-8 space-y-6">
            {activeLesson ? (
              <>
                {/* Dars sarlavhasi va Audio/Nusxa paneli */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-md bg-elevated px-2.5 py-1 font-mono font-bold text-neon">
                        {activeLesson.subjectNameUz} • {activeLesson.topicTitleUz}
                      </span>
                      {activeLesson.isCompleted && (
                        <span className="rounded-md bg-neon-soft px-2.5 py-1 text-[11px] font-bold text-neon flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Tugatilgan Dars
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 text-xl font-extrabold text-fg sm:text-3xl">
                      {activeLesson.titleUz}
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-fg-muted max-w-2xl">
                      {activeLesson.summaryUz}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Talaba AI Ovozli Agent bilan darsni tinglash */}
                    <JarvisVoiceButton
                      text={`${activeLesson.titleUz}. ${activeLesson.summaryUz}. ${activeLesson.theoryMarkdown}`}
                      label="Talaba AI ovozida darsni tinglash"
                    />

                    <button
                      type="button"
                      onClick={() => handleCopyText(activeLesson.theoryMarkdown, activeLesson.id)}
                      className="glass-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-fg hover:text-neon"
                      title="Dars nazariy matnini nusxalash"
                    >
                      {copiedId === activeLesson.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-neon" />
                          <span className="text-neon">Nusxalandi</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Matnni nusxalash</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/learn/${activeLesson.slug}`}
                      className="btn-neon inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold"
                    >
                      <span>Mashqlariga o&apos;tish</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* 1. DARS NAZARIY MATNI (Full Theory Reader View) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-neon">
                    <BookOpen className="h-4 w-4" />
                    <span>Darsning To&apos;liq Nazariy Matni</span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-canvas/70 p-6 sm:p-7 text-sm leading-relaxed text-fg whitespace-pre-line font-sans shadow-inner">
                    {activeLesson.theoryMarkdown}
                  </div>
                </div>

                {/* 2. HAYOTIY MISOLLAR VA BOSQICHMA-BOSQICH YECHIMLAR */}
                {activeLesson.examples && activeLesson.examples.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm font-bold text-gold">
                      <Lightbulb className="h-4 w-4" />
                      <span>Namunaviy Misollar va Qadamma-qadam Yechimlar ({activeLesson.examples.length} ta)</span>
                    </div>

                    <div className="grid gap-4">
                      {activeLesson.examples.map((ex, i) => (
                        <div key={i} className="rounded-2xl border border-white/10 bg-surface/60 p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-fg flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-soft font-mono text-[10px] font-bold text-gold">
                                {i + 1}
                              </span>
                              {ex.title}
                            </h4>
                            <JarvisVoiceButton
                              text={`Misol ${i + 1}: ${ex.title}. Masala: ${ex.problem}. Yechimi: ${ex.stepByStepSolution.join(". ")}. Xulosa: ${ex.takeaway}`}
                              label="Tinglash"
                            />
                          </div>

                          <div className="rounded-xl border border-white/5 bg-canvas/60 p-3.5 font-mono text-xs text-gold">
                            {ex.problem}
                          </div>

                          <ol className="space-y-1.5 pl-2 text-xs text-fg-muted">
                            {ex.stepByStepSolution.map((st, j) => (
                              <li key={j} className="flex gap-2">
                                <span className="font-bold text-neon">{j + 1}-qadam:</span>
                                <span>{st}</span>
                              </li>
                            ))}
                          </ol>

                          <div className="rounded-xl border border-neon/30 bg-neon-soft/20 p-3 text-xs text-neon flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span><strong>Xulosa:</strong> {ex.takeaway}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-sm text-fg-muted">
                Dars tanlanmagan.
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
