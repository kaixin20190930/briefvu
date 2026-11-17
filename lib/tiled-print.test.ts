import { describe, expect, it } from "vitest";
import { tiledPrintLayout, type PrintOptions, MM_TO_PT } from "./tiled-print";
import { PDFDocument } from "pdf-lib";
import { createTiledPdf } from "./tiled-print-pdf";
import { readFileSync } from "node:fs";
const options: PrintOptions = { paper: "A4", landscape: false, margin: 10, overlap: 5, mode: "size", width: 400, height: 300, columns: 2, rows: 2, locked: true };
describe("tiled print", () => {
  it("keeps neighboring crops continuous with exactly 5mm overlap", () => {
    const layout = tiledPrintLayout(4000, 3000, options);
    expect([layout.columns, layout.rows, layout.tiles.length]).toEqual([3, 2, 6]);
    expect(layout.tiles[1].x).toBe(layout.contentWidth - 5);
    expect(layout.tiles[3].y).toBe(layout.contentHeight - 5);
    expect(layout.ppi).toBeCloseTo(254);
  });
  it("fits proportions into a Letter landscape page grid and rejects excessive pages", () => {
    const layout = tiledPrintLayout(600, 400, { ...options, paper: "Letter", landscape: true, mode: "pages" });
    expect(layout.paperWidth).toBe(279.4); expect(layout.width / layout.height).toBeCloseTo(1.5); expect(layout.tiles).toHaveLength(4);
    expect(() => tiledPrintLayout(600, 400, { ...options, width: 10000, height: 10000 })).toThrow(/100 pages/);
    expect(() => tiledPrintLayout(600, 400, { ...options, overlap: NaN })).toThrow(/overlap/);
  });
  it("exports fixed A4 media boxes, a full grid, and a one-page test", async () => {
    // Existing screenshot is JPEG-encoded despite its .png extension.
    const jpeg = new Uint8Array(readFileSync("public/examples/ico-fit-preview.png"));
    const layout = tiledPrintLayout(600, 400, options);
    const full = await PDFDocument.load(await createTiledPdf(jpeg, layout, false, true, true));
    const first = await PDFDocument.load(await createTiledPdf(jpeg, layout, true, true, true));
    expect(full.getPageCount()).toBe(6); expect(first.getPageCount()).toBe(1);
    expect(full.getPage(0).getWidth()).toBeCloseTo(210 * MM_TO_PT);
    expect(full.getPage(0).getHeight()).toBeCloseTo(297 * MM_TO_PT);
  });
});
