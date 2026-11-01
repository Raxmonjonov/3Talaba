import React from "react";
import type { MathVisual } from "@/lib/curriculum/math-deep-dive";

/**
 * Har bir mavzu uchun sodda, tushunarli SVG chizma ("Ko'r" bosqichi).
 * Ranglar currentColor va Tailwind tokenlari orqali mavzuga moslashadi.
 */
export function MathVisualDiagram({ type }: { type: MathVisual }) {
  const common = "h-56 w-full max-w-md text-fg";
  const neon = "var(--accent-neon)";
  const gold = "var(--accent-gold)";
  const grid = "currentColor";

  switch (type) {
    case "balance":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Tarozi modeli">
          <line x1="150" y1="40" x2="150" y2="170" stroke={grid} strokeWidth="3" />
          <polygon points="130,175 170,175 150,155" fill={grid} opacity="0.6" />
          <line x1="50" y1="60" x2="250" y2="60" stroke={grid} strokeWidth="3" />
          <line x1="70" y1="60" x2="50" y2="110" stroke={grid} />
          <line x1="70" y1="60" x2="90" y2="110" stroke={grid} />
          <line x1="230" y1="60" x2="210" y2="110" stroke={grid} />
          <line x1="230" y1="60" x2="250" y2="110" stroke={grid} />
          <path d="M40 110 Q70 130 100 110 Z" fill={neon} opacity="0.35" stroke={neon} />
          <path d="M200 110 Q230 130 260 110 Z" fill={gold} opacity="0.35" stroke={gold} />
          <text x="70" y="100" textAnchor="middle" fontSize="16" fontWeight="700" fill={neon}>3x + 4</text>
          <text x="230" y="100" textAnchor="middle" fontSize="16" fontWeight="700" fill={gold}>19</text>
          <text x="150" y="25" textAnchor="middle" fontSize="13" fill={grid} opacity="0.8">Muvozanat: chap = o&apos;ng</text>
        </svg>
      );

    case "parabola": {
      // y = x² − 5x + 6, x ∈ [0; 5]
      const pts: string[] = [];
      for (let x = 0; x <= 5.001; x += 0.1) {
        const y = x * x - 5 * x + 6;
        pts.push(`${40 + x * 44},${150 - y * 18}`);
      }
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Parabola grafigi">
          <line x1="20" y1="150" x2="290" y2="150" stroke={grid} opacity="0.6" />
          <line x1="40" y1="10" x2="40" y2="190" stroke={grid} opacity="0.6" />
          <polyline points={pts.join(" ")} fill="none" stroke={neon} strokeWidth="3" />
          <circle cx={40 + 2 * 44} cy="150" r="5" fill={gold} />
          <circle cx={40 + 3 * 44} cy="150" r="5" fill={gold} />
          <text x={40 + 2 * 44} y="170" textAnchor="middle" fontSize="13" fill={gold}>x = 2</text>
          <text x={40 + 3 * 44} y="170" textAnchor="middle" fontSize="13" fill={gold}>x = 3</text>
          <text x="200" y="30" fontSize="13" fill={neon}>y = x² − 5x + 6</text>
        </svg>
      );
    }

    case "line":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Chiziqli funksiya grafigi">
          <line x1="20" y1="170" x2="290" y2="170" stroke={grid} opacity="0.6" />
          <line x1="50" y1="10" x2="50" y2="190" stroke={grid} opacity="0.6" />
          {/* y = 2x + 1: x 0..4 → px 50..250, y 1..9 → py 155..35 */}
          <line x1="50" y1="155" x2="250" y2="35" stroke={neon} strokeWidth="3" />
          <circle cx="50" cy="155" r="5" fill={gold} />
          <text x="58" y="150" fontSize="12" fill={gold}>b = 1</text>
          <line x1="100" y1="125" x2="150" y2="125" stroke={gold} strokeDasharray="4" />
          <line x1="150" y1="125" x2="150" y2="95" stroke={gold} strokeDasharray="4" />
          <text x="125" y="140" textAnchor="middle" fontSize="11" fill={gold}>+1</text>
          <text x="165" y="114" fontSize="11" fill={gold}>+2</text>
          <text x="190" y="40" fontSize="13" fill={neon}>y = 2x + 1</text>
        </svg>
      );

    case "intersect":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Ikki to'g'ri chiziq kesishishi">
          <line x1="20" y1="180" x2="290" y2="180" stroke={grid} opacity="0.6" />
          <line x1="30" y1="10" x2="30" y2="190" stroke={grid} opacity="0.6" />
          {/* scale: x*22+30, 180 - y*15 */}
          {/* x + y = 10 : (0,10) → (10,0) */}
          <line x1="30" y1="30" x2="250" y2="180" stroke={neon} strokeWidth="3" />
          {/* x − y = 4 : (4,0) → (11,7) */}
          <line x1="118" y1="180" x2="272" y2="75" stroke={gold} strokeWidth="3" />
          <circle cx={30 + 7 * 22} cy={180 - 3 * 15} r="6" fill="currentColor" />
          <text x={30 + 7 * 22 - 10} y={180 - 3 * 15 - 12} fontSize="13" fontWeight="700" fill="currentColor">(7; 3)</text>
          <text x="40" y="25" fontSize="12" fill={neon}>x + y = 10</text>
          <text x="210" y="70" fontSize="12" fill={gold}>x − y = 4</text>
        </svg>
      );

    case "powers":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Darajalar o'sishi">
          {[1, 2, 3].map((p, idx) => {
            const count = 2 ** p;
            const x0 = 20 + idx * 95;
            return (
              <g key={p}>
                {Array.from({ length: count }).map((_, i) => (
                  <rect
                    key={i}
                    x={x0 + (i % 4) * 20}
                    y={130 - Math.floor(i / 4) * 20}
                    width="16"
                    height="16"
                    rx="3"
                    fill={idx === 2 ? gold : neon}
                    opacity="0.75"
                  />
                ))}
                <text x={x0 + 30} y="175" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">
                  2{p === 1 ? "¹" : p === 2 ? "²" : "³"} = {count}
                </text>
              </g>
            );
          })}
        </svg>
      );

    case "triangle":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Uchburchak burchaklari">
          <polygon points="40,170 230,170 120,40" fill={neon} fillOpacity="0.12" stroke={neon} strokeWidth="3" />
          <line x1="230" y1="170" x2="290" y2="170" stroke={gold} strokeWidth="3" strokeDasharray="5" />
          <text x="62" y="162" fontSize="13" fill="currentColor">50°</text>
          <text x="192" y="162" fontSize="13" fill="currentColor">70°</text>
          <text x="112" y="72" fontSize="13" fill="currentColor">60°</text>
          <text x="245" y="160" fontSize="13" fontWeight="700" fill={gold}>110°</text>
          <text x="150" y="195" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.8">50° + 60° + 70° = 180°</text>
        </svg>
      );

    case "right-triangle":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="To'g'ri burchakli uchburchak">
          <polygon points="60,170 220,170 60,50" fill={neon} fillOpacity="0.12" stroke={neon} strokeWidth="3" />
          <rect x="60" y="155" width="15" height="15" fill="none" stroke="currentColor" />
          <text x="140" y="190" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">b = 4</text>
          <text x="35" y="115" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">a = 3</text>
          <text x="160" y="100" fontSize="15" fontWeight="700" fill={gold}>c = 5</text>
          <text x="230" y="40" fontSize="12" fill={gold}>3² + 4² = 5²</text>
        </svg>
      );

    case "area":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Trapetsiya yuzi">
          <polygon points="90,50 210,50 260,160 40,160" fill={neon} fillOpacity="0.12" stroke={neon} strokeWidth="3" />
          <line x1="90" y1="50" x2="260" y2="160" stroke={gold} strokeDasharray="5" />
          <line x1="90" y1="50" x2="90" y2="160" stroke="currentColor" strokeDasharray="3" />
          <text x="150" y="42" textAnchor="middle" fontSize="13" fill="currentColor">a = 6</text>
          <text x="150" y="180" textAnchor="middle" fontSize="13" fill="currentColor">b = 10</text>
          <text x="96" y="110" fontSize="13" fill="currentColor">h = 4</text>
          <text x="150" y="198" textAnchor="middle" fontSize="12" fill={gold}>S = (a + b) · h / 2 = 32</text>
        </svg>
      );

    case "circle":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Aylana va sektor">
          <circle cx="150" cy="100" r="75" fill={neon} fillOpacity="0.1" stroke={neon} strokeWidth="3" />
          {/* 60° sektor: 0° → −60° */}
          <path d="M150 100 L225 100 A75 75 0 0 0 187.5 35.05 Z" fill={gold} fillOpacity="0.45" stroke={gold} />
          <circle cx="150" cy="100" r="3" fill="currentColor" />
          <text x="182" y="92" fontSize="12" fontWeight="700" fill="currentColor">60°</text>
          <text x="180" y="118" fontSize="12" fill="currentColor">r</text>
          <text x="150" y="195" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.85">Sektor = (60/360) · πr²</text>
        </svg>
      );

    case "solid":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Silindr">
          <ellipse cx="150" cy="45" rx="70" ry="18" fill={neon} fillOpacity="0.25" stroke={neon} strokeWidth="3" />
          <line x1="80" y1="45" x2="80" y2="155" stroke={neon} strokeWidth="3" />
          <line x1="220" y1="45" x2="220" y2="155" stroke={neon} strokeWidth="3" />
          <path d="M80 155 A70 18 0 0 0 220 155" fill="none" stroke={neon} strokeWidth="3" />
          <path d="M80 155 A70 18 0 0 1 220 155" fill="none" stroke={neon} strokeDasharray="4" opacity="0.6" />
          <line x1="150" y1="45" x2="220" y2="45" stroke={gold} strokeWidth="2" />
          <text x="185" y="40" fontSize="13" fill={gold}>r</text>
          <line x1="235" y1="45" x2="235" y2="155" stroke={gold} strokeDasharray="4" />
          <text x="242" y="105" fontSize="13" fill={gold}>h</text>
          <text x="150" y="195" textAnchor="middle" fontSize="12" fill="currentColor">V = πr²h</text>
        </svg>
      );

    case "trig":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Trigonometrik nisbatlar">
          <polygon points="50,160 250,160 250,40" fill={neon} fillOpacity="0.12" stroke={neon} strokeWidth="3" />
          <rect x="235" y="145" width="15" height="15" fill="none" stroke="currentColor" />
          <path d="M90 160 A40 40 0 0 0 85 141" fill="none" stroke={gold} strokeWidth="2" />
          <text x="95" y="152" fontSize="14" fill={gold}>α</text>
          <text x="150" y="180" textAnchor="middle" fontSize="13" fill="currentColor">yopishgan = 4</text>
          <text x="258" y="105" fontSize="13" fill="currentColor">3</text>
          <text x="120" y="92" fontSize="13" fill={gold}>gipotenuza = 5</text>
          <text x="150" y="198" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.85">sin α = 3/5 · cos α = 4/5 · tan α = 3/4</text>
        </svg>
      );

    case "percent":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Foiz va proporsiya">
          <rect x="30" y="50" width="240" height="40" rx="8" fill="none" stroke={grid} strokeWidth="2" opacity="0.4" />
          <rect x="30" y="50" width="180" height="40" rx="8" fill={neon} fillOpacity="0.4" stroke={neon} strokeWidth="2" />
          <line x1="210" y1="40" x2="210" y2="100" stroke={gold} strokeWidth="3" />
          <text x="120" y="75" textAnchor="middle" fontSize="15" fontWeight="700" fill={neon}>75% (3/4 qism)</text>
          <text x="240" y="75" textAnchor="middle" fontSize="13" fill="currentColor" opacity="0.7">25%</text>
          <path d="M30 130 C 80 110, 160 160, 270 120" fill="none" stroke={gold} strokeWidth="3" strokeDasharray="4" />
          <text x="150" y="170" textAnchor="middle" fontSize="13" fill="currentColor">O'sish: Asosiy miqdor × (1 + r%)</text>
        </svg>
      );

    case "logarithm":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Logarifm va ko'rsatkichli funksiya">
          <line x1="20" y1="170" x2="280" y2="170" stroke={grid} opacity="0.6" />
          <line x1="50" y1="20" x2="50" y2="190" stroke={grid} opacity="0.6" />
          <line x1="40" y1="180" x2="240" y2="30" stroke={grid} strokeDasharray="3" opacity="0.4" />
          {/* y = 2^x */}
          <path d="M50 160 Q 140 155 180 30" fill="none" stroke={gold} strokeWidth="3" />
          {/* y = log2(x) */}
          <path d="M60 190 Q 65 140 260 70" fill="none" stroke={neon} strokeWidth="3" />
          <text x="175" y="25" fontSize="12" fontWeight="700" fill={gold}>y = aˣ</text>
          <text x="250" y="65" fontSize="12" fontWeight="700" fill={neon}>y = logₐ(x)</text>
          <text x="150" y="195" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.8">y = x simmetriya o'qi bo'yicha teskari funksiyalar</text>
        </svg>
      );

    case "vector":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Koordinata tekisligida vektorlar">
          <line x1="30" y1="170" x2="280" y2="170" stroke={grid} opacity="0.5" />
          <line x1="50" y1="20" x2="50" y2="185" stroke={grid} opacity="0.5" />
          <defs>
            <marker id="arrow-neon" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,1 L7,4 L0,7 Z" fill="var(--accent-neon)" />
            </marker>
            <marker id="arrow-gold" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,1 L7,4 L0,7 Z" fill="var(--accent-gold)" />
            </marker>
          </defs>
          {/* Vector u: (50, 170) -> (170, 130) */}
          <line x1="50" y1="170" x2="165" y2="132" stroke={neon} strokeWidth="3" markerEnd="url(#arrow-neon)" />
          {/* Vector v: (170, 130) -> (240, 50) */}
          <line x1="170" y1="130" x2="235" y2="55" stroke={neon} strokeWidth="3" markerEnd="url(#arrow-neon)" />
          {/* Sum vector u+v: (50, 170) -> (240, 50) */}
          <line x1="50" y1="170" x2="235" y2="53" stroke={gold} strokeWidth="3" strokeDasharray="5" markerEnd="url(#arrow-gold)" />
          <text x="100" y="145" fontSize="13" fontWeight="700" fill={neon}>u⃗ = (4; 2)</text>
          <text x="215" y="105" fontSize="13" fontWeight="700" fill={neon}>v⃗ = (3; 4)</text>
          <text x="120" y="90" fontSize="14" fontWeight="700" fill={gold}>u⃗ + v⃗ = (7; 6)</text>
        </svg>
      );

    case "probability":
      return (
        <svg viewBox="0 0 300 200" className={common} role="img" aria-label="Ehtimollik va Venn diagrammasi">
          <rect x="25" y="25" width="250" height="150" rx="10" fill="none" stroke={grid} strokeWidth="2" opacity="0.3" />
          <circle cx="115" cy="100" r="55" fill={neon} fillOpacity="0.25" stroke={neon} strokeWidth="2.5" />
          <circle cx="185" cy="100" r="55" fill={gold} fillOpacity="0.25" stroke={gold} strokeWidth="2.5" />
          <text x="85" y="105" fontSize="15" fontWeight="700" fill={neon}>P(A)</text>
          <text x="210" y="105" fontSize="15" fontWeight="700" fill={gold}>P(B)</text>
          <text x="150" y="105" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">P(A∩B)</text>
          <text x="150" y="165" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.9">P(A ∪ B) = P(A) + P(B) − P(A ∩ B)</text>
        </svg>
      );

    default:
      return null;
  }
}
