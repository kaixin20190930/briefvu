import { describe, expect, it } from "vitest";
import { spriteLayout } from "./sprite-sheet";

describe("sprite sheet layout", () => {
  it("places 12 mixed frames in equal cells with gap, margin, and centering", () => {
    const sizes = Array.from({ length: 12 }, (_, i) => ({ width: i ? 12 : 16, height: 16 }));
    const sheet = spriteLayout(sizes, 4, 2, 3);
    expect([sheet.width, sheet.height, sheet.rows]).toEqual([76, 58, 3]);
    expect(sheet.frames[4]).toMatchObject({ x: 3, y: 21, w: 16, h: 16, offsetX: 2 });
    expect(sheet.frames[11]).toMatchObject({ x: 57, y: 39 });
  });
  it("rejects allocations above browser limits and invalid settings", () => {
    expect(() => spriteLayout([{ width: 8192, height: 8192 }], 1)).toThrow(/32 megapixels/);
    expect(() => spriteLayout([{ width: 16, height: 16 }], NaN)).toThrow();
    expect(() => spriteLayout(Array.from({ length: 181 }, () => ({ width: 1, height: 1 })), 4)).toThrow(/180/);
  });
});
