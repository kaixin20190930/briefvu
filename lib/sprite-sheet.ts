export const MAX_SPRITE_FRAMES = 180;
export const MAX_SPRITE_PIXELS = 32_000_000;

export function spriteLayout(sizes: { width: number; height: number }[], columns: number, gap = 0, margin = 0) {
  if (!sizes.length || sizes.length > MAX_SPRITE_FRAMES) throw new Error(`Choose 1–${MAX_SPRITE_FRAMES} frames.`);
  if (![columns, gap, margin].every(Number.isInteger) || columns < 1 || columns > 30 || gap < 0 || gap > 64 || margin < 0 || margin > 64) throw new Error("Use 1–30 columns and 0–64 px spacing and margin.");
  if (sizes.some(s => !Number.isInteger(s.width) || !Number.isInteger(s.height) || s.width < 1 || s.height < 1)) throw new Error("Each frame needs valid dimensions.");
  const cellWidth = Math.max(...sizes.map(s => s.width));
  const cellHeight = Math.max(...sizes.map(s => s.height));
  const cols = Math.min(columns, sizes.length), rows = Math.ceil(sizes.length / cols);
  const width = cols * cellWidth + (cols - 1) * gap + margin * 2;
  const height = rows * cellHeight + (rows - 1) * gap + margin * 2;
  if (width > 8192 || height > 8192 || width * height > MAX_SPRITE_PIXELS) throw new Error("This sheet exceeds 8,192 px per side or 32 megapixels. Reduce columns, frame size, or frame count.");
  return { width, height, columns: cols, rows, cellWidth, cellHeight, gap, margin, frames: sizes.map((s, index) => ({
    index, x: margin + index % cols * (cellWidth + gap), y: margin + Math.floor(index / cols) * (cellHeight + gap), w: cellWidth, h: cellHeight,
    offsetX: Math.floor((cellWidth - s.width) / 2), offsetY: Math.floor((cellHeight - s.height) / 2), sourceWidth: s.width, sourceHeight: s.height,
  })) };
}
