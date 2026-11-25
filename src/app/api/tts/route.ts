import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { cleanTextForSpeech } from "@/lib/voice/uz-speech";
import { normalizeGeminiAudioToWav } from "@/lib/voice/wav-normalizer";

export const dynamic = "force-dynamic";

const ttsBodySchema = z.object({
  text: z.string().min(1).max(3500),
  voice: z.enum(["Aoede", "Puck", "Charon", "Kore", "Fenrir"]).optional(),
});

// Barcha darslarda 100% BIR XIL Gemini Neural ovoz ("Puck") ishlatilishi uchun
// har bir modelning alohida RPM kvotasidan navbat bilan foydalanamiz (OpenAI robot ovoziga TUSHMAYDI!)
const GEMINI_TTS_MODELS = [
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-flash-preview-tts",
  "gemini-3.8-flash-tts",
  "gemini-3.8-flash-lite-tts",
  "gemini-2.5-pro-preview-tts",
] as const;

let roundRobinCursor = 0;

const memoryCache = new Map<string, Buffer>();
const inflightRequests = new Map<string, Promise<Buffer | null>>();

function getDiskCachePath(cacheKey: string): string {
  const hash = createHash("sha256").update(cacheKey).digest("hex").slice(0, 32);
  return path.join(process.cwd(), "data", "tts-cache", `${hash}.wav`);
}

async function readDiskCache(cacheKey: string): Promise<Buffer | null> {
  try {
    const buf = await readFile(getDiskCachePath(cacheKey));
    return buf.byteLength > 128 ? buf : null;
  } catch {
    return null;
  }
}

async function writeDiskCache(cacheKey: string, wav: Buffer): Promise<void> {
  try {
    const dir = path.join(process.cwd(), "data", "tts-cache");
    await mkdir(dir, { recursive: true });
    await writeFile(getDiskCachePath(cacheKey), wav);
  } catch {
    // ignore read-only serverless fs
  }
}

async function requestSingleModel(
  apiKey: string,
  modelName: string,
  text: string,
  voice: string,
): Promise<{ status: number; wav: Buffer | null }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 24000);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Please read the following text transcript aloud clearly without adding any words:\n${text}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice,
                },
              },
            },
          },
        }),
      },
    );
    clearTimeout(timeout);

    if (!res.ok) {
      return { status: res.status, wav: null };
    }

    const json = (await res.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }>;
        };
      }>;
    };
    const inline = json.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inline?.data) {
      return { status: 502, wav: null };
    }

    const rawBuf = Buffer.from(inline.data, "base64");
    const cleanWav = normalizeGeminiAudioToWav(rawBuf, inline.mimeType);
    return { status: cleanWav ? 200 : 502, wav: cleanWav };
  } catch {
    return { status: 504, wav: null };
  }
}

async function synthesizeConsistentGeminiVoice(
  text: string,
  preferredVoice?: string,
): Promise<Buffer | null> {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();
  if (!apiKey) return null;

  const geminiVoices = ["Aoede", "Puck", "Charon", "Kore", "Fenrir"];
  const envVoice = process.env.GEMINI_LIVE_VOICE?.trim();
  const voice =
    preferredVoice && geminiVoices.includes(preferredVoice)
      ? preferredVoice
      : envVoice && geminiVoices.includes(envVoice)
        ? envVoice
        : "Puck";

  const startIdx = roundRobinCursor++ % GEMINI_TTS_MODELS.length;
  const orderedModels = [
    ...GEMINI_TTS_MODELS.slice(startIdx),
    ...GEMINI_TTS_MODELS.slice(0, startIdx),
  ];

  // Pass 1 across available Gemini TTS quota pools (all using the exact same prebuilt voice!)
  let sawRateLimit = false;
  for (const modelName of orderedModels) {
    const attempt = await requestSingleModel(apiKey, modelName, text, voice);
    if (attempt.wav) return attempt.wav;
    if (attempt.status === 429 || attempt.status === 503) {
      sawRateLimit = true;
    }
  }

  // If momentarily rate-limited by rapid lesson switching, wait briefly and retry Gemini
  // instead of EVER switching to a different/robotic voice!
  if (sawRateLimit) {
    await new Promise((r) => setTimeout(r, 2200));
    for (const modelName of orderedModels.slice(0, 3)) {
      const retry = await requestSingleModel(apiKey, modelName, text, voice);
      if (retry.wav) return retry.wav;
    }
  }

  return null;
}

async function handleSynthesize(rawText: string, voice?: string): Promise<NextResponse> {
  const cleaned = cleanTextForSpeech(rawText);
  if (!cleaned) {
    return NextResponse.json({ error: "Empty speech text" }, { status: 400 });
  }

  const effectiveVoice = voice ?? process.env.GEMINI_LIVE_VOICE?.trim() ?? "Puck";
  const cacheKey = `puck-v4:${effectiveVoice}:${cleaned}`;

  // 1. Instant RAM cache
  const memHit = memoryCache.get(cacheKey);
  if (memHit) {
    return new NextResponse(new Uint8Array(memHit), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=86400",
        "X-TTS-Provider": "gemini-puck-cache",
      },
    });
  }

  // 2. Persistent Disk cache (survives restarts & saves API quota!)
  const diskHit = await readDiskCache(cacheKey);
  if (diskHit) {
    if (memoryCache.size >= 160) {
      const oldest = memoryCache.keys().next().value;
      if (oldest) memoryCache.delete(oldest);
    }
    memoryCache.set(cacheKey, diskHit);
    return new NextResponse(new Uint8Array(diskHit), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=86400",
        "X-TTS-Provider": "gemini-puck-disk",
      },
    });
  }

  // 3. Deduplicate concurrent identical requests
  let pending = inflightRequests.get(cacheKey);
  if (!pending) {
    pending = synthesizeConsistentGeminiVoice(cleaned, effectiveVoice).finally(() => {
      inflightRequests.delete(cacheKey);
    });
    inflightRequests.set(cacheKey, pending);
  }

  const wav = await pending;
  if (wav) {
    if (memoryCache.size >= 160) {
      const oldest = memoryCache.keys().next().value;
      if (oldest) memoryCache.delete(oldest);
    }
    memoryCache.set(cacheKey, wav);
    void writeDiskCache(cacheKey, wav);

    return new NextResponse(new Uint8Array(wav), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=86400",
        "X-TTS-Provider": "gemini-puck-live",
      },
    });
  }

  return NextResponse.json({ error: "TTS temporarily busy" }, { status: 503 });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ttsBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid TTS payload" }, { status: 400 });
  }

  return handleSynthesize(parsed.data.text, parsed.data.voice);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const text = url.searchParams.get("text") ?? "";
  const voice = url.searchParams.get("voice") as
    | "Aoede"
    | "Puck"
    | "Charon"
    | "Kore"
    | "Fenrir"
    | undefined;
  if (!text.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }
  return handleSynthesize(text.slice(0, 3500), voice);
}
