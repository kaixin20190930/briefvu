"use client";

import {
  Check,
  Clipboard,
  Copy,
  Crosshair,
  ImagePlus,
  Lock,
  MousePointer2,
  RefreshCw,
  ShieldCheck,
  Upload,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  clampPixelPoint,
  formatHsl,
  formatRgb,
  mapClientPointToPixel,
  rgbToHex,
  type PixelPoint,
  type RgbColor,
} from "@/lib/image-color";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 20_000_000;
const MAX_IMAGE_EDGE = 8192;
const LOUPE_SIZE = 104;
const LOUPE_SOURCE_SIZE = 13;

type CopyTarget = "hex" | "rgb" | "hsl";
type CopyState = CopyTarget | "failed" | null;

function fallbackCopy(value: string) {
  const field = document.createElement("textarea");
  field.value = value;
  field.readOnly = true;
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    field.remove();
  }
  return copied;
}

export function ImageColorPicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loupeRef = useRef<HTMLCanvasElement>(null);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [imageInfo, setImageInfo] = useState<{ name: string; width: number; height: number } | null>(null);
  const [color, setColor] = useState<RgbColor | null>(null);
  const [point, setPoint] = useState<PixelPoint | null>(null);
  const [locked, setLocked] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>(null);

  const hex = color ? rgbToHex(color.r, color.g, color.b) : "#136FE8";
  const rgb = color ? formatRgb(color) : "rgb(19, 111, 232)";
  const hsl = color ? formatHsl(color) : "hsl(213, 85%, 49%)";
  const alpha = color?.a ?? 255;

  useEffect(() => () => {
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
  }, []);

  const samplePixel = useCallback((nextPoint: PixelPoint) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const safePoint = clampPixelPoint(nextPoint, canvas.width, canvas.height);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    const [r, g, b, a] = context.getImageData(safePoint.x, safePoint.y, 1, 1).data;
    setPoint(safePoint);
    setColor({ r, g, b, a });
  }, []);

  const drawLoupe = useCallback((nextPoint: PixelPoint) => {
    const source = canvasRef.current;
    const loupe = loupeRef.current;
    if (!source || !loupe) return;
    const context = loupe.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);
    context.imageSmoothingEnabled = false;
    context.drawImage(
      source,
      nextPoint.x - Math.floor(LOUPE_SOURCE_SIZE / 2),
      nextPoint.y - Math.floor(LOUPE_SOURCE_SIZE / 2),
      LOUPE_SOURCE_SIZE,
      LOUPE_SOURCE_SIZE,
      0,
      0,
      LOUPE_SIZE,
      LOUPE_SIZE,
    );
    const center = LOUPE_SIZE / 2;
    const pixelSize = LOUPE_SIZE / LOUPE_SOURCE_SIZE;
    context.strokeStyle = "rgba(255,255,255,.95)";
    context.lineWidth = 3;
    context.strokeRect(center - pixelSize / 2, center - pixelSize / 2, pixelSize, pixelSize);
    context.strokeStyle = "rgba(16,32,43,.95)";
    context.lineWidth = 1;
    context.strokeRect(center - pixelSize / 2, center - pixelSize / 2, pixelSize, pixelSize);
    context.beginPath();
    context.moveTo(center, 0);
    context.lineTo(center, LOUPE_SIZE);
    context.moveTo(0, center);
    context.lineTo(LOUPE_SIZE, center);
    context.stroke();
  }, []);

  const loadFile = useCallback(async (file: File) => {
    setError(null);
    setCopyState(null);
    if (file.type && !file.type.startsWith("image/")) {
      setError("That file is not an image. Choose a picture your browser can open.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("This image is larger than 20 MB. Choose a smaller file so the browser stays responsive.");
      return;
    }

    setLoading(true);
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.decoding = "async";
      image.src = objectUrl;
      await image.decode();
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      if (!width || !height) throw new Error("empty image");
      if (width > MAX_IMAGE_EDGE || height > MAX_IMAGE_EDGE || width * height > MAX_IMAGE_PIXELS) {
        setError("This image is too large to sample safely. Use an image under 20 megapixels with each side below 8,192 px.");
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("canvas unavailable");
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      const center = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
      const displayName = !file.name || file.name.startsWith("clipboard.") ? "Pasted image" : file.name;
      setImageInfo({ name: displayName, width, height });
      setLocked(false);
      samplePixel(center);
      drawLoupe(center);
    } catch {
      setError("BriefVu could not decode this image. Try exporting it as PNG, JPEG, or another format your browser supports.");
    } finally {
      URL.revokeObjectURL(objectUrl);
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [drawLoupe, samplePixel]);

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const imageItem = Array.from(event.clipboardData?.items ?? []).find((item) => item.type.startsWith("image/"));
      const file = imageItem?.getAsFile();
      if (!file) return;
      event.preventDefault();
      void loadFile(file);
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [loadFile]);

  function pointFromPointer(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return mapClientPointToPixel(
      { x: event.clientX, y: event.clientY },
      canvas.getBoundingClientRect(),
      canvas.width,
      canvas.height,
    );
  }

  function positionLoupe(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const loupe = loupeRef.current;
    if (!canvas || !loupe) return;
    const rect = canvas.getBoundingClientRect();
    loupe.style.left = `${event.clientX - rect.left}px`;
    loupe.style.top = `${event.clientY - rect.top}px`;
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (locked || event.pointerType === "touch") return;
    const nextPoint = pointFromPointer(event);
    if (!nextPoint) return;
    samplePixel(nextPoint);
    drawLoupe(nextPoint);
    positionLoupe(event);
  }

  function handleCanvasClick(event: PointerEvent<HTMLCanvasElement>) {
    if (locked) {
      setLocked(false);
      return;
    }
    const nextPoint = pointFromPointer(event);
    if (nextPoint) samplePixel(nextPoint);
    setLocked(true);
  }

  function handleCanvasKeyDown(event: KeyboardEvent<HTMLCanvasElement>) {
    if (!imageInfo) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setLocked((value) => !value);
      return;
    }
    if (!locked || !point || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const delta = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    }[event.key];
    if (!delta) return;
    samplePixel({ x: point.x + delta.x, y: point.y + delta.y });
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const file = Array.from(event.dataTransfer.files).find((candidate) => !candidate.type || candidate.type.startsWith("image/"));
    if (file) void loadFile(file);
    else setError("No image file was found in that drop.");
  }

  async function copyValue(target: CopyTarget, value: string) {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        copied = true;
      } else {
        copied = fallbackCopy(value);
      }
    } catch {
      copied = fallbackCopy(value);
    }
    setCopyState(copied ? target : "failed");
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    copyResetTimer.current = setTimeout(() => setCopyState(null), 1600);
  }

  return (
    <section className="color-picker-shell" aria-labelledby="picker-title">
      <div className="generator-heading color-picker-heading">
        <div>
          <span className="section-label">Browser-local tool</span>
          <h2 id="picker-title">Pick a pixel, copy its color</h2>
          <p>Upload, drag, or paste an image. Nothing is sent to BriefVu.</p>
        </div>
        <span className="local-badge"><ShieldCheck size={17} /> Your image stays local</span>
      </div>

      <input
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void loadFile(file);
        }}
        ref={inputRef}
        type="file"
      />

      {!imageInfo ? (
        <div
          className={`image-dropzone ${dragActive ? "drag-active" : ""}`}
          onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
          onDragLeave={(event) => { event.preventDefault(); setDragActive(false); }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="upload-icon"><ImagePlus size={32} /></div>
          <h3>{loading ? "Opening your image…" : "Click or drag an image here"}</h3>
          <p>You can also paste a screenshot with Ctrl+V or Cmd+V.</p>
          <button disabled={loading} onClick={() => inputRef.current?.click()} type="button"><Upload size={17} /> Choose image</button>
          <small>Up to 20 MB and 20 megapixels. Supported formats depend on your browser.</small>
        </div>
      ) : null}

        <div className="picker-workspace" hidden={!imageInfo}>
          <div className="picker-toolbar">
            <div><strong>{imageInfo?.name}</strong><span>{imageInfo ? `${imageInfo.width.toLocaleString()} × ${imageInfo.height.toLocaleString()} px` : ""}</span></div>
            <button onClick={() => inputRef.current?.click()} type="button"><RefreshCw size={16} /> Replace image</button>
          </div>
          <div className="canvas-frame">
            <canvas
              aria-describedby="canvas-help"
              aria-label="Image color sampling canvas"
              className={locked ? "is-locked" : ""}
              onPointerDown={handleCanvasClick}
              onKeyDown={handleCanvasKeyDown}
              onPointerMove={handlePointerMove}
              ref={canvasRef}
              tabIndex={0}
            />
            <canvas
              aria-hidden="true"
              className={`pixel-loupe ${locked ? "hidden" : ""}`}
              height={LOUPE_SIZE}
              ref={loupeRef}
              width={LOUPE_SIZE}
            />
          </div>
          <p className="canvas-help" id="canvas-help">
            {locked ? <><Lock size={15} /> Color locked. Click again to unlock, or use arrow keys to move one pixel.</> : <><MousePointer2 size={15} /> Move to preview. Click or tap to lock a color.</>}
          </p>
        </div>

      {error ? <div className="picker-error" role="alert">{error}</div> : null}

      {imageInfo && color && point ? (
        <div className="color-result" aria-label="Selected color">
          <div className="color-result-swatch">
            <i className="swatch-color-fill" style={{ backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha / 255})` }} />
            <span style={{ backgroundColor: hex }} />
          </div>
          <div className="color-result-values">
            <div className="color-result-title">
              <div><span>Selected pixel</span><strong>{hex}</strong></div>
              <span className="pixel-coordinate"><Crosshair size={14} /> x {point.x}, y {point.y}</span>
            </div>
            <div className="color-value-row"><code>{hex}</code><button onClick={() => void copyValue("hex", hex)} type="button">{copyState === "hex" ? <Check size={16} /> : <Copy size={16} />}{copyState === "hex" ? "Copied" : "Copy HEX"}</button></div>
            <div className="color-value-row"><code>{rgb}</code><button onClick={() => void copyValue("rgb", rgb)} type="button">{copyState === "rgb" ? <Check size={16} /> : <Copy size={16} />}{copyState === "rgb" ? "Copied" : "Copy RGB"}</button></div>
            <div className="color-value-row"><code>{hsl}</code><button onClick={() => void copyValue("hsl", hsl)} type="button">{copyState === "hsl" ? <Check size={16} /> : <Copy size={16} />}{copyState === "hsl" ? "Copied" : "Copy HSL"}</button></div>
            {alpha < 255 ? <p className="alpha-note">Pixel opacity: {Math.round((alpha / 255) * 100)}%. The values above report its RGB channels separately from transparency.</p> : null}
          </div>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {copyState === "failed" ? "Copy failed. Select the displayed value and copy it manually." : copyState ? `${copyState.toUpperCase()} color copied.` : ""}
      </p>
      <div className="paste-tip"><Clipboard size={16} /><span>Tip: paste a screenshot anywhere on this page to open it instantly.</span></div>
    </section>
  );
}
