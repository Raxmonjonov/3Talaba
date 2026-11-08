import { NextResponse } from "next/server";
import { z } from "zod";
import { cleanTextForSpeech, splitIntoNaturalSentences } from "@/lib/voice/jarvis-speech";

export const dynamic = "force-dynamic";

const ttsRequestSchema = z.object({
  text: z.string().min(1).max(4000),
  voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).optional(),
  speed: z.number().min(0.75).max(1.5).optional(),
});

/**
 * 1-ustuvorlik: ElevenLabs Multilingual v2 API (`ELEVENLABS_API_KEY`)
 */
async function synthesizeWithElevenLabs(text: string): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) return null;

  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || "JBFqnCBsd6RMkjVDRZzb"; // George (Multilingual Warm Mentor)
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.78,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return buf.byteLength > 128 ? buf : null;
  } catch {
    return null;
  }
}

/**
 * 2-ustuvorlik: OpenAI Neural TTS `tts-1` (`OPENAI_API_KEY`)
 */
async function synthesizeWithOpenAI(
  text: string,
  voice: string = "onyx",
  speed: number = 1.0
): Promise<ArrayBuffer | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice,
        speed,
        response_format: "mp3",
      }),
    });

    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return buf.byteLength > 128 ? buf : null;
  } catch {
    return null;
  }
}

/**
 * Matnni 175 belgidan oshmaydigan to'liq gap bo'laklariga ajratish
 */
function chunkTextForStream(text: string, maxLen = 175): string[] {
  const sentences = splitIntoNaturalSentences(text);
  const chunks: string[] = [];

  for (const s of sentences) {
    if (s.length <= maxLen) {
      chunks.push(s);
      continue;
    }
    const words = s.split(/\s+/);
    let current = "";
    for (const w of words) {
      if (!current) {
        current = w;
      } else if ((current + " " + w).length <= maxLen) {
        current = `${current} ${w}`;
      } else {
        chunks.push(current);
        current = w;
      }
    }
    if (current) chunks.push(current);
  }

  return chunks;
}

/**
 * 3-ustuvorlik: Kalitsiz (Zero-Config) Cloud Neural Audio Stream
 * O'zbek lotin matnini tabiiy fonetik ohangda MP3 oqimiga aylantiradi.
 */
async function synthesizeWithCloudStream(text: string): Promise<Uint8Array | null> {
  const chunks = chunkTextForStream(text, 175);
  if (chunks.length === 0) return null;

  try {
    const buffers: Uint8Array[] = [];
    for (const chunk of chunks) {
      const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=tr&q=${encodeURIComponent(
        chunk
      )}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
      });
      if (!res.ok) return null;
      const arr = new Uint8Array(await res.arrayBuffer());
      if (arr.byteLength < 64) return null;
      buffers.push(arr);
    }

    const totalLength = buffers.reduce((acc, b) => acc + b.byteLength, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const b of buffers) {
      merged.set(b, offset);
      offset += b.byteLength;
    }
    return merged;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ttsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid TTS parameters" }, { status: 400 });
  }

  const cleanedText = cleanTextForSpeech(parsed.data.text);
  if (!cleanedText) {
    return NextResponse.json({ fallback: "web-speech" }, { status: 200 });
  }

  const speed = parsed.data.speed ?? 1.0;
  const voice = parsed.data.voice ?? "onyx";

  // 1. ElevenLabs Neural TTS
  const elevenAudio = await synthesizeWithElevenLabs(cleanedText);
  if (elevenAudio) {
    return new NextResponse(elevenAudio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
        "X-TTS-Provider": "elevenlabs",
      },
    });
  }

  // 2. OpenAI TTS (`tts-1`)
  const openAiAudio = await synthesizeWithOpenAI(cleanedText, voice, speed);
  if (openAiAudio) {
    return new NextResponse(openAiAudio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
        "X-TTS-Provider": "openai-tts-1",
      },
    });
  }

  // 3. Cloud Neural TTS Stream
  const cloudAudio = await synthesizeWithCloudStream(cleanedText);
  if (cloudAudio) {
    return new NextResponse(Buffer.from(cloudAudio), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
        "X-TTS-Provider": "cloud-neural",
      },
    });
  }

  // 4. Graceful Web Speech API fallback
  return NextResponse.json({ fallback: "web-speech" }, { status: 200 });
}
