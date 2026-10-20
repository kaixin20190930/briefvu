"use client";

import { Download, Upload } from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

type Mode = "resize" | "compress";
type OutputType = "image/jpeg" | "image/png" | "image/webp";
type LoadedImage = { file: File; bitmap: ImageBitmap; width: number; height: number };
const MAX_BYTES = 30 * 1024 * 1024;
const MAX_PIXELS = 30_000_000;

const extensionFor = (type: OutputType) => type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png";

export function ImageOutputTool({ mode }: { mode: Mode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [locked, setLocked] = useState(true);
  const [outputType, setOutputType] = useState<OutputType>(mode === "compress" ? "image/webp" : "image/png");
  const [quality, setQuality] = useState(mode === "compress" ? 75 : 90);
  const [background, setBackground] = useState("#ffffff");
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => () => image?.bitmap.close(), [image]);
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !image) return;
    const scale = Math.min(1, 1000 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    context?.drawImage(image.bitmap, 0, 0, canvas.width, canvas.height);
  }, [image]);

  async function load(file?: File) {
    if (!file) return;
    setError(null);
    setResult(null);
    if (file.size > MAX_BYTES) return setError("Choose an image smaller than 30 MB.");
    if (!/^(image\/(jpeg|png|webp))$/.test(file.type)) return setError("Choose a JPG, PNG, or WebP image. Convert other formats first.");
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > MAX_PIXELS) {
        bitmap.close();
        return setError("Choose an image under 30 megapixels.");
      }
      setImage((current) => { current?.bitmap.close(); return { file, bitmap, width: bitmap.width, height: bitmap.height }; });
      setWidth(bitmap.width);
      setHeight(bitmap.height);
      setOutputType(mode === "compress" ? (file.type === "image/jpeg" ? "image/jpeg" : "image/webp") : (file.type as OutputType));
      const tool = mode === "resize" ? "resize-image" : "compress-image";
      trackToolStarted(tool);
      trackToolEvent(tool, "file_loaded");
    } catch {
      setError("This browser could not decode the image. Convert it to JPG, PNG, or WebP first.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function updateWidth(next: number) {
    if (!image) return;
    const safe = Math.max(1, Math.min(12000, Math.round(next || 1)));
    setWidth(safe);
    if (locked) setHeight(Math.max(1, Math.round(safe * image.height / image.width)));
    setResult(null);
  }

  function updateHeight(next: number) {
    if (!image) return;
    const safe = Math.max(1, Math.min(12000, Math.round(next || 1)));
    setHeight(safe);
    if (locked) setWidth(Math.max(1, Math.round(safe * image.width / image.height)));
    setResult(null);
  }

  function applyScale(scale: number) {
    if (!image) return;
    setWidth(Math.max(1, Math.round(image.width * scale)));
    setHeight(Math.max(1, Math.round(image.height * scale)));
    setResult(null);
  }

  function process() {
    if (!image) return;
    const targetWidth = mode === "resize" ? width : image.width;
    const targetHeight = mode === "resize" ? height : image.height;
    if (targetWidth * targetHeight > 50_000_000) return setError("Choose output dimensions under 50 megapixels.");
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    if (!context) return setError("The browser could not create the output canvas.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    if (outputType === "image/jpeg") {
      context.fillStyle = background;
      context.fillRect(0, 0, targetWidth, targetHeight);
    }
    context.drawImage(image.bitmap, 0, 0, targetWidth, targetHeight);
    canvas.toBlob((blob) => {
      if (!blob) return setError("The browser could not encode this output. Try PNG instead.");
      const stem = image.file.name.replace(/\.[^.]+$/, "") || "image";
      const suffix = mode === "resize" ? "resized" : "compressed";
      setResult({ blob, name: `${stem}-${suffix}.${extensionFor(outputType)}` });
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
    trackToolEvent(mode === "resize" ? "resize-image" : "compress-image", "export_completed");
  }

  function drop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDrag(false);
    void load(event.dataTransfer.files[0]);
  }

  return <section className="metadata-shell converter-shell" aria-labelledby={`${mode}-tool-title`}>
    <div className="generator-heading"><div><span className="section-label">Private image output</span><h2 id={`${mode}-tool-title`}>{mode === "resize" ? "Resize an image by pixels or percentage" : "Compress a JPG or WebP image"}</h2><p>JPG, PNG, or WebP · up to 30 MB and 30 megapixels</p></div><span className="local-badge">No upload</span></div>
    <input id={`${mode}-image-input`} ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void load(event.target.files?.[0])}/>
    {!image ? <label htmlFor={`${mode}-image-input`} className={`metadata-dropzone${drag ? " drag-active" : ""}`} onDragOver={(event) => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={drop}><Upload size={31}/><strong>Drop an image here or click to browse</strong><span>JPG, PNG, WebP · processed locally</span></label> : <>
      <div className="converter-workspace"><div className="converter-preview"><canvas ref={previewRef}/><p>{image.file.name} · {image.width} × {image.height}px · {(image.file.size / 1024).toFixed(1)} KB</p></div><div className="converter-controls">
        {mode === "resize" && <><div className="resize-dimensions"><label>Width<input type="number" min="1" max="12000" value={width} onChange={(event) => updateWidth(Number(event.target.value))}/></label><label>Height<input type="number" min="1" max="12000" value={height} onChange={(event) => updateHeight(Number(event.target.value))}/></label></div><label className="checkbox-row"><input type="checkbox" checked={locked} onChange={(event) => setLocked(event.target.checked)}/>Lock aspect ratio</label><div className="resize-presets"><button type="button" onClick={() => applyScale(.5)}>50%</button><button type="button" onClick={() => applyScale(.75)}>75%</button><button type="button" onClick={() => applyScale(1)}>Original</button><button type="button" onClick={() => { if (!image) return; const scale = Math.min(1, 1920 / Math.max(image.width, image.height)); applyScale(scale); }}>Max 1920px</button></div></>}
        <label>Output format<select value={outputType} onChange={(event) => { setOutputType(event.target.value as OutputType); setResult(null); }}><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>
        {outputType !== "image/png" && <label>Quality <output>{quality}%</output><input type="range" min="35" max="100" value={quality} onChange={(event) => { setQuality(Number(event.target.value)); setResult(null); }}/></label>}
        {outputType === "image/jpeg" && <label>Transparency background<input type="color" value={background} onChange={(event) => setBackground(event.target.value)}/></label>}
        {mode === "compress" && <p>JPG and WebP use the quality setting. PNG export is lossless and may not reduce file size; choose WebP when a smaller output matters.</p>}
        <button className="button-primary" type="button" onClick={process}>{mode === "resize" ? "Create resized image" : "Compress image"}</button><button className="button-secondary" type="button" onClick={() => { setImage((current) => { current?.bitmap.close(); return null; }); setResult(null); }}>Choose another</button>
      </div></div>
      {result && <div className="metadata-result"><div><strong>{result.name}</strong><span>{(image.file.size / 1024).toFixed(1)} KB → {(result.blob.size / 1024).toFixed(1)} KB</span><span>{mode === "resize" ? `${width} × ${height}px` : `${image.width} × ${image.height}px`}</span></div><button className="button-primary" type="button" onClick={download}><Download size={18}/>Download image</button></div>}
    </>}
    {error && <p className="tool-error" role="alert">{error}</p>}
  </section>;
}
