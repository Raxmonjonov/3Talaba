import 'server-only';

/**
 * Prompt injection himoyasi.
 *
 * **Xavf modeli.** Foydalanuvchi matni AI ustozga bevosita uzatiladi. Agar u
 * `<system>` yoki "ignore previous instructions" yozsa, model ko'rsatmani
 * almashtirishi mumkin. To'liq himoyaning iloji yo'q (chunki LLM tabiiy til
 * tahlil qiladi), lekin biz uchta qatlam qo'yamiz:
 *
 *  1. **Aniqlash** — suspensiya belgilari, zero-width, base64, haddan tashqari
 *     uzunlik, tizimga xos kalit so'zlari.
 *  2. **Izolyatsiya** — foydalanuvchi matni `<user_data>` ichida, o'zgartirilmay
 *     `escapeXml` qilingan holda beriladi. Tizim prompti uni "ma'lumot, ko'rsatma
 *     emas" deb belgilaydi.
 *  3. **Nazorat** — AI qarorlari faqat **tool-calling** orqali qabul qilinadi,
 *     klient hech qanday erkin kod bajarilmaydi; har bir qiymat Zod bilan
 *     tekshiriladi.
 *
 * Bloklangan matn buzilmaydi — u `blocked: true` bilan saqlanadi va foydalanuvchiga
 * yumshoq qaytariladi (zararli/nomaqbul mavzularda ham shunday).
 */

export type GuardVerdict = {
  blocked: boolean;
  reason: 'INJECTION' | 'TOO_LONG' | 'UNSAFE' | null;
  /** Modelga uzatiladigan xavfsiz matn (oddiy holatda — o'zgarishsiz) */
  safeContent: string;
  /** Foydalanuvchiga ko'rsatiladigan yumshoq javob */
  softReplyUz: string;
  softReplyEn: string;
};

/** Tizimga xos kalit so'zlar (boshqarilmaydigan deklaratsiyaga urinish). */
const INJECTION_PATTERNS: { re: RegExp; weight: number }[] = [
  { re: /<\s*\/?\s*(system|assistant|user|instructions?|prompt)\b[^>]*>/i, weight: 3 },
  { re: /\[\s*(system|inst|assistant)\s*\]/i, weight: 3 },
  { re: /\b(ignore|disregard|forget)\b[^.\n]{0,40}\b(all\s+)?(previous|prior|above|earlier)\b[^.\n]{0,20}\b(instruction|prompt|rule|direction)/i, weight: 3 },
  { re: /\byou\s+are\s+now\b|\byou\s+are\s+no\s+longer\b|\bact\s+as\s+(a|an)?\s*(dan|developer|admin|root|unrestricted)/i, weight: 2 },
  { re: /\bdeveloper\s+mode\b|\bjailbreak\b|\bDAN\s+mode\b|\bopposite\s+mode\b/i, weight: 3 },
  { re: /\b(reveal|print|repeat|show|output)\b[^.\n]{0,30}\b(your\s+)?(system\s+prompt|instructions|prompt|rules|guidelines)\b/i, weight: 3 },
  { re: /\b(prefill|prefix)\s*[:=]/i, weight: 1 },
  { re: /ignore\s+(all\s+)?(previous|above)\s+lines/i, weight: 3 },
  { re: /\bfrom\s+now\s+on[,\s]+(you|immediately)\b[^.\n]{0,60}\b(must|should|will)\b/i, weight: 2 },
  { re: /\b(simulate|pretend|roleplay)\b[^.\n]{0,30}\b(an?\s+)?(ai|language\s+model|chatbot|assistant)\b/i, weight: 1 },
  { re: /\bno\s+(longer|more)\s+(bound|restricted|limited)\s+by\b/i, weight: 2 },
];

/** Zararli/nomaqbul soha — yumshoq qaytariladi, lekin jazolamaydi. */
const UNSAFE_PATTERNS: { re: RegExp; weight: number }[] = [
  { re: /\b(suicide|self[\s-]?harm|kill\s+myself|o'?z(?:im|ingizni)\s+o'?ldir)/i, weight: 2 },
  { re: /\b(exploit|hack|ddos|steal\s+(password|credit\s+card)|keylogger|ransomware)\b/i, weight: 1 },
  { re: /\b(cheat\s+(on|in)\s+(exam|test)|exam\s+leak|ielts\s+(answer|question)\s+leak|sat\s+leak)\b/i, weight: 2 },
  { re: /\b(buy|write)\s+(my\s+)?(essay|thesis|homework)\s+for\s+me\b/i, weight: 1 },
  { re: /\b(drugs?|narcotic|weapon|bomb)\b[^.\n]{0,30}\b(buy|make|how\s+to)\b/i, weight: 1 },
];

/** Zero-width va boshqa yashirin belgilar. */
const HIDDEN_CHARS = /[\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060-\u2064\uFEFF]/g;

/** Juda uzun "prompt" — resursni suiiste'moldan qat'iy himoya. */
export const MAX_CONTENT_LENGTH = 4000;

export function inspectUserContent(content: string): GuardVerdict {
  const soft = SOFT_REPLIES;

  if (content.length > MAX_CONTENT_LENGTH) {
    return {
      blocked: true,
      reason: 'TOO_LONG',
      safeContent: '',
      softReplyUz: soft.longUz,
      softReplyEn: soft.longEn,
    };
  }

  const normalized = content.replace(HIDDEN_CHARS, '');
  const normalizedLower = normalized.toLowerCase();

  let injectionWeight = 0;
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.re.test(normalized)) injectionWeight += pattern.weight;
  }

  let unsafeWeight = 0;
  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.re.test(normalized)) unsafeWeight += pattern.weight;
  }

  // Yashirin belgilar — o'zi jinoiy belgi emas, lekin kuzatuvga olingandek.
  const hiddenCount = (content.match(HIDDEN_CHARS) ?? []).length;
  if (hiddenCount > 3) injectionWeight += 2;

  // Katta base64 / hex blob — ko'pincha ma'lumotni "kod" ichiga yashirishga urinish
  if (/[A-Za-z0-9+/]{180,}={0,2}/.test(normalized)) injectionWeight += 2;

  if (injectionWeight >= 3) {
    return {
      blocked: true,
      reason: 'INJECTION',
      safeContent: '',
      softReplyUz: soft.injectionUz,
      softReplyEn: soft.injectionEn,
    };
  }

  if (unsafeWeight >= 2) {
    return {
      blocked: true,
      reason: 'UNSAFE',
      safeContent: content,
      softReplyUz: soft.unsafeUz,
      softReplyEn: soft.unsafeEn,
    };
  }

  return {
    blocked: false,
    reason: null,
    // Birorta nomutanoshlik belgisi bo'lsa ham — matn izolyatsiya ichida beriladi,
    // shuning uchun toza variantni qaytaramiz.
    safeContent: normalizedLower.length === 0 ? content : normalized,
    softReplyUz: '',
    softReplyEn: '',
  };
}

/** Foydalanuvchi matnini model uchun xavfsiz `<user_data>` blokiga o'raydi. */
export function wrapUserData(content: string): string {
  return `<user_data>\n${escapeXml(content)}\n</user_data>`;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Ishonchli "qurolsiz" bo'lish tekshiruvi — haqiqiy imtihon javobini
 * kashf etishga urinish. Biz imtihon savollariga javob bermaymiz, faqat
 * o'rgatamiz (bu pedagogik yondashuv ham, xavfsizlik ham).
 */
export function isAnswerExtractionAttempt(content: string): boolean {
  return /(just\s+give\s+me\s+the\s+answer|tell\s+me\s+the\s+correct\s+option|answer\s+only\s+[:\-]|faqat\s+javobni\s+ber|to'?g'?ri\s+variantni\s+ayt)/i.test(
    content,
  );
}

const SOFT_REPLIES = {
  injectionUz:
    'Bu so‘rovni bajarishga tayyor emas — men o‘qitish ustoziman va faqat o‘quvga yordam beraman. Keling, sizning darajangizga mos savol bilan davom etamiz.',
  injectionEn:
    'I can’t act on that request — I’m a study tutor and I only help with learning. Let’s continue with a question matched to your level.',
  unsafeUz:
    'Bu mavzu menga yordam qilmaydi. Sizning oldingizda katta imkoniyatlar bor — keling, ularni ochamiz.',
  unsafeEn:
    'That topic is not something I can help with. There are bigger opportunities ahead — let’s open those instead.',
  longUz:
    'Xabar juda uzun bo‘lib ketdi. Iltimos, asosiy savolni qisqacha yozing — men sizga to‘liq javob beraman.',
  longEn: 'That message is too long. Please write just the main question — I’ll give you a full answer.',
};