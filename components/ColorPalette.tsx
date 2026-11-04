"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Upload } from "lucide-react";
import { extractPalette, paletteSampleSize, type PaletteResult } from "@/lib/color-palette";
import { formatRgb, formatHsl, rgbToHex, type RgbColor } from "@/lib/image-color";
import { copyText } from "@/lib/clipboard";
import { ColorExport } from "@/components/ColorExport";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

const TOOL = "color-palette-from-image";
type LoadedImage = { id: number; name: string; width: number; height: number; pixels: Uint8ClampedArray; result: PaletteResult | null };

export function ColorPalette() {
  const input = useRef<HTMLInputElement>(null);
  const preview = useRef<HTMLCanvasElement>(null);
  const generation = useRef(0);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [format, setFormat] = useState<"hex" | "rgb" | "hsl">("hex");
  const [message, setMessage] = useState("");
  useEffect(() => () => { generation.current++; }, []);

  async function load(file: File) {
    const token = ++generation.current;
    setLoaded(null); setError(""); setMessage(""); setLoading(false);
    if (file.size > 20 * 1024 * 1024) { setError("Choose an image smaller than 20 MB."); return; }
    if (!/\.(png|jpe?g|webp|avif)$/i.test(file.name) && !/^image\/(png|jpeg|webp|avif)$/.test(file.type)) {
      setError("Choose a JPG, PNG, WebP, or AVIF image. SVG and animated formats are not supported here."); return;
    }
    setLoading(true);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image(); image.src = url; await image.decode();
      if (token !== generation.current) return;
      const size = paletteSampleSize(image.naturalWidth, image.naturalHeight);
      const canvas = preview.current;
      if (!canvas) throw new Error("Image preview is unavailable. Please reload the page.");
      canvas.width = size.width; canvas.height = size.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Your browser could not open the image canvas.");
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0, size.width, size.height);
      const pixels = context.getImageData(0, 0, size.width, size.height).data;
      setLoaded({ id: token, name: file.name, width: image.naturalWidth, height: image.naturalHeight, pixels, result: extractPalette(pixels, count) });
      trackToolStarted(TOOL); trackToolEvent(TOOL, "file_loaded");
    } catch (failure) {
      if (token === generation.current) setError(failure instanceof Error && failure.name !== "EncodingError" ? failure.message : "This image could not be decoded. Try a valid PNG or JPG; AVIF support depends on your browser.");
    } finally {
      URL.revokeObjectURL(url);
      if (token === generation.current) { setLoading(false); if (input.current) input.current.value = ""; }
    }
  }
  function changeCount(next: number) {
    setCount(next); setMessage("");
    setLoaded((current) => current ? { ...current, result: extractPalette(current.pixels, next) } : null);
  }
  function value(color: RgbColor) {
    return format === "hex" ? rgbToHex(color.r, color.g, color.b) : format === "rgb" ? formatRgb(color) : formatHsl(color);
  }
  async function copy(color: RgbColor) {
    const text = value(color); const success = await copyText(text);
    setMessage(success ? `Copied ${text}.` : "Copy failed. Select the displayed color value and copy it manually.");
    if (success) trackToolEvent(TOOL, "copy_completed");
  }
  function swatch(color: RgbColor, label: string, detail?: string) {
    const hex = rgbToHex(color.r, color.g, color.b);
    return <article className="palette-swatch" key={label}>
      <div className="palette-swatch-fill" style={{ backgroundColor: hex }} />
      <div><h3>{label}</h3>{detail && <p>{detail}</p>}<code>{value(color)}</code>
      <button type="button" aria-label={`Copy ${label}`} onClick={() => void copy(color)}>Copy {format.toUpperCase()}</button></div>
    </article>;
  }
  const result = loaded?.result;
  const exports = result ? [
    { name: "average", color: result.average }, { name: "dominant", color: result.colors[0] },
    ...result.colors.map((color, index) => ({ name: `palette-${index + 1}`, color })),
  ] : [];

  return <section className="color-picker-shell palette-shell" aria-labelledby="palette-tool-title" aria-busy={loading}>
    <div className="generator-heading"><div><span className="section-label">Private color extraction</span><h2 id="palette-tool-title">An image in. A palette out.</h2><p>Find representative colors without uploading your image.</p></div><span className="local-badge"><ShieldCheck size={17} />Your image stays local</span></div>
    <input ref={input} type="file" className="sr-only" aria-label="Choose palette image" accept="image/jpeg,image/png,image/webp,image/avif,.avif" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void load(file); }} />
    <div className={`palette-dropzone${dragging ? " drag-active" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) void load(file); }}>
      <Upload size={24} /><strong>{loading ? "Reading image…" : loaded ? "Choose another image or drop it here" : "Choose an image or drop it here"}</strong>
      <button type="button" disabled={loading} onClick={() => input.current?.click()}>{loaded ? "Replace image" : "Choose image"}</button>
      <small>JPG, PNG, WebP, AVIF · up to 20 MB, 20 megapixels and 8,192 px per side</small>
    </div>
    {error && <p className="picker-error" role="alert">{error}</p>}
    <div className="palette-source" hidden={!loaded}><canvas ref={preview} aria-label="Source image sampled for palette extraction" /><div><strong>{loaded?.name}</strong><p>{loaded?.width.toLocaleString()} × {loaded?.height.toLocaleString()} px</p><p>We sample at up to 256 × 256 pixels. Tiny details may be missed.</p></div></div>
    <div className="color-controls">
      <label>Palette size <select value={count} disabled={loading} onChange={(event) => changeCount(Number(event.target.value))}>{Array.from({ length: 9 }, (_, i) => <option value={i + 2} key={i}>{i + 2} colors</option>)}</select></label>
      <label>Color format <select value={format} onChange={(event) => { setFormat(event.target.value as typeof format); setMessage(""); }}><option value="hex">HEX</option><option value="rgb">RGB</option><option value="hsl">HSL</option></select></label>
    </div>
    {loaded && !result && <p role="status">This image is fully transparent. There are no visible colors to extract.</p>}
    {result && <>
      <div className="palette-summary">{swatch(result.colors[0], "Dominant color", "Largest extracted color group")}{swatch(result.average, "Average color", "Alpha-weighted, linear-light RGB average")}</div>
      <h3>Your {result.colors.length}-color palette</h3>
      {result.colors.length < count && <p>Fewer distinct color groups were found than requested. We do not invent extra colors.</p>}
      <div className="palette-grid">{result.colors.map((color, index) => swatch(color, `Color ${index + 1}`, `${(color.share * 100).toFixed(1)}% of visible sample weight`))}</div>
      <p className="color-status" role="status">{message}</p>
      <ColorExport key={`${loaded?.id}-${count}`} colors={exports} tool={TOOL} />
    </>}
    <p className="color-method-note">Fully transparent pixels are ignored; partially transparent pixels count by their opacity. Extracted swatches are opaque representative colors. The average is computed in linear-light RGB, then converted to sRGB.</p>
  </section>;
}
