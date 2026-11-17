export type Dither = "none" | "bayer" | "floyd-steinberg";
export type Rgb = [number, number, number];
export function parseHexPalette(text: string): Rgb[] {
  const colors = text.trim().split(/[\s,;]+/).filter(Boolean);
  if (colors.length < 2 || colors.length > 64) throw new Error("Enter 2–64 HEX colors, separated by spaces or commas.");
  return colors.map(color => {
    const match = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(color);
    if (!match) throw new Error(`Invalid HEX color: ${color.slice(0, 20)}. Use #RRGGBB or #RGB.`);
    const hex = match[1].length === 3 ? [...match[1]].map(c => c + c).join("") : match[1];
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  });
}

/** Color mapping operates on the small pixel grid, never a full-resolution photograph. */
export function mapPixelPalette(pixels: Uint8ClampedArray, width: number, colors: Rgb[], dither: Dither) {
  if (!Number.isInteger(width) || width < 1 || pixels.length % (width * 4) || pixels.length > 1_048_576 * 4 || colors.length < 2 || colors.length > 256) throw new Error("Invalid pixel grid or palette.");
  const height = pixels.length / width / 4, result = new Uint8ClampedArray(pixels), work = Float32Array.from(pixels);
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function diffuse(x: number, y: number, error: number[], weight: number) { if (x < 0 || x >= width || y >= height) return; const offset = (y * width + x) * 4; if (!pixels[offset + 3]) return; for (let c = 0; c < 3; c++) work[offset + c] += error[c] * weight; }
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4; if (!pixels[i + 3]) continue;
    const bias = dither === "bayer" ? (bayer[y % 4 * 4 + x % 4] / 16 - 0.5) * 64 : 0;
    const rgb = [0, 1, 2].map(c => Math.max(0, Math.min(255, work[i + c] + bias)));
    let best = colors[0], distance = Infinity;
    for (const color of colors) { const next = rgb.reduce((sum, value, c) => sum + (value - color[c]) ** 2, 0); if (next < distance) { best = color; distance = next; } }
    for (let c = 0; c < 3; c++) result[i + c] = best[c];
    if (dither === "floyd-steinberg") { const error = rgb.map((value, c) => value - best[c]); diffuse(x + 1, y, error, 7 / 16); diffuse(x - 1, y + 1, error, 3 / 16); diffuse(x, y + 1, error, 5 / 16); diffuse(x + 1, y + 1, error, 1 / 16); }
  }
  return result;
}
export type PixelRegion = { x: number; y: number; width: number; height: number };
export function clampPixelRegion(region: PixelRegion, width: number, height: number): PixelRegion {
  const safe = (value: number) => Number.isFinite(value) ? Math.round(value) : 0;
  const x = Math.max(0, Math.min(width - 1, safe(region.x))), y = Math.max(0, Math.min(height - 1, safe(region.y)));
  return { x, y, width: Math.max(1, Math.min(width - x, safe(region.width))), height: Math.max(1, Math.min(height - y, safe(region.height))) };
}
