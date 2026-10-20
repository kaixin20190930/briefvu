declare module "gifenc" {
  export function quantize(data: Uint8Array | Uint8ClampedArray, maxColors: number, options?: Record<string, unknown>): number[][];
  export function applyPalette(data: Uint8Array | Uint8ClampedArray, palette: number[][], format?: string): Uint8Array;
  export function GIFEncoder(): { writeFrame(index: Uint8Array, width: number, height: number, options: { palette?: number[][]; delay?: number; repeat?: number; transparent?: boolean; transparentIndex?: number }); finish(): void; bytes(): Uint8Array };
}
