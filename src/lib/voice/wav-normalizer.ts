/**
 * Gemini TTS modellaridan qaytadigan audio oqimlarni (ham raw L16 PCM, ham ichida
 * qo'shimcha LIST/INFO/junk treyler bo'laklari bor RIFF WAVE fayllarni) tozalab,
 * boshida va oxirida silliq fade-in / fade-out bilan sof 44-bayt sarlavhali WAV ga keltiradi.
 * Bu bo'limdan bo'limga o'tganda hech qanday shitirlash, pop yoki shovqin chiqmasligini ta'minlaydi.
 */

export function buildCleanWavFromPcm16(
  pcmInput: Buffer,
  sampleRate = 24000,
  numChannels = 1,
): Buffer {
  const evenLen = pcmInput.byteLength - (pcmInput.byteLength % (2 * numChannels));
  const pcm = Buffer.from(pcmInput.subarray(0, evenLen));
  const totalSamples = pcm.byteLength / 2;

  // Apply 12ms cosine fade-in and 18ms cosine fade-out to eliminate boundary clicks/pops
  const fadeInSamples = Math.min(Math.floor(sampleRate * 0.012) * numChannels, Math.floor(totalSamples / 4));
  const fadeOutSamples = Math.min(Math.floor(sampleRate * 0.018) * numChannels, Math.floor(totalSamples / 4));

  for (let i = 0; i < fadeInSamples; i++) {
    const gain = 0.5 * (1 - Math.cos((Math.PI * i) / fadeInSamples));
    const sample = pcm.readInt16LE(i * 2);
    pcm.writeInt16LE(Math.round(sample * gain), i * 2);
  }

  for (let i = 0; i < fadeOutSamples; i++) {
    const idx = totalSamples - 1 - i;
    const gain = 0.5 * (1 - Math.cos((Math.PI * i) / fadeOutSamples));
    const sample = pcm.readInt16LE(idx * 2);
    pcm.writeInt16LE(Math.round(sample * gain), idx * 2);
  }

  const header = Buffer.alloc(44);
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcm.byteLength;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcm]);
}

export function normalizeGeminiAudioToWav(rawBuffer: Buffer, mimeType?: string): Buffer | null {
  if (!rawBuffer || rawBuffer.byteLength < 128) return null;

  // 1. Check if buffer is ALREADY a RIFF WAVE container (e.g., gemini-3.8-flash-tts)
  const isRiffWave =
    rawBuffer.byteLength >= 44 &&
    rawBuffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    rawBuffer.subarray(8, 12).toString("ascii") === "WAVE";

  if (isRiffWave) {
    let offset = 12;
    let sampleRate = 24000;
    let numChannels = 1;
    let bitsPerSample = 16;
    let audioFormat = 1;
    let pcmSlice: Buffer | null = null;

    while (offset + 8 <= rawBuffer.byteLength) {
      const chunkId = rawBuffer.subarray(offset, offset + 4).toString("ascii");
      const chunkSize = rawBuffer.readUInt32LE(offset + 4);
      const chunkDataStart = offset + 8;

      if (chunkId === "fmt " && chunkDataStart + 16 <= rawBuffer.byteLength) {
        audioFormat = rawBuffer.readUInt16LE(chunkDataStart);
        numChannels = rawBuffer.readUInt16LE(chunkDataStart + 2) || 1;
        sampleRate = rawBuffer.readUInt32LE(chunkDataStart + 4) || 24000;
        bitsPerSample = rawBuffer.readUInt16LE(chunkDataStart + 14) || 16;
      } else if (chunkId === "data") {
        const safeEnd = Math.min(rawBuffer.byteLength, chunkDataStart + chunkSize);
        pcmSlice = rawBuffer.subarray(chunkDataStart, safeEnd);
        break; // Stop right after 'data' so trailing LIST/INFO/junk metadata is stripped!
      }

      // RIFF chunks are word-aligned (padded to even byte boundary)
      const paddedSize = chunkSize + (chunkSize % 2);
      if (paddedSize <= 0 && chunkId !== "fmt ") break;
      offset = chunkDataStart + paddedSize;
    }

    if (pcmSlice && pcmSlice.byteLength >= 64 && audioFormat === 1 && bitsPerSample === 16) {
      return buildCleanWavFromPcm16(pcmSlice, sampleRate, numChannels);
    }

    // Fallback if non-standard WAV format: return original WAV untouched (never double-wrap!)
    return rawBuffer;
  }

  // 2. Raw L16 PCM stream (e.g., gemini-2.5-flash-preview-tts -> "audio/L16;codec=pcm;rate=24000")
  let parsedRate = 24000;
  if (mimeType) {
    const rateMatch = /rate=(\d+)/i.exec(mimeType);
    if (rateMatch?.[1]) {
      const num = Number(rateMatch[1]);
      if (num >= 8000 && num <= 96000) parsedRate = num;
    }
  }

  return buildCleanWavFromPcm16(rawBuffer, parsedRate, 1);
}
