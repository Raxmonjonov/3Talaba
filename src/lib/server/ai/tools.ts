import 'server-only';

import { z } from 'zod';

/**
 * AI ustozning "qurollari" (tool-calling).
 *
 * Nima uchun tool-calling:
 *  - Model hech qanday "erkin" kod bajarilmaydi — u faqat **tasdiqlangan
 *    enumlar** qaytaradi, ular Zod bilan tekshiriladi va keyin ma'lumotlar
 *    bazasiga yoziladi. Bu prompt-injection'dan eng kuchli himoya.
 *  - O'quvchi ustozga "mening xatomni daftarga qo'sh" dese, bu aynan shu
 *    orqali bajariladi — "ishonch" ga tayanib emas.
 *  - Har bir o'zgarish auditlanadi (`refId`).
 */

export const TOOLS = [
  {
    name: 'check_mastery',
    description:
      'Mavzu tushunilganini tekshirish natijasini yozadi. "understood" — o\'quvchi tushundi, "partial" — qisman, "needs_work" — qayta o\'tish kerak.',
    input_schema: {
      type: 'object' as const,
      properties: {
        topic: { type: 'string', description: 'Mavzu nomi (savol matnida aynan shunday)' },
        verdict: { type: 'string', enum: ['understood', 'partial', 'needs_work'] },
        note: { type: 'string', description: 'Bir jumlalik izoh (ixtiyoriy)' },
      },
      required: ['topic', 'verdict'],
    },
  },
  {
    name: 'assign_error',
    description:
      'Xatoni "xatolar daftari"ga qo\'shadi va shu mavzuni keyinchalik qayta berish rejasiga joylaydi.',
    input_schema: {
      type: 'object' as const,
      properties: {
        topic: { type: 'string' },
        userAnswer: { type: 'string' },
        correctAnswer: { type: 'string' },
        reason: {
          type: 'string',
          enum: ['NIQOH', 'DASHBOARD', 'VAQT', 'FORMAL', 'BILIM'],
          description:
            'NIQOH=o\'qish tushunilmagan, DASHBOARD=diqqat, VAQT=vqt, FORMAL=shakl/xato, BILIM=bazaviy bilim yetishmaydi',
        },
      },
      required: ['topic', 'userAnswer', 'correctAnswer', 'reason'],
    },
  },
  {
    name: 'srs_add_card',
    description:
      'Takrorlash uchun kartochka yaratadi: lug\'at so\'zi, formula, grammatika qoidasi yoki tushuncha.',
    input_schema: {
      type: 'object' as const,
      properties: {
        kind: { type: 'string', enum: ['WORD', 'FORMULA', 'GRAMMAR', 'CONCEPT'] },
        front: { type: 'string', description: 'Savol tomoni (orqasida)' },
        back: { type: 'string', description: 'Javob tomoni (oldida)' },
        note: { type: 'string', description: 'Qischa izoh (ixtiyoriy)' },
      },
      required: ['kind', 'front', 'back'],
    },
  },
  {
    name: 'offer_break',
    description:
      'Yumshoq tanaffus taklif qiladi. Faqat o\'quvchi charchagan yoki uzun sessiyada ishlatiladi.',
    input_schema: {
      type: 'object' as const,
      properties: {
        kind: {
          type: 'string',
          enum: ['EYES', 'WATER', 'STRETCH', 'SHORT'],
          description: 'EYES=ko\'z, WATER=suv, STRETCH=cho\'zilish, SHORT=qisqa',
        },
        seconds: { type: 'number', description: 'Tanaffus uzunligi (soniya, 30–300)' },
      },
      required: ['kind'],
    },
  },
  {
    name: 'offer_level_up',
    description:
      'Darajani oshirishni taklif qiladi — faqat o\'quvchi tushunarli darajada ko\'p to\'g\'ri javob bergan bo\'lsa.',
    input_schema: {
      type: 'object' as const,
      properties: {
        targetTopic: { type: 'string', description: 'Keyingi mavzu' },
      },
      required: [],
    },
  },
  {
    name: 'finish_lesson',
    description:
      'Darsni yakunlaydi. Faqat reja bo\'yicha barcha bloklar bajarilganda ishlatiladi.',
    input_schema: {
      type: 'object' as const,
      properties: {
        summary: { type: 'string', description: 'Ikki jumlalik yakuniy xulosa' },
        learned: {
          type: 'array',
          items: { type: 'string' },
          description: 'Bugun o\'rgangan 3–5 ta kalit so\'z/-rule',
        },
      },
      required: ['summary', 'learned'],
    },
  },
] as const;

export type ToolName = (typeof TOOLS)[number]['name'];

// ── Tool argumentlarini tekshirish (Zod) ───────────────────────────────────

const schemaByName = {
  check_mastery: z.object({
    topic: z.string().trim().min(1).max(200),
    verdict: z.enum(['understood', 'partial', 'needs_work']),
    note: z.string().trim().max(500).optional(),
  }),
  assign_error: z.object({
    topic: z.string().trim().min(1).max(200),
    userAnswer: z.string().trim().max(1000),
    correctAnswer: z.string().trim().max(1000),
    reason: z.enum(['NIQOH', 'DASHBOARD', 'VAQT', 'FORMAL', 'BILIM']),
  }),
  srs_add_card: z.object({
    kind: z.enum(['WORD', 'FORMULA', 'GRAMMAR', 'CONCEPT']),
    front: z.string().trim().min(1).max(400),
    back: z.string().trim().max(1000),
    note: z.string().trim().max(500).optional(),
  }),
  offer_break: z.object({
    kind: z.enum(['EYES', 'WATER', 'STRETCH', 'SHORT']),
    seconds: z.coerce.number().int().min(30).max(300).default(120),
  }),
  offer_level_up: z.object({
    targetTopic: z.string().trim().max(200).optional(),
  }),
  finish_lesson: z.object({
    summary: z.string().trim().min(5).max(600),
    learned: z.array(z.string().trim().min(1).max(120)).min(1).max(8),
  }),
} satisfies Record<ToolName, z.ZodTypeAny>;

export type ParsedToolCall =
  | { name: 'check_mastery'; data: z.infer<(typeof schemaByName)['check_mastery']> }
  | { name: 'assign_error'; data: z.infer<(typeof schemaByName)['assign_error']> }
  | { name: 'srs_add_card'; data: z.infer<(typeof schemaByName)['srs_add_card']> }
  | { name: 'offer_break'; data: z.infer<(typeof schemaByName)['offer_break']> }
  | { name: 'offer_level_up'; data: z.infer<(typeof schemaByName)['offer_level_up']> }
  | { name: 'finish_lesson'; data: z.infer<(typeof schemaByName)['finish_lesson']> };

/** Modelning xar qanday chiqishini tekshiradi — noto'g'ri qiymatlar tashlab yuboriladi. */
export function parseToolCall(name: string, input: unknown): ParsedToolCall | null {
  if (!(name in schemaByName)) return null;
  const schema = schemaByName[name as ToolName];
  const result = schema.safeParse(input);
  if (!result.success) return null;
  return { name, data: result.data } as ParsedToolCall;
}

export type ToolEffects = {
  mastery: { topic: string; verdict: 'understood' | 'partial' | 'needs_work'; note?: string }[];
  errors: {
    topic: string;
    userAnswer: string;
    correctAnswer: string;
    reason: 'NIQOH' | 'DASHBOARD' | 'VAQT' | 'FORMAL' | 'BILIM';
  }[];
  cards: { kind: 'WORD' | 'FORMULA' | 'GRAMMAR' | 'CONCEPT'; front: string; back: string; note?: string }[];
  breaks: { kind: 'EYES' | 'WATER' | 'STRETCH' | 'SHORT'; seconds: number }[];
  levelUps: { targetTopic?: string }[];
  finish: { summary: string; learned: string[] } | null;
};

export function emptyEffects(): ToolEffects {
  return { mastery: [], errors: [], cards: [], breaks: [], levelUps: [], finish: null };
}

export function collectEffects(calls: readonly ParsedToolCall[]): ToolEffects {
  const effects = emptyEffects();

  for (const call of calls) {
    switch (call.name) {
      case 'check_mastery':
        effects.mastery.push(call.data);
        break;
      case 'assign_error':
        effects.errors.push(call.data);
        break;
      case 'srs_add_card':
        effects.cards.push(call.data);
        break;
      case 'offer_break':
        effects.breaks.push(call.data);
        break;
      case 'offer_level_up':
        effects.levelUps.push({ targetTopic: call.data.targetTopic });
        break;
      case 'finish_lesson':
        effects.finish = call.data;
        break;
      default:
        break;
    }
  }

  return effects;
}