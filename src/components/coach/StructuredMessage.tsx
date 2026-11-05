"use client";

import React from "react";

const SUPERSCRIPT_MAP: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  a: "ᵃ",
  b: "ᵇ",
  c: "ᶜ",
  d: "ᵈ",
  e: "ᵉ",
  i: "ⁱ",
  k: "ᵏ",
  m: "ᵐ",
  n: "ⁿ",
  t: "ᵗ",
  x: "ˣ",
  y: "ʸ",
};

const SUBSCRIPT_MAP: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
  a: "ₐ",
  e: "ₑ",
  i: "ᵢ",
  j: "ⱼ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",
  v: "ᵥ",
  x: "ₓ",
};

function toScript(value: string, superscript: boolean): string {
  const map = superscript ? SUPERSCRIPT_MAP : SUBSCRIPT_MAP;
  return Array.from(value)
    .map((char) => map[char] ?? char)
    .join("");
}

function readBalancedGroup(
  source: string,
  start: number
): { content: string; end: number } | null {
  if (source[start] !== "{") return null;
  let depth = 0;
  for (let i = start; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        return { content: source.slice(start + 1, i), end: i + 1 };
      }
    }
  }
  return null;
}

function replaceLatexFractions(input: string): string {
  let result = input;
  for (let guard = 0; guard < 12; guard += 1) {
    const marker = result.search(/\\[dt]?frac/);
    if (marker === -1) break;

    const commandMatch = result.slice(marker).match(/^\\[dt]?frac\s*/);
    if (!commandMatch) break;

    const numeratorStart = marker + commandMatch[0].length;
    const numerator = readBalancedGroup(result, numeratorStart);
    if (!numerator) break;

    let denominatorStart = numerator.end;
    while (result[denominatorStart] === " ") denominatorStart += 1;
    const denominator = readBalancedGroup(result, denominatorStart);
    if (!denominator) break;

    result =
      result.slice(0, marker) +
      `(${numerator.content})/(${denominator.content})` +
      result.slice(denominator.end);
  }
  return result;
}

export function normalizeMath(raw: string): string {
  let value = raw.trim();

  value = replaceLatexFractions(value);
  value = value.replace(/\\sqrt\s*\{([^{}]+)\}/g, "√($1)");
  value = value.replace(/\\sqrt\s*([a-zA-Z0-9])/g, "√$1");
  value = value.replace(/\\text\s*\{([^{}]+)\}/g, "$1");
  value = value.replace(/\\mathrm\s*\{([^{}]+)\}/g, "$1");
  value = value.replace(/\\mathbf\s*\{([^{}]+)\}/g, "$1");
  value = value.replace(/\\overline\s*\{([^{}]+)\}/g, "$1̅");
  value = value.replace(/\\vec\s*\{([^{}]+)\}/g, "$1⃗");

  value = value
    .replace(/\\cdot/g, "·")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±")
    .replace(/\\mp/g, "∓")
    .replace(/\\leq|\\le/g, "≤")
    .replace(/\\geq|\\ge/g, "≥")
    .replace(/\\neq|\\ne/g, "≠")
    .replace(/\\approx/g, "≈")
    .replace(/\\equiv/g, "≡")
    .replace(/\\infty/g, "∞")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\theta/g, "θ")
    .replace(/\\lambda/g, "λ")
    .replace(/\\mu/g, "μ")
    .replace(/\\pi/g, "π")
    .replace(/\\sigma/g, "σ")
    .replace(/\\phi/g, "φ")
    .replace(/\\omega/g, "ω")
    .replace(/\\rightarrow|\\to/g, "→")
    .replace(/\\left|\\right/g, "")
    .replace(/\\qquad|\\quad/g, "    ")
    .replace(/\\[,;:!]/g, " ")
    .replace(/\\ /g, " ");

  value = value.replace(/\^\{([^{}]+)\}/g, (_, group: string) =>
    toScript(group, true)
  );
  value = value.replace(/\^(\-?\d+|[a-zA-Z])/g, (_, group: string) =>
    toScript(group, true)
  );
  value = value.replace(/_\{([^{}]+)\}/g, (_, group: string) =>
    toScript(group, false)
  );
  value = value.replace(/_(\d+|[a-zA-Z])/g, (_, group: string) =>
    toScript(group, false)
  );

  value = value
    .replace(/\\begin\{[a-zA-Z*]+\}|\\end\{[a-zA-Z*]+\}/g, " ")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return value;
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const tokens = text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|\$[^$]+\$|`[^`]+`)/g)
    .filter((token) => token.length > 0);

  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;

    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return (
        <strong key={key} className="font-extrabold text-fg">
          {token.slice(2, -2)}
        </strong>
      );
    }

    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code
          key={key}
          className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.9em] text-gold"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    if (token.startsWith("$") && token.endsWith("$") && token.length > 2) {
      return (
        <code
          key={key}
          dir="ltr"
          className="mx-0.5 inline-block rounded-md border border-neon/25 bg-neon-soft/15 px-1.5 py-0.5 font-mono text-[0.92em] font-semibold text-emerald-300"
        >
          {normalizeMath(token.slice(1, -1))}
        </code>
      );
    }

    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return (
        <em key={key} className="italic text-fg-muted">
          {token.slice(1, -1)}
        </em>
      );
    }

    return <React.Fragment key={key}>{token}</React.Fragment>;
  });
}

function FormulaBlock({ formula }: { formula: string }) {
  return (
    <div
      dir="ltr"
      className="my-2 overflow-x-auto rounded-xl border border-neon/25 bg-[#0b0b0c] px-4 py-3 text-center font-mono text-[13px] font-semibold tracking-wide text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:text-sm"
    >
      <span className="whitespace-nowrap">{normalizeMath(formula)}</span>
    </div>
  );
}

function isSpecialLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed === "" ||
    trimmed.startsWith("$$") ||
    trimmed.startsWith("\\[") ||
    /^#{1,4}\s+/.test(trimmed) ||
    /^>\s?/.test(trimmed) ||
    /^[•\-*]\s+/.test(trimmed) ||
    /^\d+[.)]\s+/.test(trimmed) ||
    trimmed.startsWith("```")
  );
}

export function StructuredMessage({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let cursor = 0;
  let keyIndex = 0;

  while (cursor < lines.length) {
    const rawLine = lines[cursor];
    const line = rawLine.trim();
    const key = `block-${keyIndex}`;
    keyIndex += 1;

    if (!line) {
      cursor += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      cursor += 1;
      while (cursor < lines.length && !lines[cursor].trim().startsWith("```")) {
        codeLines.push(lines[cursor]);
        cursor += 1;
      }
      cursor += 1;
      blocks.push(
        <pre
          key={key}
          className="overflow-x-auto rounded-xl border border-white/10 bg-[#0b0b0c] p-3 font-mono text-[11px] leading-relaxed text-emerald-300 sm:text-xs"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (line.startsWith("$$") || line.startsWith("\\[")) {
      const formulaLines: string[] = [line];
      let closed =
        (line.startsWith("$$") && line.length > 2 && line.endsWith("$$")) ||
        (line.startsWith("\\[") && line.endsWith("\\]"));

      while (!closed && cursor + 1 < lines.length) {
        cursor += 1;
        const nextLine = lines[cursor].trim();
        formulaLines.push(nextLine);
        if (
          (line.startsWith("$$") && nextLine.endsWith("$$")) ||
          (line.startsWith("\\[") && nextLine.endsWith("\\]"))
        ) {
          closed = true;
        }
      }

      const formula = formulaLines
        .join(" ")
        .replace(/^\$\$/, "")
        .replace(/\$\$$/, "")
        .replace(/^\\\[/, "")
        .replace(/\\\]$/, "")
        .trim();

      if (formula) {
        blocks.push(<FormulaBlock key={key} formula={formula} />);
      }
      cursor += 1;
      continue;
    }

    if (/^\$[^$]+\$$/.test(line)) {
      blocks.push(<FormulaBlock key={key} formula={line.slice(1, -1)} />);
      cursor += 1;
      continue;
    }

    if (/^#{1,4}\s+/.test(line)) {
      const headingText = line.replace(/^#{1,4}\s+/, "");
      blocks.push(
        <h4
          key={key}
          className="mt-3 flex items-center gap-2 text-sm font-extrabold text-fg sm:text-base"
        >
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-neon to-gold" />
          <span>{renderInline(headingText, key)}</span>
        </h4>
      );
      cursor += 1;
      continue;
    }

    const stepHeadingMatch = line.match(
      /^\*\*((?:\d+[-–]?\s*(?:qadam|bosqich|qatlam)|(?:qadam|bosqich)\s*\d+)[^*]*)\*\*:?$/i
    );
    if (stepHeadingMatch) {
      const stepText = stepHeadingMatch[1].replace(/:$/, "");
      blocks.push(
        <div
          key={key}
          className="mt-3 flex items-start gap-2.5 rounded-xl border border-neon/20 bg-neon-soft/10 px-3 py-2.5"
        >
          <span className="mt-0.5 shrink-0 rounded-md bg-neon px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-canvas">
            Qadam
          </span>
          <p className="text-xs font-bold leading-relaxed text-fg sm:text-sm">
            {renderInline(stepText, key)}
          </p>
        </div>
      );
      cursor += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (cursor < lines.length && /^>\s?/.test(lines[cursor].trim())) {
        quoteLines.push(lines[cursor].trim().replace(/^>\s?/, ""));
        cursor += 1;
      }
      blocks.push(
        <blockquote
          key={key}
          className="rounded-r-xl border-l-2 border-gold/70 bg-gold-soft/10 px-3.5 py-2.5 text-xs italic leading-relaxed text-fg-muted sm:text-sm"
        >
          {quoteLines.map((quoteLine, quoteIndex) => (
            <p key={`${key}-q-${quoteIndex}`}>
              {renderInline(quoteLine, `${key}-q-${quoteIndex}`)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    if (/^[•\-*]\s+/.test(line)) {
      const items: string[] = [];
      while (cursor < lines.length && /^[•\-*]\s+/.test(lines[cursor].trim())) {
        items.push(lines[cursor].trim().replace(/^[•\-*]\s+/, ""));
        cursor += 1;
      }
      blocks.push(
        <ul key={key} className="space-y-1.5">
          {items.map((item, itemIndex) => (
            <li
              key={`${key}-b-${itemIndex}`}
              className="flex items-start gap-2 text-xs leading-relaxed text-fg sm:text-sm"
            >
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-neon shadow-[0_0_8px_rgba(198,244,50,0.8)]" />
              <span>{renderInline(item, `${key}-b-${itemIndex}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (cursor < lines.length && /^\d+[.)]\s+/.test(lines[cursor].trim())) {
        items.push(lines[cursor].trim().replace(/^\d+[.)]\s+/, ""));
        cursor += 1;
      }
      blocks.push(
        <ol key={key} className="space-y-2">
          {items.map((item, itemIndex) => (
            <li
              key={`${key}-n-${itemIndex}`}
              className="flex items-start gap-2.5 text-xs leading-relaxed text-fg sm:text-sm"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-neon/30 bg-neon-soft/20 font-mono text-[10px] font-extrabold text-neon">
                {itemIndex + 1}
              </span>
              <span className="pt-0.5">{renderInline(item, `${key}-n-${itemIndex}`)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    const paragraphLines: string[] = [line];
    cursor += 1;
    while (cursor < lines.length && !isSpecialLine(lines[cursor])) {
      paragraphLines.push(lines[cursor].trim());
      cursor += 1;
    }
    blocks.push(
      <p key={key} className="text-xs leading-relaxed text-fg sm:text-sm">
        {renderInline(paragraphLines.join(" "), key)}
      </p>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`.trim()}>{blocks}</div>
  );
}

export function messageToPlainText(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, formula: string) => ` ${normalizeMath(formula)} `)
    .replace(/\$([^$]+)\$/g, (_, formula: string) => ` ${normalizeMath(formula)} `)
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[•\-*]\s+/gm, "")
    .replace(/^\d+[.)]\s+/gm, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
