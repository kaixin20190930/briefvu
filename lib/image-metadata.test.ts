import { describe, expect, it } from "vitest";
import { scanMetadata, stripMetadata } from "./image-metadata";

function jpegWithExif() { return new Uint8Array([0xff,0xd8, 0xff,0xe1,0,8, 0x45,0x78,0x69,0x66,0,0, 0xff,0xda,0,2, 1,2,3, 0xff,0xd9]); }
it("finds and removes EXIF without touching scan data", () => { const input = jpegWithExif(); expect(scanMetadata(input)?.blocks[0].category).toBe("EXIF"); const output = stripMetadata(input); expect(scanMetadata(output)?.blocks).toHaveLength(0); expect(Array.from(output.slice(2))).toEqual([0xff,0xda,0,2,1,2,3,0xff,0xd9]); });
describe("unsupported input", () => { it("is rejected", () => expect(scanMetadata(new Uint8Array([1,2,3]))).toBeNull()); });
