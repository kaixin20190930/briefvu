export type MetadataBlock = { category: "EXIF" | "XMP" | "C2PA" | "Text" | "Color profile"; label: string; bytes: number };
export type MetadataResult = { format: "jpeg" | "png" | "webp"; blocks: MetadataBlock[] };

const decoder = new TextDecoder("latin1");
const text = (bytes: Uint8Array) => decoder.decode(bytes);

export function detectMetadataFormat(bytes: Uint8Array): MetadataResult["format"] | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpeg";
  if (bytes.length >= 12 && text(bytes.subarray(0, 4)) === "RIFF" && text(bytes.subarray(8, 12)) === "WEBP") return "webp";
  if (bytes.length >= 8 && bytes[0] === 0x89 && text(bytes.subarray(1, 4)) === "PNG") return "png";
  return null;
}

function categoryFor(value: string): MetadataBlock["category"] | null {
  if (/c2pa|jumb/i.test(value)) return "C2PA";
  if (/exif/i.test(value)) return "EXIF";
  if (value === "iCCP" || value === "ICCP") return "Color profile";
  if (["tEXt", "zTXt", "iTXt", "tIME"].includes(value)) return "Text";
  if (/xmp|xml/i.test(value)) return "XMP";
  return null;
}

function jpegSegments(bytes: Uint8Array) {
  const segments: { start: number; end: number; marker: number; body: Uint8Array }[] = [];
  let offset = 2;
  while (offset + 3 < bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda || marker === 0xd9) break;
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2 || offset + 2 + length > bytes.length) break;
    segments.push({ start: offset, end: offset + 2 + length, marker, body: bytes.subarray(offset + 4, offset + 2 + length) });
    offset += 2 + length;
  }
  return segments;
}

export function scanMetadata(bytes: Uint8Array): MetadataResult | null {
  const format = detectMetadataFormat(bytes);
  if (!format) return null;
  const blocks: MetadataBlock[] = [];
  if (format === "jpeg") {
    for (const segment of jpegSegments(bytes)) {
      const signature = text(segment.body.subarray(0, 80));
      const category = segment.marker === 0xfe ? "Text" : segment.marker === 0xe1 ? (/xmp/i.test(signature) ? "XMP" : "EXIF") : segment.marker === 0xe2 && /icc_profile/i.test(signature) ? "Color profile" : segment.marker === 0xeb || /c2pa|jumb/i.test(signature) ? "C2PA" : null;
      if (category) blocks.push({ category, label: `${category} JPEG block`, bytes: segment.end - segment.start });
    }
  } else if (format === "png") {
    let offset = 8;
    while (offset + 12 <= bytes.length) {
      const size = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0);
      const kind = text(bytes.subarray(offset + 4, offset + 8));
      const category = categoryFor(kind);
      if (category) blocks.push({ category, label: `${kind} PNG chunk`, bytes: size + 12 });
      offset += size + 12;
      if (kind === "IEND") break;
    }
  } else {
    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const kind = text(bytes.subarray(offset, offset + 4));
      const size = new DataView(bytes.buffer, bytes.byteOffset + offset + 4, 4).getUint32(0, true);
      const category = categoryFor(kind);
      if (category) blocks.push({ category, label: `${kind} WebP chunk`, bytes: size + 8 + (size % 2) });
      offset += 8 + size + (size % 2);
    }
  }
  return { format, blocks };
}

function join(parts: Uint8Array[]) { const length = parts.reduce((sum, part) => sum + part.length, 0); const output = new Uint8Array(length); let offset = 0; for (const part of parts) { output.set(part, offset); offset += part.length; } return output; }

export function stripMetadata(bytes: Uint8Array): Uint8Array {
  const result = scanMetadata(bytes);
  if (!result) throw new Error("Unsupported image format");
  if (result.format === "jpeg") {
    const segments = jpegSegments(bytes); const parts = [bytes.subarray(0, 2)]; let cursor = 2;
    for (const segment of segments) { if (cursor < segment.start) parts.push(bytes.subarray(cursor, segment.start)); const signature = text(segment.body.subarray(0, 80)); const remove = segment.marker === 0xfe || segment.marker === 0xe1 || segment.marker === 0xeb || (segment.marker === 0xe2 && /icc_profile/i.test(signature)) || /c2pa|jumb|xmp|exif/i.test(signature); if (!remove) parts.push(bytes.subarray(segment.start, segment.end)); cursor = segment.end; }
    parts.push(bytes.subarray(cursor)); return join(parts);
  }
  if (result.format === "png") {
    const parts = [bytes.subarray(0, 8)]; let offset = 8;
    while (offset + 12 <= bytes.length) { const size = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0); const end = offset + size + 12; const kind = text(bytes.subarray(offset + 4, offset + 8)); if (!categoryFor(kind)) parts.push(bytes.subarray(offset, end)); offset = end; if (kind === "IEND") break; }
    return join(parts);
  }
  const chunks: Uint8Array[] = []; let offset = 12;
  while (offset + 8 <= bytes.length) { const kind = text(bytes.subarray(offset, offset + 4)); const size = new DataView(bytes.buffer, bytes.byteOffset + offset + 4, 4).getUint32(0, true); const end = offset + 8 + size + (size % 2); if (!categoryFor(kind)) { const chunk = bytes.slice(offset, end); if (kind === "VP8X" && size >= 1) chunk[8] &= ~0x2c; chunks.push(chunk); } offset = end; }
  const body = join(chunks); const output = new Uint8Array(12 + body.length); output.set(bytes.subarray(0, 12)); output.set(body, 12); new DataView(output.buffer).setUint32(4, output.length - 8, true); return output;
}
