"use client";

import { Download, ImageIcon, RefreshCw, Upload } from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

const MAX_BYTES = 30 * 1024 * 1024;
const MAX_PIXELS = 30_000_000;
type OutputType = "image/jpeg" | "image/png" | "image/webp";
type LoadedImage = { file: File; bitmap: ImageBitmap; width: number; height: number; source: "browser" | "tga" };

const extensionFor = (type: OutputType) => type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png";

export function ImageConverter() {
  const revision = useRef(0);
  const [preset, setPreset] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [outputType, setOutputType] = useState<OutputType>("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [background, setBackground] = useState("#ffffff");
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);

  useEffect(() => () => image?.bitmap.close(), [image]);
  useEffect(() => () => { revision.current++; }, []);
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !image) return;
    const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image.bitmap, 0, 0, canvas.width, canvas.height);
  }, [image]);

  async function load(file?: File) {
    if (!file) return;
    const request = ++revision.current;
    setImage(null); setBusy(false);
    setError(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
    if (file.size > MAX_BYTES) return setError("Choose an image smaller than 30 MB.");
    const isTga = /\.tga$/i.test(file.name);
    const supported = /^(image\/(jpeg|png|webp|avif))$/.test(file.type) || /\.(jpe?g|png|webp|avif|tga)$/i.test(file.name);
    if (!supported) return setError("Choose a JPG, PNG, WebP, AVIF, or supported TGA image. HEIC is not supported in this release.");
    try {
      let bitmap: ImageBitmap;
      if (isTga) {
        const { decodeTga } = await import("@/lib/tga");
        const decoded = decodeTga(await file.arrayBuffer());
        bitmap = await createImageBitmap(new ImageData(new Uint8ClampedArray(decoded.rgba), decoded.width, decoded.height));
      } else {
        bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      }
      if (request !== revision.current) { bitmap.close(); return; }
      if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > MAX_PIXELS) {
        bitmap.close();
        return setError("Choose an image under 30 megapixels so conversion stays responsive.");
      }
      setImage({ file, bitmap, width: bitmap.width, height: bitmap.height, source: isTga ? "tga" : "browser" });
      if (!preset) setOutputType(file.type === "image/png" ? "image/jpeg" : "image/png");
      trackToolStarted("image-converter");
      trackToolEvent("image-converter", "file_loaded");
    } catch (cause) {
      if (request !== revision.current) return;
      setError(cause instanceof Error ? cause.message : "This browser could not decode the image. AVIF support varies by browser; HEIC is not supported yet.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function convert() {
    if (!image || busy) return;
    const request = ++revision.current;
    setBusy(true); setResult(null);
    setError(null);
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    if (!context) { setBusy(false); return setError("The browser could not create a conversion canvas."); }
    if (outputType === "image/jpeg") {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(image.bitmap, 0, 0);
    canvas.toBlob((blob) => {
      if (request !== revision.current) return;
      setBusy(false);
      if (!blob || blob.type !== outputType) return setError("The browser could not encode this format. Try PNG instead.");
      const stem = image.file.name.replace(/\.[^.]+$/, "") || "converted-image";
      setResult({ blob, name: `${stem}.${extensionFor(outputType)}` });
    }, outputType, outputType === "image/png" ? undefined : quality / 100);
  }

  function download() {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    trackToolEvent("image-converter", "export_completed");
  }

  function reset() {
    revision.current++; setBusy(false);
    setImage(null);
    setResult(null);
    setError(null);
  }

  function drop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDrag(false);
    void load(event.dataTransfer.files[0]);
  }

  function invalidate() { revision.current++; setBusy(false); setResult(null); }

  function webPreset() {
    invalidate(); setError(null); setPreset(true); setOutputType("image/webp"); setQuality(80);
  }

  return <section id="image-converter" className="metadata-shell converter-shell" aria-labelledby="converter-title">
    <div className="generator-heading"><div><span className="section-label">Private format converter</span><h2 id="converter-title">Convert an image in your browser</h2><p>JPG, PNG, WebP, AVIF, or supported TGA input · JPG, PNG, or WebP output</p></div><span className="local-badge">No upload</span></div>
    <div className="icon-actions"><button className="button-secondary" type="button" onClick={webPreset}>Use WebP web preset</button><span role="status">{preset ? "WebP · 80% quality · original dimensions. Choose an image, then convert." : "A starting point for website images; compare the result before publishing."}</span></div>
    <input id="image-converter-input" ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif,.avif,.tga,application/x-tga,image/x-tga" onChange={(event) => void load(event.target.files?.[0])}/>
    {!image ? <label htmlFor="image-converter-input" className={`metadata-dropzone${drag ? " drag-active" : ""}`} onDragOver={(event) => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={drop}><Upload size={31}/><strong>Drop an image here or click to browse</strong><span>JPG, PNG, WebP, AVIF, TGA · up to 30 MB</span></label> : <>
      <div className="converter-workspace">
        <div className="converter-preview"><canvas ref={previewRef}/><p><ImageIcon size={16}/>{image.file.name} · {image.width} × {image.height}px · {(image.file.size / 1024).toFixed(1)} KB</p></div>
        <div className="converter-controls">
          <label>Output format<select value={outputType} onChange={(event) => { invalidate(); setPreset(false); setOutputType(event.target.value as OutputType); }}><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>
          {outputType !== "image/png" && <label>Quality <output>{quality}%</output><input type="range" min="40" max="100" value={quality} onChange={(event) => { invalidate(); setPreset(false); setQuality(Number(event.target.value)); }}/></label>}
          {outputType === "image/jpeg" && <label>Transparency background<input type="color" value={background} onChange={(event) => { invalidate(); setBackground(event.target.value); }}/></label>}
          <p>Conversion keeps the original pixel dimensions. JPG cannot preserve transparency, so transparent pixels use the selected background color.</p>
          <button className="button-primary" type="button" disabled={busy} onClick={convert}>{busy ? "Converting…" : "Convert image"}</button>
          <button className="button-secondary" type="button" onClick={reset}><RefreshCw size={16}/>Choose another</button>
        </div>
      </div>
      {result && <div className="metadata-result"><div><strong>{result.name}</strong><span>{(image.file.size / 1024).toFixed(1)} KB → {(result.blob.size / 1024).toFixed(1)} KB</span><span>{image.width} × {image.height}px</span></div><button className="button-primary" type="button" onClick={download}><Download size={18}/>Download converted image</button></div>}
    </>}
    {error && <p className="tool-error" role="alert">{error}</p>}
    <p className="converter-heic-note"><strong>HEIC is not supported yet.</strong> BriefVu will only list HEIC after decoding and output have been verified across supported browsers.</p>
  </section>;
}
