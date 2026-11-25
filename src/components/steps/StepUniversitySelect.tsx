"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Globe2, Search, Sparkles, Trophy } from "lucide-react";
import {
  COUNTRY_CODES,
  filterUniversities,
  UNIVERSITY_COUNTRIES,
  type UniversityItem,
} from "@/lib/data/universities";

interface StepUniversitySelectProps {
  selectedUniversity: UniversityItem | null;
  onSelect: (university: UniversityItem) => void;
  onNext: () => void;
}

const TIER_FILTERS: Array<{ id: "ALL" | UniversityItem["tier"]; label: string }> = [
  { id: "ALL", label: "Barchasi (300)" },
  { id: "TOP_10", label: "Top 10" },
  { id: "TOP_50", label: "Top 50" },
  { id: "TOP_100", label: "Top 100" },
];

export function StepUniversitySelect({
  selectedUniversity,
  onSelect,
  onNext,
}: StepUniversitySelectProps) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("ALL");
  const [tier, setTier] = useState<"ALL" | UniversityItem["tier"]>("ALL");

  const filtered = useMemo(
    () => filterUniversities({ query, country, tier }),
    [query, country, tier],
  );

  return (
    <section className="glass-panel relative mx-auto w-full max-w-5xl rounded-[1.75rem] p-5 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c6f432]/35 bg-[#c6f432]/12 px-3.5 py-1 font-mono text-xs font-bold text-[#c6f432]">
            <Trophy className="h-3.5 w-3.5" />
            1-BOSQICH · TOP 300 UNIVERSITETLAR
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Maqsadli universitetingizni tanlang
          </h1>
          <p className="max-w-2xl text-sm text-zinc-400">
            Dunyoning eng kuchli 300 ta universitetidan birini belgilang — AI ustoz aynan shu
            universitetning qabul tizimi va grant talablariga mos dars o&apos;tadi.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TIER_FILTERS.map((item) => {
            const active = tier === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTier(item.id)}
                className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition ${
                  active
                    ? "border border-[#c6f432]/70 bg-[#c6f432]/20 text-[#c6f432] shadow-[0_0_20px_rgba(198,244,50,0.25)]"
                    : "border border-white/12 bg-white/5 text-zinc-300 hover:border-white/25 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_250px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Universitet, davlat yoki raqam yozing (MIT, Oxford, Koreya, 14)..."
            className="glass-input w-full rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="relative">
          <Globe2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c6f432]" />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Davlat bo'yicha saralash"
            className="glass-input w-full appearance-none rounded-2xl py-3 pl-10 pr-8 text-sm font-semibold text-white"
          >
            <option value="ALL" className="bg-[#0b0b0c] text-white">
              Barcha davlatlar ({UNIVERSITY_COUNTRIES.length})
            </option>
            {UNIVERSITY_COUNTRIES.map((c) => (
              <option key={c.country} value={c.country} className="bg-[#0b0b0c] text-white">
                {c.country} ({c.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-scroll grid max-h-[430px] gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((uni) => {
          const isSelected = selectedUniversity?.rank === uni.rank;
          const code = COUNTRY_CODES[uni.country] ?? "GL";
          return (
            <button
              key={uni.rank}
              type="button"
              onClick={() => onSelect(uni)}
              className={`group flex items-start justify-between gap-3 rounded-2xl p-3.5 text-left ${
                isSelected ? "glass-card-selected" : "glass-card"
              }`}
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-lg px-2 py-0.5 font-mono text-xs font-bold ${
                      uni.rank <= 10
                        ? "border border-[#c6f432]/50 bg-[#c6f432]/20 text-[#c6f432]"
                        : uni.rank <= 50
                          ? "border border-white/25 bg-white/10 text-white"
                          : "border border-white/12 bg-white/5 text-zinc-300"
                    }`}
                  >
                    #{uni.rank}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                    <span className="font-bold text-[#c6f432]">{code}</span>
                    <span>·</span>
                    <span className="truncate">{uni.country}</span>
                  </span>
                </div>
                <p className="line-clamp-2 text-sm font-bold leading-snug text-white">{uni.name}</p>
              </div>

              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                  isSelected
                    ? "border-[#c6f432] bg-[#c6f432] text-[#0b0b0c]"
                    : "border-white/15 bg-white/5 text-transparent group-hover:border-white/30"
                }`}
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </span>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-zinc-300">
            Qidiruv bo&apos;yicha universitet topilmadi. Filtrlarni tozalab ko&apos;ring.
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-stretch justify-between gap-4 border-t border-white/12 pt-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 text-sm text-zinc-200">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#c6f432]/35 bg-[#c6f432]/12 text-[#c6f432]">
            <Sparkles className="h-5 w-5" />
          </div>
          {selectedUniversity ? (
            <div>
              <p className="font-mono text-xs font-bold text-[#c6f432]">Tanlangan maqsad:</p>
              <p className="font-bold text-white">
                #{selectedUniversity.rank} {selectedUniversity.name} — {selectedUniversity.country}
              </p>
            </div>
          ) : (
            <p className="text-zinc-400">Davom etish uchun bitta universitetni tanlang.</p>
          )}
        </div>

        <button
          type="button"
          disabled={!selectedUniversity}
          onClick={onNext}
          className="btn-neon inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold"
        >
          <span>Sinf tanlashga o&apos;tish</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
