export const PAPER_MM = { A4: [210, 297], Letter: [215.9, 279.4] } as const;
export const MM_TO_PT = 72 / 25.4;
export type PrintOptions = { paper: keyof typeof PAPER_MM; landscape: boolean; margin: number; overlap: number; mode: "size" | "pages"; width: number; height: number; columns: number; rows: number; locked: boolean };

export function tiledPrintLayout(pixelWidth: number, pixelHeight: number, options: PrintOptions) {
  const { margin, overlap } = options;
  const dims = PAPER_MM[options.paper];
  if (!dims || !Number.isFinite(pixelWidth) || !Number.isFinite(pixelHeight) || pixelWidth <= 0 || pixelHeight <= 0) throw new Error("Choose a valid image and paper size.");
  const [paperWidth, paperHeight] = options.landscape ? [dims[1], dims[0]] : dims;
  if (!Number.isFinite(margin) || margin < 5 || margin > 40) throw new Error("Use printer margins between 5 and 40 mm.");
  // Reserve printable space for crop marks, row labels, and the calibration ruler.
  const contentLeft = margin + 3, contentBottom = margin + 6;
  const contentWidth = paperWidth - 2 * margin - 6, contentHeight = paperHeight - 2 * margin - 12;
  if (!Number.isFinite(overlap) || overlap < 0 || overlap > 30 || overlap >= Math.min(contentWidth, contentHeight)) throw new Error("Use overlap between 0 and 30 mm, smaller than the printable area.");
  const stepX = contentWidth - overlap, stepY = contentHeight - overlap;
  let width: number, height: number, columns: number, rows: number, areaWidth: number, areaHeight: number;
  if (options.mode === "pages") {
    columns = options.columns; rows = options.rows;
    if (![columns, rows].every(n => Number.isInteger(n) && n >= 1 && n <= 20)) throw new Error("Choose 1–20 columns and rows.");
    areaWidth = contentWidth + (columns - 1) * stepX; areaHeight = contentHeight + (rows - 1) * stepY;
    const scale = Math.min(areaWidth / pixelWidth, areaHeight / pixelHeight);
    width = options.locked ? pixelWidth * scale : areaWidth; height = options.locked ? pixelHeight * scale : areaHeight;
  } else {
    width = options.width; height = options.height;
    if (![width, height].every(n => Number.isFinite(n) && n > 0 && n <= 10000)) throw new Error("Use final dimensions above 0 and no more than 10,000 mm.");
    columns = Math.max(1, Math.ceil((width - overlap - 1e-8) / stepX)); rows = Math.max(1, Math.ceil((height - overlap - 1e-8) / stepY));
    areaWidth = contentWidth + (columns - 1) * stepX; areaHeight = contentHeight + (rows - 1) * stepY;
  }
  if (columns * rows > 100) throw new Error("This layout needs more than 100 pages. Reduce the final size or page count.");
  const offsetX = (areaWidth - width) / 2, offsetY = (areaHeight - height) / 2;
  return { paperWidth, paperHeight, contentWidth, contentHeight, contentLeft, contentBottom, margin, overlap, width, height, areaWidth, areaHeight, offsetX, offsetY, columns, rows, ppi: Math.min(pixelWidth / width, pixelHeight / height) * 25.4,
    tiles: Array.from({ length: columns * rows }, (_, index) => ({ row: Math.floor(index / columns), column: index % columns, x: index % columns * stepX, y: Math.floor(index / columns) * stepY })) };
}
export type PrintLayout = ReturnType<typeof tiledPrintLayout>;
