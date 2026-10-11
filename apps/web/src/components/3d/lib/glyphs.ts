import { CanvasTexture } from "three";

/**
 * Glyph textures are drawn once on a 2D canvas and cached module-wide, so the
 * rain and the subject plates cost nothing after the first frame. Canvas beats
 * a .glb + Draco pipeline here: there is no model to download, no decoder to
 * ship, and the whole motif weighs a few kilobytes of texture memory.
 */
const cache = new Map<string, CanvasTexture>();

const RAIN_GLYPHS = "0123456789SATIEL";
const RAIN_CELLS = RAIN_GLYPHS.length;
const CELL = 64;

/**
 * A vertical strip of digits and letters, one glyph per cell. Columns scroll
 * this texture upward/downward; the material's colour tints it green, cyan or
 * gold so one canvas serves every rain in the app.
 */
export function rainStrip(): CanvasTexture {
  const hit = cache.get("rain");
  if (hit) return hit;

  const canvas = document.createElement("canvas");
  canvas.width = CELL;
  canvas.height = CELL * RAIN_CELLS;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `700 ${Math.round(CELL * 0.62)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
    ctx.shadowBlur = 7;
    for (let i = 0; i < RAIN_CELLS; i++) {
      ctx.fillText(RAIN_GLYPHS[i], CELL / 2, i * CELL + CELL / 2 + 1);
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = "SRGBColorSpace";
  cache.set("rain", texture);
  return texture;
}

/** A soft glowing plate for a short label: "SAT", "IELTS", "π", "A+". */
export function glyphPlate(label: string): CanvasTexture {
  const hit = cache.get(label);
  if (hit) return hit;

  const width = 256;
  const height = 128;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, width, height);
    ctx.font = `700 ${label.length > 3 ? 52 : 68}px ui-rounded, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, width / 2, height / 2 + 2);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = "SRGBColorSpace";
  cache.set(label, texture);
  return texture;
}
