import { describe, expect, it } from "vitest";
import { exportColors, extractPalette, paletteSampleSize, validateColorImage } from "./color-palette";

describe("palette extraction", () => {
  it("preserves a solid source color without inventing extra swatches", () => {
    const result = extractPalette(new Uint8ClampedArray([19, 111, 232, 255, 19, 111, 232, 255]), 10);
    expect(result?.colors).toEqual([{ r: 19, g: 111, b: 232, share: 1 }]);
    expect(result?.average).toEqual({ r: 19, g: 111, b: 232 });
  });
  it("ranks area-weighted colors and computes a linear-light average", () => {
    const pixels = new Uint8ClampedArray([255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255]);
    const result = extractPalette(pixels, 2)!;
    expect(result.colors[0]).toEqual({ r: 255, g: 0, b: 0, share: 2 / 3 });
    expect(result.colors[1]).toEqual({ r: 0, g: 0, b: 255, share: 1 / 3 });
    expect(result.average).toEqual({ r: 213, g: 0, b: 156 });
    expect(extractPalette(pixels, 2)).toEqual(result);
  });
  it("ignores hidden RGB and weights partial transparency", () => {
    const result = extractPalette(new Uint8ClampedArray([0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 85]), 2)!;
    expect(result.colors[0].share).toBeCloseTo(0.75);
    expect(result.colors).toHaveLength(2);
    expect(extractPalette(new Uint8ClampedArray([255, 0, 0, 0]))).toBeNull();
    expect(extractPalette(new Uint8ClampedArray())).toBeNull();
  });
  it("handles gradients within the requested count and accounts for all weights", () => {
    const pixels = new Uint8ClampedArray(Array.from({ length: 256 }, (_, i) => [i, 255 - i, i, 255]).flat());
    for (const count of [2, 5, 10]) {
      const result = extractPalette(pixels, count)!;
      expect(result.colors).toHaveLength(count);
      expect(result.colors.reduce((sum, color) => sum + color.share, 0)).toBeCloseTo(1);
      expect(extractPalette(pixels, count)).toEqual(result);
    }
  });
  it("rejects invalid buffers and caps decoded and sampled dimensions independently", () => {
    expect(() => extractPalette(new Uint8ClampedArray(3))).toThrow();
    expect(() => extractPalette(new Uint8ClampedArray(256 * 256 * 4 + 4))).toThrow();
    expect(() => extractPalette(new Uint8ClampedArray(4), 11)).toThrow();
    expect(() => validateColorImage(8000, 8000)).toThrow();
    expect(() => validateColorImage(9000, 1)).toThrow();
    expect(paletteSampleSize(4000, 2000)).toEqual({ width: 256, height: 128 });
    expect(paletteSampleSize(2, 1)).toEqual({ width: 2, height: 1 });
  });
});

describe("shared color exports", () => {
  const colors = [{ name: "picked-color", color: { r: 255, g: 0, b: 0, a: 128 } }];
  it("preserves opacity in CSS and JSON", () => {
    expect(exportColors(colors, "css")).toBe(":root {\n  --picked-color: #FF000080;\n}");
    const value = JSON.parse(exportColors(colors, "json"))["picked-color"];
    expect(value.hex).toBe("#FF000080");
    expect(value.alpha).toBeCloseTo(128 / 255);
    expect(value.hsl).toEqual({ h: 0, s: 100, l: 50 });
  });
});
