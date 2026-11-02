"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { SECTION_IDS } from "@/lib/site-config";
import type { FaqItem } from "./faq-data";

/**
 * Accordion formatidagi FAQ. Javob matnlari server HTML'ida doim mavjud
 * (faqat vizual yashiriladi), shuning uchun qidiruv tizimlari ularni ko'radi.
 */
export function FaqSection({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section
      id={SECTION_IDS.faq}
      className="scroll-mt-28 space-y-8"
      aria-labelledby="faq-title"
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
          <HelpCircle className="h-4 w-4" /> FAQ
        </span>
        <h2 id="faq-title" className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
          Ko&apos;p beriladigan savollar
        </h2>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {items.map((item) => {
          const isOpen = openId === item.id;
          const buttonId = `faq-trigger-${item.id}`;
          const panelId = `faq-panel-${item.id}`;

          return (
            <div
              key={item.id}
              className={`glass-card overflow-hidden transition-colors ${
                isOpen ? "border-emerald-400/50" : ""
              }`}
            >
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(item.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                >
                  <span
                    className={`text-sm font-bold sm:text-base ${isOpen ? "text-emerald-300" : "text-white"}`}
                  >
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-emerald-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="border-t border-white/10 px-5 pb-5 pt-4 text-sm leading-relaxed text-slate-300 sm:px-6">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
