/**
 * O'zbekcha sonlarni so'z bilan yozish.
 * TTS modeli "6" yoki "1500" ni ingliz/rus tilida o'qib yubormasligi uchun
 * barcha raqamlar ovozga yuborilishidan oldin o'zbekcha so'zlarga aylantiriladi.
 */

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

/** Butun sonni o'zbekcha so'zlarga aylantiradi: 1500 -> "bir ming besh yuz". */
export function integerToUzbekWords(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (value < 0) return `minus ${integerToUzbekWords(-value)}`;
  let n = Math.floor(value);
  if (n === 0) return ONES[0];

  const parts: string[] = [];
  for (const [size, word] of SCALES) {
    if (n >= size) {
      const count = Math.floor(n / size);
      parts.push(`${below1000(count)} ${word}`);
      n %= size;
    }
  }
  if (n > 0) parts.push(below1000(n));
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/** "7.5" -> "yetti butun o'ndan besh", "2,25" -> "ikki butun yuzdan yigirma besh". */
function decimalToUzbekWords(intPart: string, fracPart: string): string {
  const whole = integerToUzbekWords(Number(intPart));
  const frac = fracPart.replace(/0+$/, "");
  if (!frac) return whole;
  const denominators = ["", "o'ndan", "yuzdan", "mingdan"];
  const den = denominators[frac.length];
  if (!den) {
    // Juda uzun kasr: raqamma-raqam o'qiymiz
    return `${whole} butun ${frac.split("").map((d) => ONES[Number(d)]).join(" ")}`;
  }
  return `${whole} butun ${den} ${integerToUzbekWords(Number(frac))}`;
}

/** Tartib son qo'shimchasi: "1-chi" -> "birinchi", "3-qadam" -> "uchinchi qadam". */
function ordinal(words: string): string {
  // Unli bilan tugasa "nchi", undosh bilan tugasa "inchi"
  return /[aeiouo']$/i.test(words) && !words.endsWith("'") ? `${words}nchi` : `${words}inchi`;
}

/**
 * Matndagi barcha raqamlarni o'zbekcha so'zlarga aylantiradi.
 * - Foiz: "85%" -> "sakson besh foiz"
 * - Kasr: "7.5", "6,5" -> "yetti butun o'ndan besh"
 * - Tartib: "1-qadam", "2-chi" -> "birinchi qadam", "ikkinchi"
 * - Qo'shimchalar saqlanadi: "6 ga" / "6ga" -> "olti ga"
 */
export function numbersToUzbekWords(text: string): string {
  if (!text) return "";
  return (
    text
      // Ming ajratuvchi bo'shliq/vergul: "15,700" yoki "15 700" -> "15700"
      .replace(/\b(\d{1,3})(?:[ ,](\d{3}))+\b/g, (m) => m.replace(/[ ,]/g, ""))
      // Tartib sonlar: "1-chi", "3-qadam", "2-bosqich"
      .replace(/\b(\d+)\s*-\s*(chi|nchi|inchi)\b/gi, (_m, d: string) => ordinal(integerToUzbekWords(Number(d))))
      .replace(
        /\b(\d+)\s*-\s*(?=[a-zA-Z'])/g,
        (_m, d: string) => `${ordinal(integerToUzbekWords(Number(d)))} `
      )
      // Foiz
      .replace(/(\d+(?:[.,]\d+)?)\s*%/g, (_m, num: string) => {
        const [i, f = ""] = num.split(/[.,]/);
        return `${decimalToUzbekWords(i, f)} foiz`;
      })
      // O'nli kasrlar
      .replace(/\b(\d+)[.,](\d+)\b/g, (_m, i: string, f: string) => decimalToUzbekWords(i, f))
      // Butun sonlar (qo'shimcha yopishgan bo'lsa ham: "6ga" -> "olti ga")
      .replace(/(\d+)([a-zA-Z']*)/g, (_m, d: string, suffix: string) => {
        const words = integerToUzbekWords(Number(d));
        return suffix ? `${words} ${suffix}` : words;
      })
      .replace(/\s+/g, " ")
      .trim()
  );
}
