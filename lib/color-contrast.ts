import type { RgbColor } from "./image-color";
import { srgbToLinear } from "./color-palette";

export function parseHexColor(value: string): RgbColor | null {
  if (!/^#[0-9a-f]{6}$/i.test(value)) return null;
  return { r: parseInt(value.slice(1, 3), 16), g: parseInt(value.slice(3, 5), 16), b: parseInt(value.slice(5, 7), 16) };
}

/** WCAG text contrast uses the displayed foreground after compositing over an opaque background. */
export function compositeColor(foreground: RgbColor, background: RgbColor): RgbColor {
  const alpha = Math.max(0, Math.min(255, foreground.a ?? 255)) / 255;
  return { r: foreground.r * alpha + background.r * (1 - alpha), g: foreground.g * alpha + background.g * (1 - alpha), b: foreground.b * alpha + background.b * (1 - alpha) };
}

export function contrastRatio(foreground: RgbColor, background: RgbColor) {
  const luminance = (color: RgbColor) => 0.2126 * srgbToLinear(color.r) + 0.7152 * srgbToLinear(color.g) + 0.0722 * srgbToLinear(color.b);
  const front = luminance(compositeColor(foreground, background));
  const back = luminance(background);
  return (Math.max(front, back) + 0.05) / (Math.min(front, back) + 0.05);
}

export function contrastChecks(ratio: number) {
  return { normalAA: ratio >= 4.5, normalAAA: ratio >= 7, largeAA: ratio >= 3, largeAAA: ratio >= 4.5 };
}
