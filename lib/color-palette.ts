import { rgbToHex, rgbToHsl, type RgbColor } from "./image-color";

export type PaletteColor = RgbColor & { share: number };
export type PaletteResult = { average: RgbColor; colors: PaletteColor[] };
type Bin = { r: number; g: number; b: number; weight: number };

export function srgbToLinear(channel: number) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value: number) {
  return Math.round(255 * (value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055));
}

/** Bounded input: caller samples the decoded image to at most 256 × 256 pixels. */
export function extractPalette(pixels: Uint8ClampedArray, count = 5): PaletteResult | null {
  if (pixels.length % 4 || pixels.length > 256 * 256 * 4) throw new Error("Invalid sample size");
  if (!Number.isInteger(count) || count < 2 || count > 10) throw new Error("Choose 2–10 colors");
  const histogram = new Map<number, Bin>();
  const linearSum = [0, 0, 0];
  let totalWeight = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const weight = pixels[i + 3] / 255;
    if (!weight) continue;
    const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
    totalWeight += weight;
    linearSum[0] += srgbToLinear(r) * weight;
    linearSum[1] += srgbToLinear(g) * weight;
    linearSum[2] += srgbToLinear(b) * weight;
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const bin = histogram.get(key) ?? { r: 0, g: 0, b: 0, weight: 0 };
    bin.r += r * weight; bin.g += g * weight; bin.b += b * weight; bin.weight += weight;
    histogram.set(key, bin);
  }
  if (!totalWeight) return null;
  const bins = [...histogram.entries()].sort(([a], [b]) => a - b).map(([, bin]) => ({
    r: bin.r / bin.weight, g: bin.g / bin.weight, b: bin.b / bin.weight, weight: bin.weight,
  }));
  const boxes: Bin[][] = [bins];
  function extent(box: Bin[]) {
    let axis: "r" | "g" | "b" = "r";
    let range = -1;
    for (const channel of ["r", "g", "b"] as const) {
      let low = 255, high = 0;
      for (const bin of box) { low = Math.min(low, bin[channel]); high = Math.max(high, bin[channel]); }
      if (high - low > range) { range = high - low; axis = channel; }
    }
    return { axis, score: range * box.reduce((sum, bin) => sum + bin.weight, 0) };
  }
  while (boxes.length < count) {
    let selected = -1, score = -1;
    boxes.forEach((box, index) => {
      const next = extent(box).score;
      if (box.length > 1 && next > score) { selected = index; score = next; }
    });
    if (selected < 0) break;
    const box = boxes[selected];
    const { axis } = extent(box);
    box.sort((a, b) => a[axis] - b[axis]);
    const half = box.reduce((sum, bin) => sum + bin.weight, 0) / 2;
    let weight = 0, split = 1;
    for (let i = 0; i < box.length - 1; i++) {
      weight += box[i].weight; split = i + 1;
      if (weight >= half) break;
    }
    boxes.splice(selected, 1, box.slice(0, split), box.slice(split));
  }
  const colors = boxes.map((box) => {
    const weight = box.reduce((sum, bin) => sum + bin.weight, 0);
    const channel = (key: "r" | "g" | "b") => Math.round(box.reduce((sum, bin) => sum + bin[key] * bin.weight, 0) / weight);
    return { r: channel("r"), g: channel("g"), b: channel("b"), share: weight / totalWeight };
  }).sort((a, b) => b.share - a.share || a.r - b.r || a.g - b.g || a.b - b.b);
  return {
    average: { r: linearToSrgb(linearSum[0] / totalWeight), g: linearToSrgb(linearSum[1] / totalWeight), b: linearToSrgb(linearSum[2] / totalWeight) },
    colors,
  };
}

export type NamedColor = { name: string; color: RgbColor };

export function colorCssValue(color: RgbColor) {
  const hex = rgbToHex(color.r, color.g, color.b);
  return color.a === undefined || color.a >= 255 ? hex : `${hex}${Math.max(0, Math.round(color.a)).toString(16).padStart(2, "0").toUpperCase()}`;
}

export function exportColors(colors: NamedColor[], format: "css" | "json") {
  if (format === "css") return `:root {\n${colors.map(({ name, color }) => `  --${name}: ${colorCssValue(color)};`).join("\n")}\n}`;
  return JSON.stringify(Object.fromEntries(colors.map(({ name, color }) => [name, {
    hex: colorCssValue(color), rgb: { r: color.r, g: color.g, b: color.b },
    hsl: rgbToHsl(color.r, color.g, color.b), alpha: (color.a ?? 255) / 255,
  }])), null, 2);
}

export function validateColorImage(width: number, height: number) {
  if (!width || !height || width > 8192 || height > 8192 || width * height > 20_000_000) {
    throw new Error("Choose an image up to 20 megapixels and 8,192 px per side. Resize larger images first.");
  }
}

export function paletteSampleSize(width: number, height: number) {
  validateColorImage(width, height);
  const scale = Math.min(1, 256 / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
