"use client";

import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { encodeIco, iconDib, iconGeometry, iconZip, ICO_SIZES, ICON_HTML, ICON_MANIFEST, ICON_README, EXTENSION_MANIFEST, EXTENSION_README, EXTENSION_SIZES, type IconOptions } from "@/lib/image-icons";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

function renderIcon(image: ImageBitmap, size: number, options: IconOptions, opaque = false) {
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not create an icon canvas.");
  if (!options.transparent || opaque) { ctx.fillStyle = options.background; ctx.fillRect(0, 0, size, size); }
  const g = iconGeometry(image.width, image.height, size, options.padding, options.mode);
  ctx.save(); ctx.beginPath(); ctx.rect(g.inset, g.inset, g.box, g.box); ctx.clip();
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, g.x, g.y, g.width, g.height); ctx.restore();
  return canvas;
}

function png(canvas: HTMLCanvasElement): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => canvas.toBlob(async blob => {
    if (!blob || blob.type !== "image/png") return reject(new Error("PNG encoding failed. Try a different browser."));
    try { resolve(new Uint8Array(await blob.arrayBuffer())); } catch { reject(new Error("Unable to read the encoded icon.")); }
  }, "image/png"));
}

function IconPreview({ image, size, options }: { image: ImageBitmap; size: number; options: IconOptions }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      context?.clearRect(0, 0, size, size);
      context?.drawImage(renderIcon(image, size, options), 0, 0);
    }
  }, [image, size, options]);
  return <figure><div className="icon-preview-tile"><canvas ref={ref} width={size} height={size} aria-label={`${size}px icon preview`} /></div><figcaption>{size} × {size}px</figcaption></figure>;
}

export function ImageToIco() {
  const input = useRef<HTMLInputElement>(null);
  const revision = useRef(0);
  const [image, setImage] = useState<ImageBitmap | null>(null);
  const [name, setName] = useState("");
  const [options, setOptions] = useState<IconOptions>({ mode: "fit", padding: 0, transparent: true, background: "#ffffff" });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => () => image?.close(), [image]);
  useEffect(() => () => { revision.current++; }, []);

  async function load(file?: File) {
    if (!file) return;
    const request = ++revision.current;
    setImage(null); setName(""); setError(""); setStatus(""); setBusy(false); setLoading(true);
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error("Choose an image no larger than 20 MB.");
      if (!/^image\/(png|jpeg|webp)$/.test(file.type) && !(file.type === "" && /\.(png|jpe?g|webp)$/i.test(file.name))) throw new Error("Choose a PNG, JPG, or WebP image. SVG and animated formats are not supported.");
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      if (request !== revision.current) { bitmap.close(); return; }
      if (bitmap.width * bitmap.height > 20_000_000 || Math.max(bitmap.width, bitmap.height) > 8192) { bitmap.close(); throw new Error("Choose an image under 20 megapixels and no more than 8,192px per side."); }
      setImage(bitmap); setName(file.name); trackToolStarted("image-to-ico"); trackToolEvent("image-to-ico", "file_loaded");
    } catch (cause) { if (request === revision.current) setError(cause instanceof Error && cause.name !== "InvalidStateError" ? cause.message : "This image could not be decoded. Try another PNG, JPG, or WebP."); }
    finally { if (request === revision.current) { setLoading(false); if (input.current) input.current.value = ""; } }
  }

  function change(patch: Partial<IconOptions>) { revision.current++; setOptions(current => ({ ...current, ...patch })); setBusy(false); setStatus(""); setError(""); }
  async function download(zip: boolean) {
    if (!image || busy) return;
    const request = ++revision.current;
    setBusy(true); setError(""); setStatus("");
    try {
      const entries = [];
      for (const size of ICO_SIZES) {
        const canvas = renderIcon(image, size, options);
        const bytes = size === 256 ? await png(canvas) : iconDib(size, canvas.getContext("2d")!.getImageData(0, 0, size, size).data);
        if (request !== revision.current) return;
        entries.push({ size, bytes });
      }
      const ico = encodeIco(entries);
      let bytes = ico;
      if (zip) {
        const files = [{ name: "favicon.ico", bytes: ico }];
        for (const size of [180, 192, 512]) {
          const bytes = await png(renderIcon(image, size, options, size === 180));
          if (request !== revision.current) return;
          files.push({ name: size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`, bytes });
        }
        files.push({ name: "readme.txt", bytes: new TextEncoder().encode(ICON_README) });
        bytes = iconZip(files);
      }
      if (request !== revision.current) return;
      const url = URL.createObjectURL(new Blob([bytes], { type: zip ? "application/zip" : "image/vnd.microsoft.icon" }));
      const link = document.createElement("a"); link.href = url; link.download = zip ? "website-icons.zip" : "favicon.ico"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(zip ? "Website icon ZIP downloaded." : "Multi-size ICO downloaded."); trackToolEvent("image-to-ico", "export_completed");
    } catch { if (request === revision.current) setError("Icon export failed. Try again with a smaller image."); }
    finally { if (request === revision.current) setBusy(false); }
  }
  async function copy(value: string) { const ok = await copyText(value); setStatus(ok ? "Code copied." : "Select and copy the code below manually."); if (ok) trackToolEvent("image-to-ico", "copy_completed"); }
  async function downloadExtension() {
    if (!image || busy) return;
    const request = ++revision.current;
    setBusy(true); setError(""); setStatus("");
    try {
      const files = [];
      for (const size of EXTENSION_SIZES) {
        const bytes = await png(renderIcon(image, size, options));
        if (request !== revision.current) return;
        files.push({ name: `icon-${size}.png`, bytes });
      }
      files.push({ name: "readme.txt", bytes: new TextEncoder().encode(EXTENSION_README) });
      const bytes = iconZip(files);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/zip" }));
      const link = document.createElement("a"); link.href = url; link.download = "chrome-extension-icons.zip"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("Chrome extension icon ZIP downloaded."); trackToolEvent("image-to-ico", "export_completed");
    } catch { if (request === revision.current) setError("Extension icon export failed. Try again with a smaller image."); }
    finally { if (request === revision.current) setBusy(false); }
  }

  return <section className="metadata-shell icon-tool" aria-labelledby="icon-tool-title">
    <div className="generator-heading"><div><span className="section-label">Private icon converter</span><h2 id="icon-tool-title">Make your image a usable icon</h2><p>PNG, JPG, WebP · up to 20 MB · files stay in your browser</p></div><span className="local-badge">No upload</span></div>
    <input ref={input} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={e => void load(e.target.files?.[0])} aria-label="Icon source image" />
    <div className="icon-drop" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void load(e.dataTransfer.files[0]); }}>
      <button className="button-secondary" onClick={() => input.current?.click()}>{image ? "Choose another image" : "Choose image"}</button><span>{loading ? "Opening image…" : image ? `${name} · ${image.width} × ${image.height}px` : "or drop your image here"}</span>
    </div>
    {image && <>
      <div className="icon-controls">
        <label>Image placement<select value={options.mode} onChange={e => change({ mode: e.target.value as IconOptions["mode"] })}><option value="fit">Fit — keep the whole image</option><option value="crop">Crop — fill the square</option></select></label>
        <label>Padding per side: {options.padding}%<input type="range" min="0" max="30" value={options.padding} onChange={e => change({ padding: Number(e.target.value) })} /></label>
        <label className="icon-checkbox"><input type="checkbox" checked={options.transparent} onChange={e => change({ transparent: e.target.checked })} />Transparent background</label>
        <label>Background / Apple touch color<input type="color" value={options.background} onChange={e => change({ background: e.target.value })} /></label>
      </div>
      <h3>Preview at actual size</h3><p>Each preview has its own pixel dimensions. Check the 16px version for missing detail; browser zoom and display density can change its physical size.</p>
      <div className="icon-previews">{ICO_SIZES.map(size => <IconPreview key={size} image={image} size={size} options={options} />)}</div>
      {Math.min(image.width, image.height) < 512 && <p className="icon-note">Your source is smaller than 512px on at least one side. Larger exports may look soft; resizing cannot restore missing detail.</p>}
      <div className="icon-actions"><button className="button-primary" disabled={busy} onClick={() => void download(false)}>{busy ? "Preparing icons…" : "Download ICO"}</button><button className="button-secondary" disabled={busy} onClick={() => void download(true)}>Download website ZIP</button><button className="button-secondary" disabled={busy} onClick={() => void downloadExtension()}>Download extension ZIP</button></div>
      <p>ICO: 16, 32, 48, 256px. Website ZIP adds Apple touch and 192/512px PNGs. Extension ZIP adds 16/32/48/128px PNGs and a matching manifest fragment.</p>
    </>}
    {error && <p className="tool-error" role="alert">{error}</p>}<p role="status" aria-live="polite">{status}</p>
    <details className="icon-snippets"><summary>Website integration snippets</summary><p>Place exported files at your site root or edit these paths.</p><button className="button-secondary" onClick={() => void copy(ICON_HTML)}>Copy HTML</button><pre>{ICON_HTML}</pre><p>Merge this icons member into your existing manifest. This fragment alone does not make a website an installable PWA.</p><button className="button-secondary" onClick={() => void copy(ICON_MANIFEST)}>Copy icons JSON</button><pre>{ICON_MANIFEST}</pre></details>
    <details className="icon-snippets"><summary>Chrome extension manifest snippet</summary><p>Merge these object members into an existing extension manifest. The downloaded ZIP uses the same filenames.</p><button className="button-secondary" onClick={() => void copy(EXTENSION_MANIFEST)}>Copy extension JSON</button><pre>{EXTENSION_MANIFEST}</pre></details>
  </section>;
}
