"use client";
import { Download, Upload } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { quantize } from "gifenc";
import { clampPixelRegion, mapPixelPalette, parseHexPalette, type Dither, type PixelRegion, type Rgb } from "@/lib/pixelate";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

export function PixelateTool() {
  const [image, setImage] = useState<ImageBitmap | null>(null), [name, setName] = useState("image");
  const [pixelWidth, setPixelWidth] = useState(64), [effect, setEffect] = useState<"pixelate" | "blur">("pixelate");
  const [palette, setPalette] = useState<"original" | "adaptive" | "custom">("original"), [colorCount, setColorCount] = useState(8), [hex, setHex] = useState("#10212B, #136FE8, #B5F24A, #FFFFFF"), [dither, setDither] = useState<Dither>("none");
  const [region, setRegion] = useState<PixelRegion | null>(null), [result, setResult] = useState<HTMLCanvasElement | null>(null), [grid, setGrid] = useState(false), [actualSize, setActualSize] = useState(false), [scale, setScale] = useState(1), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const preview = useRef<HTMLCanvasElement>(null), anchor = useRef<{ x: number; y: number } | null>(null), revision = useRef(0);
  useEffect(() => () => image?.close(), [image]);
  useEffect(() => () => { revision.current++; }, []);
  useEffect(() => {
    const canvas = preview.current; if (!canvas || !image) return;
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext("2d"); if (!ctx) return; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(result || image, 0, 0);
    const area = region || { x: 0, y: 0, width: image.width, height: image.height };
    const cols = Math.min(pixelWidth, area.width), rows = Math.max(1, Math.round(area.height * cols / area.width));
    if (grid && result && effect === "pixelate" && cols <= 256 && rows <= 256) {
      ctx.lineWidth = 0.6; ctx.strokeStyle = "rgba(35,60,90,.5)"; ctx.beginPath();
      for (let i = 0; i <= cols; i++) { const x = area.x + i * area.width / cols; ctx.moveTo(x, area.y); ctx.lineTo(x, area.y + area.height); }
      for (let i = 0; i <= rows; i++) { const y = area.y + i * area.height / rows; ctx.moveTo(area.x, y); ctx.lineTo(area.x + area.width, y); } ctx.stroke();
    }
    if (region) { ctx.lineWidth = Math.max(1, image.width / 500); ctx.strokeStyle = "#ff602b"; ctx.setLineDash([6, 4]); ctx.strokeRect(region.x, region.y, region.width, region.height); }
  }, [image, result, region, grid, pixelWidth, effect]);
  function invalidate() { setResult(null); setError(""); }
  async function load(file?: File) {
    if (!file || busy) return; const request = ++revision.current; setBusy(true); setError("");
    try {
      if (file.size > 30 * 1024 * 1024 || !/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Choose a JPG, PNG, or WebP file under 30 MB.");
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      if (bitmap.width * bitmap.height > 20_000_000 || bitmap.width > 8192 || bitmap.height > 8192) { bitmap.close(); throw new Error("Use an image under 20 megapixels and 8,192 px per side."); }
      if (request !== revision.current) { bitmap.close(); return; }
      setImage(bitmap); setName(file.name.replace(/\.[^.]+$/, "") || "image"); setRegion(null); setResult(null); setScale(1);
      trackToolStarted("pixelate-image"); trackToolEvent("pixelate-image", "file_loaded");
    } catch (e) { setError(e instanceof Error ? e.message : "The browser could not open this image."); } finally { setBusy(false); }
  }
  function point(event: PointerEvent<HTMLCanvasElement>) { const rect = event.currentTarget.getBoundingClientRect(); return { x: Math.max(0, Math.min((image?.width ?? 1) - 1, Math.round((event.clientX - rect.left) / rect.width * (image?.width ?? 1)))), y: Math.max(0, Math.min((image?.height ?? 1) - 1, Math.round((event.clientY - rect.top) / rect.height * (image?.height ?? 1)))) }; }
  function startSelection(event: PointerEvent<HTMLCanvasElement>) { if (!image || busy) return; anchor.current = point(event); event.currentTarget.setPointerCapture(event.pointerId); invalidate(); setRegion({ ...anchor.current, width: 1, height: 1 }); }
  function moveSelection(event: PointerEvent<HTMLCanvasElement>) {
    if (!anchor.current || !image) return; const end = point(event), start = anchor.current;
    setRegion(clampPixelRegion({ x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), width: Math.abs(start.x - end.x) + 1, height: Math.abs(start.y - end.y) + 1 }, image.width, image.height));
  }
  function updateRegion(key: keyof PixelRegion, value: number) { if (!image) return; const area = region || { x: 0, y: 0, width: image.width, height: image.height }; setRegion(clampPixelRegion({ ...area, [key]: value }, image.width, image.height)); invalidate(); }
  async function apply() {
    if (!image || busy) return; setBusy(true); setError("");
    // Yield once so the busy state paints before bounded local processing.
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    try {
      if (!Number.isInteger(pixelWidth) || pixelWidth < 1 || pixelWidth > 1024) throw new Error("Choose a target grid width between 1 and 1,024 pixels.");
      if (effect === "pixelate" && palette === "adaptive" && (!Number.isInteger(colorCount) || colorCount < 2 || colorCount > 64)) throw new Error("Choose 2–64 adaptive colors.");
      const area = region || { x: 0, y: 0, width: image.width, height: image.height };
      const width = Math.min(pixelWidth, area.width), height = Math.max(1, Math.round(area.height * width / area.width));
      if (width * height > 1_048_576 || height > 8192) throw new Error("This region creates an oversized pixel grid. Choose a lower target width.");
      const small = document.createElement("canvas"); small.width = width; small.height = height;
      const ctx = small.getContext("2d", { willReadFrequently: true }); if (!ctx) throw new Error("Canvas is unavailable.");
      ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, width, height);
      if (effect === "pixelate" && palette !== "original") {
        const pixels = ctx.getImageData(0, 0, width, height);
        let colors: Rgb[];
        if (palette === "custom") colors = parseHexPalette(hex);
        else { colors = quantize(pixels.data, colorCount, { format: "rgba4444", oneBitAlpha: true }).map(c => [c[0], c[1], c[2]] as Rgb); if (colors.length < 2) colors = [colors[0] || [0, 0, 0], colors[0] || [255, 255, 255]]; }
        ctx.putImageData(new ImageData(Uint8ClampedArray.from(mapPixelPalette(pixels.data, width, colors, dither)), width, height), 0, 0);
      }
      const output = document.createElement("canvas"); output.width = image.width; output.height = image.height;
      const target = output.getContext("2d"); if (!target) throw new Error("Canvas is unavailable.");
      target.drawImage(image, 0, 0); target.clearRect(area.x, area.y, area.width, area.height); target.imageSmoothingEnabled = effect === "blur"; target.imageSmoothingQuality = "high"; target.drawImage(small, area.x, area.y, area.width, area.height);
      setResult(output);
    } catch (e) { setError(e instanceof Error ? e.message : "Not enough browser memory. Use a smaller image."); } finally { setBusy(false); }
  }
  function exportPng() {
    if (!result || busy) return; setError("");
    try {
      if (result.width * scale > 16384 || result.height * scale > 16384 || result.width * result.height * scale * scale > 32_000_000) throw new Error("This enlargement exceeds 32 megapixels or 16,384 px per side. Choose a smaller scale.");
      const canvas = document.createElement("canvas"); canvas.width = result.width * scale; canvas.height = result.height * scale; const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("The output canvas is unavailable.");
      ctx.imageSmoothingEnabled = false; ctx.drawImage(result, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => { if (!blob) { setError("The browser could not encode this PNG. Use a smaller scale."); return; } const url = URL.createObjectURL(blob), link = document.createElement("a"); link.href = url; link.download = `${name}-${effect}-${scale}x.png`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000); trackToolEvent("pixelate-image", "export_completed"); }, "image/png");
    } catch (e) { setError(e instanceof Error ? e.message : "Not enough memory to export this size."); }
  }
  const area = region || (image ? { x: 0, y: 0, width: image.width, height: image.height } : null);
  return <section className="sprite-shell" aria-labelledby="pixelate-title"><div className="generator-heading"><div><span className="section-label">Pixelate & blur</span><h2 id="pixelate-title">Choose your image and pixel grid</h2><p>Process the full image or drag a rectangle to select one area.</p></div><span className="local-badge">No upload</span></div>
    <label className="metadata-dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void load(e.dataTransfer.files[0]); }}><Upload size={28}/><strong>{image ? "Choose a different image" : "Choose or drop an image"}</strong><span>JPG, PNG, WebP · 30 MB · 20 megapixels</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => { void load(e.target.files?.[0]); e.target.value = ""; }}/></label>
    {image && <><fieldset className="workflow-settings" disabled={busy}><legend>Effect settings</legend><div className="workflow-controls"><label>Effect<select value={effect} onChange={e => { setEffect(e.target.value as typeof effect); invalidate(); }}><option value="pixelate">Pixelate (sharp blocks)</option><option value="blur">Blur (smooth resampling)</option></select></label><label>Target pixel width<input type="number" min="1" max="1024" value={pixelWidth} onChange={e => { setPixelWidth(Number(e.target.value)); invalidate(); }}/></label><label>Palette<select disabled={effect === "blur"} value={palette} onChange={e => { setPalette(e.target.value as typeof palette); invalidate(); }}><option value="original">Original colors</option><option value="adaptive">Adaptive colors</option><option value="custom">Custom HEX colors</option></select></label>{palette === "adaptive" && effect === "pixelate" && <label>Color count<input type="number" min="2" max="64" value={colorCount} onChange={e => { setColorCount(Number(e.target.value)); invalidate(); }}/></label>}{palette === "custom" && effect === "pixelate" && <label>HEX palette<textarea rows={2} value={hex} onChange={e => { setHex(e.target.value); invalidate(); }}/></label>}<label>Dithering<select disabled={palette === "original" || effect === "blur"} value={dither} onChange={e => { setDither(e.target.value as Dither); invalidate(); }}><option value="none">None</option><option value="bayer">Bayer 4×4</option><option value="floyd-steinberg">Floyd–Steinberg</option></select></label></div><div className="workflow-checks">{[16, 32, 64, 128].map(width => <button className="button-secondary" key={width} type="button" onClick={() => { setPixelWidth(width); invalidate(); }}>{width}px</button>)}</div></fieldset>
      <fieldset className="workflow-settings" disabled={busy}><legend>{region ? "Selected area" : "Entire image"}</legend><div className="workflow-controls">{area && ([["x", "X"], ["y", "Y"], ["width", "Area width"], ["height", "Area height"]] as const).map(([key, label]) => <label key={key}>{label}<input type="number" min={key === "x" || key === "y" ? 0 : 1} value={area[key]} onChange={e => updateRegion(key, Number(e.target.value))}/></label>)}</div><div className="workflow-checks"><button className="button-secondary" type="button" onClick={() => { setRegion(null); invalidate(); }}>Use entire image</button><label><input type="checkbox" checked={grid} onChange={e => setGrid(e.target.checked)}/> Show pixel grid (preview only, up to 256 rows/columns)</label><label><input type="checkbox" checked={actualSize} onChange={e => setActualSize(e.target.checked)}/> View at 100%</label></div></fieldset>
      <p>Drag on the preview, or enter the area coordinates above. Smaller target widths make larger blocks or stronger softening. Dithering applies only with a limited palette. Press Apply after changing the effect or area.</p>
      <div className="workflow-preview pixelate-preview checker-preview"><canvas ref={preview} style={{ maxWidth: actualSize ? "none" : "100%", maxHeight: actualSize ? "none" : 650 }} onPointerDown={startSelection} onPointerMove={moveSelection} onPointerUp={e => { moveSelection(e); anchor.current = null; }} onPointerCancel={() => { anchor.current = null; }} aria-label="Image preview; drag to select an area"/></div>
      {result && area && <p role="status">Applied {effect} to {region ? "the selected area" : "the entire image"}. Pixel grid: {Math.min(pixelWidth, area.width)} × {Math.max(1, Math.round(area.height * Math.min(pixelWidth, area.width) / area.width))}. Output: {image.width} × {image.height}px before enlargement. Selection outline and grid are excluded from the download.</p>}
      <div className="text-tool-actions"><button className="button-primary" disabled={busy} type="button" onClick={() => void apply()}>{busy ? "Processing…" : "Apply effect"}</button><label>PNG size<select aria-label="PNG size" value={scale} onChange={e => setScale(Number(e.target.value))}>{[1, 2, 4, 8].map(value => <option key={value} value={value}>{value === 1 ? "Original size" : `${value}× nearest-neighbor`}</option>)}</select></label><button className="button-secondary" disabled={!result || busy} type="button" onClick={exportPng}><Download size={17}/>Download PNG</button></div>
      <p className="workflow-note">For sensitive information, use an opaque cover or crop it out. Pixelation and blur can retain recognizable detail and do not guarantee anonymization.</p>
    </>}
    {error && <p className="tool-error" role="alert">{error}</p>}
  </section>;
}
