import 'server-only';

import Anthropic from '@anthropic-ai/sdk';

import { getServerEnv } from '@/lib/env';
import { logger, sanitizeError } from '@/lib/server/logger';

import { mockChunkedReply } from './mock';

/**
 * Anthropic Claude klienti.
 *
 * **Qoidalar:**
 *  1. Bu modul `server-only` — `ANTHROPIC_API_KEY` hech qachon klient
 *     bog'lanishiga tushmaydi (`src/lib/server/*` ESLint bilan ham
 *     himoyalangan).
 *  2. Bitta klient instance butun jarayon davomida qayta ishlatiladi
 *     (Axios keep-alive).
 *  3. Xatolar `sanitizeError()` orqali o'tkaziladi — kalit kalitga o'tmaydi.
 */

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (client) return client;
  const env = getServerEnv();

  if (!env.ANTHROPIC_API_KEY) {
    throw new MissingApiKeyError();
  }

  client = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    maxRetries: 2,
    timeout: 60_000,
  });

  return client;
}

export class MissingApiKeyError extends Error {
  readonly status = 503;
  constructor() {
    super('ANTHROPIC_API_KEY sozlanmagan');
    this.name = 'MissingApiKeyError';
  }
}

export function aiModel(): string {
  return getServerEnv().AI_MODEL;
}

export function isAiConfigured(): boolean {
  const env = getServerEnv();
  if (env.AI_PROVIDER === 'test-mock') return true;
  return typeof env.ANTHROPIC_API_KEY === 'string' && env.ANTHROPIC_API_KEY.length > 0;
}

/** Test muhiti uchun deterministik javob (kalit talab qilmaydi). */
export function isMockProvider(): boolean {
  return getServerEnv().AI_PROVIDER === 'test-mock';
}

export type ChatMessageIn = {
  role: 'user' | 'assistant';
  content: string;
};

export type StreamOptions = {
  system: string;
  messages: ChatMessageIn[];
  maxTokens?: number;
  temperature?: number;
  tools?: readonly unknown[];
  onToolUse?: (name: string, input: unknown) => void;
  onText?: (delta: string) => void;
};

export type StreamResult = {
  text: string;
  toolCalls: { name: string; input: unknown }[];
  tokensIn: number | null;
  tokensOut: number | null;
  latencyMs: number;
};

/**
 * Oqimli javob (streaming). `onText` orqali har bir bo'lak yuboriladi —
 * Route Handler SSE orqali klientga uzatadi.
 */
export async function streamChat(options: StreamOptions): Promise<StreamResult> {
  const started = Date.now();

  // ── Test/demo stub (kalitsiz, deterministik) ────────────────────────────
  if (isMockProvider()) {
    // `system` alohida maydonda keladi, `messages` faqat user/assistant saqlaydi —
    // shuning uchun mavjudlik `system` va `tools` orqali aniqlanadi.
    const kind = options.system.trim().length > 0 || (options.tools?.length ?? 0) > 0 ? 'LESSON' : 'GENERAL';
    const variant = options.messages.length;
    const chunks = mockChunkedReply(kind, variant);

    for (const chunk of chunks) {
      options.onText?.(chunk);
    }

    return {
      text: chunks.join(''),
      toolCalls: [],
      tokensIn: 42,
      tokensOut: Math.ceil(chunks.join('').length / 3),
      latencyMs: Date.now() - started,
    };
  }

  const anthropic = getAnthropic();

  const stream = anthropic.messages.stream({
    model: aiModel(),
    max_tokens: options.maxTokens ?? 1400,
    temperature: options.temperature ?? 0.6,
    system: options.system,
    messages: options.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    ...(options.tools && options.tools.length > 0 ? { tools: options.tools as never } : {}),
  });

  let text = '';
  const toolCalls: { name: string; input: unknown }[] = [];

  stream.on('text', (delta) => {
    text += delta;
    options.onText?.(delta);
  });

  const final = await stream.finalMessage();

  for (const block of final.content) {
    if (block.type === 'tool_use') {
      const input = block.input as unknown;
      toolCalls.push({ name: block.name, input });
      options.onToolUse?.(block.name, input);
    }
  }

  const usage = final.usage ?? null;

  return {
    text: text || '',
    toolCalls,
    tokensIn: usage?.input_tokens ?? null,
    tokensOut: usage?.output_tokens ?? null,
    latencyMs: Date.now() - started,
  };
}

/** Oqimsiz qisqa javob (onboarding tahlili, xulosa matnlari). */
export async function completeOnce(options: {
  system: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  if (isMockProvider()) {
    return mockChunkedReply('ONBOARDING', options.prompt.length).join('');
  }

  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: aiModel(),
    max_tokens: options.maxTokens ?? 700,
    temperature: options.temperature ?? 0.3,
    system: options.system,
    messages: [{ role: 'user', content: options.prompt }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return text.trim();
}

export function logAiError(error: unknown, context: string): void {
  logger().error({ err: sanitizeError(error), context }, 'AI so\'rovi muvaffaqiyatsiz');
}