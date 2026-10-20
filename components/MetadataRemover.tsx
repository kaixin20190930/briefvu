"use client";

import { CheckCircle2, Download, FileImage, ShieldCheck, Upload } from "lucide-react";
import { useState, type DragEvent } from "react";
import { scanMetadata, stripMetadata, type MetadataBlock } from "@/lib/image-metadata";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

const MAX_BYTES = 30 * 1024 * 1024;
type State = { file: File; before: MetadataBlock[]; details: { label: string; value: string }[]; output?: Blob; after?: MetadataBlock[] };

export function MetadataRemover() {
  const [state, setState] = useState<State | null>(null); const [error, setError] = useState<string | null>(null); const [drag, setDrag] = useState(false);
  async function load(file?: File) {
    if (!file) return; setError(null);
    if (file.size > MAX_BYTES) return setError("Choose an image smaller than 30 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer()); const scan = scanMetadata(bytes);
    if (!scan) return setError("This first release supports JPG, PNG, and WebP. HEIC support is still being validated.");
    let parsed: Record<string, unknown> = {}; try { const exifr = await import("exifr"); parsed = await exifr.parse(file, { tiff: true, exif: true, gps: true, xmp: true }) ?? {}; } catch { parsed = {}; }
    const readable = (value: unknown) => value instanceof Date ? value.toLocaleString() : typeof value === "string" || typeof value === "number" ? String(value) : "";
    const fields: [string, string][] = [["Camera make", "Make"], ["Camera model", "Model"], ["Date taken", "DateTimeOriginal"], ["Software", "Software"], ["Artist", "Artist"], ["Copyright", "Copyright"], ["GPS latitude", "latitude"], ["GPS longitude", "longitude"]];
    const details = fields.map(([label, key]) => ({ label, value: readable(parsed[key]) })).filter((item) => item.value);
    setState({ file, before: scan.blocks, details }); trackToolStarted("remove-metadata"); trackToolEvent("remove-metadata", "file_loaded");
  }
  async function clean() {
    if (!state) return;
    try { const outputBytes = stripMetadata(new Uint8Array(await state.file.arrayBuffer())); const after = scanMetadata(outputBytes)?.blocks ?? []; setState({ ...state, output: new Blob([Uint8Array.from(outputBytes).buffer], { type: state.file.type || "application/octet-stream" }), after }); } catch { setError("This image could not be cleaned safely."); }
  }
  function download() { if (!state?.output) return; const url = URL.createObjectURL(state.output); const link = document.createElement("a"); const dot = state.file.name.lastIndexOf("."); link.href = url; link.download = `${dot > 0 ? state.file.name.slice(0, dot) : state.file.name}-clean${dot > 0 ? state.file.name.slice(dot) : ""}`; link.click(); URL.revokeObjectURL(url); trackToolEvent("remove-metadata", "export_completed"); }
  function drop(event: DragEvent<HTMLLabelElement>) { event.preventDefault(); setDrag(false); void load(event.dataTransfer.files[0]); }
  const removed = state?.before.length ?? 0; const verified = state?.after?.length === 0;
  return <section className="metadata-shell" aria-labelledby="metadata-tool-title">
    <div className="generator-heading"><div><span className="section-label">Private image cleaner</span><h2 id="metadata-tool-title">Inspect first, then remove</h2><p>See recognized privacy metadata before creating a cleaned copy.</p></div><span className="local-badge"><ShieldCheck size={14} />No upload</span></div>
    {!state && <label className={`metadata-dropzone${drag ? " drag-active" : ""}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={drop}><Upload size={31} /><strong>Drop an image here or click to browse</strong><span>JPG, PNG, or WebP · up to 30 MB</span><input accept="image/jpeg,image/png,image/webp" onChange={(e) => void load(e.target.files?.[0])} type="file" /></label>}
    {error && <p className="tool-error">{error}</p>}
    {state && <><div className="metadata-file"><FileImage size={22} /><div><strong>{state.file.name}</strong><span>{(state.file.size / 1024).toFixed(1)} KB · {removed} recognized metadata block{removed === 1 ? "" : "s"}</span></div><button className="button-secondary" onClick={() => setState(null)} type="button">Choose another</button></div>
      <div className="metadata-compare"><article><h3>Before</h3>{state.details.map((item) => <div className="metadata-detail" key={item.label}><span>EXIF</span><strong>{item.label}</strong><small>{item.value}</small></div>)}{state.before.length ? state.before.map((block, index) => <div key={`${block.label}-${index}`}><span>{block.category}</span><strong>{block.label}</strong><small>{block.bytes.toLocaleString()} bytes</small></div>) : !state.details.length && <p>No recognized EXIF, XMP, C2PA, text, or ICC blocks were found.</p>}</article><article><h3>After</h3>{state.output ? (verified ? <p className="verified"><CheckCircle2 size={20} />Verified — output re-scanned with zero recognized metadata blocks remaining.</p> : state.after?.map((block, index) => <div key={`${block.label}-${index}`}><span>{block.category}</span><strong>{block.label}</strong></div>)) : <p>Create a cleaned copy to see the verification result.</p>}</article></div>
      {!state.output ? <button className="copy-primary" onClick={() => void clean()} type="button">Remove recognized metadata</button> : <div className="metadata-result"><div><strong>Removed {removed} metadata block{removed === 1 ? "" : "s"}</strong><span>Compressed image data was preserved; no canvas re-encoding was used.</span><span>{(state.file.size / 1024).toFixed(1)} KB → {(state.output.size / 1024).toFixed(1)} KB</span></div><button className="button-primary" onClick={download} type="button"><Download size={18} />Download cleaned image</button></div>}
    </>}
  </section>;
}
