import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import {
  filterUniversities,
  findUniversityByRank,
  TOP_300_UNIVERSITIES,
} from "@/lib/data/universities";
import {
  buildPersonalizedLessonModules,
  buildSmartAdmissionReply,
  DIRECTION_TRACKS,
  GRADE_OPTIONS,
  rankDirectionsByAnswers,
} from "@/lib/data/methodology";
import { cleanTextForSpeech, splitSpeechIntoChunks } from "@/lib/voice/uz-speech";
import { normalizeGeminiAudioToWav } from "@/lib/voice/wav-normalizer";
import { pickSinkIdForMode, type AudioOutputDeviceOption } from "@/lib/voice/lesson-audio-engine";
import {
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
} from "@/lib/auth/session";
import { applicationSubmitSchema } from "@/lib/validations/application";
import {
  computeAutoSlotHour,
  computeNextDayWindow,
  evaluateEnrollmentStatus,
  LESSON_DURATION_MS,
  type StoredApplicationRecord,
} from "@/lib/applications/store";

describe("Top 300 universities dataset", () => {
  it("contains all 300 ranked universities from #1 MIT to #300 TMDU", () => {
    expect(TOP_300_UNIVERSITIES).toHaveLength(300);
    expect(TOP_300_UNIVERSITIES[0]?.name).toBe("Massachusetts Institute of Technology (MIT)");
    expect(TOP_300_UNIVERSITIES[299]?.name).toBe("Tokyo Medical and Dental University (TMDU)");
  });

  it("parses multi-hyphen university names accurately", () => {
    const kaist = findUniversityByRank(53);
    expect(kaist?.name).toBe("KAIST - Korea Advanced Institute of Science & Technology");
    expect(kaist?.country).toBe("Janubiy Koreya");
  });

  it("filters by search query, country, and tier", () => {
    expect(filterUniversities({ tier: "TOP_10" })).toHaveLength(10);
    expect(filterUniversities({ query: "mit" })[0]?.rank).toBe(1);
  });
});

describe("Natural spoken Uzbek methodology & Bluetooth/Speaker routing", () => {
  it("identifies CS & AI track when coding/AI answers are selected", () => {
    const ranked = rankDirectionsByAnswers({
      q1: "math-code",
      q2: "ai-future",
      q3: "coding-logic",
    });
    expect(ranked[0]?.track.id).toBe("cs-ai");
  });

  it("uses natural conversational Uzbek without stiff literary clichés", () => {
    const university = findUniversityByRank(4)!;
    const grade = GRADE_OPTIONS.find((g) => g.id === "9-sinf")!;
    const direction = DIRECTION_TRACKS.find((d) => d.id === "cs-ai")!;

    const modules = buildPersonalizedLessonModules({
      university,
      grade,
      direction,
      studentName: "Jasurbek",
    });
    expect(modules).toHaveLength(7);
    expect(modules[0]?.spokenScript).toContain("Salom, Jasurbek!");
    expect(modules[0]?.spokenScript).toContain("UCAS");

    for (const mod of modules) {
      expect(mod.spokenScript).not.toMatch(/[*#`]/);
      expect(mod.spokenScript).not.toMatch(/amalga oshiriladi|hisoblanadi|zarur bo'ladi/i);
    }
  });

  it("answers student questions naturally in Uzbek fallback mode", () => {
    const reply = buildSmartAdmissionReply({
      question: "Grant yutish uchun nima qilishim kerak?",
      university: findUniversityByRank(53)!,
      grade: GRADE_OPTIONS[5]!,
      direction: DIRECTION_TRACKS[0]!,
      currentModuleIndex: 2,
    });
    expect(reply).toContain("GKS");
  });

  it("routes audio cleanly between stereo Bluetooth and Dinamik (Speaker)", () => {
    const mockDevices: AudioOutputDeviceOption[] = [
      {
        deviceId: "default",
        label: "Default - Speakers (Realtek Audio)",
        isBluetoothLike: false,
        isSpeakerLike: true,
      },
      {
        deviceId: "spk-realtek",
        label: "Speakers (Realtek High Definition Audio)",
        isBluetoothLike: false,
        isSpeakerLike: true,
      },
      {
        deviceId: "bt-hfp",
        label: "Headset (AirPods Pro Hands-Free AG Audio)",
        isBluetoothLike: true,
        isSpeakerLike: false,
      },
      {
        deviceId: "bt-stereo",
        label: "Headphones (AirPods Pro Stereo)",
        isBluetoothLike: true,
        isSpeakerLike: false,
      },
    ];

    // Prefers crisp Stereo Bluetooth over Hands-Free AG Audio
    expect(pickSinkIdForMode(mockDevices, "bluetooth")).toBe("bt-stereo");
    // Picks dedicated built-in Speaker (Dinamik) when speaker mode is chosen
    expect(pickSinkIdForMode(mockDevices, "speaker")).toBe("spk-realtek");
  });
});

describe("Auth session, Uzbek speech & Fullscreen zero-text check", () => {
  it("hashes passwords and verifies signed session tokens", () => {
    const hash = hashPassword("Secret123!");
    expect(verifyPassword("Secret123!", hash)).toBe(true);
    expect(verifyPassword("WrongPass", hash)).toBe(false);

    const token = createSessionToken({
      id: "u1",
      name: "Jasurbek",
      email: "jasur@example.com",
    });
    expect(verifySessionToken(token)).toEqual({
      id: "u1",
      name: "Jasurbek",
      email: "jasur@example.com",
    });
  });

  it("normalizes numbers, ordinals, and percentages into Uzbek spoken words", () => {
    const cleaned = cleanTextForSpeech("1-o'rinda 7.5 ball va 100% grant!");
    expect(cleaned).toContain("birinchi");
    expect(cleaned).toContain("yetti yarim");
    expect(cleaned).toContain("yuz foiz");
    expect(splitSpeechIntoChunks(cleaned).length).toBeGreaterThan(0);
  });

  it("validates application submission input", () => {
    const ok = applicationSubmitSchema.safeParse({
      fullName: "Sardor Aliyev",
      phone: "+998 90 123 45 67",
      universityRank: 1,
      gradeId: "10-sinf",
      directionId: "cs-ai",
    });
    expect(ok.success).toBe(true);
  });

  it("strips trailing non-audio metadata from RIFF WAVE buffers and fades boundaries to zero", () => {
    const pcmBytes = 4800; // 2400 samples @ 24kHz
    const trailingGarbageBytes = 7664;
    const rawWav = Buffer.alloc(44 + pcmBytes + trailingGarbageBytes);
    rawWav.write("RIFF", 0);
    rawWav.writeUInt32LE(36 + pcmBytes + trailingGarbageBytes, 4);
    rawWav.write("WAVE", 8);
    rawWav.write("fmt ", 12);
    rawWav.writeUInt32LE(16, 16);
    rawWav.writeUInt16LE(1, 20);
    rawWav.writeUInt16LE(1, 22);
    rawWav.writeUInt32LE(24000, 24);
    rawWav.writeUInt32LE(48000, 28);
    rawWav.writeUInt16LE(2, 32);
    rawWav.writeUInt16LE(16, 34);
    rawWav.write("data", 36);
    rawWav.writeUInt32LE(pcmBytes, 40);

    // Fill PCM with constant signal and trailing region with loud 0x7fff static spikes
    for (let i = 0; i < pcmBytes / 2; i++) {
      rawWav.writeInt16LE(12000, 44 + i * 2);
    }
    for (let i = 0; i < trailingGarbageBytes / 2; i++) {
      rawWav.writeInt16LE(32767, 44 + pcmBytes + i * 2);
    }

    const cleaned = normalizeGeminiAudioToWav(rawWav, "audio/wav")!;
    expect(cleaned).not.toBeNull();
    // Exact canonical length: 44 header + pcmBytes (all 7,664 trailing static bytes removed!)
    expect(cleaned.byteLength).toBe(44 + pcmBytes);
    expect(cleaned.readUInt32LE(40)).toBe(pcmBytes);
    // First and last PCM samples smoothly faded to 0 (no clicks/pops!)
    expect(cleaned.readInt16LE(44)).toBe(0);
    expect(cleaned.readInt16LE(cleaned.byteLength - 2)).toBe(0);
  });

  it("auto-schedules strictly 1 lesson per day with 2-hour duration and shows preparation text", () => {
    expect(computeAutoSlotHour("6-sinf")).toBe(17);
    expect(computeAutoSlotHour("9-sinf")).toBe(18);
    expect(computeAutoSlotHour("litsey-bitiruvchi")).toBe(19);

    const baseNow = new Date("2026-11-25T15:00:00.000Z");
    const { start, end } = computeNextDayWindow(baseNow, 18);
    expect(end.getTime() - start.getTime()).toBe(LESSON_DURATION_MS);
    expect(LESSON_DURATION_MS).toBe(2 * 60 * 60 * 1000);

    const waitingRecord: StoredApplicationRecord = {
      id: "enr-1",
      userId: "u-1",
      userEmail: "student@example.com",
      fullName: "Hello",
      phone: "+998901234567",
      universityRank: 1,
      universityName: "Massachusetts Institute of Technology (MIT)",
      country: "AQSH",
      gradeId: "8-sinf",
      grade: "8-sinf",
      directionId: "cs-ai",
      directionTitle: "Dasturlash va Sun'iy Intellekt (IT & AI)",
      completedModules: 7,
      currentModuleIndex: 0,
      currentDayNumber: 2,
      dailySlotHour: 18,
      lessonDurationMinutes: 120,
      nextLessonStartAt: start.toISOString(),
      nextLessonEndAt: end.toISOString(),
      lastCompletedAt: baseNow.toISOString(),
      lastNotifiedStartIso: null,
      questionsAsked: 1,
      createdAt: baseNow.toISOString(),
      updatedAt: baseNow.toISOString(),
    };

    const waitingStatus = evaluateEnrollmentStatus(waitingRecord, baseNow);
    expect(waitingStatus.isLessonOpenNow).toBe(false);
    expect(waitingStatus.statusMessage).toBe("Keyingi darsga tayyorgarlik qiling");

    const insideWindow = new Date(start.getTime() + 15 * 60 * 1000);
    const openStatus = evaluateEnrollmentStatus(waitingRecord, insideWindow);
    expect(openStatus.isLessonOpenNow).toBe(true);
    expect(openStatus.remainingLessonSeconds).toBe(105 * 60);
  });

  it("keeps FullscreenAiLesson strictly text-free in JSX markup", () => {
    const filePath = path.join(
      process.cwd(),
      "src",
      "components",
      "steps",
      "FullscreenAiLesson.tsx",
    );
    const source = readFileSync(filePath, "utf8");
    const sf = ts.createSourceFile(
      filePath,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    const visibleJsxTexts: string[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isJsxText(node)) {
        const trimmed = node.getText(sf).trim();
        if (trimmed.length > 0) {
          visibleJsxTexts.push(trimmed);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);

    expect(visibleJsxTexts).toEqual([]);
  });
});
