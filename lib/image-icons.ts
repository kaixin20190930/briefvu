export const ICO_SIZES = [16, 32, 48, 256] as const;
export type IconOptions = { mode: "fit" | "crop"; padding: number; transparent: boolean; background: string };

export function iconGeometry(width: number, height: number, size: number, padding: number, mode: "fit" | "crop") {
  if (![width, height, size].every((v) => Number.isFinite(v) && v > 0) || !Number.isFinite(padding) || padding < 0 || padding > 30) throw new Error("Invalid icon dimensions.");
  const inset = size * padding / 100;
  const box = size - inset * 2;
  const scale = (mode === "fit" ? Math.min : Math.max)(box / width, box / height);
  return { x: (size - width * scale) / 2, y: (size - height * scale) / 2, width: width * scale, height: height * scale, inset, box };
}

// ICO DIB: bottom-up BGRA XOR pixels followed by a DWORD-aligned 1-bit AND mask.
export function iconDib(size: number, rgba: Uint8ClampedArray): Uint8Array<ArrayBuffer> {
  if (!Number.isInteger(size) || size < 1 || size > 256 || rgba.length !== size * size * 4) throw new Error("Invalid icon pixels.");
  const maskStride = Math.ceil(size / 32) * 4;
  const pixelsLength = size * size * 4;
  const bytes = new Uint8Array(40 + pixelsLength + maskStride * size);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 40, true); view.setInt32(4, size, true); view.setInt32(8, size * 2, true);
  view.setUint16(12, 1, true); view.setUint16(14, 32, true); view.setUint32(20, pixelsLength + maskStride * size, true);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const source = (y * size + x) * 4;
    const row = size - 1 - y;
    const target = 40 + (row * size + x) * 4;
    bytes.set([rgba[source + 2], rgba[source + 1], rgba[source], rgba[source + 3]], target);
    if (rgba[source + 3] === 0) bytes[40 + pixelsLength + row * maskStride + (x >> 3)] |= 0x80 >> (x & 7);
  }
  return bytes;
}

export function encodeIco(entries: { size: number; bytes: Uint8Array }[]): Uint8Array<ArrayBuffer> {
  if (!entries.length || entries.length > 256 || new Set(entries.map(e => e.size)).size !== entries.length || entries.some(e => !Number.isInteger(e.size) || e.size < 1 || e.size > 256 || !e.bytes.length)) throw new Error("Invalid ICO entries.");
  let offset = 6 + 16 * entries.length;
  const result = new Uint8Array(offset + entries.reduce((sum, e) => sum + e.bytes.length, 0));
  const view = new DataView(result.buffer);
  view.setUint16(2, 1, true); view.setUint16(4, entries.length, true);
  entries.forEach((entry, index) => {
    const at = 6 + index * 16;
    result[at] = result[at + 1] = entry.size === 256 ? 0 : entry.size;
    view.setUint16(at + 4, 1, true); view.setUint16(at + 6, 32, true);
    view.setUint32(at + 8, entry.bytes.length, true); view.setUint32(at + 12, offset, true);
    result.set(entry.bytes, offset); offset += entry.bytes.length;
  });
  return result;
}

export function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Small, uncompressed ZIP for our fixed ASCII filenames. No ZIP64 or user paths.
export function iconZip(files: { name: string; bytes: Uint8Array }[]): Uint8Array<ArrayBuffer> {
  if (!files.length || files.length > 100 || new Set(files.map(f => f.name)).size !== files.length || files.some(f => !/^[a-z0-9][a-z0-9.-]{0,80}$/.test(f.name))) throw new Error("Invalid ZIP files.");
  const encoder = new TextEncoder();
  const localSize = files.reduce((n, f) => n + 30 + f.name.length + f.bytes.length, 0);
  const centralSize = files.reduce((n, f) => n + 46 + f.name.length, 0);
  const out = new Uint8Array(localSize + centralSize + 22);
  const v = new DataView(out.buffer);
  let local = 0, central = localSize;
  for (const file of files) {
    const name = encoder.encode(file.name), crc = crc32(file.bytes);
    v.setUint32(local, 0x04034b50, true); v.setUint16(local + 4, 20, true); v.setUint16(local + 12, 33, true);
    v.setUint32(local + 14, crc, true); v.setUint32(local + 18, file.bytes.length, true); v.setUint32(local + 22, file.bytes.length, true); v.setUint16(local + 26, name.length, true);
    out.set(name, local + 30); out.set(file.bytes, local + 30 + name.length);
    v.setUint32(central, 0x02014b50, true); v.setUint16(central + 4, 20, true); v.setUint16(central + 6, 20, true); v.setUint16(central + 14, 33, true);
    v.setUint32(central + 16, crc, true); v.setUint32(central + 20, file.bytes.length, true); v.setUint32(central + 24, file.bytes.length, true); v.setUint16(central + 28, name.length, true); v.setUint32(central + 42, local, true);
    out.set(name, central + 46); central += 46 + name.length; local += 30 + name.length + file.bytes.length;
  }
  v.setUint32(central, 0x06054b50, true); v.setUint16(central + 8, files.length, true); v.setUint16(central + 10, files.length, true); v.setUint32(central + 12, centralSize, true); v.setUint32(central + 16, localSize, true);
  return out;
}

export const ICON_HTML = '<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48 256x256">\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">';
export const ICON_MANIFEST = JSON.stringify({ icons: [192, 512].map(size => ({ src: `/icon-${size}.png`, sizes: `${size}x${size}`, type: "image/png", purpose: "any" })) }, null, 2);
export const ICON_README = `BriefVu website icons\n\nPlace the images at your website root, or adjust the paths below. Add to your HTML head:\n${ICON_HTML}\n\nMerge this icons member into your existing web app manifest:\n${ICON_MANIFEST}\n\nThis is an icons fragment, not a complete installable PWA. These are regular icons, not maskable icons or a Chrome extension package. The 180px Apple touch icon uses the selected solid background. favicon.ico contains 16/32/48px 32-bit DIB images and a 256px PNG. Check the deployed website and clear favicon caches when testing.\n`;
export const EXTENSION_SIZES = [16, 32, 48, 128] as const;
export const EXTENSION_MANIFEST = JSON.stringify({
  icons: Object.fromEntries(EXTENSION_SIZES.map(size => [String(size), `icon-${size}.png`])),
  action: { default_icon: Object.fromEntries([16, 32].map(size => [String(size), `icon-${size}.png`])) },
}, null, 2);
export const EXTENSION_README = `BriefVu Chrome extension icons\n\nFiles: icon-16.png, icon-32.png, icon-48.png, and icon-128.png.\n\nMerge these members into your existing manifest.json:\n${EXTENSION_MANIFEST}\n\nThis is a configuration fragment, not a complete installable extension. Keep the filenames beside your manifest or edit the paths. Chrome extension icons should use PNG; SVG and WebP are not supported for this manifest field. Check the 16px icon for disappearing detail before publishing.\n`;
