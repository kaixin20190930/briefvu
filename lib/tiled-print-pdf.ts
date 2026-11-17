import { PDFDocument, StandardFonts, PrintScaling, rgb, pushGraphicsState, popGraphicsState, rectangle, clip, endPath } from "pdf-lib";
import { MM_TO_PT as pt, type PrintLayout } from "./tiled-print";

/** Embed the decoded, white-backed source once; every page clips the same image transform. */
export async function createTiledPdf(jpeg: Uint8Array, layout: PrintLayout, firstPageOnly: boolean, cutLines: boolean, ruler: boolean) {
  const pdf = await PDFDocument.create();
  const image = await pdf.embedJpg(jpeg), font = await pdf.embedFont(StandardFonts.Helvetica);
  pdf.setTitle("BriefVu tiled image print"); pdf.catalog.getOrCreateViewerPreferences().setPrintScaling(PrintScaling.None);
  const tiles = firstPageOnly ? layout.tiles.slice(0, 1) : layout.tiles;
  for (const tile of tiles) {
    const page = pdf.addPage([layout.paperWidth * pt, layout.paperHeight * pt]);
    page.pushOperators(pushGraphicsState(), rectangle(layout.contentLeft * pt, layout.contentBottom * pt, layout.contentWidth * pt, layout.contentHeight * pt), clip(), endPath());
    page.drawImage(image, { x: (layout.contentLeft + layout.offsetX - tile.x) * pt, y: (layout.contentBottom + layout.contentHeight - layout.offsetY - layout.height + tile.y) * pt, width: layout.width * pt, height: layout.height * pt });
    page.pushOperators(popGraphicsState());
    const line = (x1: number, y1: number, x2: number, y2: number, dashed = false) => page.drawLine({ start: { x: x1 * pt, y: y1 * pt }, end: { x: x2 * pt, y: y2 * pt }, thickness: 0.4, color: rgb(0.2, 0.2, 0.2), ...(dashed ? { dashArray: [2, 2] } : {}) });
    if (cutLines) {
      const left = layout.contentLeft, right = left + layout.contentWidth, bottom = layout.contentBottom, top = bottom + layout.contentHeight;
      for (const x of [left, right]) for (const y of [bottom, top]) { line(x - 2, y, x + 2, y); line(x, y - 2, x, y + 2); }
      if (tile.column > 0 && layout.overlap) line(left + layout.overlap, bottom, left + layout.overlap, top, true);
      if (tile.row > 0 && layout.overlap) line(left, top - layout.overlap, right, top - layout.overlap, true);
    }
    page.drawText(`Row ${tile.row + 1} / ${layout.rows}  -  Column ${tile.column + 1} / ${layout.columns}  |  Print at 100% / Actual size`, { x: layout.contentLeft * pt, y: (layout.paperHeight - layout.margin - 3.3) * pt, size: 7, font });
    if (ruler && tile.row === 0 && tile.column === 0) {
      line(layout.contentLeft, layout.margin + 2, layout.contentLeft + 100, layout.margin + 2);
      for (let mm = 0; mm <= 100; mm += 10) line(layout.contentLeft + mm, layout.margin + 1.2, layout.contentLeft + mm, layout.margin + 2.8);
      page.drawText("100 mm", { x: (layout.contentLeft + 103) * pt, y: (layout.margin + 1.1) * pt, size: 6, font });
    }
  }
  return Uint8Array.from(await pdf.save());
}
