"use client";

import { ArrowLeft, ArrowRight, Copy, Download, Film, ImageIcon, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { decompressFrames, parseGIF } from "gifuct-js";
import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { spriteLayout, MAX_SPRITE_FRAMES } from "@/lib/sprite-sheet";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

type Mode = "images-to-sheet" | "gif-to-sheet" | "sheet-to-gif";
type Frame = { image: ImageData; delay: number; name: string };
type SheetGrid = { frameWidth: number; frameHeight: number; offsetX: number; offsetY: number; gapX: number; gapY: number };
const MAX_BYTES = 25 * 1024 * 1024;
const bounded = (value: string, min: number, max: number) => Math.max(min, Math.min(max, Math.round(Number(value) || min)));

function FrameCanvas({ image }: { image: ImageData }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const canvas = ref.current; if (canvas) { canvas.width = image.width; canvas.height = image.height; canvas.getContext("2d")?.putImageData(image, 0, 0); } }, [image]);
  return <canvas ref={ref} aria-label="Frame thumbnail" />;
}

export function SpriteSheetTool() {
  const [mode, setMode] = useState<Mode>("images-to-sheet");
  const [frames, setFrames] = useState<Frame[]>([]), [name, setName] = useState("sprite");
  const [columns, setColumns] = useState(4), [rows, setRows] = useState(4), [padding, setPadding] = useState(0), [margin, setMargin] = useState(0);
  const [fps, setFps] = useState(12), [loop, setLoop] = useState(0), [selected, setSelected] = useState(0), [playing, setPlaying] = useState(true);
  const [source, setSource] = useState<ImageBitmap | null>(null);
  const [sheetGrid, setSheetGrid] = useState<SheetGrid>({ frameWidth: 1, frameHeight: 1, offsetX: 0, offsetY: 0, gapX: 0, gapY: 0 });
  const [error, setError] = useState<string | null>(null), [drag, setDrag] = useState(false), [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null), gridRef = useRef<HTMLCanvasElement>(null), revision = useRef(0), draggedFrame = useRef<number | null>(null);
  const layoutResult = useMemo(() => { if (!frames.length) return { layout: null, message: null }; try { return { layout: spriteLayout(frames.map(f => f.image), columns, padding, margin), message: null }; } catch (cause) { return { layout: null, message: (cause as Error).message }; } }, [frames, columns, padding, margin]);
  const { layout } = layoutResult;
  useEffect(() => () => source?.close(), [source]);
  useEffect(() => () => { revision.current++; }, []);
  useEffect(() => {
    const canvas = previewRef.current; if (!canvas || !frames.length) return;
    canvas.width = Math.max(...frames.map(f => f.image.width)); canvas.height = Math.max(...frames.map(f => f.image.height));
    const ctx = canvas.getContext("2d"); let index = Math.min(selected, frames.length - 1);
    const draw = () => { const frame = frames[index % frames.length].image; ctx?.clearRect(0, 0, canvas.width, canvas.height); ctx?.putImageData(frame, Math.floor((canvas.width - frame.width) / 2), Math.floor((canvas.height - frame.height) / 2)); index++; };
    draw(); if (!playing) return; const timer = window.setInterval(draw, 1000 / fps); return () => clearInterval(timer);
  }, [frames, fps, selected, playing]);
  useEffect(() => {
    const canvas = gridRef.current; if (!canvas || !layout) return;
    const scale = Math.min(1, 1000 / Math.max(layout.width, layout.height)); canvas.width = Math.max(1, Math.round(layout.width * scale)); canvas.height = Math.max(1, Math.round(layout.height * scale));
    const ctx = canvas.getContext("2d"); if (!ctx) return; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.imageSmoothingEnabled = false;
    frames.forEach((frame, i) => { const tmp = document.createElement("canvas"); tmp.width = frame.image.width; tmp.height = frame.image.height; tmp.getContext("2d")?.putImageData(frame.image, 0, 0); const cell = layout.frames[i]; ctx.drawImage(tmp, (cell.x + cell.offsetX) * scale, (cell.y + cell.offsetY) * scale, tmp.width * scale, tmp.height * scale); });
  }, [frames, layout]);

  function sliceBitmap(bitmap: ImageBitmap, nextColumns: number, nextRows: number, grid = sheetGrid) {
    const { frameWidth: width, frameHeight: height } = grid;
    if (nextColumns * nextRows > MAX_SPRITE_FRAMES || width * height * nextColumns * nextRows > 32_000_000) { setError("Use at most 180 frames and 32 million decoded frame pixels."); return; }
    if (grid.offsetX + nextColumns * width + (nextColumns - 1) * grid.gapX > bitmap.width || grid.offsetY + nextRows * height + (nextRows - 1) * grid.gapY > bitmap.height) { setError("The grid extends beyond this image. Check frame size, rows, columns, offsets and gaps."); return; }
    const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true }); if (!ctx) throw new Error("Canvas is unavailable.");
    const next: Frame[] = [];
    for (let y = 0; y < nextRows; y++) for (let x = 0; x < nextColumns; x++) { ctx.clearRect(0, 0, width, height); ctx.drawImage(bitmap, grid.offsetX + x * (width + grid.gapX), grid.offsetY + y * (height + grid.gapY), width, height, 0, 0, width, height); next.push({ image: ctx.getImageData(0, 0, width, height), delay: 1000 / fps, name: `frame-${next.length + 1}` }); }
    setFrames(next); setSelected(0); setError(null);
  }
  async function load(files: File[]) {
    if (!files.length || busy) return; const request = ++revision.current; setError(null); setBusy(true);
    try {
      if (files.some(f => f.size > MAX_BYTES) || files.reduce((sum, f) => sum + f.size, 0) > 100 * 1024 * 1024) throw new Error("Use files under 25 MB each and 100 MB per selection.");
      if (mode === "images-to-sheet") {
        if (frames.length + files.length > MAX_SPRITE_FRAMES) throw new Error("Use at most 180 frames.");
        const next: Frame[] = []; let pixels = frames.reduce((sum, f) => sum + f.image.width * f.image.height, 0);
        for (const file of files) {
          if (!/image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Choose PNG, JPG, or WebP frames.");
          const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
          try {
            pixels += bitmap.width * bitmap.height;
            if (pixels > 32_000_000 || bitmap.width > 8192 || bitmap.height > 8192) throw new Error("Use at most 32 million frame pixels and 8,192 px per side.");
            const canvas = document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height;
            const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas is unavailable."); ctx.drawImage(bitmap, 0, 0);
            next.push({ image: ctx.getImageData(0, 0, bitmap.width, bitmap.height), delay: 1000 / fps, name: file.name });
          } finally { bitmap.close(); }
        }
        if (request !== revision.current) return; setFrames(current => [...current, ...next]); if (!frames.length) setName(files[0].name.replace(/\.[^.]+$/, "") || "sprite");
      } else if (mode === "gif-to-sheet") {
        const file = files[0]; if (file.type !== "image/gif" && !file.name.toLowerCase().endsWith(".gif")) throw new Error("Choose an animated GIF for this mode.");
        const parsed = parseGIF(await file.arrayBuffer());
        const width = parsed.lsd.width, height = parsed.lsd.height;
        if (!width || !height || width > 8192 || height > 8192 || width * height * parsed.frames.length > 32_000_000 || parsed.frames.length > MAX_SPRITE_FRAMES) throw new Error("This GIF exceeds 180 frames or 32 million decoded pixels. Use a shorter or smaller animation.");
        const decoded = decompressFrames(parsed, true); if (!decoded.length) throw new Error("No GIF frames were found.");
        const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true }); if (!ctx) throw new Error("Canvas is unavailable.");
        const patchCanvas = document.createElement("canvas"), patchCtx = patchCanvas.getContext("2d"); if (!patchCtx) throw new Error("Canvas is unavailable.");
        const next: Frame[] = [];
        for (const item of decoded) {
          const previous = item.disposalType === 3 ? ctx.getImageData(0, 0, width, height) : null;
          patchCanvas.width = item.dims.width; patchCanvas.height = item.dims.height;
          patchCtx.putImageData(new ImageData(new Uint8ClampedArray(item.patch), item.dims.width, item.dims.height), 0, 0);
          ctx.drawImage(patchCanvas, item.dims.left, item.dims.top);
          next.push({ image: ctx.getImageData(0, 0, width, height), delay: item.delay || 100, name: `frame-${next.length + 1}` });
          if (item.disposalType === 2) ctx.clearRect(item.dims.left, item.dims.top, item.dims.width, item.dims.height); else if (previous) ctx.putImageData(previous, 0, 0);
        }
        if (request !== revision.current) return; setFrames(next); setColumns(Math.min(30, Math.ceil(Math.sqrt(next.length)))); setSource(null); setName(file.name.replace(/\.[^.]+$/, "") || "sprite");
      } else {
        const bitmap = await createImageBitmap(files[0]);
        if (bitmap.width * bitmap.height > 32_000_000 || bitmap.width > 8192 || bitmap.height > 8192) { bitmap.close(); throw new Error("Use a sheet under 32 megapixels and 8,192 px per side."); }
        if (request !== revision.current) { bitmap.close(); return; }
        const cols = bitmap.width % 4 === 0 ? 4 : 1, nextRows = bitmap.height % 4 === 0 ? 4 : 1;
        const grid = { frameWidth: Math.floor(bitmap.width / cols), frameHeight: Math.floor(bitmap.height / nextRows), offsetX: 0, offsetY: 0, gapX: 0, gapY: 0 };
        setSource(bitmap); setColumns(cols); setRows(nextRows); setSheetGrid(grid); sliceBitmap(bitmap, cols, nextRows, grid); setName(files[0].name.replace(/\.[^.]+$/, "") || "sprite");
      }
      trackToolStarted("sprite-sheet"); trackToolEvent("sprite-sheet", "file_loaded");
    } catch (cause) { if (request === revision.current) setError(cause instanceof Error ? cause.message : "Could not read these files."); }
    finally { if (request === revision.current) setBusy(false); }
  }
  function drop(event: DragEvent<HTMLLabelElement>) { event.preventDefault(); setDrag(false); void load(Array.from(event.dataTransfer.files)); }
  function updateGrid(patch: Partial<SheetGrid>) { if (!source) return; const next = { ...sheetGrid, ...patch }; setSheetGrid(next); sliceBitmap(source, columns, rows, next); }
  function reorder(from: number, to: number) { if (to < 0 || to >= frames.length || from === to) return; setFrames(current => { const next = [...current]; next.splice(to, 0, next.splice(from, 1)[0]); return next; }); setSelected(to); }
  function reset(nextMode = mode) { revision.current++; setBusy(false); setMode(nextMode); setFrames([]); setSource(null); setSelected(0); setError(null); }
  function download(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); trackToolEvent("sprite-sheet", "export_completed"); }
  function exportSheet() {
    if (!layout) return; setError(null);
    try {
      const canvas = document.createElement("canvas"); canvas.width = layout.width; canvas.height = layout.height; const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas is unavailable.");
      frames.forEach((frame, index) => { const cell = layout.frames[index]; ctx.putImageData(frame.image, cell.x + cell.offsetX, cell.y + cell.offsetY); });
      canvas.toBlob(blob => { if (blob) download(blob, `${name}-sprite-sheet.png`); else setError("The browser could not create this PNG. Reduce sheet dimensions."); }, "image/png");
    } catch { setError("Not enough browser memory for this sheet. Use fewer or smaller frames."); }
  }
  function exportJson() { if (layout) download(new Blob([JSON.stringify({ ...layout, frames: layout.frames.map((cell, i) => ({ ...cell, name: frames[i].name, durationMs: Math.round(1000 / fps) })) }, null, 2)], { type: "application/json" }), `${name}-sprite-sheet.json`); }
  function exportGif() {
    if (!frames.length || !layout || error) return;
    try {
      const gif = GIFEncoder(); frames.forEach((frame, index) => { const palette = quantize(frame.image.data, 256, { format: "rgba4444", oneBitAlpha: true }); const indexed = applyPalette(frame.image.data, palette, "rgba4444"); gif.writeFrame(indexed, frame.image.width, frame.image.height, { palette, delay: Math.round(1000 / fps), repeat: index === 0 ? loop : undefined }); }); gif.finish(); download(new Blob([Uint8Array.from(gif.bytes()).buffer], { type: "image/gif" }), `${name}.gif`);
    } catch { setError("The GIF could not be encoded. Try fewer or smaller frames."); }
  }
  return <section className="sprite-shell" aria-labelledby="sprite-title">
    <div className="generator-heading"><div><span className="section-label">Sprite Sheet Maker</span><h2 id="sprite-title">Make a sheet or convert an animation</h2><p>Arrange separate frames, convert a GIF, or slice a uniform sheet locally.</p></div><span className="local-badge">No upload</span></div>
    <div className="sprite-tabs sprite-tabs-three">{([["images-to-sheet", "Images → Sprite Sheet"], ["gif-to-sheet", "GIF → Sprite Sheet"], ["sheet-to-gif", "Sprite Sheet → GIF"]] as const).map(([value, label]) => <button key={value} className={mode === value ? "active" : ""} onClick={() => reset(value)} type="button" disabled={busy}>{value === "gif-to-sheet" ? <Film size={17}/> : <ImageIcon size={17}/>} {label}</button>)}</div>
    {(mode === "images-to-sheet" || (!frames.length && !source)) && <label className={`metadata-dropzone${drag ? " drag-active" : ""}`} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={drop}><Upload size={31}/><strong>{busy ? "Reading frames…" : mode === "images-to-sheet" ? frames.length ? "Add more PNG, JPG, or WebP frames" : "Choose or drop PNG, JPG, or WebP frames" : mode === "gif-to-sheet" ? "Drop an animated GIF" : "Drop a PNG, WebP, or JPG sprite sheet"}</strong><span>25 MB each · up to 180 frames / 32 million decoded pixels · no upload</span><input multiple={mode === "images-to-sheet"} disabled={busy} accept={mode === "gif-to-sheet" ? "image/gif" : "image/png,image/webp,image/jpeg"} onChange={e => { void load(Array.from(e.target.files ?? [])); e.target.value = ""; }} type="file"/></label>}
    {(error || layoutResult.message) && <p className="tool-error" role="alert">{error || layoutResult.message}</p>}
    {!!frames.length && <>
      <div className="sprite-controls"><label>Columns<input min="1" max="30" type="number" value={columns} onChange={e => { const value = bounded(e.target.value, 1, 30); setColumns(value); if (source) sliceBitmap(source, value, rows); }}/></label>
        {mode === "sheet-to-gif" ? <><label>Rows<input min="1" max="30" type="number" value={rows} onChange={e => { const value = bounded(e.target.value, 1, 30); setRows(value); if (source) sliceBitmap(source, columns, value); }}/></label>{([["frameWidth", "Frame width", 1], ["frameHeight", "Frame height", 1], ["offsetX", "X offset", 0], ["offsetY", "Y offset", 0], ["gapX", "Column gap", 0], ["gapY", "Row gap", 0]] as const).map(([key, label, min]) => <label key={key}>{label}<input type="number" min={min} max={8192} value={sheetGrid[key]} onChange={e => updateGrid({ [key]: bounded(e.target.value, min, 8192) })}/></label>)}</> : <><label>Frame spacing (px)<input min="0" max="64" type="number" value={padding} onChange={e => setPadding(bounded(e.target.value, 0, 64))}/></label><label>Outer margin (px)<input min="0" max="64" type="number" value={margin} onChange={e => setMargin(bounded(e.target.value, 0, 64))}/></label></>}
        <label>FPS<input min="1" max="60" type="range" value={fps} onChange={e => setFps(Number(e.target.value))}/><span>{fps}</span></label>{mode === "sheet-to-gif" && <label>Loops<input min="0" max="20" type="number" value={loop} onChange={e => setLoop(bounded(e.target.value, 0, 20))}/><small>0 = forever</small></label>}
      </div>
      {mode !== "sheet-to-gif" && layout && <div className="sprite-grid-preview checker-preview"><canvas ref={gridRef} aria-label="Sprite sheet grid preview"/><p>{layout.width}×{layout.height}px · {layout.columns} columns × {layout.rows} rows · {layout.cellWidth}×{layout.cellHeight}px cells · smaller frames centered without scaling</p></div>}
      <div className="sprite-workspace"><div className="checker-preview"><h3>{playing ? "Animation preview" : `Frame ${Math.min(selected + 1, frames.length)}`}</h3><canvas ref={previewRef}/><p>{frames.length} frames</p><button className="button-secondary" type="button" onClick={() => setPlaying(!playing)}>{playing ? "Pause" : "Play"}</button><label className="frame-scrub">Preview frame<input aria-label="Preview frame" min="1" max={frames.length} type="range" value={Math.min(selected + 1, frames.length)} onChange={e => { setPlaying(false); setSelected(Number(e.target.value) - 1); }}/></label></div>
        <div><h3>Frame order</h3><p>Drag frames or use arrows to reorder.</p><div className="frame-list sprite-maker-frames">{frames.map((frame, index) => <article key={index} draggable onDragStart={e => { draggedFrame.current = index; e.dataTransfer.setData("text/plain", String(index)); }} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (draggedFrame.current !== null) reorder(draggedFrame.current, index); draggedFrame.current = null; }} onDragEnd={() => { draggedFrame.current = null; }}><span>{index + 1}</span><button aria-label={`Preview frame ${index + 1}`} type="button" onClick={() => { setSelected(index); setPlaying(false); }}><FrameCanvas image={frame.image}/></button><button disabled={index === 0} onClick={() => reorder(index, index - 1)} aria-label={`Move frame ${index + 1} left`} type="button"><ArrowLeft size={14}/></button><button disabled={index === frames.length - 1} onClick={() => reorder(index, index + 1)} aria-label={`Move frame ${index + 1} right`} type="button"><ArrowRight size={14}/></button><button disabled={frames.length >= MAX_SPRITE_FRAMES || frames.reduce((sum, f) => sum + f.image.width * f.image.height, 0) + frame.image.width * frame.image.height > 32_000_000} onClick={() => setFrames(current => [...current.slice(0, index + 1), frame, ...current.slice(index + 1)])} aria-label={`Duplicate frame ${index + 1}`} type="button"><Copy size={14}/></button><button onClick={() => setFrames(current => current.filter((_, i) => i !== index))} aria-label={`Delete frame ${index + 1}`} type="button"><Trash2 size={14}/></button><small title={frame.name}>{frame.name}</small></article>)}</div></div>
      </div>
      <div className="text-tool-actions"><button className="button-primary" disabled={busy || !layout || !!error} onClick={mode === "sheet-to-gif" ? exportGif : exportSheet} type="button"><Download size={18}/>{mode === "sheet-to-gif" ? "Download animated GIF" : "Download PNG sprite sheet"}</button>{mode !== "sheet-to-gif" && <button className="button-secondary" disabled={!layout || busy} onClick={exportJson} type="button">Download JSON frame data</button>}<button className="button-secondary" onClick={() => reset()} type="button">Start over</button></div>
    </>}
  </section>;
}
