"use client";

import { splitSpeechIntoChunks } from "./uz-speech";

export type AudioOutputMode = "bluetooth" | "speaker";

export interface AudioOutputDeviceOption {
  deviceId: string;
  label: string;
  isBluetoothLike: boolean;
  isSpeakerLike: boolean;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SinkableAudioElement = HTMLAudioElement & {
  setSinkId?: (sinkId: string) => Promise<void>;
  sinkId?: string;
};

export interface RecordedTurnPayload {
  audioBlob: Blob | null;
  browserTranscript: string;
  durationMs: number;
}

const BLUETOOTH_REGEX =
  /bluetooth|airpods|buds|wireless|headphone|headset|wh-|wf-|jbl|marshall|sony|bose|anker|soundcore|qcy|xiaomi|redmi|galaxy|beats|наушники|гарнитура|earphone/i;

const HANDS_FREE_REGEX = /hands-free|ag audio|telephony/i;

const SPEAKER_REGEX =
  /speaker|dinamik|динамик|realtek|internal|built-in|high definition|amd|intel|macbook|laptop/i;

export async function listAudioOutputDevices(
  unlockLabelsIfNeeded = false,
): Promise<AudioOutputDeviceOption[]> {
  if (typeof window === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    return [];
  }

  let all = await navigator.mediaDevices.enumerateDevices();
  let outputs = all.filter((d) => d.kind === "audiooutput");

  const hasAnyLabels = outputs.some((d) => d.label && d.label.trim().length > 0);
  if (!hasAnyLabels && unlockLabelsIfNeeded && navigator.mediaDevices.getUserMedia) {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      for (const track of tempStream.getTracks()) {
        track.stop();
      }
      all = await navigator.mediaDevices.enumerateDevices();
      outputs = all.filter((d) => d.kind === "audiooutput");
    } catch {
      // ignore if permission declined
    }
  }

  return outputs.map((d, idx) => {
    const label = d.label?.trim() || `Audio chiqish #${idx + 1}`;
    const isBt = BLUETOOTH_REGEX.test(label);
    const isSpk = !isBt && (SPEAKER_REGEX.test(label) || d.deviceId === "default");
    return {
      deviceId: d.deviceId,
      label,
      isBluetoothLike: isBt,
      isSpeakerLike: isSpk,
    };
  });
}

export function pickSinkIdForMode(
  devices: AudioOutputDeviceOption[],
  mode: AudioOutputMode,
  explicitDeviceId?: string,
): string {
  if (explicitDeviceId) return explicitDeviceId;
  if (devices.length === 0) return "";

  if (mode === "bluetooth") {
    // Prefer stereo Bluetooth endpoint over muffled Hands-Free AG Audio
    const stereoBt = devices.find(
      (d) => d.isBluetoothLike && !HANDS_FREE_REGEX.test(d.label) && d.deviceId !== "communications",
    );
    if (stereoBt) return stereoBt.deviceId;

    const anyBt = devices.find((d) => d.isBluetoothLike);
    if (anyBt) return anyBt.deviceId;

    // Fallback to non-speaker external output if available
    const external = devices.find(
      (d) => !SPEAKER_REGEX.test(d.label) && d.deviceId !== "default" && d.deviceId !== "communications",
    );
    return external?.deviceId ?? "";
  }

  // mode === "speaker" (Dinamik)
  const dedicatedSpeaker = devices.find(
    (d) =>
      !d.isBluetoothLike &&
      SPEAKER_REGEX.test(d.label) &&
      d.deviceId !== "default" &&
      d.deviceId !== "communications",
  );
  if (dedicatedSpeaker) return dedicatedSpeaker.deviceId;

  const nonBluetooth = devices.find(
    (d) => !d.isBluetoothLike && d.deviceId !== "communications",
  );
  return nonBluetooth?.deviceId ?? "default";
}

function extractWavEnvelope(arrayBuffer: ArrayBuffer, fps = 50): Float32Array | null {
  if (arrayBuffer.byteLength <= 48) return null;
  const view = new DataView(arrayBuffer);
  // Check "RIFF" header
  if (view.getUint32(0, false) !== 0x52494646) return null;

  const sampleRate = view.getUint32(24, true) || 24000;
  const pcmOffset = 44;
  const declaredDataBytes = view.getUint32(40, true);
  const safeDataBytes = Math.min(
    arrayBuffer.byteLength - pcmOffset,
    declaredDataBytes > 0 ? declaredDataBytes : arrayBuffer.byteLength - pcmOffset,
  );
  const totalSamples = Math.floor(safeDataBytes / 2);
  if (totalSamples <= 0) return null;

  const samplesPerFrame = Math.max(1, Math.floor(sampleRate / fps));
  const frameCount = Math.ceil(totalSamples / samplesPerFrame);
  const envelope = new Float32Array(frameCount);

  for (let f = 0; f < frameCount; f++) {
    const start = f * samplesPerFrame;
    const end = Math.min(totalSamples, start + samplesPerFrame);
    let sumSq = 0;
    for (let s = start; s < end; s++) {
      const sample = view.getInt16(pcmOffset + s * 2, true) / 32768;
      sumSq += sample * sample;
    }
    const rms = Math.sqrt(sumSq / Math.max(1, end - start));
    envelope[f] = Math.min(1, rms * 3.4);
  }

  return envelope;
}

function pickBestBrowserVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const uzNatural = voices.find(
    (v) =>
      (v.lang.toLowerCase().startsWith("uz") || /madina|sardor|uzbek/i.test(v.name)) &&
      /natural|neural|online|google/i.test(v.name),
  );
  if (uzNatural) return uzNatural;

  const uzAny = voices.find(
    (v) => v.lang.toLowerCase().startsWith("uz") || /madina|sardor|uzbek/i.test(v.name),
  );
  if (uzAny) return uzAny;

  const trNatural = voices.find(
    (v) => v.lang.toLowerCase().startsWith("tr") && /natural|neural|online|google/i.test(v.name),
  );
  if (trNatural) return trNatural;

  return voices.find((v) => /multilingual|natural|google/i.test(v.name)) ?? voices[0] ?? null;
}

export class LessonAudioEngine {
  private activeAudioEl: SinkableAudioElement | null = null;
  private activeBlobUrl: string | null = null;
  private activeEnvelope: Float32Array | null = null;

  private outputMode: AudioOutputMode = "bluetooth";
  private explicitSinkId = "";
  private resolvedSinkId = "";

  private playbackToken = 0;
  private isPausedFlag = false;
  private isSpeakingFlag = false;
  private webSpeechActive = false;

  // Mic / Push-to-Talk state (strictly opened ONLY while Spacebar is held!)
  private micAudioCtx: AudioContext | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recognition: SpeechRecognitionInstance | null = null;
  private recognitionTranscript = "";
  private recordStartTime = 0;
  private isRecordingFlag = false;
  private freqBuffer = new Uint8Array(64);

  public async configureOutput(
    mode: AudioOutputMode,
    explicitDeviceId = "",
    unlockLabels = false,
  ): Promise<{ sinkId: string; devices: AudioOutputDeviceOption[] }> {
    this.outputMode = mode;
    this.explicitSinkId = explicitDeviceId;

    const devices = await listAudioOutputDevices(unlockLabels);
    let targetSink = pickSinkIdForMode(devices, mode, explicitDeviceId);

    // If user asked for bluetooth, no bluetooth label was visible, and browser supports selectAudioOutput
    const mediaDevicesExt = navigator.mediaDevices as MediaDevices & {
      selectAudioOutput?: () => Promise<MediaDeviceInfo>;
    };
    if (
      unlockLabels &&
      mode === "bluetooth" &&
      !explicitDeviceId &&
      !devices.some((d) => d.isBluetoothLike) &&
      typeof mediaDevicesExt?.selectAudioOutput === "function"
    ) {
      try {
        const picked = await mediaDevicesExt.selectAudioOutput();
        if (picked?.deviceId) {
          targetSink = picked.deviceId;
        }
      } catch {
        // user dismissed native picker; keep best available
      }
    }

    this.resolvedSinkId = targetSink;

    // Live hot-swap sinkId on currently playing audio element!
    if (this.activeAudioEl && typeof this.activeAudioEl.setSinkId === "function" && targetSink) {
      try {
        await this.activeAudioEl.setSinkId(targetSink);
      } catch {
        // ignore if device disconnected
      }
    }

    return { sinkId: targetSink, devices };
  }

  public async unlock(): Promise<void> {
    if (typeof window === "undefined") return;
    const devices = await listAudioOutputDevices(false);
    if (!this.resolvedSinkId) {
      this.resolvedSinkId = pickSinkIdForMode(devices, this.outputMode, this.explicitSinkId);
    }
  }

  public getAudioLevel(): number {
    if (this.isRecordingFlag && this.micAnalyser) {
      this.micAnalyser.getByteFrequencyData(this.freqBuffer);
      let sum = 0;
      for (let i = 0; i < this.freqBuffer.length; i++) {
        sum += this.freqBuffer[i] ?? 0;
      }
      return Math.min(1, (sum / this.freqBuffer.length / 128) * 1.45);
    }

    if (this.isSpeakingFlag && !this.isPausedFlag) {
      if (this.activeAudioEl && this.activeEnvelope && !this.activeAudioEl.paused) {
        const frameIdx = Math.floor(this.activeAudioEl.currentTime * 50);
        if (frameIdx >= 0 && frameIdx < this.activeEnvelope.length) {
          return this.activeEnvelope[frameIdx] ?? 0.25;
        }
      }
      // Smooth rhythmic fallback envelope for MP3 or WebSpeech
      const t = performance.now() * 0.0085;
      return 0.24 + 0.36 * Math.abs(Math.sin(t)) * Math.abs(Math.cos(t * 0.67));
    }

    return 0;
  }

  private async fetchChunkAudio(
    chunkText: string,
    signal: AbortSignal,
  ): Promise<{ arrayBuffer: ArrayBuffer; contentType: string } | null> {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: chunkText }),
          signal,
        });
        if (res.ok) {
          const contentType = res.headers.get("content-type") ?? "";
          if (contentType.includes("audio/")) {
            const arrayBuffer = await res.arrayBuffer();
            if (arrayBuffer.byteLength > 128) {
              return { arrayBuffer, contentType };
            }
          }
        }
        if (res.status === 503 && attempt === 0) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        return null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private cleanupActiveAudioEl(): void {
    const audio = this.activeAudioEl;
    const blobUrl = this.activeBlobUrl;
    this.activeAudioEl = null;
    this.activeBlobUrl = null;
    this.activeEnvelope = null;

    if (audio) {
      try {
        audio.onended = null;
        audio.onerror = null;
        // Zero volume before pause to prevent hardware DAC pop/click on section switch
        audio.volume = 0;
        audio.pause();
      } catch {
        // ignore
      }
    }

    if (blobUrl) {
      setTimeout(() => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {
          // ignore
        }
      }, 120);
    }
  }

  private async playHtmlAudioBuffer(
    arrayBuffer: ArrayBuffer,
    contentType: string,
    token: number,
  ): Promise<boolean> {
    if (typeof window === "undefined" || token !== this.playbackToken) return false;

    this.cleanupActiveAudioEl();

    const blob = new Blob([arrayBuffer], { type: contentType || "audio/wav" });
    const blobUrl = URL.createObjectURL(blob);
    this.activeBlobUrl = blobUrl;
    this.activeEnvelope = contentType.includes("wav") ? extractWavEnvelope(arrayBuffer, 50) : null;

    const audio = new Audio(blobUrl) as SinkableAudioElement;
    audio.preload = "auto";
    this.activeAudioEl = audio;

    // Route directly to Bluetooth or Speaker (Dinamik) via setSinkId!
    if (typeof audio.setSinkId === "function" && this.resolvedSinkId) {
      try {
        await audio.setSinkId(this.resolvedSinkId);
      } catch {
        // fallback to OS default output if specific sinkId unavailable
      }
    }

    if (token !== this.playbackToken) {
      this.cleanupActiveAudioEl();
      return false;
    }

    return new Promise<boolean>((resolve) => {
      audio.onended = () => {
        this.cleanupActiveAudioEl();
        resolve(true);
      };
      audio.onerror = () => {
        this.cleanupActiveAudioEl();
        resolve(false);
      };

      void audio.play().catch(() => {
        this.cleanupActiveAudioEl();
        resolve(false);
      });
    });
  }

  private playWebSpeechSentence(sentence: string, token: number): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        resolve();
        return;
      }
      if (token !== this.playbackToken) {
        resolve();
        return;
      }

      this.webSpeechActive = true;
      const utter = new SpeechSynthesisUtterance(sentence);
      const voices = window.speechSynthesis.getVoices();
      const chosen = pickBestBrowserVoice(voices);
      if (chosen) {
        utter.voice = chosen;
        utter.lang = chosen.lang;
      } else {
        utter.lang = "uz-UZ";
      }
      utter.rate = 0.98;
      utter.pitch = 1.0;

      utter.onend = () => {
        this.webSpeechActive = false;
        resolve();
      };
      utter.onerror = () => {
        this.webSpeechActive = false;
        resolve();
      };

      try {
        window.speechSynthesis.speak(utter);
      } catch {
        this.webSpeechActive = false;
        resolve();
      }
    });
  }

  public warmUp(text: string): void {
    const chunks = splitSpeechIntoChunks(text);
    if (!chunks[0]) return;
    void fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: chunks[0] }),
    }).catch(() => {});
  }

  public async speak(text: string, onComplete?: () => void): Promise<void> {
    this.stopSpeech();
    const token = ++this.playbackToken;
    const chunks = splitSpeechIntoChunks(text);
    if (chunks.length === 0) {
      onComplete?.();
      return;
    }

    await this.unlock();
    if (token !== this.playbackToken) return;

    this.isSpeakingFlag = true;
    this.isPausedFlag = false;

    const abortController = new AbortController();
    const checkCancel = () => token !== this.playbackToken;

    let nextPromise: Promise<{ arrayBuffer: ArrayBuffer; contentType: string } | null> | null =
      this.fetchChunkAudio(chunks[0], abortController.signal);

    for (let i = 0; i < chunks.length; i++) {
      if (checkCancel()) {
        abortController.abort();
        return;
      }

      while (this.isPausedFlag && !checkCancel()) {
        await new Promise((r) => setTimeout(r, 80));
      }
      if (checkCancel()) {
        abortController.abort();
        return;
      }

      const currentResult = nextPromise
        ? await nextPromise
        : await this.fetchChunkAudio(chunks[i], abortController.signal);

      if (checkCancel()) {
        abortController.abort();
        return;
      }

      if (i + 1 < chunks.length) {
        nextPromise = this.fetchChunkAudio(chunks[i + 1], abortController.signal);
      } else {
        nextPromise = null;
      }

      if (currentResult) {
        await this.playHtmlAudioBuffer(
          currentResult.arrayBuffer,
          currentResult.contentType,
          token,
        );
      }
    }

    if (!checkCancel()) {
      this.isSpeakingFlag = false;
      this.isPausedFlag = false;
      onComplete?.();
    }
  }

  public stopSpeech(): void {
    this.playbackToken += 1;
    this.isSpeakingFlag = false;
    this.isPausedFlag = false;
    this.webSpeechActive = false;
    this.cleanupActiveAudioEl();

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  public async pauseSpeech(): Promise<void> {
    if (!this.isSpeakingFlag || this.isPausedFlag) return;
    this.isPausedFlag = true;
    if (this.activeAudioEl && !this.activeAudioEl.paused) {
      try {
        this.activeAudioEl.pause();
      } catch {
        // ignore
      }
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window && this.webSpeechActive) {
      try {
        window.speechSynthesis.pause();
      } catch {
        // ignore
      }
    }
  }

  public async resumeSpeech(): Promise<void> {
    if (!this.isPausedFlag) return;
    this.isPausedFlag = false;
    if (this.activeAudioEl && this.activeAudioEl.paused) {
      try {
        await this.activeAudioEl.play();
      } catch {
        // ignore
      }
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window && this.webSpeechActive) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }
  }

  private releaseMicHardwareImmediately(): void {
    if (this.micSourceNode) {
      try {
        this.micSourceNode.disconnect();
      } catch {
        // ignore
      }
      this.micSourceNode = null;
    }

    if (this.micStream) {
      for (const track of this.micStream.getTracks()) {
        try {
          track.stop();
        } catch {
          // ignore
        }
      }
      this.micStream = null;
    }

    if (this.micAudioCtx) {
      try {
        void this.micAudioCtx.close();
      } catch {
        // ignore
      }
      this.micAudioCtx = null;
      this.micAnalyser = null;
    }
  }

  public async startPushToTalk(): Promise<boolean> {
    if (this.isRecordingFlag) return true;
    this.stopSpeech();

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Refresh output sinkId now that device labels are unlocked!
      const devices = await listAudioOutputDevices(false);
      this.resolvedSinkId = pickSinkIdForMode(devices, this.outputMode, this.explicitSinkId);

      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.micAudioCtx = new Ctx();
      this.micAnalyser = this.micAudioCtx.createAnalyser();
      this.micAnalyser.fftSize = 128;
      this.micAnalyser.smoothingTimeConstant = 0.75;
      this.micSourceNode = this.micAudioCtx.createMediaStreamSource(this.micStream);
      this.micSourceNode.connect(this.micAnalyser);

      this.recordedChunks = [];
      this.recognitionTranscript = "";
      this.recordStartTime = performance.now();
      this.isRecordingFlag = true;

      const preferredMime =
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "";

      const recorder = preferredMime
        ? new MediaRecorder(this.micStream, { mimeType: preferredMime })
        : new MediaRecorder(this.micStream);

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          this.recordedChunks.push(ev.data);
        }
      };

      this.mediaRecorder = recorder;
      recorder.start(120);

      const SpeechRec =
        (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor })
          .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor })
          .webkitSpeechRecognition;

      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.lang = "uz-UZ";
          rec.continuous = true;
          rec.interimResults = true;
          rec.onresult = (event: SpeechRecognitionEventLike) => {
            let combined = "";
            for (let i = 0; i < event.results.length; i++) {
              combined += `${event.results[i]?.[0]?.transcript ?? ""} `;
            }
            this.recognitionTranscript = combined.trim();
          };
          rec.onerror = () => {};
          rec.start();
          this.recognition = rec;
        } catch {
          this.recognition = null;
        }
      }

      return true;
    } catch {
      this.isRecordingFlag = false;
      this.releaseMicHardwareImmediately();
      return false;
    }
  }

  public async stopPushToTalk(): Promise<RecordedTurnPayload> {
    if (!this.isRecordingFlag) {
      return { audioBlob: null, browserTranscript: "", durationMs: 0 };
    }

    this.isRecordingFlag = false;
    const durationMs = Math.max(0, Math.round(performance.now() - this.recordStartTime));

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }

    const recorder = this.mediaRecorder;
    this.mediaRecorder = null;

    let audioBlob: Blob | null = null;
    if (recorder && recorder.state !== "inactive") {
      audioBlob = await new Promise<Blob | null>((resolve) => {
        const mime = recorder.mimeType || "audio/webm";
        recorder.onstop = () => {
          if (this.recordedChunks.length > 0) {
            resolve(new Blob(this.recordedChunks, { type: mime }));
          } else {
            resolve(null);
          }
        };
        try {
          recorder.stop();
        } catch {
          resolve(null);
        }
      });
    }

    // CRITICAL FOR BLUETOOTH A2DP: Immediately stop & release mic hardware tracks
    // so Bluetooth exits Hands-Free mode and restores stereo audio output!
    this.releaseMicHardwareImmediately();

    // Brief settle window so Bluetooth A2DP profile & SpeechRecognition finalize cleanly
    await new Promise((r) => setTimeout(r, 150));

    return {
      audioBlob,
      browserTranscript: this.recognitionTranscript.trim(),
      durationMs,
    };
  }

  public destroy(): void {
    this.stopSpeech();
    this.isRecordingFlag = false;

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    this.mediaRecorder = null;

    this.releaseMicHardwareImmediately();
  }
}
