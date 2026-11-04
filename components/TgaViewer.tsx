"use client";

import { Download, RefreshCw, Upload } from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { decodeTga, TgaError, type DecodedTga } from "@/lib/tga";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

type OutputType = "image/png" | "image/webp" | "image/jpeg";
type LoadedTga = { file: File; decoded: DecodedTga };

function sampleFile() {
  const width = 4, height = 4;
  const bytes = new Uint8Array(18 + width * height * 4);
  bytes[2] = 2; bytes[12] = width; bytes[14] = height; bytes[16] = 32; bytes[17] = 0x28;
  const colors = [[44,99,235,255], [14,165,233,210], [34,197,94,150], [249,115,22,80]];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const [r,g,b,a] = colors[(x + y) % colors.length];
    const at = 18 + (y * width + x) * 4;
    bytes.set([b,g,r,a], at);
  }
  return new File([bytes], "briefvu-transparent-sample.tga", { type: "application/octet-stream" });
}

export function TgaViewer() {
  const input = useRef<HTMLInputElement>(null);
  const preview = useRef<HTMLCanvasElement>(null);
  const revision = useRef(0);
  const [image, setImage] = useState<LoadedTga | null>(null);
  const [zoom, setZoom] = useState("fit");
  const [background, setBackground] = useState("checker");
  const [output, setOutput] = useState<OutputType>("image/png");
  const [quality, setQuality] = useState(90);
  const [jpgBackground, setJpgBackground] = useState("#ffffff");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const canvas = preview.current;
    if (!canvas || !image) return;
    canvas.width = image.decoded.width;
    canvas.height = image.decoded.height;
    canvas.getContext("2d")?.putImageData(new ImageData(new Uint8ClampedArray(image.decoded.rgba), image.decoded.width, image.decoded.height), 0, 0);
  }, [image]);

  async function load(file?: File) {
    if (!file) return;
    const request = ++revision.current;
    setImage(null); setError(""); setStatus(""); setBusy(true);
    try {
      if (!/\.tga$/i.test(file.name)) throw new TgaError("Choose a file with the .tga extension.", "unsupported");
      const decoded = decodeTga(await file.arrayBuffer());
      if (request !== revision.current) return;
      setImage({ file, decoded });
      trackToolStarted("tga-viewer"); trackToolEvent("tga-viewer", "file_loaded");
    } catch (cause) {
      if (request === revision.current) setError(cause instanceof Error ? cause.message : "This TGA file could not be opened.");
    } finally {
      if (request === revision.current) { setBusy(false); if (input.current) input.current.value = ""; }
    }
  }

  function reset() { revision.current++; setImage(null); setBusy(false); setError(""); setStatus(""); }

  function convert() {
    if (!image || busy) return;
    const request = ++revision.current;
    setBusy(true); setError(""); setStatus("");
    const canvas = document.createElement("canvas");
    canvas.width = image.decoded.width; canvas.height = image.decoded.height;
    const context = canvas.getContext("2d");
    if (!context) { setBusy(false); return setError("The browser could not create an output canvas."); }
    if (output === "image/jpeg") { context.fillStyle = jpgBackground; context.fillRect(0, 0, canvas.width, canvas.height); }
    context.putImageData(new ImageData(new Uint8ClampedArray(image.decoded.rgba), image.decoded.width, image.decoded.height), 0, 0);
    canvas.toBlob(blob => {
      if (request !== revision.current) return;
      setBusy(false);
      if (!blob || blob.type !== output) return setError("This browser could not encode the selected output. Try PNG instead.");
      const extension = output === "image/jpeg" ? "jpg" : output === "image/webp" ? "webp" : "png";
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url; link.download = `${image.file.name.replace(/\.tga$/i, "") || "tga-image"}.${extension}`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(`${extension.toUpperCase()} downloaded · ${(blob.size / 1000).toFixed(1)} KB`);
      trackToolEvent("tga-viewer", "export_completed");
    }, output, output === "image/png" ? undefined : quality / 100);
  }

  function drop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); setDrag(false); void load(event.dataTransfer.files[0]); }

  return <section className="metadata-shell tga-tool" aria-labelledby="tga-tool-title">
    <div className="generator-heading"><div><span className="section-label">Private TGA viewer</span><h2 id="tga-tool-title">Open a TGA file in your browser</h2><p>Common 24/32-bit true-color and 8-bit grayscale TGA · no upload</p></div><span className="local-badge">No upload</span></div>
    <input ref={input} id="tga-input" className="sr-only" type="file" accept=".tga,application/x-tga,image/x-tga" onChange={event => void load(event.target.files?.[0])}/>
    {!image ? <div className={`metadata-dropzone${drag ? " drag-active" : ""}`} onDragOver={event => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={drop}>
      <Upload size={31}/><strong>{busy ? "Opening TGA…" : "Drop a TGA here or choose a file"}</strong>
      <div className="icon-actions"><button className="button-primary" type="button" disabled={busy} onClick={() => input.current?.click()}>Choose TGA</button><button className="button-secondary" type="button" disabled={busy} onClick={() => void load(sampleFile())}>Open sample TGA</button></div>
      <span>Up to 20 MB, 16 megapixels, and 8,192px per side</span>
    </div> : <>
      <div className="tga-workspace">
        <div><div className={`tga-preview ${background}`}><canvas ref={preview} style={zoom === "fit" ? { maxWidth: "100%", maxHeight: "520px" } : { width: `${image.decoded.width * Number(zoom)}px`, height: `${image.decoded.height * Number(zoom)}px` }}/></div>
          <div className="resize-presets"><button type="button" onClick={() => setZoom("fit")}>Fit</button>{[1,2,4].map(value => <button type="button" key={value} onClick={() => setZoom(String(value))}>{value * 100}%</button>)}</div>
          <label>Preview background<select value={background} onChange={event => setBackground(event.target.value)}><option value="checker">Checkerboard</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
        </div>
        <div className="converter-controls">
          <dl className="tga-info"><div><dt>Dimensions</dt><dd>{image.decoded.width} × {image.decoded.height}px</dd></div><div><dt>Color</dt><dd>{image.decoded.colorMode} · {image.decoded.pixelDepth}-bit</dd></div><div><dt>Compression</dt><dd>{image.decoded.compression}</dd></div><div><dt>Origin</dt><dd>{image.decoded.origin}</dd></div><div><dt>Alpha</dt><dd>{image.decoded.hasVisibleTransparency ? "Visible transparent pixels" : image.decoded.alphaBits ? `Declared ${image.decoded.alphaBits}-bit, fully opaque` : "No declared alpha"}</dd></div></dl>
          <label>Output format<select value={output} onChange={event => setOutput(event.target.value as OutputType)}><option value="image/png">PNG</option><option value="image/webp">WebP</option><option value="image/jpeg">JPG</option></select></label>
          {output !== "image/png" && <label>Quality <output>{quality}%</output><input type="range" min="40" max="100" value={quality} onChange={event => setQuality(Number(event.target.value))}/></label>}
          {output === "image/jpeg" && <label>Transparency background<input type="color" value={jpgBackground} onChange={event => setJpgBackground(event.target.value)}/></label>}
          <button className="button-primary" disabled={busy} type="button" onClick={convert}><Download size={17}/>{busy ? "Converting…" : `Convert to ${output.split("/")[1].toUpperCase()}`}</button>
          <button className="button-secondary" type="button" onClick={reset}><RefreshCw size={16}/>Choose another</button>
        </div>
      </div>
    </>}
    {error && <p className="tool-error" role="alert">{error}</p>}<p role="status" aria-live="polite">{status}</p>
    <p className="converter-heic-note"><strong>Supported in this release:</strong> uncompressed and RLE 24/32-bit true-color TGA, plus 8-bit grayscale. Indexed-color, 16-bit, interleaved, and premultiplied-alpha TGA variants return a specific unsupported-format message.</p>
  </section>;
}
