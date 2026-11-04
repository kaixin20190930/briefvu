import { describe, expect, it } from "vitest";
import { encodeIco, iconDib, iconGeometry, iconZip, crc32, EXTENSION_MANIFEST } from "./image-icons";

describe("icon geometry", () => {
  it("fits rectangles and crops centrally within padding", () => {
    expect(iconGeometry(200, 100, 100, 10, "fit")).toEqual({ x: 10, y: 30, width: 80, height: 40, inset: 10, box: 80 });
    expect(iconGeometry(200, 100, 100, 10, "crop")).toEqual({ x: -30, y: 10, width: 160, height: 80, inset: 10, box: 80 });
    expect(() => iconGeometry(0, 10, 16, 0, "fit")).toThrow();
    expect(() => iconGeometry(10, 10, 16, 31, "fit")).toThrow();
  });
});
describe("real ICO encoding", () => {
  it("writes bottom-up BGRA pixels and a padded transparency mask", () => {
    const dib = iconDib(2, new Uint8ClampedArray([255,0,0,255, 0,255,0,128, 0,0,255,0, 255,255,255,255]));
    const v = new DataView(dib.buffer);
    expect(v.getUint32(0,true)).toBe(40); expect(v.getInt32(8,true)).toBe(4);
    expect(Array.from(dib.slice(40,48))).toEqual([255,0,0,0, 255,255,255,255]);
    expect(Array.from(dib.slice(48,56))).toEqual([0,0,255,255, 0,255,0,128]);
    expect(Array.from(dib.slice(56))).toEqual([128,0,0,0, 0,0,0,0]);
  });
  it("writes directory offsets, lengths and the 256px sentinel", () => {
    const entries = [16,32,48,256].map(size => ({ size, bytes: new Uint8Array([size % 256, 1, 2]) }));
    const ico = encodeIco(entries), v = new DataView(ico.buffer);
    expect(Array.from(ico.slice(0,6))).toEqual([0,0,1,0,4,0]);
    entries.forEach((e,i) => { const at=6+16*i; expect(ico[at]).toBe(e.size%256); expect(v.getUint32(at+12,true)).toBe(70+i*3); expect(v.getUint32(at+8,true)).toBe(3); expect(Array.from(ico.slice(70+i*3,73+i*3))).toEqual(Array.from(e.bytes)); });
    expect(() => encodeIco([{size:257,bytes:new Uint8Array([1])}])).toThrow();
    expect(() => encodeIco([entries[0],entries[0]])).toThrow();
  });
});
describe("website ZIP", () => {
  it("matches the standard CRC32 test vector", () => expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926));
  it("writes consistent local and central directories with file content", () => {
    const bytes = new TextEncoder().encode("hello"), zip=iconZip([{name:"readme.txt",bytes}]), v=new DataView(zip.buffer);
    expect(v.getUint32(0,true)).toBe(0x04034b50);
    expect(new TextDecoder().decode(zip.slice(40,45))).toBe("hello");
    expect(v.getUint32(45,true)).toBe(0x02014b50);
    expect(v.getUint32(45+16,true)).toBe(crc32(bytes));
    expect(v.getUint32(zip.length-22,true)).toBe(0x06054b50);
    expect(v.getUint32(zip.length-6,true)).toBe(45);
    expect(() => iconZip([{name:"../bad",bytes}])).toThrow();
  });
});
describe("extension manifest", () => {
  it("uses object maps that match the exported PNG filenames", () => {
    const manifest = JSON.parse(EXTENSION_MANIFEST);
    expect(manifest.icons).toEqual({ "16": "icon-16.png", "32": "icon-32.png", "48": "icon-48.png", "128": "icon-128.png" });
    expect(manifest.action.default_icon).toEqual({ "16": "icon-16.png", "32": "icon-32.png" });
  });
});
