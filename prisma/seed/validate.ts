/**
 * Seed ma'lumotlarini tekshiruvchi skript (bazaga tegmaydi).
 * Ishga tushirish:  npx tsx prisma/seed/validate.ts
 */
import { SKILLS } from './data/skills';
import { ALL_QUESTIONS } from './data/questions-index';
import { ALL_COURSES } from './data/courses-index';
import { MOCK_EXAMS } from './data/mock-exams';

const errors: string[] = [];
const warnings: string[] = [];

const skillSlugs = new Set(SKILLS.map((s) => s.slug));

// Skill daraxti
for (const s of SKILLS) {
  if (s.parent && !skillSlugs.has(s.parent)) errors.push(`skill "${s.slug}" — ota skill yo'q: ${s.parent}`);
}

/**
 * `uz` matnida qolib ketgan inglizchani aniqlaydi.
 *
 * Ishonchli belgilar — o'zbekchada umuman ishlatilmaydigan so'zlar va
 * grammatik kalitlar. `w`/`x` kabi belgilar hisobga olinmaydi: o'zbekcha
 * matematikada ular tez-tez uchraydi (masalan `2x + 1`, `x² − 5x`).
 *
 * Muhim: `’` (tipografik apostrof) lotin harflari sifatida hisoblanadi, shuning
 * uchun `ma’no` ichidagi `no` so'z sifatida topilmasligi kerak.
 */
const ENGLISH_MARKERS =
  /\b(the|and|with|that|this|these|those|from|into|than|then|there|their|they|which|while|where|whose|would|could|should|shall|will|were|been|being|have|has|had|does|did|not|none|all|any|some|each|other|another|such|most|least|more|less|larger|smaller|bigger|equal|following|below|above|choose|select|correct|incorrect|answer|solve|calculate|compute|simplify|determine|find|given|value|result|total|average|mean|median|number|amount|question|statement|option|paragraph|sentence|word|best|what|how|when|because|however|therefore|instead|without|before|after|about|only|also|your|our)\b/gi;

/** Butun so'z sifatida keladigan va o'zbekchada yo'q so'zlar */
const UZ_ONLY_WORDS =
  /\b(kabi|uchun|bilan|necha|qanday|qaysi|nima|qancha|bo'lsa|bo‘lsa|bo'lib|bo‘lib)\b/gi;

function looksEnglish(text: string): boolean {
  const t = text.trim();
  // Juda qisqa matnlar (son, harf, belgi) — tekshirilmaydi.
  if (t.length < 12) return false;

  const words = t.split(/\s+/);
  const hits = words.filter((w) => ENGLISH_MARKERS.test(w));
  if (hits.length === 0) return false;

  // Inglizcha kalitlar sezilarli ulushda bo'lsa va o'zbekcha kalit topilmasa.
  return hits.length / words.length >= 0.3 && !UZ_ONLY_WORDS.test(t);
}

/**
 * Xususiy nom (proper noun) ikki tilda bir xil yoziladi: "UCAS Personal
 * Statement", "Common App". Buni tarjima qilinmaganlik deb xato baholamaymiz.
 *
 * Ro'yxat qat'iy: avtomatik aniqlash uchun `isProperName` ishlatsa, "Data Drill"
 * kabi haqiqiy tarjima qilinishi kerak bo'lgan matnlar ham o'tib ketishi mumkin.
 */
const PROPER_NAMES = new Set([
  'common app personal essay',
  'ucas personal statement',
  'cover letter',
]);

function isProperName(text: string): boolean {
  return PROPER_NAMES.has(text.trim().toLowerCase());
}

// Savollar
const prompts = new Set<string>();
for (const q of ALL_QUESTIONS) {
  const key = `${q.skill}::${q.p[0]}`;
  if (prompts.has(key)) errors.push(`takrorlangan savol: ${key}`);
  prompts.add(key);

  if (!skillSlugs.has(q.skill)) errors.push(`savol "${q.p[0].slice(0, 50)}…" — skill yo'q: ${q.skill}`);
  if (!q.p[0].trim() || !q.p[1].trim()) errors.push(`savol matni bo'sh: ${key}`);
  if (q.p[0].length > 600) warnings.push(`uzzo'${q.p[0].length > 900 ? 'ng' : ''} prompt (${q.p[0].length}): ${key.slice(0, 60)}`);

  // Ikkala til bir xil bo'lsa — tarjima qilinmagan
  const promptSame = q.p[0].trim().toLowerCase() === q.p[1].trim().toLowerCase();
  if (promptSame) {
    if (!isProperName(q.p[0])) errors.push(`tarjima qilinmagan prompt (uz = en): ${key.slice(0, 70)}`);
  } else if (looksEnglish(q.p[0])) {
    errors.push(`uz matni inglizcha ko'rinadi: ${key.slice(0, 70)}`);
  }

  // Inglizcha variantda bo'sh joy `___` bo'lsa, o'zbekchada ham bo'lishi shart —
  // aks holda savol ikki tilda boshqacha savolga aylanadi.
  if (q.p[0].includes('___') !== q.p[1].includes('___')) {
    errors.push(`___ bo'sh joyi mos kelmadi (uz/en): ${key.slice(0, 70)}`);
  }

  if (q.passage) {
    const passageSame = q.passage[0].trim().toLowerCase() === q.passage[1].trim().toLowerCase();
    if (passageSame) {
      if (!isProperName(q.passage[0])) errors.push(`tarjima qilinmagan passage (uz = en): ${key.slice(0, 70)}`);
    } else if (looksEnglish(q.passage[0])) {
      errors.push(`uz passage inglizcha ko'rinadi: ${key.slice(0, 70)}`);
    }
  }

  if (q.type === 'MCQ_SINGLE' || q.type === 'MCQ_MULTI' || q.type === 'NUMERIC') {
    const opts = q.options ?? [];
    const correct = opts.filter((o) => o.correct).length;

    if (q.type === 'NUMERIC') {
      // NUMERIC — bitta to'g'ri javob varianti (matchRules.accepts bilan)
      if (correct !== 1) errors.push(`NUMERIC da aynan 1 to'g'ri javob kerak, topildi ${correct}: ${key}`);
      if (!opts.some((o) => o.accepts?.length)) errors.push(`NUMERIC da accepts[] bo'lishi kerak: ${key}`);
    } else {
      if (opts.length < 2) errors.push(`variant soni kam: ${key}`);
      if (q.type === 'MCQ_MULTI') {
        if (correct < 2) errors.push(`MCQ_MULTI da kamida 2 to'g'ri variant kerak: ${key}`);
      } else if (correct !== 1) {
        errors.push(`MCQ_SINGLE da aynan 1 to'g'ri variant kerak, topildi ${correct}: ${key}`);
      }
    }

    for (const o of opts) {
      if (!o.label.uz.trim() && !o.label.en.trim()) errors.push(`variant matni bo'sh: ${key}`);
      if ('correct' in (o.label as object)) errors.push(`label ichida correct qoldi: ${key}`);
    }
  }
}

// Kurslar
const lessonSlugs = new Set<string>();
for (const c of ALL_COURSES) {
  for (const m of c.modules) {
    if (!m.lessons.length) warnings.push(`modul bo'sh: ${c.slug}/${m.slug}`);
    for (const l of m.lessons) {
      if (lessonSlugs.has(l.slug)) errors.push(`takrorlangan dars slug: ${l.slug}`);
      lessonSlugs.add(l.slug);
      for (const s of [...l.skills, ...l.blocks.flatMap((b) => b.skills ?? [])]) {
        if (!skillSlugs.has(s)) errors.push(`dars "${l.slug}" — skill yo'q: ${s}`);
      }
      if (!l.blocks.length) errors.push(`dars bloklarsiz: ${l.slug}`);
      const totalMin = l.blocks.reduce((n, b) => n + b.minMinutes, 0);
      if (Math.abs(totalMin - l.estMinutes) > 15) {
        warnings.push(`dars "${l.slug}": bloklar ${totalMin} daqiqa, estMinutes ${l.estMinutes}`);
      }

      // Dars matnlari tarjima qilingan bo'lishi shart
      const texts: Array<[string, string, string]> = [
        ['sarlavha', l.title[0], l.title[1]],
        ['qisqacha', l.summary[0], l.summary[1]],
        ...l.objectives.map((o, i) => [`maqsad ${i + 1}`, o[0], o[1]] as [string, string, string]),
      ];
      for (const b of l.blocks) {
        texts.push([`blok "${b.kind}" sarlavha`, b.title[0], b.title[1]]);
        texts.push([`blok "${b.kind}" matn`, b.content.uz, b.content.en]);
      }
      for (const [what, uz, en] of texts) {
        // Katta-kichik farqi xususiy nomlarda normal ("UCAS personal statement"),
        // shuning uchun taqqoslash harf registriga sezgir emas.
        const same = uz.trim().toLowerCase() === en.trim().toLowerCase();
        if (same && !isProperName(uz)) {
          errors.push(`tarjima qilinmagan ${what} (uz = en): ${l.slug}`);
        } else if (!same && looksEnglish(uz)) {
          errors.push(`${what} uz matni inglizcha ko'rinadi: ${l.slug}`);
        }
      }
    }
  }
}

// Namuna imtihonlar
for (const m of MOCK_EXAMS) {
  // Seed bir skill bo'yicha kursor bilan ketma-ket bo'lib oladi —
  // shu sababli bitta imtihonda savol takrorlanmasligi kerak.
  const used = new Map<string, number>();

  for (const s of m.sections) {
    if (!skillSlugs.has(s.skill)) errors.push(`imtihon "${m.slug}" — skill yo'q: ${s.skill}`);

    const pool = ALL_QUESTIONS.filter((q) => q.skill === s.skill);
    const start = used.get(s.skill) ?? 0;

    if (pool.length < start + s.count) {
      errors.push(
        `imtihon "${m.slug}" / ${s.skill}: ${pool.length} ta savol bor, ${start + s.count} ta kerak (bo'limlar takrorlanmasligi kerak)`,
      );
    }
    used.set(s.skill, start + s.count);
  }
}

// Statistika
const bySkill = new Map<string, number>();
for (const q of ALL_QUESTIONS) bySkill.set(q.skill, (bySkill.get(q.skill) ?? 0) + 1);

console.log('Skilllar:', SKILLS.length);
console.log('Savollar:', ALL_QUESTIONS.length);
console.log('Kurslar:', ALL_COURSES.length);
console.log('Darslar:', lessonSlugs.size);
console.log('Bloklar:', ALL_COURSES.reduce((n, c) => n + c.modules.reduce((m, x) => m + x.lessons.reduce((k, l) => k + l.blocks.length, 0), 0), 0));
console.log('Imtihonlar:', MOCK_EXAMS.length);
console.log('\nSkill bo‘yicha savollar:');
for (const [slug, n] of [...bySkill].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${slug.padEnd(26)} ${n}`);
}

const unusedSkills = [...skillSlugs].filter((s) => !bySkill.has(s));
if (unusedSkills.length) console.log('\nSavolsiz skilllar:', unusedSkills.join(', '));

if (warnings.length) {
  console.log('\nOgohlantirishlar:');
  for (const w of warnings) console.log('  !', w);
}
if (errors.length) {
  console.log('\nXatolar:');
  for (const e of errors) console.log('  x', e);
  process.exitCode = 1;
} else {
  console.log('\nXato topilmadi.');
}