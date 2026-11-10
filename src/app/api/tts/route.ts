import { NextResponse } from "next/server";
import { z } from "zod";
import { cleanTextForSpeech, splitIntoNaturalSentences } from "@/lib/voice/jarvis-speech";

export const dynamic = "force-dynamic";

const ttsRequestSchema = z.object({
  text: z.string().min(1).max(4000),
  voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer", "Aoede", "Puck", "Charon", "Kore", "Fenrir"]).optional(),
  speed: z.number().min(0.75).max(1.5).optional(),
});

function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcmBuffer.length;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // BitsPerSample
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

const audioCache = new Map<string, Buffer>();

/**
 * 1-USTUVORLIK: Gemini Neural Multilingual TTS (`models/gemini-2.5-flash-preview-tts`)
 * O'zbek tili uchun insondek tabiiy, ohangdor va mukammal fonetik talaffuz.
 * Aoede = Ayol o'qituvchi, Puck = Erkak murabbiy.
 */
async function synthesizeWithGeminiTTS(
  text: string,
  voiceName: string = "Aoede"
): Promise<Buffer | null> {
  const apiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY
  )?.trim();
  if (!apiKey) return null;

  const validVoices = ["Aoede", "Puck", "Charon", "Kore", "Fenrir"];
  const voice = validVoices.includes(voiceName) ? voiceName : "Aoede";
  const cacheKey = `${voice}:${text}`;

  const cached = audioCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[TTS Gemini Error]", res.status, errText);
      return null;
    }
    const json = await res.json();
    const base64Data = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Data) return null;

    const pcm = Buffer.from(base64Data, "base64");
    const wav = pcmToWav(pcm, 24000, 1);

    if (audioCache.size > 150) {
      const first = audioCache.keys().next().value;
      if (first) audioCache.delete(first);
    }
    audioCache.set(cacheKey, wav);
    return wav;
  } catch {
    return null;
  }
}

/**
 * 2-ustuvorlik: ElevenLabs Multilingual v2 API (`ELEVENLABS_API_KEY`)
 */
async function synthesizeWithElevenLabs(text: string): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) return null;

  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || "JBFqnCBsd6RMkjVDRZzb";
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

    if (!res.ok) {
      const errText = await res.text();
      console.error("[TTS ElevenLabs Error]", res.status, errText);
      return null;
    }
    const buf = await res.arrayBuffer();
    return buf.byteLength > 128 ? buf : null;
  } catch {
    return null;
  }
}

/**
 * 3-ustuvorlik: OpenAI Neural TTS `tts-1` (`OPENAI_TTS_API_KEY` yoki `OPENAI_API_KEY`)
 */
async function synthesizeWithOpenAI(
  text: string,
  voice: string = "onyx",
  speed: number = 1.0
): Promise<ArrayBuffer | null> {
  const apiKey = (
    process.env.OPENAI_TTS_API_KEY || process.env.OPENAI_API_KEY
  )?.trim();
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

    if (!res.ok) {
      const errText = await res.text();
      console.error("[TTS OpenAI Error]", res.status, errText);
      return null;
    }
    const buf = await res.arrayBuffer();
    return buf.byteLength > 128 ? buf : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const text = url.searchParams.get("text") || "";
  const voice = url.searchParams.get("voice") || "Aoede";

  if (!text) {
    return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
  }

  const cleanedText = cleanTextForSpeech(text);
  if (!cleanedText) {
    return NextResponse.json({ fallback: "web-speech" }, { status: 200 });
  }

  // 1. Gemini Neural Multilingual TTS (Top Priority)
  const geminiAudio = await synthesizeWithGeminiTTS(cleanedText, voice);
  if (geminiAudio) {
    return new NextResponse(new Uint8Array(geminiAudio), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=86400, immutable",
        "X-TTS-Provider": "gemini-neural-tts",
      },
    });
  }

  // 2. OpenAI Neural TTS
  const openAiAudio = await synthesizeWithOpenAI(cleanedText, voice);
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

  // 3. ElevenLabs
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

  return NextResponse.json({ fallback: "web-speech" }, { status: 200 });
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

  const voice = parsed.data.voice ?? "Aoede";

  // 1. Gemini Neural Multilingual TTS
  const geminiAudio = await synthesizeWithGeminiTTS(cleanedText, voice);
  if (geminiAudio) {
    return new NextResponse(new Uint8Array(geminiAudio), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=86400, immutable",
        "X-TTS-Provider": "gemini-neural-tts",
      },
    });
  }

  // 2. OpenAI Neural TTS
  const openAiAudio = await synthesizeWithOpenAI(cleanedText, voice);
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

  // 3. ElevenLabs
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

  return NextResponse.json({ fallback: "web-speech" }, { status: 200 });
}
