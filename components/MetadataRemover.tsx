"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { scanMetadata, stripMetadata, type MetadataResult } from "@/lib/image-metadata";
import { inspectMetadataFields, type FieldInspection } from "@/lib/metadata-inspection";
import { BATCH_LIMITS, batchError, cleanedFilename, METADATA_GROUPS } from "@/lib/metadata-fields";
import { iconZip } from "@/lib/image-icons";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

type Item = { id: number; file: File; status: "waiting" | "inspecting" | "ready" | "cleaning" | "done" | "error"; before?: MetadataResult; fields?: FieldInspection; output?: Blob; after?: MetadataResult; afterFields?: FieldInspection; error?: string };
const bytesLabel = (size: number) => `${size.toLocaleString()} bytes (${(size / 1024).toFixed(1)} KB)`;
const mime = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
async function verifyImage(blob: Blob) {
  const image = await createImageBitmap(blob);
  try { if (!image.width || !image.height || image.width * image.height > 40_000_000 || Math.max(image.width, image.height) > 16384) throw new Error("Use an image under 40 megapixels and 16,384px per side."); }
  finally { image.close(); }
}
function FieldGroups({ inspection }: { inspection?: FieldInspection }) {
  if (!inspection) return null;
  return <><p>{inspection.warning ?? "No readable fields were detected by this viewer."}</p>{METADATA_GROUPS.map(group => {
    const fields = inspection.fields.filter(f => f.group === group);
    return fields.length ? <section className={`metadata-field-group${group === "Location" ? " metadata-location" : ""}`} key={group}>
      <h4>{group}{group === "Location" ? " — sensitive location data detected" : ""}</h4>
      <dl>{fields.map((field, i) => <div key={`${field.label}-${i}`}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}</dl>
    </section> : null;
  })}</>;
}
export function MetadataRemover() {
  const input = useRef<HTMLInputElement>(null), revision = useRef(0);
  const [items, setItems] = useState<Item[]>([]), [busy, setBusy] = useState(false), [packing, setPacking] = useState(false), [error, setError] = useState(""), [status, setStatus] = useState("");
  useEffect(() => () => { revision.current++; }, []);
  const update = (id: number, patch: Partial<Item>) => setItems(current => current.map(item => item.id === id ? { ...item, ...patch } : item));
  async function load(files: File[]) {
    if (!files.length) return;
    const request = ++revision.current;
    setItems([]); setBusy(false); setPacking(false); setError(""); setStatus("");
    if (input.current) input.current.value = "";
    const invalidBatch = batchError(files);
    if (invalidBatch) { setError(invalidBatch); return; }
    setItems(files.map((file, id) => ({ file, id, status: "waiting" }))); setBusy(true);
    trackToolStarted("remove-metadata");
    for (const [id, file] of files.entries()) {
      if (request !== revision.current) return;
      update(id, { status: "inspecting" });
      try {
        if (file.size > BATCH_LIMITS.fileBytes) throw new Error("This file exceeds the 30 MB limit.");
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (request !== revision.current) return;
        const scan = scanMetadata(bytes);
        if (!scan) throw new Error("Unsupported format. Choose JPG, PNG, or WebP; HEIC is not supported.");
        await verifyImage(new Blob([bytes], { type: mime[scan.format] }));
        if (request !== revision.current) return;
        const fields = await inspectMetadataFields(bytes, scan);
        if (request !== revision.current) return;
        update(id, { status: "ready", before: scan, fields }); trackToolEvent("remove-metadata", "file_loaded");
      } catch (cause) {
        if (request !== revision.current) return;
        update(id, { status: "error", error: cause instanceof Error && cause.name !== "InvalidStateError" ? cause.message : "This image could not be decoded safely." });
      }
    }
    if (request === revision.current) { setBusy(false); setStatus("Inspection finished. Review each file before cleaning."); }
  }
  async function clean() {
    if (busy) return;
    const request = ++revision.current; setBusy(true); setStatus(""); setError("");
    for (const item of items.filter(i => i.status === "ready")) {
      if (request !== revision.current) return;
      update(item.id, { status: "cleaning" });
      try {
        const bytes = new Uint8Array(await item.file.arrayBuffer());
        if (request !== revision.current) return;
        const outputBytes = stripMetadata(bytes);
        const after = scanMetadata(outputBytes);
        if (!after || after.blocks.length) throw new Error("Recognized metadata remains. No download was enabled.");
        const afterFields = await inspectMetadataFields(outputBytes, after);
        const output = new Blob([outputBytes], { type: mime[after.format] });
        await verifyImage(output);
        if (request !== revision.current) return;
        update(item.id, { status: "done", after, afterFields, output });
      } catch (cause) {
        if (request !== revision.current) return;
        update(item.id, { status: "error", error: cause instanceof Error && cause.name !== "InvalidStateError" ? cause.message : "Output decoding failed. No download was enabled." });
      }
    }
    if (request === revision.current) { setBusy(false); setStatus("Cleaning finished. Only verified outputs are available to download."); }
  }
  function save(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); trackToolEvent("remove-metadata", "export_completed");
  }
  async function downloadZip() {
    if (packing || busy) return;
    const request = revision.current; setPacking(true); setError("");
    try {
      const files = [];
      for (const item of items.filter(i => i.status === "done" && i.output && i.after)) {
        const bytes = new Uint8Array(await item.output!.arrayBuffer());
        if (request !== revision.current) return;
        files.push({ name: cleanedFilename(item.id, item.after!.format), bytes });
      }
      if (!files.length) return;
      save(new Blob([iconZip(files)], { type: "application/zip" }), "cleaned-images.zip"); setStatus(`Downloaded ${files.length} verified image(s) in a ZIP. Failed files are excluded.`);
    } catch { if (request === revision.current) setError("Could not package this batch. Download the verified images individually instead."); }
    finally { if (request === revision.current) setPacking(false); }
  }
  function clear() { revision.current++; setItems([]); setBusy(false); setPacking(false); setError(""); setStatus(""); }
  function drop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); void load(Array.from(event.dataTransfer.files)); }
  const ready = items.filter(i => i.status === "ready").length, done = items.filter(i => i.status === "done").length, failed = items.filter(i => i.status === "error").length;
  return <section className="metadata-shell metadata-batch" aria-labelledby="metadata-tool-title">
    <div className="generator-heading"><div><span className="section-label">Private image cleaner</span><h2 id="metadata-tool-title">Inspect first, then remove</h2><p>Review location, device, time, author, and software fields before cleaning.</p></div><span className="local-badge">No upload</span></div>
    <input ref={input} className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" aria-label="Photos to inspect" onChange={e => void load(Array.from(e.target.files ?? []))} />
    <div className="icon-drop" onDragOver={e => e.preventDefault()} onDrop={drop}><button className="button-secondary" onClick={() => input.current?.click()}>{items.length ? "Choose a new batch" : "Choose images"}</button><span>or drop images here · JPG, PNG, WebP · 20 files maximum · 30 MB each / 100 MB total</span></div>
    <p className="metadata-scope">Cleaning removes all recognized EXIF, XMP, C2PA, text, and ICC blocks. Removing orientation or color profiles may change how an image displays. Embedded provenance is removed too. Original files are not overwritten.</p>
    {items.length > 0 && <><div className="metadata-batch-actions"><button className="button-primary" disabled={busy || !ready} onClick={() => void clean()}>{busy ? "Processing…" : ready ? `Clean ${ready} ready image${ready === 1 ? "" : "s"}` : done ? "Cleaning complete" : "No images ready"}</button><button className="button-secondary" disabled={busy || packing || !done} onClick={() => void downloadZip()}>{packing ? "Preparing ZIP…" : `Download verified ZIP (${done})`}</button><button className="button-secondary" onClick={clear}>Clear batch</button></div><p>{items.length} selected · {ready} ready · {done} verified · {failed} failed</p></>}
    <p role="status" aria-live="polite">{status}</p>{error && <p className="tool-error" role="alert">{error}</p>}
    <div className="metadata-batch-list">{items.map(item => <article className="metadata-batch-item" key={item.id}>
      <header><h3>{item.file.name}</h3><span>{item.status}</span></header><p>{bytesLabel(item.file.size)}</p>
      {item.error && <p className="tool-error" role="alert">{item.error}</p>}
      {item.before && <>
        <div className="metadata-summary"><span>Recognized blocks (original → cleaned output): <strong>{item.before.blocks.length}{item.after ? ` → ${item.after.blocks.length}` : ""}</strong></span><span>File size (original → cleaned output): <strong>{item.output ? `${item.file.size.toLocaleString()} → ${item.output.size.toLocaleString()} bytes` : "Not cleaned yet"}</strong></span></div>
        {item.fields?.fields.some(f => f.group === "Location") && <p className="metadata-location-alert">{item.output ? "Original image contained location fields. The original is unchanged; see the cleaned output scan below." : "Original image contains location fields. Clean it and review the output scan before sharing."}</p>}
        {item.output && <><p className="verified">Cleaned output re-scanned: zero recognized blocks remain. Image decoding passed; compressed image data was not re-encoded.</p><p>{item.file.size === item.output.size ? "No size change: no recognized blocks needed removal." : `${(item.file.size - item.output.size).toLocaleString()} bytes removed.`} A smaller file alone does not prove privacy. Unknown blocks and visible image content are outside this check.</p><button className="button-primary" onClick={() => save(item.output!, cleanedFilename(item.id, item.after!.format))}>Download {cleanedFilename(item.id, item.after!.format)}</button></>}
        <details className="metadata-inspection" open={items.length === 1 || undefined}><summary>Inspect fields and before / after details</summary><div className="metadata-before-after"><section><h4>Original image — before cleaning</h4><FieldGroups inspection={item.fields} /><h4>Recognized container blocks</h4>{item.before.blocks.length ? <ul>{item.before.blocks.map((b,i) => <li key={i}>{b.category}: {b.label} — {b.bytes.toLocaleString()} bytes</li>)}</ul> : <p>No recognized blocks found. This does not establish that the image contains no identifying information.</p>}</section><section><h4>Cleaned output — after cleaning</h4>{item.after ? <><p>{item.after.blocks.length} recognized blocks; {item.afterFields?.fields.length ?? 0} readable fields in the recognized blocks.</p><FieldGroups inspection={item.afterFields} /><p>Download name: {cleanedFilename(item.id, item.after.format)}. Generic names avoid carrying the original filename into the download.</p></> : <p>Clean the image to compare the output scan. Unreadable fields are not treated as absent.</p>}</section></div></details>
      </>}
    </article>)}</div>
    <p>Field values stay on this device. The viewer limits long values and may omit unsupported or binary tags. No map links or metadata reports are sent to external services.</p>
  </section>;
}
