const ONES = ["nol", "bir", "ikki", "uch", "to'rt", "besh", "olti", "yetti", "sakkiz", "to'qqiz"];
const TENS = ["", "o'n", "yigirma", "o'ttiz", "qirq", "ellik", "oltmish", "yetmish", "sakson", "to'qson"];
const SCALES: Array<[number, string]> = [
  [1_000_000_000, "milliard"],
  [1_000_000, "million"],
  [1_000, "ming"],
];

function below1000(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h > 0) parts.push(h === 1 ? "yuz" : `${ONES[h]} yuz`);
  const t = Math.floor(rest / 10);
  const o = rest % 10;
  if (t > 0) parts.push(TENS[t]);
  if (o > 0) parts.push(ONES[o]);
  return parts.join(" ");
}

export function integerToUzbekWords(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (value < 0) return `minus ${integerToUzbekWords(-value)}`;
  let n = Math.floor(value);
  if (n === 0) return ONES[0];

  const parts: string[] = [];
  for (const [size, word] of SCALES) {
    if (n >= size) {
      const count = Math.floor(n / size);
      parts.push(count === 1 && size === 1000 ? "ming" : `${below1000(count)} ${word}`);
      n %= size;
    }
  }
  if (n > 0) parts.push(below1000(n));
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function decimalToUzbekWords(intPart: string, fracPart: string): string {
  const whole = integerToUzbekWords(Number(intPart));
  const frac = fracPart.replace(/0+$/, "");
  if (!frac) return whole;
  if (frac === "5") {
    return `${whole} yarim`;
  }
  const denominators = ["", "o'ndan", "yuzdan", "mingdan"];
  const den = denominators[frac.length];
  if (!den) {
    return `${whole} butun ${frac
      .split("")
      .map((d) => ONES[Number(d)])
      .join(" ")}`;
  }
  return `${whole} butun ${den} ${integerToUzbekWords(Number(frac))}`;
}

function ordinal(words: string): string {
  return /[aeiouo']$/i.test(words) && !words.endsWith("'")
    ? `${words}nchi`
    : `${words}inchi`;
}

export function cleanTextForSpeech(text: string): string {
  if (!text || typeof text !== "string") return "";

  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*#`_~>]/g, "")
    .replace(/•/g, ". ")
    .replace(/[ʻʼ‘’`´]/g, "'")
    .replace(/\b(\d+)\s*-\s*(chi|nchi|inchi)\b/gi, (_m, d: string) =>
      ordinal(integerToUzbekWords(Number(d))),
    )
    .replace(
      /\b(\d+)\s*-\s*(?=[a-zA-Z'])/g,
      (_m, d: string) => `${ordinal(integerToUzbekWords(Number(d)))} `,
    )
    .replace(/(\d+(?:[.,]\d+)?)\s*%/g, (_m, num: string) => {
      const [i, f = ""] = num.split(/[.,]/);
      return `${decimalToUzbekWords(i, f)} foiz`;
    })
    .replace(/\b(\d+)[.,](\d+)\b/g, (_m, i: string, f: string) =>
      decimalToUzbekWords(i, f),
    )
    .replace(/\b(\d+)\b/g, (_m, d: string) => integerToUzbekWords(Number(d)))
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitSpeechIntoChunks(text: string): string[] {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return [];

  const rawSentences =
    cleaned
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
      ?.map((s) => s.trim())
      .filter(Boolean) ?? [];

  // First chunk is kept short (~180 chars) so voice starts in ~2.5s; rest of the module stays in 1 smooth stream
  const chunks: string[] = [];
  let current = "";
  for (const s of rawSentences) {
    const limit = chunks.length === 0 ? 190 : 1000;
    if (!current) {
      current = s;
    } else if (current.length + 1 + s.length <= limit) {
      current = `${current} ${s}`;
    } else {
      chunks.push(current);
      current = s;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
