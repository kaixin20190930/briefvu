"use client";

import { Download, Upload } from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { encodeToTarget } from "@/lib/image-target";
import { iconZip } from "@/lib/image-icons";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

type Mode = "resize" | "compress";
type OutputType = "image/jpeg" | "image/png" | "image/webp";
type LoadedImage = { file: File; bitmap: ImageBitmap; width: number; height: number };
type OutputResult = { blob: Blob; name: string; originalSize: number; quality: number | null; reached: boolean | null; width: number; height: number };
const MAX_BYTES = 30 * 1024 * 1024;
const MAX_PIXELS = 30_000_000;
const MAX_BATCH_FILES = 10;
const MAX_BATCH_BYTES = 100 * 1024 * 1024;

const extensionFor = (type: OutputType) => type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png";
const safeStem = (name: string, index: number) => name.replace(/\.[^.]+$/, "").normalize("NFKD").replace(/[^a-zA-Z0-9.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 55) || `image-${index + 1}`;

function canvasBlob(canvas: HTMLCanvasElement, type: OutputType, quality?: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => {
    if (!blob) return reject(new Error("The browser could not encode this output."));
    if (blob.type !== type) return reject(new Error("The browser did not support the selected output format. Try PNG instead."));
    resolve(blob);
  }, type, quality));
}

export function ImageOutputTool({ mode }: { mode: Mode }) {
  const revision = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [locked, setLocked] = useState(true);
  const [outputType, setOutputType] = useState<OutputType>(mode === "compress" ? "image/webp" : "image/png");
  const [quality, setQuality] = useState(mode === "compress" ? 75 : 90);
  const [targetMode, setTargetMode] = useState(false);
  const [targetKb, setTargetKb] = useState(100);
  const [background, setBackground] = useState("#ffffff");
  const [results, setResults] = useState<OutputResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => () => image?.bitmap.close(), [image]);
  useEffect(() => () => { revision.current++; }, []);
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !image) return;
    const scale = Math.min(1, 1000 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    context?.clearRect(0, 0, canvas.width, canvas.height);
    context?.drawImage(image.bitmap, 0, 0, canvas.width, canvas.height);
  }, [image]);

  async function open(file: File) {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > MAX_PIXELS) {
      bitmap.close(); throw new Error("Choose images under 30 megapixels.");
    }
    return bitmap;
  }

  async function load(selected?: FileList | File[]) {
    const next = selected ? Array.from(selected) : [];
    if (!next.length) return;
    const request = ++revision.current;
    setBusy(true); setError(null); setResults([]);
    try {
      if (mode === "resize" && next.length > 1) next.splice(1);
      if (next.length > MAX_BATCH_FILES) throw new Error(`Choose no more than ${MAX_BATCH_FILES} images at a time.`);
      if (next.reduce((sum, file) => sum + file.size, 0) > MAX_BATCH_BYTES) throw new Error("Choose a batch smaller than 100 MB in total.");
      for (const file of next) {
        if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than 30 MB.`);
        if (!/^(image\/(jpeg|png|webp))$/.test(file.type)) throw new Error(`${file.name} is not a JPG, PNG, or WebP image.`);
      }
      const bitmap = await open(next[0]);
      if (request !== revision.current) { bitmap.close(); return; }
      setImage({ file: next[0], bitmap, width: bitmap.width, height: bitmap.height });
      setFiles(next); setWidth(bitmap.width); setHeight(bitmap.height);
      setOutputType(mode === "compress" ? (next[0].type === "image/jpeg" ? "image/jpeg" : "image/webp") : (next[0].type as OutputType));
      const tool = mode === "resize" ? "resize-image" : "compress-image";
      trackToolStarted(tool); trackToolEvent(tool, "file_loaded");
    } catch (cause) {
      if (request === revision.current) setError(cause instanceof Error ? cause.message : "The image could not be opened.");
    } finally {
      if (request === revision.current) { setBusy(false); if (inputRef.current) inputRef.current.value = ""; }
    }
  }

  function invalidate() { revision.current++; setBusy(false); setResults([]); setError(null); }
  function updateWidth(next: number) { if (!image) return; const safe = Math.max(1, Math.min(12000, Math.round(next || 1))); setWidth(safe); if (locked) setHeight(Math.max(1, Math.round(safe * image.height / image.width))); invalidate(); }
  function updateHeight(next: number) { if (!image) return; const safe = Math.max(1, Math.min(12000, Math.round(next || 1))); setHeight(safe); if (locked) setWidth(Math.max(1, Math.round(safe * image.width / image.height))); invalidate(); }
  function applyScale(scale: number) { if (!image) return; setWidth(Math.max(1, Math.round(image.width * scale))); setHeight(Math.max(1, Math.round(image.height * scale))); invalidate(); }

  async function createResult(file: File, bitmap: ImageBitmap, index: number): Promise<OutputResult> {
    const targetWidth = mode === "resize" ? width : bitmap.width;
    const targetHeight = mode === "resize" ? height : bitmap.height;
    if (targetWidth * targetHeight > 50_000_000) throw new Error("Choose output dimensions under 50 megapixels.");
    const canvas = document.createElement("canvas"); canvas.width = targetWidth; canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("The browser could not create the output canvas.");
    context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high";
    if (outputType === "image/jpeg") { context.fillStyle = background; context.fillRect(0, 0, targetWidth, targetHeight); }
    context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    let blob: Blob, finalQuality: number | null = outputType === "image/png" ? null : quality / 100, reached: boolean | null = null;
    if (mode === "compress" && targetMode) {
      if (outputType === "image/png") throw new Error("Target size mode needs JPG or WebP. PNG quality cannot be reduced with the browser encoder.");
      const target = await encodeToTarget(candidate => canvasBlob(canvas, outputType, candidate), targetKb * 1000);
      blob = target.blob; finalQuality = target.quality; reached = target.reached;
    } else {
      blob = await canvasBlob(canvas, outputType, outputType === "image/png" ? undefined : quality / 100);
    }
    const suffix = mode === "resize" ? "resized" : "compressed";
    return { blob, name: `${safeStem(file.name, index)}-${suffix}.${extensionFor(outputType)}`, originalSize: file.size, quality: finalQuality, reached, width: targetWidth, height: targetHeight };
  }

  async function process() {
    if (!image || busy) return;
    const request = ++revision.current;
    setBusy(true); setError(null); setResults([]);
    const output: OutputResult[] = [];
    try {
      for (let index = 0; index < files.length; index++) {
        if (request !== revision.current) return;
        let bitmap: ImageBitmap | null = null;
        try {
          bitmap = files.length === 1 ? image.bitmap : await open(files[index]);
          output.push(await createResult(files[index], bitmap, index));
        } catch (cause) {
          if (files.length === 1) throw cause;
          setError(current => `${current ? `${current} ` : ""}${files[index].name}: ${cause instanceof Error ? cause.message : "failed"}`);
        } finally {
          if (files.length > 1) bitmap?.close();
        }
      }
      if (request === revision.current) setResults(output);
    } catch (cause) {
      if (request === revision.current) setError(cause instanceof Error ? cause.message : "The browser could not create the output.");
    } finally { if (request === revision.current) setBusy(false); }
  }

  function download(result: OutputResult) {
    const url = URL.createObjectURL(result.blob); const link = document.createElement("a"); link.href = url; link.download = result.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    trackToolEvent(mode === "resize" ? "resize-image" : "compress-image", "export_completed");
  }

  async function downloadZip() {
    if (results.length < 2 || busy) return;
    setBusy(true); setError(null);
    try {
      const packed = iconZip(await Promise.all(results.map(async result => ({ name: result.name, bytes: new Uint8Array(await result.blob.arrayBuffer()) }))));
      const url = URL.createObjectURL(new Blob([packed], { type: "application/zip" })); const link = document.createElement("a"); link.href = url; link.download = "briefvu-compressed-images.zip"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      trackToolEvent("compress-image", "export_completed");
    } catch { setError("The browser could not create the ZIP. Download the completed images individually."); }
    finally { setBusy(false); }
  }

  function drop(event: DragEvent<HTMLLabelElement>) { event.preventDefault(); setDrag(false); void load(event.dataTransfer.files); }
  function reset() { revision.current++; setImage(null); setFiles([]); setResults([]); setBusy(false); setError(null); }

  return <section className="metadata-shell converter-shell" aria-labelledby={`${mode}-tool-title`}>
    <div className="generator-heading"><div><span className="section-label">Private image output</span><h2 id={`${mode}-tool-title`}>{mode === "resize" ? "Resize an image by pixels or percentage" : "Compress images by quality or target size"}</h2><p>JPG, PNG, or WebP · up to 30 MB each{mode === "compress" ? " · up to 10 files" : ""}</p></div><span className="local-badge">No upload</span></div>
    <input id={`${mode}-image-input`} ref={inputRef} className="sr-only" type="file" multiple={mode === "compress"} accept="image/jpeg,image/png,image/webp" onChange={event => void load(event.target.files ?? undefined)}/>
    {!image ? <label htmlFor={`${mode}-image-input`} className={`metadata-dropzone${drag ? " drag-active" : ""}`} onDragOver={event => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={drop}><Upload size={31}/><strong>{busy ? "Opening images…" : `Drop ${mode === "compress" ? "images" : "an image"} here or click to browse`}</strong><span>JPG, PNG, WebP · processed locally</span></label> : <>
      <div className="converter-workspace"><div className="converter-preview"><canvas ref={previewRef}/><p>{image.file.name} · {image.width} × {image.height}px · {(image.file.size / 1000).toFixed(1)} KB{files.length > 1 ? ` · ${files.length} files selected` : ""}</p></div><div className="converter-controls">
        {mode === "resize" && <><div className="resize-dimensions"><label>Width<input type="number" min="1" max="12000" value={width} onChange={event => updateWidth(Number(event.target.value))}/></label><label>Height<input type="number" min="1" max="12000" value={height} onChange={event => updateHeight(Number(event.target.value))}/></label></div><label className="checkbox-row"><input type="checkbox" checked={locked} onChange={event => setLocked(event.target.checked)}/>Lock aspect ratio</label><div className="resize-presets"><button type="button" onClick={() => applyScale(.5)}>50%</button><button type="button" onClick={() => applyScale(.75)}>75%</button><button type="button" onClick={() => applyScale(1)}>Original</button><button type="button" onClick={() => { if (!image) return; applyScale(Math.min(1, 1920 / Math.max(image.width, image.height))); }}>Max 1920px</button></div></>}
        <label>Output format<select value={outputType} onChange={event => { invalidate(); setOutputType(event.target.value as OutputType); }}><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>
        {mode === "compress" && <div className="resize-presets"><button type="button" aria-pressed={!targetMode} onClick={() => { invalidate(); setTargetMode(false); }}>Quality</button><button type="button" aria-pressed={targetMode} onClick={() => { invalidate(); setTargetMode(true); }}>Target KB</button></div>}
        {outputType !== "image/png" && (!targetMode || mode === "resize") && <label>Quality <output>{quality}%</output><input type="range" min="35" max="100" value={quality} onChange={event => { invalidate(); setQuality(Number(event.target.value)); }}/></label>}
        {mode === "compress" && targetMode && <><label>Maximum file size (KB)<input type="number" min="1" max="5000" value={targetKb} onChange={event => { invalidate(); setTargetKb(Math.max(1, Math.min(5000, Number(event.target.value) || 1))); }}/></label><div className="resize-presets">{[20,50,100,200].map(value => <button type="button" key={value} onClick={() => { invalidate(); setTargetKb(value); }}>{value} KB</button>)}</div></>}
        {outputType === "image/jpeg" && <label>Transparency background<input type="color" value={background} onChange={event => { invalidate(); setBackground(event.target.value); }}/></label>}
        {mode === "compress" && <p>{targetMode ? outputType === "image/png" ? "PNG target mode is unavailable because browser PNG export has no quality control. Choose JPG or WebP." : `BriefVu tries up to 8 actual encodes and keeps the highest tested quality at or below ${targetKb} KB. Dimensions stay unchanged.` : "JPG and WebP use the selected quality. PNG is lossless and may not reduce file size."}</p>}
        <button className="button-primary" type="button" disabled={busy} onClick={process}>{busy ? "Processing…" : mode === "resize" ? "Create resized image" : files.length > 1 ? `Compress ${files.length} images` : "Compress image"}</button><button className="button-secondary" type="button" onClick={reset}>{busy ? "Cancel and choose another" : "Choose another"}</button>
      </div></div>
      {results.length > 0 && <div className="batch-results">{results.map(result => <div className="metadata-result" key={result.name}><div><strong>{result.name}</strong><span>{(result.originalSize / 1000).toFixed(1)} KB → {(result.blob.size / 1000).toFixed(1)} KB</span><span>{result.width} × {result.height}px{result.quality !== null ? ` · ${Math.round(result.quality * 100)}% quality` : ""}</span>{result.reached === false && <span className="tool-error">Target not reached. This was the smallest tested result without resizing.</span>}{result.reached === true && <span>Target reached</span>}</div><button className="button-primary" type="button" onClick={() => download(result)}><Download size={18}/>Download</button></div>)}{results.length > 1 && <button className="button-primary" disabled={busy} type="button" onClick={() => void downloadZip()}><Download size={18}/>Download ZIP</button>}</div>}
    </>}
    {error && <p className="tool-error" role="alert">{error}</p>}
  </section>;
}
