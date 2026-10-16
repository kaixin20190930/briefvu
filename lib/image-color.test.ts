import { describe, expect, it } from "vitest";
import {
  clampPixelPoint,
  formatHsl,
  formatRgb,
  mapClientPointToPixel,
  rgbToHex,
  rgbToHsl,
} from "./image-color";

describe("image color formatting", () => {
  it.each([
    [[255, 0, 0], "#FF0000"],
    [[0, 255, 0], "#00FF00"],
    [[0, 0, 255], "#0000FF"],
    [[0, 0, 0], "#000000"],
    [[255, 255, 255], "#FFFFFF"],
    [[18, 52, 86], "#123456"],
  ])("converts RGB %j to HEX %s", (rgb, expected) => {
    expect(rgbToHex(...rgb as [number, number, number])).toBe(expected);
  });

  it("clamps invalid channels before formatting", () => {
    expect(rgbToHex(-1, 260, Number.NaN)).toBe("#00FF00");
    expect(formatRgb({ r: 12.4, g: 99.8, b: 300 })).toBe("rgb(12, 100, 255)");
  });

  it.each([
    [[255, 0, 0], { h: 0, s: 100, l: 50 }],
    [[0, 255, 0], { h: 120, s: 100, l: 50 }],
    [[0, 0, 255], { h: 240, s: 100, l: 50 }],
    [[128, 128, 128], { h: 0, s: 0, l: 50 }],
    [[255, 255, 255], { h: 0, s: 0, l: 100 }],
  ])("converts RGB %j to HSL", (rgb, expected) => {
    expect(rgbToHsl(...rgb as [number, number, number])).toEqual(expected);
  });

  it("formats an HSL CSS value", () => {
    expect(formatHsl({ r: 255, g: 107, b: 53 })).toBe("hsl(16, 100%, 60%)");
  });
});

describe("pixel coordinates", () => {
  it("clamps points inside canvas bounds", () => {
    expect(clampPixelPoint({ x: -4, y: 999 }, 20, 10)).toEqual({ x: 0, y: 9 });
    expect(clampPixelPoint({ x: 8.9, y: 2.2 }, 20, 10)).toEqual({ x: 8, y: 2 });
  });

  it("maps CSS display coordinates back to source pixels", () => {
    expect(mapClientPointToPixel(
      { x: 150, y: 75 },
      { left: 50, top: 25, width: 200, height: 100 },
      1000,
      500,
    )).toEqual({ x: 500, y: 250 });
  });

  it("handles a zero-size display box", () => {
    expect(mapClientPointToPixel(
      { x: 100, y: 100 },
      { left: 0, top: 0, width: 0, height: 0 },
      100,
      100,
    )).toEqual({ x: 0, y: 0 });
  });
});
