import { metadataPayloads, type MetadataResult } from "./image-metadata";
import { metadataFields, type MetadataField } from "./metadata-fields";

export type FieldInspection = { fields: MetadataField[]; warning: string | null };
export async function inspectMetadataFields(bytes: Uint8Array, scan: MetadataResult): Promise<FieldInspection> {
  if (!scan.blocks.length) return { fields: [], warning: null };
  const parsed: Record<string, unknown> = {};
  let partial = false;
  const payloads = metadataPayloads(bytes);
  try {
    const exifr = await import("exifr");
    const options = { tiff: true, exif: true, gps: true, xmp: true, userComment: true, reviveValues: false, silentErrors: false, chunked: false };
    if (scan.format === "webp") {
      for (const [i, payload] of payloads.entries()) if (payload.category === "EXIF") {
        const data = payload.bytes;
        const tiff = new TextDecoder().decode(data.subarray(0, 6)) === "Exif\0\0" ? data.subarray(6) : data;
        parsed[`EXIF ${i + 1}`] = await exifr.parse(tiff, options) ?? {};
      }
      if (payloads.some(p => p.category === "XMP")) partial = true;
    } else if (scan.blocks.some(b => b.category === "EXIF" || b.category === "XMP")) {
      Object.assign(parsed, await exifr.parse(bytes, options) ?? {});
    }
  } catch { partial = true; }
  for (const [index, payload] of payloads.entries()) {
    if (payload.kind === "tEXt") {
      const separator = payload.bytes.indexOf(0);
      if (separator > 0) parsed[`Text ${index + 1}.${new TextDecoder("latin1").decode(payload.bytes.subarray(0, separator))}`] = new TextDecoder("latin1").decode(payload.bytes.subarray(separator + 1, separator + 501));
      else partial = true;
    }
    if (["iTXt", "zTXt"].includes(payload.kind ?? "")) partial = true;
  }
  const fields = metadataFields(parsed);
  return { fields, warning: partial ? "Some fields could not be decoded. Recognized blocks are still listed below; unreadable does not mean absent." : "The field list is a limited view, not a complete inventory. Unrecognized tags and binary fields may not be shown." };
}
