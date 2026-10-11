import { CanvasTexture } from "three";

/**
 * Glyph and glow textures are drawn once on a 2D canvas and cached
 * module-wide, so every plate and halo in the app costs nothing after the
 * first frame. Canvas beats a .glb + Draco pipeline here: there is no model to
 * download, no decoder to ship, and the whole motif weighs a few kilobytes of
 * texture memory.
 */
const cache = new Map<string, CanvasTexture>();

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

/**
 * A radial falloff used as an additive halo behind the hero globe and as the
 * soft head of every falling mote. `power` steers the curve: 2 is a wide wash,
 * 3.5 is a tight bloom.
 */
export function radialGlow(power = 2.2): CanvasTexture {
  const key = `glow:${power}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const centre = size / 2;
    const gradient = ctx.createRadialGradient(centre, centre, 0, centre, centre, centre);
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      // Squaring/cubing the falloff keeps the core bright and the rim gone.
      gradient.addColorStop(t, `rgba(255, 255, 255, ${Math.pow(1 - t, power)})`);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = "SRGBColorSpace";
  cache.set(key, texture);
  return texture;
}

/** A thin soft-edged ring, used as the orbit line around the hero globe. */
export function ringGlow(): CanvasTexture {
  const hit = cache.get("ring");
  if (hit) return hit;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const centre = size / 2;
    ctx.clearRect(0, 0, size, size);
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const radius = size * (0.3 + t * 0.16);
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.pow(1 - t, 2.6) * 0.9})`;
      ctx.lineWidth = size * 0.02;
      ctx.beginPath();
      ctx.arc(centre, centre, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = "SRGBColorSpace";
  cache.set("ring", texture);
  return texture;
}
