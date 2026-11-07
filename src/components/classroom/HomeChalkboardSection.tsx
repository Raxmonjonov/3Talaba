"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChalkboardClassroom } from "@/components/classroom/ChalkboardClassroom";
import { MATH_15_MODULES } from "@/lib/curriculum/math-modules-data";
import { SEED_CURRICULUM } from "@/lib/curriculum/seed-content";
import {
  buildChalkboardFromLesson,
  buildChalkboardFromMathModule,
} from "@/lib/learning/chalkboard-builder";

export function HomeChalkboardSection() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>(
    SEED_CURRICULUM[0]?.topic.lesson.slug ?? "sat-math-linear-equations"
  );

  const slides = useMemo(() => {
    const lessonSlides = SEED_CURRICULUM.map((s) =>
      buildChalkboardFromLesson({
        slug: s.topic.lesson.slug,
        subjectName: s.nameUz,
        lessonTitle: s.topic.lesson.titleUz,
        theoryMarkdown: s.topic.lesson.theoryMarkdown,
        examples: s.topic.lesson.examples,
      })
    );
    const mathSlides = MATH_15_MODULES.map((m) =>
      buildChalkboardFromMathModule(m)
    );
    return [...lessonSlides, ...mathSlides];
  }, []);

  const currentSlide = useMemo(
    () => slides.find((s) => s.id === selectedId) ?? slides[0]!,
    [selectedId, slides]
  );

  const isCoreLesson = SEED_CURRICULUM.some(
    (s) => s.topic.lesson.slug === currentSlide.id
  );

  return (
    <section id="jonli-doska" className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-[#c6f432]">
            JONLI SINFXONA • ANIMATSIYALI AI USTOZ
          </span>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Mavzuni Tanlang — AI Ustoz Doskada Yozib Tushuntiradi
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-white/75">
          Yuqori paneldan istalgan mavzuni almashtiring: sinfxona o&apos;zgarmaydi, faqat doskadagi yozuv o&apos;chib, yangi mavzu animatsiya va ovoz bilan tushuntiriladi.
        </p>
      </div>

      <ChalkboardClassroom
        slide={currentSlide}
        availableSlides={slides}
        onSelectSlide={(id) => setSelectedId(id)}
        honorific="Bo'lajak Talaba"
        lessonSlug={isCoreLesson ? currentSlide.id : undefined}
        onProceedNext={() => {
          if (isCoreLesson) {
            router.push(`/learn/${currentSlide.id}`);
          } else {
            router.push("/math");
          }
        }}
        proceedLabel="Dars Mashqlariga O'tish"
      />
    </section>
  );
}
