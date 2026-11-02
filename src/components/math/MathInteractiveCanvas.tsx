"use client";

import React, { useMemo, useState } from "react";
import { Sliders, RefreshCw, Zap, Eye, Calculator } from "lucide-react";

interface MathInteractiveCanvasProps {
  visualType: "linear" | "parabola" | "pythagoras" | "circle" | "polygon";
  title: string;
}

export function MathInteractiveCanvas({ visualType, title }: MathInteractiveCanvasProps) {
  // Parabola holati: y = ax² + bx + c
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(-4);
  const [c, setC] = useState<number>(3);

  // Chiziqli holat: y = kx + b
  const [slope, setSlope] = useState<number>(2);
  const [intercept, setIntercept] = useState<number>(1);

  // Pifagor holati: katetlar a va b
  const [sideA, setSideA] = useState<number>(6);
  const [sideB, setSideB] = useState<number>(8);

  // Aylana holati: radius r va markaziy burchak theta
  const [radius, setRadius] = useState<number>(5);
  const [angle, setAngle] = useState<number>(60);

  // Parabola hisob-kitoblari
  const parabolaData = useMemo(() => {
    const safeA = a === 0 ? 0.01 : a;
    const discriminant = b * b - 4 * safeA * c;
    const vertexX = -b / (2 * safeA);
    const vertexY = safeA * vertexX * vertexX + b * vertexX + c;

    // SVG koordinatalari (Markaz: 150, 100, masshtab: 1 birlik = 12px)
    const centerX = 150;
    const centerY = 110;
    const scale = 11;

    const points: string[] = [];
    for (let x = -7; x <= 7; x += 0.25) {
      const y = safeA * x * x + b * x + c;
      const svgX = centerX + x * scale;
      const svgY = centerY - y * scale;
      if (svgY >= -20 && svgY <= 240) {
        points.push(`${svgX.toFixed(1)},${svgY.toFixed(1)}`);
      }
    }

    return {
      discriminant,
      vertexX,
      vertexY,
      points: points.join(" "),
      svgVertexX: centerX + vertexX * scale,
      svgVertexY: centerY - vertexY * scale,
    };
  }, [a, b, c]);

  // Pifagor hisob-kitoblari
  const pythagorasData = useMemo(() => {
    const hyp = Math.sqrt(sideA * sideA + sideB * sideB);
    const area = 0.5 * sideA * sideB;
    return { hyp: Number(hyp.toFixed(2)), area };
  }, [sideA, sideB]);

  // Aylana hisob-kitoblari
  const circleData = useMemo(() => {
    const sectorArea = (angle / 360) * Math.PI * radius * radius;
    const arcLength = (angle / 360) * 2 * Math.PI * radius;
    return {
      sectorArea: Number(sectorArea.toFixed(2)),
      arcLength: Number(arcLength.toFixed(2)),
    };
  }, [radius, angle]);

  const resetParabola = () => {
    setA(1);
    setB(-4);
    setC(3);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:p-6 backdrop-blur-xl space-y-6">
      {/* Sarlavha va status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-400">
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Dinamik SVG Modeli &amp; Interaktiv Grafik</h4>
            <span className="text-[11px] text-slate-400">
              Sliderlar orqali koeffitsiyentlarni o&apos;zgartiring — grafik real vaqtda moslashadi
            </span>
          </div>
        </div>

        {visualType === "parabola" && (
          <button
            type="button"
            onClick={resetParabola}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Qayta o&apos;rnatish</span>
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-center">
        {/* ====================================================================
            SVG Chizma maydoni (7 ustun)
            ==================================================================== */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#070e17] p-4 relative overflow-hidden shadow-inner">
          {/* Koordinata foni / to'ri */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          {/* PARABOLA GRAFIGI */}
          {visualType === "parabola" && (
            <svg viewBox="0 0 300 220" className="w-full h-56 sm:h-64 text-slate-500">
              {/* O'qlar */}
              <line x1="150" y1="10" x2="150" y2="210" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
              <line x1="10" y1="110" x2="290" y2="110" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
              <text x="280" y="105" fontSize="11" fill="currentColor">x</text>
              <text x="155" y="20" fontSize="11" fill="currentColor">y</text>

              {/* Parabola chizig'i */}
              {parabolaData.points && (
                <polyline
                  points={parabolaData.points}
                  fill="none"
                  stroke="var(--accent-neon, #10b981)"
                  strokeWidth="3.5"
                  className="transition-all duration-75"
                />
              )}

              {/* Cho'qqi (Vertex) nuqtasi */}
              {parabolaData.svgVertexY >= 10 && parabolaData.svgVertexY <= 210 && (
                <g>
                  <circle
                    cx={parabolaData.svgVertexX}
                    cy={parabolaData.svgVertexY}
                    r="5"
                    fill="var(--accent-gold, #f59e0b)"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={parabolaData.svgVertexX + 8}
                    y={parabolaData.svgVertexY - 6}
                    fontSize="11"
                    fontWeight="700"
                    fill="var(--accent-gold, #f59e0b)"
                  >
                    V({parabolaData.vertexX.toFixed(1)}, {parabolaData.vertexY.toFixed(1)})
                  </text>
                </g>
              )}
            </svg>
          )}

          {/* CHIZIQLI TENGLAMA GRAFIGI */}
          {visualType === "linear" && (
            <svg viewBox="0 0 300 220" className="w-full h-56 sm:h-64 text-slate-500">
              <line x1="150" y1="10" x2="150" y2="210" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
              <line x1="10" y1="110" x2="290" y2="110" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
              <text x="280" y="105" fontSize="11" fill="currentColor">x</text>
              <text x="155" y="20" fontSize="11" fill="currentColor">y</text>

              {/* y = kx + b (150, 110 markaz, scale 10) */}
              <line
                x1={150 - 10 * 10}
                y1={110 - (-10 * slope + intercept) * 10}
                x2={150 + 10 * 10}
                y2={110 - (10 * slope + intercept) * 10}
                stroke="var(--accent-neon, #10b981)"
                strokeWidth="3.5"
              />
              <circle cx="150" cy={110 - intercept * 10} r="5" fill="var(--accent-gold, #f59e0b)" />
              <text x="158" y={110 - intercept * 10 - 6} fontSize="11" fontWeight="bold" fill="var(--accent-gold, #f59e0b)">
                (0, {intercept})
              </text>
            </svg>
          )}

          {/* PIFAGOR VA UCHBURCHAK */}
          {(visualType === "pythagoras" || visualType === "polygon") && (
            <svg viewBox="0 0 300 220" className="w-full h-56 sm:h-64">
              {/* Uchburchak: (50, 170) -> (50 + sideB*12, 170) -> (50, 170 - sideA*12) */}
              <polygon
                points={`50,170 ${50 + sideB * 14},170 50,${170 - sideA * 12}`}
                fill="rgba(16,185,129,0.15)"
                stroke="var(--accent-neon, #10b981)"
                strokeWidth="3"
              />
              {/* To'g'ri burchak kvadratchasi */}
              <rect x="50" y="152" width="18" height="18" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              {/* Tomonlar yozuvlari */}
              <text x="28" y={170 - (sideA * 12) / 2} fill="#ffffff" fontSize="12" fontWeight="bold">
                a={sideA}
              </text>
              <text x={50 + (sideB * 14) / 2} y="190" fill="#ffffff" fontSize="12" fontWeight="bold">
                b={sideB}
              </text>
              <text
                x={50 + (sideB * 14) / 2 + 10}
                y={170 - (sideA * 12) / 2 - 10}
                fill="var(--accent-gold, #f59e0b)"
                fontSize="13"
                fontWeight="bold"
              >
                c={pythagorasData.hyp}
              </text>
            </svg>
          )}

          {/* DOIRA VA SEKTOR */}
          {visualType === "circle" && (
            <svg viewBox="0 0 300 220" className="w-full h-56 sm:h-64">
              <circle cx="150" cy="110" r={radius * 12} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              {/* Sektor yoyi */}
              <path
                d={`M 150 110 L ${150 + radius * 12} 110 A ${radius * 12} ${radius * 12} 0 ${
                  angle > 180 ? 1 : 0
                } 0 ${150 + radius * 12 * Math.cos((-angle * Math.PI) / 180)} ${
                  110 + radius * 12 * Math.sin((-angle * Math.PI) / 180)
                } Z`}
                fill="rgba(245,158,11,0.25)"
                stroke="var(--accent-gold, #f59e0b)"
                strokeWidth="2.5"
              />
              <text x="150" y="105" textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--accent-gold, #f59e0b)">
                {angle}°
              </text>
              <text x="150" y="210" textAnchor="middle" fontSize="11" fill="var(--accent-neon, #10b981)">
                r = {radius} birlik
              </text>
            </svg>
          )}
        </div>

        {/* ====================================================================
            Sliderlar va Jonli Hisoblagichlar Paneli (5 ustun)
            ==================================================================== */}
        <div className="lg:col-span-5 space-y-4">
          {/* PARABOLA SLIDERLARI */}
          {visualType === "parabola" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">Joriy formula</span>
                <div className="text-base font-mono font-bold text-white">
                  y = {a === 1 ? "" : a === -1 ? "-" : a}x² {b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x{" "}
                  {c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}
                </div>
                <div className="text-xs text-slate-300 font-mono pt-1">
                  D = b² - 4ac = <strong className="text-amber-300">{parabolaData.discriminant}</strong>{" "}
                  ({parabolaData.discriminant > 0 ? "2 ta ildiz" : parabolaData.discriminant === 0 ? "1 ta ildiz" : "0 ta ildiz"})
                </div>
              </div>

              {/* Slider a */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>a (kenglik/yo&apos;nalish):</span>
                  <span className="font-mono text-emerald-400">{a}</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.5"
                  value={a}
                  onChange={(e) => setA(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              {/* Slider b */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>b (gorizontal siljish):</span>
                  <span className="font-mono text-emerald-400">{b}</span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="1"
                  value={b}
                  onChange={(e) => setB(parseInt(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              {/* Slider c */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>c (y-kesishma):</span>
                  <span className="font-mono text-emerald-400">{c}</span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="1"
                  value={c}
                  onChange={(e) => setC(parseInt(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>
          )}

          {/* CHIZIQLI TENGLAMA SLIDERLARI */}
          {visualType === "linear" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">Tenglama</span>
                <div className="text-base font-mono font-bold text-white">
                  y = {slope}x {intercept >= 0 ? `+ ${intercept}` : `- ${Math.abs(intercept)}`}
                </div>
                <p className="text-xs text-slate-300">
                  Har 1 birlik o&apos;ngga yurganda y <strong className="text-emerald-400">{slope}</strong> birlik o&apos;zgaradi.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Qiyalik (Slope m):</span>
                  <span className="font-mono text-emerald-400">{slope}</span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="0.5"
                  value={slope}
                  onChange={(e) => setSlope(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>y-intercept (b):</span>
                  <span className="font-mono text-emerald-400">{intercept}</span>
                </div>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  step="1"
                  value={intercept}
                  onChange={(e) => setIntercept(parseInt(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>
          )}

          {/* PIFAGOR VA UCHBURCHAK SLIDERLARI */}
          {(visualType === "pythagoras" || visualType === "polygon") && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-amber-300">Pifagor hisobi</span>
                <div className="text-base font-mono font-bold text-white">
                  c = √({sideA}² + {sideB}²) = <span className="text-emerald-400">{pythagorasData.hyp}</span>
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  Uchburchak yuzi: S = 1/2 · a · b = <strong className="text-amber-300">{pythagorasData.area}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Katet a:</span>
                  <span className="font-mono text-emerald-400">{sideA}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="1"
                  value={sideA}
                  onChange={(e) => setSideA(parseInt(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Katet b:</span>
                  <span className="font-mono text-emerald-400">{sideB}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="14"
                  step="1"
                  value={sideB}
                  onChange={(e) => setSideB(parseInt(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>
          )}

          {/* AYLANA VA SEKTOR SLIDERLARI */}
          {visualType === "circle" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-amber-300">Sektor hisobi</span>
                <div className="text-base font-mono font-bold text-white">
                  Sektor yuzi: <span className="text-emerald-400">{circleData.sectorArea}</span>
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  Yoy uzunligi (Arc length): <strong className="text-amber-300">{circleData.arcLength}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Radius (r):</span>
                  <span className="font-mono text-emerald-400">{radius}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Burchak (θ°):</span>
                  <span className="font-mono text-amber-300">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="360"
                  step="15"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
