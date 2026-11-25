import { NextResponse } from "next/server";
import { findUniversityByRank, TOP_300_UNIVERSITIES } from "@/lib/data/universities";
import {
  buildSmartAdmissionReply,
  DIRECTION_TRACKS,
  getCountryProfile,
  GRADE_OPTIONS,
} from "@/lib/data/methodology";
import { cleanTextForSpeech } from "@/lib/voice/uz-speech";

export const dynamic = "force-dynamic";

interface HistoryTurn {
  role: "student" | "mentor";
  text: string;
}

function buildMentorSystemInstruction(params: {
  universityName: string;
  universityRank: number;
  country: string;
  gradeLabel: string;
  directionTitle: string;
  portalSpoken: string;
  languageSpoken: string;
  examsSpoken: string;
  pathwaySpoken: string;
  scholarshipSpoken: string;
  deadlineSpoken: string;
  currentModuleIndex: number;
}): string {
  return [
    `Sen "Flux" platformasining tajribali xalqaro qabul va ta'lim ustozisan.`,
    `O'quvchi tanlagan oliygoh: #${params.universityRank} ${params.universityName} (${params.country}).`,
    `O'quvchining hozirgi sinfi: ${params.gradeLabel}.`,
    `Tanlangan yo'nalish: ${params.directionTitle}.`,
    `Ushbu davlat qabul tizimi ma'lumotlari:`,
    `- Qabul portali: ${params.portalSpoken}`,
    `- Til talabi: ${params.languageSpoken}`,
    `- Imtihon talabi: ${params.examsSpoken}`,
    `- Kirish yo'li: ${params.pathwaySpoken}`,
    `- Grant va stipendiyalar: ${params.scholarshipSpoken}`,
    `- Muddatlar: ${params.deadlineSpoken}`,
    `Hozir o'tilayotgan dars moduli bosqichi: ${params.currentModuleIndex + 1}-modul (jami 7 modul).`,
    `QAT'IY QOIDALAR:`,
    `1. Faqat TABIIY, ODDDIY, JONLI SO'ZLASHUV O'ZBEK TILIDA gapir — xuddi yaqin, mehribon va tajribali ustoz o'quvchisi bilan yuzma-yuz samimiy gaplashayotgandek!`,
    `2. Kitobiy, rasmiy va adabiy qoliplarni ("oliygoh", "hisoblanadi", "amalga oshiriladi", "zarur bo'ladi", "namoyon etish", "muvaffaqiyatga erishasiz", "ahamiyat kasb etadi") UMUMAN ISHLATMA! Oddiy, tushunarli, insoniy so'zlardan foydalan.`,
    `3. Hech qanday markdown, yulduzcha (*), panjara (#), ro'yxat chiziqchalari yoki qavslar ishlatma — javobing to'g'ridan-to'g'ri ovozli o'qiladi, ekranda umuman yozuv yo'q.`,
    `4. Javobing qisqa, aniq va jonli bo'lsin (2 tadan 4 tagacha gap). O'quvchining aynan bergan savoliga oddiy tilda javob ber va yana savoli bo'lsa probelni bosib so'rashi mumkinligini eslat.`,
  ].join("\n");
}

const GEMINI_CHAT_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
] as const;

async function askGeminiWithAudioOrText(params: {
  audioBuffer: Buffer | null;
  audioMimeType: string;
  browserTranscript: string;
  systemInstruction: string;
  history: HistoryTurn[];
}): Promise<{ transcript: string; reply: string } | null> {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();
  if (!apiKey) return null;

  const historySummary =
    params.history.length > 0
      ? params.history
          .slice(-4)
          .map((h) => `${h.role === "student" ? "O'quvchi" : "Ustoz"}: ${h.text}`)
          .join("\n")
      : "";

  const userParts: Array<Record<string, unknown>> = [];

  if (params.audioBuffer && params.audioBuffer.byteLength > 600) {
    const cleanMime = params.audioMimeType.split(";")[0]?.trim() || "audio/webm";
    userParts.push({
      inlineData: {
        mimeType: cleanMime,
        data: params.audioBuffer.toString("base64"),
      },
    });
  }

  const promptLines = [
    historySummary ? `Oldingi qisqa suhbat:\n${historySummary}\n` : "",
    params.browserTranscript
      ? `Brauzer dastlabki matni (agar audio aniqroq bo'lsa audioni ustun bil): "${params.browserTranscript}"`
      : `O'quvchi probel tugmasini bosib ovozli savol yoki fikr bildirdi.`,
    `Quyidagi JSON formatida javob qaytar: {"transcript": "o'quvchi nima degani", "reply": "ustozning faqat oddiy, tabiiy so'zlashuv o'zbek tilidagi og'zaki javobi"}.`,
  ]
    .filter(Boolean)
    .join("\n");

  userParts.push({ text: promptLines });

  for (const modelName of GEMINI_CHAT_MODELS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 11000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: params.systemInstruction }],
            },
            contents: [
              {
                role: "user",
                parts: userParts,
              },
            ],
            generationConfig: {
              temperature: 0.55,
              responseMimeType: "application/json",
            },
          }),
        },
      );
      clearTimeout(timeout);

      if (!res.ok) continue;
      const data = (await res.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!rawText) continue;

      const parsed = JSON.parse(rawText) as { transcript?: string; reply?: string };
      const reply = parsed.reply?.trim();
      if (!reply) continue;
      return {
        transcript: parsed.transcript?.trim() || params.browserTranscript || "",
        reply: cleanTextForSpeech(reply),
      };
    } catch {
      continue;
    }
  }

  return null;
}

async function askOpenAiFallback(params: {
  audioBuffer: Buffer | null;
  audioMimeType: string;
  browserTranscript: string;
  systemInstruction: string;
  history: HistoryTurn[];
}): Promise<{ transcript: string; reply: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  let transcript = params.browserTranscript.trim();

  if (!transcript && params.audioBuffer && params.audioBuffer.byteLength > 600) {
    try {
      const ext = params.audioMimeType.includes("mp4") ? "mp4" : "webm";
      const form = new FormData();
      form.append(
        "file",
        new Blob([new Uint8Array(params.audioBuffer)], {
          type: params.audioMimeType || "audio/webm",
        }),
        `voice.${ext}`,
      );
      form.append("model", "whisper-1");

      const sttRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
      if (sttRes.ok) {
        const sttJson = (await sttRes.json()) as { text?: string };
        transcript = sttJson.text?.trim() ?? "";
      }
    } catch {
      // ignore transcription error
    }
  }

  if (!transcript) return null;

  try {
    const messages = [
      { role: "system", content: params.systemInstruction },
      ...params.history.slice(-4).map((h) => ({
        role: h.role === "student" ? ("user" as const) : ("assistant" as const),
        content: h.text,
      })),
      { role: "user", content: transcript },
    ];

    const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.55,
        max_tokens: 320,
        messages,
      }),
    });

    if (!chatRes.ok) return null;
    const chatJson = (await chatRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = chatJson.choices?.[0]?.message?.content?.trim();
    if (!reply) return null;
    return {
      transcript,
      reply: cleanTextForSpeech(reply),
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let audioBuffer: Buffer | null = null;
  let audioMimeType = "audio/webm";
  let browserTranscript = "";
  let universityRank = 1;
  let gradeId = "9-sinf";
  let directionId = "cs-ai";
  let currentModuleIndex = 0;
  let history: HistoryTurn[] = [];

  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const audioEntry = form.get("audio");
      if (audioEntry && typeof audioEntry !== "string") {
        audioMimeType = audioEntry.type || "audio/webm";
        const ab = await audioEntry.arrayBuffer();
        audioBuffer = Buffer.from(ab);
      }
      browserTranscript = String(form.get("browserTranscript") ?? "").trim();
      universityRank = Number(form.get("universityRank") ?? 1) || 1;
      gradeId = String(form.get("gradeId") ?? "9-sinf");
      directionId = String(form.get("directionId") ?? "cs-ai");
      currentModuleIndex = Number(form.get("currentModuleIndex") ?? 0) || 0;
      const rawHistory = String(form.get("history") ?? "[]");
      try {
        const parsedH = JSON.parse(rawHistory);
        if (Array.isArray(parsedH)) history = parsedH.slice(-6);
      } catch {
        history = [];
      }
    } else {
      const json = (await req.json()) as Record<string, unknown>;
      browserTranscript = String(json.browserTranscript ?? "").trim();
      universityRank = Number(json.universityRank ?? 1) || 1;
      gradeId = String(json.gradeId ?? "9-sinf");
      directionId = String(json.directionId ?? "cs-ai");
      currentModuleIndex = Number(json.currentModuleIndex ?? 0) || 0;
      if (Array.isArray(json.history)) {
        history = json.history.slice(-6) as HistoryTurn[];
      }
    }
  } catch {
    return NextResponse.json({ error: "Invalid voice turn request" }, { status: 400 });
  }

  const university = findUniversityByRank(universityRank) ?? TOP_300_UNIVERSITIES[0];
  const grade = GRADE_OPTIONS.find((g) => g.id === gradeId) ?? GRADE_OPTIONS[4];
  const direction = DIRECTION_TRACKS.find((d) => d.id === directionId) ?? DIRECTION_TRACKS[0];
  const profile = getCountryProfile(university.country);

  const systemInstruction = buildMentorSystemInstruction({
    universityName: university.name,
    universityRank: university.rank,
    country: university.country,
    gradeLabel: grade.label,
    directionTitle: direction.title,
    portalSpoken: profile.portalSpoken,
    languageSpoken: profile.languageSpoken,
    examsSpoken: profile.examsSpoken,
    pathwaySpoken: profile.pathwaySpoken,
    scholarshipSpoken: profile.scholarshipSpoken,
    deadlineSpoken: profile.deadlineSpoken,
    currentModuleIndex,
  });

  // 1. Gemini 2.5 Flash Multimodal (Audio + Context)
  if ((audioBuffer && audioBuffer.byteLength > 600) || browserTranscript) {
    const geminiResult = await askGeminiWithAudioOrText({
      audioBuffer,
      audioMimeType,
      browserTranscript,
      systemInstruction,
      history,
    });
    if (geminiResult) {
      return NextResponse.json({
        ok: true,
        provider: "gemini",
        transcript: geminiResult.transcript,
        reply: geminiResult.reply,
      });
    }

    // 2. OpenAI Whisper + GPT-4o-mini Fallback
    const openAiResult = await askOpenAiFallback({
      audioBuffer,
      audioMimeType,
      browserTranscript,
      systemInstruction,
      history,
    });
    if (openAiResult) {
      return NextResponse.json({
        ok: true,
        provider: "openai",
        transcript: openAiResult.transcript,
        reply: openAiResult.reply,
      });
    }
  }

  // 3. Built-in Smart Uzbek Admission Expert
  const fallbackReply = buildSmartAdmissionReply({
    question: browserTranscript,
    university,
    grade,
    direction,
    currentModuleIndex,
  });

  return NextResponse.json({
    ok: true,
    provider: "local-expert",
    transcript: browserTranscript,
    reply: cleanTextForSpeech(fallbackReply),
  });
}
