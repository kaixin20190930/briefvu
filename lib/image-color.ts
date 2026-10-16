export type RgbColor = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

export type HslColor = {
  h: number;
  s: number;
  l: number;
};

export type PixelPoint = {
  x: number;
  y: number;
};

function clampChannel(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(255, Math.max(0, Math.round(value)));
}
export function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number): HslColor {
  const red = clampChannel(r) / 255;
  const green = clampChannel(g) / 255;
  const blue = clampChannel(b) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(lightness * 100) };
  }

  const delta = max - min;
  const saturation = lightness > 0.5
    ? delta / (2 - max - min)
    : delta / (max + min);
  let hue: number;

  if (max === red) {
    hue = (green - blue) / delta + (green < blue ? 6 : 0);
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  return {
    h: Math.round(hue * 60) % 360,
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

export function formatRgb(color: RgbColor) {
  return `rgb(${clampChannel(color.r)}, ${clampChannel(color.g)}, ${clampChannel(color.b)})`;
}

export function formatHsl(color: RgbColor) {
  const hsl = rgbToHsl(color.r, color.g, color.b);
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

export function clampPixelPoint(
  point: PixelPoint,
  width: number,
  height: number,
): PixelPoint {
  const maxX = Math.max(0, Math.floor(width) - 1);
  const maxY = Math.max(0, Math.floor(height) - 1);
  return {
    x: Math.min(maxX, Math.max(0, Math.floor(Number.isFinite(point.x) ? point.x : 0))),
    y: Math.min(maxY, Math.max(0, Math.floor(Number.isFinite(point.y) ? point.y : 0))),
  };
}

export function mapClientPointToPixel(
  clientPoint: PixelPoint,
  rect: { left: number; top: number; width: number; height: number },
  canvasWidth: number,
  canvasHeight: number,
): PixelPoint {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
  return clampPixelPoint(
    {
      x: ((clientPoint.x - rect.left) / rect.width) * canvasWidth,
      y: ((clientPoint.y - rect.top) / rect.height) * canvasHeight,
    },
    canvasWidth,
    canvasHeight,
  );
}
