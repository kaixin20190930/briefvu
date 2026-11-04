import { describe, expect, it } from "vitest";
import { compositeColor, contrastChecks, contrastRatio, parseHexColor } from "./color-contrast";

describe("WCAG text contrast", () => {
  const black = { r: 0, g: 0, b: 0 }, white = { r: 255, g: 255, b: 255 };
  it("matches black/white and equal-color reference pairs", () => {
    expect(contrastRatio(black, white)).toBe(21);
    expect(contrastRatio(white, black)).toBe(21);
    expect(contrastRatio(black, black)).toBe(1);
    expect(contrastRatio(parseHexColor("#777777")!, white)).toBeCloseTo(4.478, 3);
  });
  it("does not round failing ratios into a pass", () => {
    expect(contrastChecks(4.4999).normalAA).toBe(false);
    expect(contrastChecks(4.5).normalAA).toBe(true);
    expect(contrastChecks(6.9999).normalAAA).toBe(false);
    expect(contrastChecks(7).normalAAA).toBe(true);
    expect(contrastChecks(3)).toEqual({ normalAA: false, normalAAA: false, largeAA: true, largeAAA: false });
  });
  it("composites transparent text before evaluating", () => {
    expect(contrastRatio({ ...black, a: 0 }, white)).toBe(1);
    expect(compositeColor({ ...black, a: 128 }, white)).toEqual({ r: 127, g: 127, b: 127 });
    expect(contrastRatio({ ...black, a: 128 }, white)).toBeCloseTo(4.004, 3);
  });
  it("validates editable color values", () => {
    expect(parseHexColor("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    for (const value of ["red", "#fff", "#GG0000", "#12345678", "#123456;"]) expect(parseHexColor(value)).toBeNull();
  });
});
