export type MetadataBlock = { category: "EXIF" | "XMP" | "C2PA" | "Text" | "Color profile"; label: string; bytes: number };
export type MetadataResult = { format: "jpeg" | "png" | "webp"; blocks: MetadataBlock[] };
type Segment = { start: number; end: number; category: MetadataBlock["category"] | null; label: string; kind?: string };
const decoder = new TextDecoder("latin1");
const text = (bytes: Uint8Array) => decoder.decode(bytes);
const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];

export function detectMetadataFormat(bytes: Uint8Array): MetadataResult["format"] | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpeg";
  if (bytes.length >= 12 && text(bytes.subarray(0, 4)) === "RIFF" && text(bytes.subarray(8, 12)) === "WEBP") return "webp";
  if (pngSignature.every((byte, index) => bytes[index] === byte)) return "png";
  return null;
}
function categoryFor(kind: string): MetadataBlock["category"] | null {
  if (["caBX", "C2PA", "JUMB"].includes(kind)) return "C2PA";
  if (["eXIf", "EXIF"].includes(kind)) return "EXIF";
  if (["iCCP", "ICCP"].includes(kind)) return "Color profile";
  if (["tEXt", "zTXt", "iTXt", "tIME"].includes(kind)) return "Text";
  if (kind === "XMP ") return "XMP";
  return null;
}
function jpegCategory(marker: number, body: Uint8Array): MetadataBlock["category"] | null {
  const signature = text(body.subarray(0, 80));
  if (marker === 0xfe) return "Text";
  if (marker === 0xe1 && signature.startsWith("Exif\0\0")) return "EXIF";
  if (marker === 0xe1 && /^(http:\/\/ns\.adobe\.com\/(xap|xmp)|<\?xpacket)/i.test(signature)) return "XMP";
  if (marker === 0xe2 && signature.startsWith("ICC_PROFILE\0")) return "Color profile";
  // JPEG APP11 JUMBF is an embedded provenance/container block, not an arbitrary payload match.
  if (marker === 0xeb && (signature.startsWith("JP") || /c2pa|jumb/i.test(signature))) return "C2PA";
  return null;
}

function segments(bytes: Uint8Array, format: MetadataResult["format"]): Segment[] {
  const result: Segment[] = [];
  const invalid = () => { throw new Error("The image container is truncated or malformed. No cleaned copy was created."); };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (format === "jpeg") {
    let offset = 2, sawScan = false;
    while (offset < bytes.length) {
      const start = offset;
      if (bytes[offset++] !== 0xff) return invalid();
      while (bytes[offset] === 0xff) offset++;
      if (offset >= bytes.length) return invalid();
      const marker = bytes[offset++];
      if (marker === 0xd9) {
        if (!sawScan) return invalid();
        // Preserve trailing unrecognized data; never call this a complete privacy scrub.
        return result;
      }
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (marker === 0 || marker === 0xd8 || offset + 2 > bytes.length) return invalid();
      const size = view.getUint16(offset);
      if (size < 2 || offset + size > bytes.length) return invalid();
      const end = offset + size;
      const category = jpegCategory(marker, bytes.subarray(offset + 2, end));
      result.push({ start, end, category, label: `${category ?? "Other"} JPEG block` });
      offset = end;
      if (marker === 0xda) {
        sawScan = true;
        // Walk entropy data, respecting escaped FF and restart markers. Continue between progressive scans.
        while (offset < bytes.length) {
          if (bytes[offset] !== 0xff) { offset++; continue; }
          let next = offset + 1;
          while (bytes[next] === 0xff) next++;
          if (next >= bytes.length) return invalid();
          if (bytes[next] === 0 || (bytes[next] >= 0xd0 && bytes[next] <= 0xd7)) { offset = next + 1; continue; }
          break;
        }
      }
    }
    return invalid();
  }
  let offset = format === "png" ? 8 : 12;
  if (format === "webp" && view.getUint32(4, true) + 8 !== bytes.length) return invalid();
  let sawHeader = false, sawData = false;
  while (offset < bytes.length) {
    const header = format === "png" ? 12 : 8;
    if (offset + header > bytes.length) return invalid();
    const size = view.getUint32(offset + (format === "png" ? 0 : 4), format === "webp");
    const kind = text(bytes.subarray(offset + (format === "png" ? 4 : 0), offset + (format === "png" ? 8 : 4)));
    const end = offset + header + size + (format === "webp" ? size % 2 : 0);
    if (end > bytes.length || !/^[A-Za-z0-9 ]{4}$/.test(kind)) return invalid();
    if (format === "png") {
      if (!sawHeader && (kind !== "IHDR" || size !== 13)) return invalid();
      if (kind === "IHDR") { if (sawHeader) return invalid(); sawHeader = true; }
      if (kind === "IDAT") sawData = true;
      if (kind === "IEND" && (size !== 0 || !sawData || end !== bytes.length)) return invalid();
    } else if (kind === "VP8X" && size !== 10) return invalid();
    const category = categoryFor(kind);
    result.push({ start: offset, end, category, label: `${kind} ${format === "png" ? "PNG" : "WebP"} chunk`, kind });
    offset = end;
    if (format === "png" && kind === "IEND") return result;
  }
  if (format === "png") return invalid();
  return result;
}

export function scanMetadata(bytes: Uint8Array): MetadataResult | null {
  const format = detectMetadataFormat(bytes);
  if (!format) return null;
  return { format, blocks: segments(bytes, format).flatMap(s => s.category ? [{ category: s.category, label: s.label, bytes: s.end - s.start }] : []) };
}
function join(parts: Uint8Array[]) { const length = parts.reduce((sum, part) => sum + part.length, 0); const output = new Uint8Array(length); let offset = 0; for (const part of parts) { output.set(part, offset); offset += part.length; } return output; }
export function stripMetadata(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const format = detectMetadataFormat(bytes);
  if (!format) throw new Error("Unsupported image format");
  const parts: Uint8Array[] = [];
  let cursor = 0;
  for (const segment of segments(bytes, format)) {
    parts.push(bytes.subarray(cursor, segment.start));
    if (!segment.category) {
      const chunk = bytes.slice(segment.start, segment.end);
      if (format === "webp" && segment.kind === "VP8X") chunk[8] &= ~0x2c;
      parts.push(chunk);
    }
    cursor = segment.end;
  }
  parts.push(bytes.subarray(cursor));
  const output = join(parts);
  if (format === "webp") new DataView(output.buffer).setUint32(4, output.length - 8, true);
  return output;
}

// Expose only recognized bounded payloads to the local field viewer.
export function metadataPayloads(bytes: Uint8Array) {
  const format = detectMetadataFormat(bytes);
  if (!format) return [];
  return segments(bytes, format).filter(s => s.category).map(s => ({
    category: s.category!, kind: s.kind,
    bytes: bytes.subarray(s.start + (format === "png" ? 8 : format === "webp" ? 8 : 4), s.end - (format === "png" ? 4 : format === "webp" ? (new DataView(bytes.buffer, bytes.byteOffset + s.start + 4, 4).getUint32(0, true) % 2) : 0)),
  }));
}
