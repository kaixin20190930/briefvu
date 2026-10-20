"use client";

import {
  Crop,
  Download,
  FlipHorizontal2,
  FlipVertical2,
  ImagePlus,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Type,
  Upload,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type PointerEvent,
} from "react";
import type { PhotoToolMode } from "@/lib/photo-tools";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";
import type { ToolId } from "@/lib/tool-events";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_PIXELS = 24_000_000;
type ActiveTool = "crop" | "rotate" | "text" | "adjust";
type ExportType = "image/png" | "image/jpeg" | "image/webp";
type CropRect = { x: number; y: number; width: number; height: number };
type CropHandle = "nw" | "ne" | "sw" | "se";

const modeTabs: { id: ActiveTool; label: string }[] = [
  { id: "crop", label: "Crop" },
  { id: "rotate", label: "Rotate" },
  { id: "text", label: "Text" },
  { id: "adjust", label: "Adjust" },
];

function initialTab(mode: PhotoToolMode): ActiveTool {
  return mode === "all" ? "crop" : mode === "mirror" ? "rotate" : mode === "invert" ? "adjust" : mode;
}

function extensionFor(type: ExportType) {
  return type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png";
}

function outputName(name: string, type: ExportType) {
  const stem = name.replace(/\.[^.]+$/, "") || "edited-image";
  return `${stem}-briefvu.${extensionFor(type)}`;
}

function toolIdForMode(mode: PhotoToolMode): ToolId {
  return mode === "crop"
    ? "crop-image"
    : mode === "rotate"
      ? "rotate-image"
      : mode === "mirror"
        ? "mirror-image"
        : mode === "invert"
          ? "invert-image"
      : mode === "text"
        ? "add-text-to-photo"
        : "photo-editor";
}

export function PhotoEditor({ mode }: { mode: PhotoToolMode }) {
  const toolId = toolIdForMode(mode);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLImageElement | null>(null);
  const cropHandleRef = useRef<CropHandle | null>(null);
  const [fileName, setFileName] = useState("image");
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>(initialTab(mode));
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [inverted, setInverted] = useState(false);
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(6);
  const [textPoint, setTextPoint] = useState({ x: 0.5, y: 0.82 });
  const [crop, setCrop] = useState<CropRect>(mode === "crop" ? { x: 0.1, y: 0.1, width: 0.8, height: 0.8 } : { x: 0, y: 0, width: 1, height: 1 });
  const [cropRatio, setCropRatio] = useState("free");
  const [cropScale, setCropScale] = useState(mode === "crop" ? 80 : 100);
  const [exportType, setExportType] = useState<ExportType>("image/png");
  const [exportQuality, setExportQuality] = useState(92);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const renderBase = useCallback(() => {
    const source = sourceRef.current;
    if (!source) return null;
    const quarterTurn = Math.abs(rotation / 90) % 2 === 1;
    const width = quarterTurn ? source.naturalHeight : source.naturalWidth;
    const height = quarterTurn ? source.naturalWidth : source.naturalHeight;
    const output = document.createElement("canvas");
    output.width = width;
    output.height = height;
    const context = output.getContext("2d");
    if (!context) return null;
    context.save();
    context.translate(width / 2, height / 2);
    context.rotate((rotation * Math.PI) / 180);
    context.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    context.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) invert(${inverted ? 100 : 0}%)`;
    context.drawImage(source, -source.naturalWidth / 2, -source.naturalHeight / 2);
    context.restore();

    if (text.trim()) {
      const fontSize = Math.max(16, Math.round(width * (textSize / 100)));
      context.font = `800 ${fontSize}px Arial, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.lineJoin = "round";
      context.lineWidth = Math.max(2, fontSize * 0.08);
      context.strokeStyle = "rgba(0,0,0,.72)";
      context.fillStyle = textColor;
      const x = textPoint.x * width;
      const y = textPoint.y * height;
      context.strokeText(text.trim(), x, y, width * 0.92);
      context.fillText(text.trim(), x, y, width * 0.92);
    }
    return output;
  }, [brightness, contrast, flipX, flipY, inverted, rotation, saturation, text, textColor, textPoint, textSize]);

  const drawPreview = useCallback(() => {
    const preview = canvasRef.current;
    const base = renderBase();
    if (!preview || !base) return;
    preview.width = base.width;
    preview.height = base.height;
    const context = preview.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, preview.width, preview.height);
    context.drawImage(base, 0, 0);
    if (activeTool === "crop") {
      const x = crop.x * preview.width;
      const y = crop.y * preview.height;
      const width = crop.width * preview.width;
      const height = crop.height * preview.height;
      context.fillStyle = "rgba(7, 19, 28, .55)";
      context.fillRect(0, 0, preview.width, y);
      context.fillRect(0, y + height, preview.width, preview.height - y - height);
      context.fillRect(0, y, x, height);
      context.fillRect(x + width, y, preview.width - x - width, height);
      context.strokeStyle = "#ffffff";
      context.lineWidth = Math.max(2, preview.width / 500);
      context.strokeRect(x, y, width, height);
      context.setLineDash([preview.width / 100, preview.width / 100]);
      context.strokeStyle = "rgba(255,255,255,.72)";
      context.beginPath();
      context.moveTo(x + width / 3, y);
      context.lineTo(x + width / 3, y + height);
      context.moveTo(x + (width * 2) / 3, y);
      context.lineTo(x + (width * 2) / 3, y + height);
      context.moveTo(x, y + height / 3);
      context.lineTo(x + width, y + height / 3);
      context.moveTo(x, y + (height * 2) / 3);
      context.lineTo(x + width, y + (height * 2) / 3);
      context.stroke();
      context.setLineDash([]);
      if (cropRatio === "free") {
        const radius = Math.max(7, preview.width / 140);
        context.fillStyle = "#ffffff";
        context.strokeStyle = "#136fe8";
        context.lineWidth = Math.max(2, preview.width / 600);
        for (const [handleX, handleY] of [[x, y], [x + width, y], [x, y + height], [x + width, y + height]]) {
          context.beginPath();
          context.arc(handleX, handleY, radius, 0, Math.PI * 2);
          context.fill();
          context.stroke();
        }
      }
    }
  }, [activeTool, crop, cropRatio, renderBase]);

  useEffect(() => drawPreview(), [drawPreview]);

  const setRatioCrop = useCallback((ratioValue: string, scale = cropScale) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maxWidth = Math.max(0.1, scale / 100);
    const maxHeight = Math.max(0.1, scale / 100);
    let width = maxWidth;
    let height = maxHeight;
    if (ratioValue !== "free") {
      const [rw, rh] = ratioValue.split(":").map(Number);
      const desired = rw / rh;
      const canvasRatio = canvas.width / canvas.height;
      if (desired > canvasRatio) height = width * canvasRatio / desired;
      else width = height * desired / canvasRatio;
    }
    setCrop({ x: (1 - width) / 2, y: (1 - height) / 2, width, height });
  }, [cropScale]);

  const loadFile = useCallback(async (file: File) => {
    setError(null);
    setNotice(null);
    if (!file.type.startsWith("image/")) return setError("Choose a PNG, JPEG, or WebP image.");
    if (file.size > MAX_FILE_BYTES) return setError("Choose an image under 25 MB so the editor stays responsive.");
    setLoading(true);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.decoding = "async";
      image.src = url;
      await image.decode();
      if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > MAX_PIXELS) {
        throw new Error("size");
      }
      sourceRef.current = image;
      setFileName(file.name || "pasted-image");
      setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
      setRotation(0);
      setFlipX(false);
      setFlipY(false);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setInverted(false);
      setText("");
      setCropRatio("free");
      const initialScale = mode === "crop" ? 80 : 100;
      setCropScale(initialScale);
      setCrop(mode === "crop" ? { x: 0.1, y: 0.1, width: 0.8, height: 0.8 } : { x: 0, y: 0, width: 1, height: 1 });
      trackToolStarted(toolId);
      trackToolEvent(toolId, "file_loaded");
    } catch {
      setError("This image could not be decoded safely. Try a PNG, JPEG, or WebP file under 24 megapixels.");
    } finally {
      URL.revokeObjectURL(url);
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [mode, toolId]);

  useEffect(() => {
    function paste(event: ClipboardEvent) {
      const item = Array.from(event.clipboardData?.items ?? []).find((candidate) => candidate.type.startsWith("image/"));
      const file = item?.getAsFile();
      if (file) {
        event.preventDefault();
        void loadFile(file);
      }
    }
    window.addEventListener("paste", paste);
    return () => window.removeEventListener("paste", paste);
  }, [loadFile]);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const file = Array.from(event.dataTransfer.files).find((candidate) => candidate.type.startsWith("image/"));
    if (file) void loadFile(file);
    else setError("No supported image was found in that drop.");
  }

  function normalizedPointer(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
    return { x, y, bounds };
  }

  function handleCanvasPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    const point = normalizedPointer(event);
    if (!point) return;
    const { x, y, bounds } = point;
    if (activeTool === "text") setTextPoint({ x, y });
    if (activeTool === "crop") {
      if (cropRatio === "free") {
        const thresholdX = 18 / bounds.width;
        const thresholdY = 18 / bounds.height;
        const handles: [CropHandle, number, number][] = [["nw", crop.x, crop.y], ["ne", crop.x + crop.width, crop.y], ["sw", crop.x, crop.y + crop.height], ["se", crop.x + crop.width, crop.y + crop.height]];
        const handle = handles.find(([, handleX, handleY]) => Math.abs(x - handleX) <= thresholdX && Math.abs(y - handleY) <= thresholdY);
        if (handle) {
          cropHandleRef.current = handle[0];
          event.currentTarget.setPointerCapture(event.pointerId);
          return;
        }
      }
      setCrop((current) => ({
        ...current,
        x: Math.min(1 - current.width, Math.max(0, x - current.width / 2)),
        y: Math.min(1 - current.height, Math.max(0, y - current.height / 2)),
      }));
    }
  }

  function handleCanvasPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const handle = cropHandleRef.current;
    if (!handle || activeTool !== "crop" || cropRatio !== "free") return;
    const point = normalizedPointer(event);
    if (!point) return;
    const minimum = 0.03;
    setCrop((current) => {
      const right = current.x + current.width;
      const bottom = current.y + current.height;
      if (handle === "nw") {
        const x = Math.min(right - minimum, point.x);
        const y = Math.min(bottom - minimum, point.y);
        return { x, y, width: right - x, height: bottom - y };
      }
      if (handle === "ne") {
        const nextRight = Math.max(current.x + minimum, point.x);
        const y = Math.min(bottom - minimum, point.y);
        return { x: current.x, y, width: nextRight - current.x, height: bottom - y };
      }
      if (handle === "sw") {
        const x = Math.min(right - minimum, point.x);
        const nextBottom = Math.max(current.y + minimum, point.y);
        return { x, y: current.y, width: right - x, height: nextBottom - current.y };
      }
      return { x: current.x, y: current.y, width: Math.max(minimum, point.x - current.x), height: Math.max(minimum, point.y - current.y) };
    });
  }

  function stopCropResize(event: PointerEvent<HTMLCanvasElement>) {
    cropHandleRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function resetEdits() {
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setInverted(false);
    setText("");
    setTextPoint({ x: 0.5, y: 0.82 });
    setCropRatio("free");
    setCropScale(mode === "crop" ? 80 : 100);
    setCrop(mode === "crop" ? { x: 0.1, y: 0.1, width: 0.8, height: 0.8 } : { x: 0, y: 0, width: 1, height: 1 });
    setNotice("Edits reset.");
  }

  function download() {
    const base = renderBase();
    if (!base) return;
    let output = base;
    if (mode === "crop" || (mode === "all" && crop.width < 0.999 && crop.height < 0.999)) {
      const sx = Math.round(crop.x * base.width);
      const sy = Math.round(crop.y * base.height);
      const sw = Math.max(1, Math.round(crop.width * base.width));
      const sh = Math.max(1, Math.round(crop.height * base.height));
      output = document.createElement("canvas");
      output.width = sw;
      output.height = sh;
      output.getContext("2d")?.drawImage(base, sx, sy, sw, sh, 0, 0, sw, sh);
    }
    const quality = exportType === "image/png" ? undefined : exportQuality / 100;
    output.toBlob((blob) => {
      if (!blob) return setError("The browser could not create the download. Try PNG instead.");
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = outputName(fileName, exportType);
      anchor.click();
      trackToolEvent(toolId, "export_completed");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(`Downloaded ${anchor.download}`);
    }, exportType, quality);
  }

  const focusedTab = mode === "mirror" ? "rotate" : mode === "invert" ? "adjust" : mode;
  const visibleTabs = mode === "all" ? modeTabs : modeTabs.filter((tab) => tab.id === focusedTab || (mode !== "invert" && tab.id === "adjust"));
  const orientedWidth = imageSize ? (Math.abs(rotation / 90) % 2 === 1 ? imageSize.height : imageSize.width) : 0;
  const orientedHeight = imageSize ? (Math.abs(rotation / 90) % 2 === 1 ? imageSize.width : imageSize.height) : 0;
  const cropPixels = imageSize ? {
    x: Math.round(orientedWidth * crop.x),
    y: Math.round(orientedHeight * crop.y),
    width: Math.round(orientedWidth * crop.width),
    height: Math.round(orientedHeight * crop.height),
  } : null;

  function updateCropPixels(field: "x" | "y" | "width" | "height", value: number) {
    if (!orientedWidth || !orientedHeight) return;
    setCrop((current) => {
      const normalized = value / (field === "x" || field === "width" ? orientedWidth : orientedHeight);
      if (field === "x") return { ...current, x: Math.max(0, Math.min(1 - current.width, normalized)) };
      if (field === "y") return { ...current, y: Math.max(0, Math.min(1 - current.height, normalized)) };
      if (field === "width") return { ...current, width: Math.max(1 / orientedWidth, Math.min(1 - current.x, normalized)) };
      return { ...current, height: Math.max(1 / orientedHeight, Math.min(1 - current.y, normalized)) };
    });
  }

  return (
    <section className="photo-editor-shell" aria-labelledby="photo-editor-title">
      <div className="photo-editor-heading">
        <div><span className="section-label">Private browser editor</span><h2 id="photo-editor-title">Open an image and start editing</h2><p>PNG, JPEG, or WebP · up to 25 MB and 24 megapixels</p></div>
        <span className="local-badge">Processed locally</span>
      </div>
      <input ref={inputRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => event.target.files?.[0] && void loadFile(event.target.files[0])} />

      {!imageSize ? (
        <div className={`photo-editor-dropzone${dragActive ? " drag-active" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDrop}>
          <span><ImagePlus size={32} /></span>
          <h3>Drop an image here</h3>
          <p>or paste an image with Ctrl+V / Cmd+V</p>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={loading}><Upload size={17} /> {loading ? "Opening…" : "Choose image"}</button>
        </div>
      ) : (
        <div className="photo-editor-workspace">
          <div className="photo-editor-tabs" role="tablist" aria-label="Editing tools">
            {visibleTabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTool === tab.id} className={activeTool === tab.id ? "active" : ""} onClick={() => setActiveTool(tab.id)}>{tab.id === "crop" ? <Crop size={16} /> : tab.id === "rotate" ? <RotateCw size={16} /> : tab.id === "text" ? <Type size={16} /> : <SlidersHorizontal size={16} />}{tab.label}</button>)}
          </div>

          <div className="photo-editor-layout">
            <aside className="photo-editor-controls">
              {activeTool === "crop" && <>
                <label>Aspect ratio<select value={cropRatio} onChange={(event) => { setCropRatio(event.target.value); setRatioCrop(event.target.value); }}><option value="free">Custom</option><option value="1:1">Square 1:1</option><option value="4:5">Portrait 4:5</option><option value="3:2">Landscape 3:2</option><option value="16:9">Widescreen 16:9</option></select></label>
                {cropRatio === "free" ? cropPixels && <div className="crop-pixel-grid"><label>X<input type="number" min="0" max={orientedWidth - 1} value={cropPixels.x} onChange={(event) => updateCropPixels("x", Number(event.target.value))}/></label><label>Y<input type="number" min="0" max={orientedHeight - 1} value={cropPixels.y} onChange={(event) => updateCropPixels("y", Number(event.target.value))}/></label><label>Width<input type="number" min="1" max={orientedWidth - cropPixels.x} value={cropPixels.width} onChange={(event) => updateCropPixels("width", Number(event.target.value))}/></label><label>Height<input type="number" min="1" max={orientedHeight - cropPixels.y} value={cropPixels.height} onChange={(event) => updateCropPixels("height", Number(event.target.value))}/></label></div> : <label>Crop size <output>{cropScale}%</output><input type="range" min="20" max="100" value={cropScale} onChange={(event) => { const value = Number(event.target.value); setCropScale(value); setRatioCrop(cropRatio, value); }} /></label>}
                <p className="control-help">{cropRatio === "free" ? "Drag a corner handle to resize freely, or enter exact pixel values. Click elsewhere to move the crop." : "Click or tap the preview to center the crop."}</p>
                {cropPixels && <p className="output-size">Output: <strong>{cropPixels.width} × {cropPixels.height}px</strong></p>}
              </>}
              {activeTool === "rotate" && <div className="control-button-grid">
                <button type="button" onClick={() => setRotation((value) => value - 90)}><RotateCcw size={18} /> Left</button>
                <button type="button" onClick={() => setRotation((value) => value + 90)}><RotateCw size={18} /> Right</button>
                <button type="button" onClick={() => setFlipX((value) => !value)} className={flipX ? "active" : ""}><FlipHorizontal2 size={18} /> Flip horizontal</button>
                <button type="button" onClick={() => setFlipY((value) => !value)} className={flipY ? "active" : ""}><FlipVertical2 size={18} /> Flip vertical</button>
              </div>}
              {activeTool === "text" && <>
                <label>Text<input type="text" maxLength={80} value={text} placeholder="Type a caption" onChange={(event) => setText(event.target.value)} /></label>
                <div className="inline-controls"><label>Color<input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} /></label><label>Size <output>{textSize}%</output><input type="range" min="2" max="14" value={textSize} onChange={(event) => setTextSize(Number(event.target.value))} /></label></div>
                <p className="control-help">Click or tap the preview to position the text.</p>
              </>}
              {activeTool === "adjust" && <>
                <label>Brightness <output>{brightness}%</output><input type="range" min="50" max="150" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} /></label>
                <label>Contrast <output>{contrast}%</output><input type="range" min="50" max="150" value={contrast} onChange={(event) => setContrast(Number(event.target.value))} /></label>
                <label>Saturation <output>{saturation}%</output><input type="range" min="0" max="200" value={saturation} onChange={(event) => setSaturation(Number(event.target.value))} /></label>
                <div className="control-button-grid"><button type="button" className={inverted ? "active" : ""} onClick={() => setInverted((value) => !value)}>{inverted ? "Remove color inversion" : "Invert image colors"}</button></div>
              </>}
              <button className="reset-edit-button" type="button" onClick={resetEdits}>Reset edits</button>
            </aside>

            <div className="photo-editor-preview"><canvas ref={canvasRef} onPointerDown={handleCanvasPointerDown} onPointerMove={handleCanvasPointerMove} onPointerUp={stopCropResize} onPointerCancel={stopCropResize} aria-label="Image editing preview" /></div>
          </div>

          <div className="photo-editor-export">
            <div><strong>{fileName}</strong><span>{imageSize.width} × {imageSize.height}px source</span></div>
            <label><span>Format</span><select value={exportType} onChange={(event) => setExportType(event.target.value as ExportType)}><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></label>
            {exportType !== "image/png" && <label className="export-quality"><span>Quality {exportQuality}%</span><input type="range" min="40" max="100" value={exportQuality} onChange={(event) => setExportQuality(Number(event.target.value))}/></label>}
            <button type="button" className="button-primary" onClick={download}><Download size={17} /> Download image</button>
            <button type="button" className="button-secondary" onClick={() => inputRef.current?.click()}>Choose another</button>
          </div>
        </div>
      )}
      {error && <p className="photo-editor-message error" role="alert">{error}</p>}
      {notice && <p className="photo-editor-message" role="status">{notice}</p>}
    </section>
  );
}

