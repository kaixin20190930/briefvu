"use client";
import { Download, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { tiledPrintLayout, type PrintOptions } from "@/lib/tiled-print";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

const units = { mm: 1, cm: 10, in: 25.4 };
export function TiledPrintTool() {
  const [image, setImage] = useState<ImageBitmap | null>(null), [name, setName] = useState("image"), [unit, setUnit] = useState<keyof typeof units>("mm");
  const [options, setOptions] = useState<PrintOptions>({ paper: "A4", landscape: false, margin: 10, overlap: 5, mode: "size", width: 500, height: 333.33, columns: 2, rows: 2, locked: true });
  const [cutLines, setCutLines] = useState(true), [ruler, setRuler] = useState(true), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const preview = useRef<HTMLCanvasElement>(null), revision = useRef(0);
  useEffect(() => () => image?.close(), [image]);
  useEffect(() => () => { revision.current++; }, []);
  const result = useMemo(() => { if (!image) return { layout: null, message: "" }; try { return { layout: tiledPrintLayout(image.width, image.height, options), message: "" }; } catch (e) { return { layout: null, message: (e as Error).message }; } }, [image, options]);
  const { layout } = result;
  useEffect(() => {
    const canvas = preview.current; if (!canvas || !layout || !image) return;
    const scale = Math.min(900 / layout.areaWidth, 650 / layout.areaHeight); canvas.width = Math.max(1, Math.round(layout.areaWidth * scale)); canvas.height = Math.max(1, Math.round(layout.areaHeight * scale));
    const ctx = canvas.getContext("2d"); if (!ctx) return; ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, layout.offsetX * scale, layout.offsetY * scale, layout.width * scale, layout.height * scale);
    ctx.strokeStyle = "#1462be"; ctx.lineWidth = 1; ctx.font = "bold 12px sans-serif";
    layout.tiles.forEach(tile => { const x = tile.x * scale, y = tile.y * scale; ctx.strokeRect(x, y, layout.contentWidth * scale, layout.contentHeight * scale); ctx.fillStyle = "white"; ctx.fillRect(x + 2, y + 2, 50, 18); ctx.fillStyle = "#123c67"; ctx.fillText(`R${tile.row + 1} C${tile.column + 1}`, x + 5, y + 15); });
  }, [layout, image]);
  async function load(file?: File) {
    if (!file || busy) return; const request = ++revision.current; setBusy(true); setError("");
    try {
      if (file.size > 30 * 1024 * 1024 || !/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Choose a JPG, PNG, or WebP file under 30 MB.");
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      if (bitmap.width * bitmap.height > 24_000_000 || bitmap.width > 8192 || bitmap.height > 8192) { bitmap.close(); throw new Error("Use an image under 24 megapixels and 8,192 px per side. Resize larger images first."); }
      if (request !== revision.current) { bitmap.close(); return; }
      setImage(bitmap); setName(file.name.replace(/\.[^.]+$/, "") || "image"); setOptions(current => ({ ...current, height: current.width * bitmap.height / bitmap.width }));
      trackToolStarted("print-image-multiple-pages"); trackToolEvent("print-image-multiple-pages", "file_loaded");
    } catch (e) { setError(e instanceof Error ? e.message : "The browser could not decode this image."); } finally { setBusy(false); }
  }
  function change(patch: Partial<PrintOptions>) { setOptions(current => ({ ...current, ...patch })); setError(""); }
  function dimension(key: "width" | "height", value: number) {
    if (!image) return; const mm = value * units[unit];
    change(key === "width" ? { width: mm, ...(options.locked ? { height: mm * image.height / image.width } : {}) } : { height: mm, ...(options.locked ? { width: mm * image.width / image.height } : {}) });
  }
  async function exportPdf(first: boolean) {
    if (!image || !layout || busy) return; setBusy(true); setError("");
    try {
      const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height; const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("The browser could not allocate an export canvas.");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Not enough browser memory. Use a smaller image.")), "image/jpeg", 0.95));
      const { createTiledPdf } = await import("@/lib/tiled-print-pdf");
      const bytes = await createTiledPdf(new Uint8Array(await blob.arrayBuffer()), layout, first, cutLines, ruler);
      const url = URL.createObjectURL(new Blob([bytes.buffer], { type: "application/pdf" })); const link = document.createElement("a"); link.href = url; link.download = `${name}-${first ? "test-page" : "tiled"}.pdf`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
      trackToolEvent("print-image-multiple-pages", "export_completed");
    } catch (e) { setError(e instanceof Error ? e.message : "The PDF could not be created. Reduce image size or page count."); } finally { setBusy(false); }
  }
  return <section className="sprite-shell" aria-labelledby="print-title"><div className="generator-heading"><div><span className="section-label">Tiled print tool</span><h2 id="print-title">Split your image into printable pages</h2><p>No upload. Export a PDF, then print it at Actual size / 100%.</p></div><span className="local-badge">Local processing</span></div>
    <label className="metadata-dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void load(e.dataTransfer.files[0]); }}><Upload size={28}/><strong>{busy ? "Working…" : image ? "Choose a different image" : "Choose or drop an image"}</strong><span>JPG, PNG, WebP · 30 MB · 24 megapixels</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => { void load(e.target.files?.[0]); e.target.value = ""; }}/></label>
    {image && <fieldset className="workflow-settings" disabled={busy}><legend>Print settings</legend><div className="workflow-controls"><label>Size mode<select value={options.mode} onChange={e => change({ mode: e.target.value as PrintOptions["mode"] })}><option value="size">Actual width and height</option><option value="pages">Number of pages</option></select></label><label>Units<select value={unit} onChange={e => setUnit(e.target.value as keyof typeof units)}><option value="mm">mm</option><option value="cm">cm</option><option value="in">inches</option></select></label>
      {options.mode === "size" ? <><label>Final width ({unit})<input type="number" min="0.1" step="0.1" value={Number((options.width / units[unit]).toFixed(2))} onChange={e => dimension("width", Number(e.target.value))}/></label><label>Final height ({unit})<input type="number" min="0.1" step="0.1" value={Number((options.height / units[unit]).toFixed(2))} onChange={e => dimension("height", Number(e.target.value))}/></label></> : <><label>Page columns<input type="number" min="1" max="20" value={options.columns} onChange={e => change({ columns: Number(e.target.value) })}/></label><label>Page rows<input type="number" min="1" max="20" value={options.rows} onChange={e => change({ rows: Number(e.target.value) })}/></label></>}
      <label>Paper<select value={options.paper} onChange={e => change({ paper: e.target.value as PrintOptions["paper"] })}><option>A4</option><option>Letter</option></select></label><label>Orientation<select value={options.landscape ? "landscape" : "portrait"} onChange={e => change({ landscape: e.target.value === "landscape" })}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label><label>Printer margin (mm)<input type="number" min="5" max="40" value={options.margin} onChange={e => change({ margin: Number(e.target.value) })}/></label><label>Overlap (mm)<input type="number" min="0" max="30" value={options.overlap} onChange={e => change({ overlap: Number(e.target.value) })}/></label></div>
      <div className="workflow-checks"><label><input type="checkbox" checked={options.locked} onChange={e => change({ locked: e.target.checked, ...(e.target.checked ? { height: options.width * image.height / image.width } : {}) })}/> Lock aspect ratio</label><label><input type="checkbox" checked={cutLines} onChange={e => setCutLines(e.target.checked)}/> Cut marks and overlap guides</label><label><input type="checkbox" checked={ruler} onChange={e => setRuler(e.target.checked)}/> 100 mm calibration ruler on first page</label></div></fieldset>}
    {(error || result.message) && <p className="tool-error" role="alert">{error || result.message}</p>}
    {layout && <><div className="workflow-summary"><strong>{layout.tiles.length} pages · {layout.columns} columns × {layout.rows} rows</strong><p>Image: {layout.width.toFixed(1)} × {layout.height.toFixed(1)} mm · Paper: {layout.paperWidth} × {layout.paperHeight} mm · Effective resolution: {Math.round(layout.ppi)} PPI</p><p>{layout.ppi < 100 ? "Low resolution: this print may look visibly soft. Use a smaller final size or a higher-resolution source." : layout.ppi < 200 ? "Suitable for viewing at a distance. Fine text may look soft at close range." : "Good pixel density for many close-view prints; inspect the test page."}</p>{options.mode === "pages" && options.locked && <p>The image is centered within the selected page grid. Its aspect ratio can leave white space or mostly blank edge pages.</p>}</div><div className="workflow-preview"><canvas ref={preview} aria-label="Assembly preview with page rows and columns"/></div><p>Trim the top overlap on rows after the first and the left overlap on columns after the first, then align duplicated image detail. Transparent pixels print on white. The PDF uses a high-quality JPEG copy, so keep your original.</p><div className="text-tool-actions"><button className="button-secondary" type="button" disabled={busy} onClick={() => void exportPdf(true)}><Download size={17}/>Download first page to test</button><button className="button-primary" type="button" disabled={busy} onClick={() => void exportPdf(false)}><Download size={17}/>{busy ? "Creating PDF…" : "Download multi-page PDF"}</button></div></>}
  </section>;
}
