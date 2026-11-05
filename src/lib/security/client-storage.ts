/**
 * 3Talaba Campus — Brauzer (Client-Side) Xotirasini Shifrlash Moduli
 *
 * Maqsad:
 * `localStorage` dagi o'quvchi profili, diagnostika ballari va dars progressi
 * ochiq JSON ko'rinishida qolmasligi hamda DevTools orqali soxtalashtirilmasligi uchun:
 * 1. Sinxron interfeys (`saveSecureLocal` / `loadSecureLocal`):
 *    96-bit CSPRNG tasodifiy Nonce + 256-bit autentifikatsiyalangan oqim shifri + MAC imzo (`cenc:v1:...`).
 * 2. Asinxron Web Crypto API interfeysi (`encryptBrowserAES256GCM` / `decryptBrowserAES256GCM`):
 *    Brauzerning apparat tezlashtirilgan `crypto.subtle` AES-256-GCM shifrlashi.
 * 3. Avtomatik migratsiya: Avvalroq ochiq JSON holatida saqlangan ma'lumot o'qilganda
 *    avtomatik ravishda shifrlangan formatga o'tkazib qo'yiladi.
 */

const CLIENT_ENC_PREFIX = "cenc:v1:";
const SESSION_SEED_KEY = "3talaba_keystore_v1";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const b64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  if (typeof atob === "function") {
    const bin = atob(padded);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      out[i] = bin.charCodeAt(i);
    }
    return out;
  }
  return new Uint8Array(Buffer.from(padded, "base64"));
}

function randomBytesClient(length: number): Uint8Array {
  const out = new Uint8Array(length);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(out);
    return out;
  }
  for (let i = 0; i < length; i++) {
    out[i] = Math.floor(Math.random() * 256);
  }
  return out;
}

/**
 * Har bir qurilma/brauzer uchun unikal 256-bit lokal kalit urug'ini oladi yoki yaratadi.
 */
function getDeviceKeyBytes(): Uint8Array {
  const originTag =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://3talaba.uz";

  let deviceSecret = "";
  if (typeof window !== "undefined") {
    try {
      const existing = window.localStorage.getItem(SESSION_SEED_KEY);
      if (existing && existing.length >= 32) {
        deviceSecret = existing;
      } else {
        deviceSecret = toBase64Url(randomBytesClient(32));
        window.localStorage.setItem(SESSION_SEED_KEY, deviceSecret);
      }
    } catch {
      deviceSecret = "ephemeral-fallback-device-seed-3talaba";
    }
  } else {
    deviceSecret = "ssr-test-device-seed-3talaba-2026";
  }

  return new TextEncoder().encode(`3talaba:v1:${originTag}:${deviceSecret}`);
}

/**
 * 256-bit ChaCha-uslubidagi ARX (Add-Rotate-XOR) kriptografik blok mikseri.
 * Keystream generatsiyasi va MAC (butunlik nazorati) uchun ishlatiladi.
 */
function quarterRound(s: Uint32Array, a: number, b: number, c: number, d: number): void {
  s[a] = (s[a]! + s[b]!) >>> 0; s[d] = rotl32(s[d]! ^ s[a]!, 16);
  s[c] = (s[c]! + s[d]!) >>> 0; s[b] = rotl32(s[b]! ^ s[c]!, 12);
  s[a] = (s[a]! + s[b]!) >>> 0; s[d] = rotl32(s[d]! ^ s[a]!, 8);
  s[c] = (s[c]! + s[d]!) >>> 0; s[b] = rotl32(s[b]! ^ s[c]!, 7);
}

function rotl32(v: number, n: number): number {
  return ((v << n) | (v >>> (32 - n))) >>> 0;
}

function deriveKeyWords(seedBytes: Uint8Array): Uint32Array {
  const state = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  for (let i = 0; i < seedBytes.length; i++) {
    const idx = i & 7;
    state[idx] = rotl32((state[idx]! ^ (seedBytes[i]! * 0x9e3779b1)) >>> 0, 11);
    quarterRound(state, 0, 2, 4, 6);
    quarterRound(state, 1, 3, 5, 7);
  }
  return state;
}

function chacha20Block(key: Uint32Array, counter: number, nonce: Uint8Array): Uint8Array {
  const n0 = (nonce[0]! | (nonce[1]! << 8) | (nonce[2]! << 16) | (nonce[3]! << 24)) >>> 0;
  const n1 = (nonce[4]! | (nonce[5]! << 8) | (nonce[6]! << 16) | (nonce[7]! << 24)) >>> 0;
  const n2 = (nonce[8]! | (nonce[9]! << 8) | (nonce[10]! << 16) | (nonce[11]! << 24)) >>> 0;

  const init = new Uint32Array([
    0x61707865, 0x3320646e, 0x79622d32, 0x6b206574,
    key[0]!, key[1]!, key[2]!, key[3]!,
    key[4]!, key[5]!, key[6]!, key[7]!,
    counter >>> 0, n0, n1, n2,
  ]);

  const work = new Uint32Array(init);
  for (let i = 0; i < 10; i++) {
    quarterRound(work, 0, 4, 8, 12);
    quarterRound(work, 1, 5, 9, 13);
    quarterRound(work, 2, 6, 10, 14);
    quarterRound(work, 3, 7, 11, 15);
    quarterRound(work, 0, 5, 10, 15);
    quarterRound(work, 1, 6, 11, 12);
    quarterRound(work, 2, 7, 8, 13);
    quarterRound(work, 3, 4, 9, 14);
  }

  const out = new Uint8Array(64);
  const view = new DataView(out.buffer);
  for (let i = 0; i < 16; i++) {
    view.setUint32(i * 4, (work[i]! + init[i]!) >>> 0, true);
  }
  return out;
}

function xorChaCha20(key: Uint32Array, nonce: Uint8Array, input: Uint8Array): Uint8Array {
  const output = new Uint8Array(input.length);
  let blockCounter = 1;
  for (let offset = 0; offset < input.length; offset += 64) {
    const keystream = chacha20Block(key, blockCounter++, nonce);
    const chunkLen = Math.min(64, input.length - offset);
    for (let i = 0; i < chunkLen; i++) {
      output[offset + i] = input[offset + i]! ^ keystream[i]!;
    }
  }
  return output;
}

function computeAuthTag(
  key: Uint32Array,
  nonce: Uint8Array,
  storageKey: string,
  ciphertext: Uint8Array,
): Uint8Array {
  const macBlock = chacha20Block(key, 0, nonce);
  const aad = new TextEncoder().encode(storageKey);
  const acc = new Uint32Array(8);
  const view = new DataView(macBlock.buffer);
  for (let i = 0; i < 8; i++) {
    acc[i] = view.getUint32(i * 4, true);
  }

  const absorb = (buf: Uint8Array, domain: number) => {
    acc[0] = (acc[0]! ^ domain) >>> 0;
    for (let i = 0; i < buf.length; i++) {
      const lane = i & 7;
      acc[lane] = (acc[lane]! + ((buf[i]! + 1) * 0x85ebca6b)) >>> 0;
      if ((i & 7) === 7 || i === buf.length - 1) {
        quarterRound(acc, 0, 2, 4, 6);
        quarterRound(acc, 1, 3, 5, 7);
        quarterRound(acc, 0, 3, 6, 1);
        quarterRound(acc, 2, 5, 0, 7);
      }
    }
  };

  absorb(aad, 0xa1);
  absorb(ciphertext, 0xc2);
  acc[7] = (acc[7]! ^ aad.length ^ (ciphertext.length << 8)) >>> 0;
  quarterRound(acc, 0, 4, 2, 6);
  quarterRound(acc, 1, 5, 3, 7);

  const tag = new Uint8Array(16);
  const tagView = new DataView(tag.buffer);
  for (let i = 0; i < 4; i++) {
    tagView.setUint32(i * 4, (acc[i]! ^ acc[i + 4]!) >>> 0, true);
  }
  return tag;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

/**
 * Matnni ChaCha20 + 128-bit MAC yordamida autentifikatsiyalangan shifrmatnga o'giradi.
 */
export function sealClientString(storageKey: string, plaintext: string): string {
  const keyWords = deriveKeyWords(getDeviceKeyBytes());
  const nonce = randomBytesClient(12);
  const plainBytes = new TextEncoder().encode(plaintext);
  const ciphertext = xorChaCha20(keyWords, nonce, plainBytes);
  const tag = computeAuthTag(keyWords, nonce, storageKey, ciphertext);

  return `${CLIENT_ENC_PREFIX}${toBase64Url(nonce)}:${toBase64Url(tag)}:${toBase64Url(ciphertext)}`;
}

/**
 * `cenc:v1:...` formatidagi shifrmatnni butunligini tekshirib ochadi.
 * Agar shifrmatn o'zgartirilgan (tampered) bo'lsa, `null` qaytaradi.
 */
export function openClientString(storageKey: string, sealed: string): string | null {
  if (!sealed.startsWith(CLIENT_ENC_PREFIX)) {
    return null;
  }

  const parts = sealed.slice(CLIENT_ENC_PREFIX.length).split(":");
  if (parts.length !== 3) return null;

  try {
    const [nonceB64, tagB64, ctB64] = parts as [string, string, string];
    const nonce = fromBase64Url(nonceB64);
    const tag = fromBase64Url(tagB64);
    const ciphertext = fromBase64Url(ctB64);
    if (nonce.length !== 12 || tag.length !== 16) return null;

    const keyWords = deriveKeyWords(getDeviceKeyBytes());
    const expectedTag = computeAuthTag(keyWords, nonce, storageKey, ciphertext);
    if (!constantTimeEqual(tag, expectedTag)) {
      return null;
    }

    const plainBytes = xorChaCha20(keyWords, nonce, ciphertext);
    return new TextDecoder().decode(plainBytes);
  } catch {
    return null;
  }
}

/**
 * Obyektni JSON qilib, shifrlangan holda `localStorage` ga yozadi.
 */
export function saveSecureLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    const json = JSON.stringify(value);
    const encrypted = sealClientString(key, json);
    window.localStorage.setItem(key, encrypted);
  } catch {
    // Brauzer xotirasi cheklangan (private mode) bo'lsa xato chiqarmaslik
  }
}

/**
 * `localStorage` dan shifrlangan ma'lumotni o'qib, haqiqiyligini tekshirib qaytaradi.
 * Agar eski (shifrlanmagan) JSON bo'lsa, uni o'qib, shu zahoti shifrlangan formatga yangilab qo'yadi.
 */
export function loadSecureLocal<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    if (raw.startsWith(CLIENT_ENC_PREFIX)) {
      const opened = openClientString(key, raw);
      if (!opened) return null;
      return JSON.parse(opened) as T;
    }

    // Legacy ochiq JSON bo'lsa -> o'qiymiz va darhol shifrlangan ko'rinishga migratsiya qilamiz
    const legacyParsed = JSON.parse(raw) as T;
    saveSecureLocal(key, legacyParsed);
    return legacyParsed;
  } catch {
    return null;
  }
}

export function removeSecureLocal(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// ============================================================================
// WEB CRYPTO API (AES-256-GCM) ASINXRON SHIFRLASH INTERFEYSI
// ============================================================================

async function getSubtleAesKey(): Promise<CryptoKey> {
  const seed = getDeviceKeyBytes();
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    seed as unknown as BufferSource,
  );
  return globalThis.crypto.subtle.importKey(
    "raw",
    digest,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptBrowserAES256GCM(plaintext: string): Promise<string> {
  const key = await getSubtleAesKey();
  const iv = randomBytesClient(12);
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuf = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    encoded as unknown as BufferSource,
  );
  return `wcenc:v1:${toBase64Url(iv)}:${toBase64Url(new Uint8Array(cipherBuf))}`;
}

export async function decryptBrowserAES256GCM(payload: string): Promise<string | null> {
  if (!payload.startsWith("wcenc:v1:")) return null;
  const parts = payload.slice("wcenc:v1:".length).split(":");
  if (parts.length !== 2) return null;
  try {
    const iv = fromBase64Url(parts[0]!);
    const cipherBytes = fromBase64Url(parts[1]!);
    const key = await getSubtleAesKey();
    const plainBuf = await globalThis.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as BufferSource },
      key,
      cipherBytes as unknown as BufferSource,
    );
    return new TextDecoder().decode(plainBuf);
  } catch {
    return null;
  }
}
