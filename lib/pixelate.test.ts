import { describe, expect, it } from "vitest";
import { clampPixelRegion, mapPixelPalette, parseHexPalette } from "./pixelate";
describe("pixelation colors and selection", () => {
  it("parses custom HEX and rejects invalid palettes", () => {
    expect(parseHexPalette("#123, ffffff")).toEqual([[17, 34, 51], [255, 255, 255]]);
    expect(() => parseHexPalette("#badcolor #fff")).toThrow(/Invalid HEX/);
  });
  it("keeps alpha and outputs only palette colors in each dither mode", () => {
    const input = new Uint8ClampedArray([100, 100, 100, 255, 180, 180, 180, 128, 25, 25, 25, 0, 210, 210, 210, 255]);
    for (const mode of ["none", "bayer", "floyd-steinberg"] as const) {
      const out = mapPixelPalette(input, 2, [[0, 0, 0], [255, 255, 255]], mode);
      expect([out[3], out[7], out[11], out[15]]).toEqual([255, 128, 0, 255]);
      expect([out[0], out[4], out[12]].every(v => v === 0 || v === 255)).toBe(true);
      expect(input[0]).toBe(100);
    }
  });
  it("keeps keyboard and dragged regions inside source bounds", () => {
    expect(clampPixelRegion({ x: -5, y: 90, width: 200, height: 100 }, 100, 100)).toEqual({ x: 0, y: 90, width: 100, height: 10 });
  });
});
