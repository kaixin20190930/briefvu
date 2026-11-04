import { describe, expect, it } from "vitest";
import { decodeTga, TgaError } from "./tga";

function tga(options: { width?: number; height?: number; type?: number; depth?: number; descriptor?: number; pixels: number[] }) {
  const width = options.width ?? 2;
  const height = options.height ?? 1;
  const bytes = new Uint8Array(18 + options.pixels.length);
  bytes[2] = options.type ?? 2;
  bytes[12] = width & 255; bytes[13] = width >> 8;
  bytes[14] = height & 255; bytes[15] = height >> 8;
  bytes[16] = options.depth ?? 24;
  bytes[17] = options.descriptor ?? 0x20;
  bytes.set(options.pixels, 18);
  return bytes.buffer;
}

describe("decodeTga", () => {
  it("decodes BGR true-color pixels and horizontal origin", () => {
    const decoded = decodeTga(tga({ descriptor: 0x30, pixels: [0, 0, 255, 0, 255, 0] }));
    expect(decoded.origin).toBe("Top right");
    expect([...decoded.rgba]).toEqual([0, 255, 0, 255, 255, 0, 0, 255]);
  });

  it("decodes RLE grayscale packets", () => {
    const decoded = decodeTga(tga({ width: 3, type: 11, depth: 8, pixels: [0x82, 64] }));
    expect(decoded.compression).toBe("RLE");
    expect([...decoded.rgba]).toEqual([64,64,64,255, 64,64,64,255, 64,64,64,255]);
  });

  it("preserves declared 32-bit alpha", () => {
    const decoded = decodeTga(tga({ width: 1, depth: 32, descriptor: 0x28, pixels: [30, 20, 10, 100] }));
    expect(decoded.alphaBits).toBe(8);
    expect(decoded.hasVisibleTransparency).toBe(true);
    expect([...decoded.rgba]).toEqual([10, 20, 30, 100]);
  });

  it("reports unsupported variants separately from truncated data", () => {
    expect(() => decodeTga(tga({ depth: 16, pixels: [0, 0, 0, 0] }))).toThrowError(TgaError);
    expect(() => decodeTga(tga({ pixels: [0, 0, 255] }))).toThrow("truncated");
  });

  it("rejects RLE packets that exceed the image", () => {
    expect(() => decodeTga(tga({ width: 2, type: 10, pixels: [0x82, 0, 0, 255] }))).toThrow("exceeds");
  });
});
