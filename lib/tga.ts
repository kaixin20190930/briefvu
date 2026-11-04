export const TGA_MAX_BYTES = 20 * 1024 * 1024;
export const TGA_MAX_PIXELS = 16_000_000;
export const TGA_MAX_SIDE = 8192;

export type TgaInfo = {
  width: number;
  height: number;
  pixelDepth: number;
  imageType: number;
  compression: "None" | "RLE";
  colorMode: "True color" | "Grayscale";
  origin: "Top left" | "Top right" | "Bottom left" | "Bottom right";
  alphaBits: number;
  hasVisibleTransparency: boolean;
};

export type DecodedTga = TgaInfo & { rgba: Uint8ClampedArray };

export class TgaError extends Error {
  constructor(message: string, public readonly code: "invalid" | "unsupported" | "too-large") {
    super(message);
    this.name = "TgaError";
  }
}

function u16(view: DataView, offset: number) {
  return view.getUint16(offset, true);
}

export function decodeTga(input: ArrayBuffer): DecodedTga {
  if (input.byteLength > TGA_MAX_BYTES) throw new TgaError("Choose a TGA file no larger than 20 MB.", "too-large");
  if (input.byteLength < 18) throw new TgaError("This file is too short to contain a complete TGA header.", "invalid");

  const view = new DataView(input);
  const bytes = new Uint8Array(input);
  const idLength = view.getUint8(0);
  const colorMapType = view.getUint8(1);
  const imageType = view.getUint8(2);
  const width = u16(view, 12);
  const height = u16(view, 14);
  const pixelDepth = view.getUint8(16);
  const descriptor = view.getUint8(17);
  const alphaBits = descriptor & 0x0f;

  if (!width || !height) throw new TgaError("The TGA header contains an invalid width or height.", "invalid");
  if (width > TGA_MAX_SIDE || height > TGA_MAX_SIDE || width * height > TGA_MAX_PIXELS) {
    throw new TgaError("Choose a TGA under 16 megapixels and no more than 8,192px per side.", "too-large");
  }
  if (colorMapType !== 0) throw new TgaError("Color-mapped TGA files are not supported in this release. Export a 24-bit or 32-bit true-color TGA instead.", "unsupported");

  const trueColor = imageType === 2 || imageType === 10;
  const grayscale = imageType === 3 || imageType === 11;
  const rle = imageType === 10 || imageType === 11;
  if (!trueColor && !grayscale) {
    throw new TgaError(`TGA image type ${imageType} is not supported. This viewer supports true-color and grayscale TGA files, with or without RLE.`, "unsupported");
  }
  if (trueColor && pixelDepth !== 24 && pixelDepth !== 32) {
    throw new TgaError(`${pixelDepth}-bit true-color TGA files are not supported in this release. Use a 24-bit or 32-bit export.`, "unsupported");
  }
  if (grayscale && pixelDepth !== 8) {
    throw new TgaError(`${pixelDepth}-bit grayscale TGA files are not supported in this release. Use an 8-bit grayscale export.`, "unsupported");
  }
  if ((descriptor & 0xc0) !== 0) throw new TgaError("Interleaved TGA pixel storage is not supported.", "unsupported");

  const attributeType = readAttributeType(view, bytes);
  if (attributeType === 4) throw new TgaError("This TGA declares premultiplied alpha, which is not supported safely in this release.", "unsupported");
  const preserveAlpha = pixelDepth === 32 && (alphaBits > 0 || attributeType === 3);
  const pixelBytes = pixelDepth / 8;
  let offset = 18 + idLength;
  if (offset > bytes.length) throw new TgaError("The TGA image ID extends beyond the end of the file.", "invalid");

  const pixelCount = width * height;
  const linear = new Uint8ClampedArray(pixelCount * 4);
  let written = 0;

  const readPixel = () => {
    if (offset + pixelBytes > bytes.length) throw new TgaError("The TGA pixel data is truncated.", "invalid");
    let red: number, green: number, blue: number, alpha = 255;
    if (grayscale) red = green = blue = bytes[offset];
    else {
      blue = bytes[offset]; green = bytes[offset + 1]; red = bytes[offset + 2];
      if (pixelDepth === 32 && preserveAlpha) alpha = bytes[offset + 3];
    }
    offset += pixelBytes;
    return [red, green, blue, alpha] as const;
  };

  const writePixel = (pixel: readonly number[]) => {
    if (written >= pixelCount) throw new TgaError("The TGA RLE stream expands beyond the declared image size.", "invalid");
    linear.set(pixel, written * 4);
    written++;
  };

  if (!rle) {
    while (written < pixelCount) writePixel(readPixel());
  } else {
    while (written < pixelCount) {
      if (offset >= bytes.length) throw new TgaError("The TGA RLE stream is truncated.", "invalid");
      const header = bytes[offset++];
      const count = (header & 0x7f) + 1;
      if (written + count > pixelCount) throw new TgaError("The TGA RLE packet exceeds the declared image size.", "invalid");
      if (header & 0x80) {
        const pixel = readPixel();
        for (let index = 0; index < count; index++) writePixel(pixel);
      } else {
        for (let index = 0; index < count; index++) writePixel(readPixel());
      }
    }
  }

  const rightToLeft = (descriptor & 0x10) !== 0;
  const topToBottom = (descriptor & 0x20) !== 0;
  const rgba = new Uint8ClampedArray(linear.length);
  let hasVisibleTransparency = false;
  for (let sourceY = 0; sourceY < height; sourceY++) {
    for (let sourceX = 0; sourceX < width; sourceX++) {
      const targetX = rightToLeft ? width - 1 - sourceX : sourceX;
      const targetY = topToBottom ? sourceY : height - 1 - sourceY;
      const source = (sourceY * width + sourceX) * 4;
      const target = (targetY * width + targetX) * 4;
      rgba.set(linear.subarray(source, source + 4), target);
      if (linear[source + 3] < 255) hasVisibleTransparency = true;
    }
  }

  const horizontal = rightToLeft ? "right" : "left";
  const vertical = topToBottom ? "Top" : "Bottom";
  return {
    width, height, pixelDepth, imageType,
    compression: rle ? "RLE" : "None",
    colorMode: trueColor ? "True color" : "Grayscale",
    origin: `${vertical} ${horizontal}` as TgaInfo["origin"],
    alphaBits,
    hasVisibleTransparency,
    rgba,
  };
}

function readAttributeType(view: DataView, bytes: Uint8Array) {
  if (bytes.length < 26) return null;
  const signature = new TextDecoder("ascii").decode(bytes.subarray(bytes.length - 18));
  if (signature !== "TRUEVISION-XFILE.\0") return null;
  const extensionOffset = view.getUint32(bytes.length - 26, true);
  if (!extensionOffset || extensionOffset + 495 > bytes.length) return null;
  return bytes[extensionOffset + 494];
}
