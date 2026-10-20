import { describe, expect, it } from "vitest";
import { scanMetadata, stripMetadata } from "./image-metadata";

function jpegWithExif() { return new Uint8Array([0xff,0xd8, 0xff,0xe1,0,8, 0x45,0x78,0x69,0x66,0,0, 0xff,0xda,0,2, 1,2,3, 0xff,0xd9]); }
it("finds and removes EXIF without touching scan data", () => { const input = jpegWithExif(); expect(scanMetadata(input)?.blocks[0].category).toBe("EXIF"); const output = stripMetadata(input); expect(scanMetadata(output)?.blocks).toHaveLength(0); expect(Array.from(output.slice(2))).toEqual([0xff,0xda,0,2,1,2,3,0xff,0xd9]); });
it("preserves a non-ICC JPEG APP2 segment", () => { const input = new Uint8Array([0xff,0xd8,0xff,0xe2,0,8,0x4d,0x50,0x46,0,0,0,0xff,0xda,0,2,1,2,0xff,0xd9]); expect(scanMetadata(input)?.blocks).toHaveLength(0); expect(Array.from(stripMetadata(input))).toEqual(Array.from(input)); });
it("clears WebP metadata feature flags after removing chunks", () => { const input = new Uint8Array(42); input.set([0x52,0x49,0x46,0x46,34,0,0,0,0x57,0x45,0x42,0x50],0); input.set([0x56,0x50,0x38,0x58,10,0,0,0,0x2c,0,0,0,0,0,0,0,0,0],12); input.set([0x45,0x58,0x49,0x46,4,0,0,0,1,2,3,4],30); const output = stripMetadata(input); expect(output[20] & 0x2c).toBe(0); expect(new TextDecoder("latin1").decode(output)).not.toContain("EXIF"); expect(new DataView(output.buffer).getUint32(4,true)).toBe(output.length - 8); });
describe("unsupported input", () => { it("is rejected", () => expect(scanMetadata(new Uint8Array([1,2,3]))).toBeNull()); });
