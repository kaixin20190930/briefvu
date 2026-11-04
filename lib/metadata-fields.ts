export const METADATA_GROUPS = ["Location", "Device", "Time", "Author", "Software", "Other"] as const;
export type MetadataGroup = (typeof METADATA_GROUPS)[number];
export type MetadataField = { label: string; value: string; group: MetadataGroup };
export function metadataFields(parsed: Record<string, unknown>): MetadataField[] {
  const fields: MetadataField[] = [];
  function visit(value: unknown, path: string, depth: number) {
    if (fields.length >= 100 || depth > 3 || value === null || value === undefined) return;
    if (typeof value === "object" && !(value instanceof Date) && !Array.isArray(value) && !ArrayBuffer.isView(value)) {
      for (const [key, item] of Object.entries(value)) visit(item, path ? `${path}.${key}` : key, depth + 1);
      return;
    }
    let readable = "";
    if (value instanceof Date) readable = Number.isFinite(value.getTime()) ? value.toISOString() : "Invalid date";
    else if (["string", "number", "boolean"].includes(typeof value)) readable = String(value);
    else if (Array.isArray(value) && value.every(x => typeof x === "number" || typeof x === "string")) readable = value.slice(0, 20).join(", ");
    if (!readable) return;
    const group: MetadataGroup = /gps|latitude|longitude|location|city|country|province|sublocation/i.test(path) ? "Location" : /serial|make|model|lens|camera|ownername/i.test(path) ? "Device" : /date|time|offsettime/i.test(path) ? "Time" : /software|processing|history|toolkit|creatortool/i.test(path) ? "Software" : /artist|author|creator|copyright|rights|credit|byline/i.test(path) ? "Author" : "Other";
    fields.push({ label: path, value: readable.slice(0, 500), group });
  }
  visit(parsed, "", 0);
  return fields;
}
export function cleanedFilename(index: number, format: "jpeg" | "png" | "webp") { return `image-${String(index + 1).padStart(3, "0")}-clean.${format === "jpeg" ? "jpg" : format}`; }
export const BATCH_LIMITS = { files: 20, fileBytes: 30 * 1024 * 1024, totalBytes: 100 * 1024 * 1024 };
export function batchError(files: { size: number }[]): string | null {
  if (files.length > BATCH_LIMITS.files) return "Choose no more than 20 images per batch.";
  if (files.reduce((sum, f) => sum + f.size, 0) > BATCH_LIMITS.totalBytes) return "Keep the total batch size at or below 100 MB.";
  return null;
}
