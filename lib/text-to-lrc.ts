export type LrcLine = {
  text: string;
  timeSeconds: number | null;
};

export function parseLyrics(value: string): LrcLine[] {
  return value.replace(/\r\n?/g, "\n").split("\n").map((text) => ({ text, timeSeconds: null }));
}

export function formatLrcTimestamp(value: number): string {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
  const totalCentiseconds = Math.round(safeValue * 100);
  const minutes = Math.floor(totalCentiseconds / 6000);
  const seconds = Math.floor((totalCentiseconds % 6000) / 100);
  const centiseconds = totalCentiseconds % 100;
  return `[${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}]`;
}

export function parseLrcTimestamp(value: string): number | null {
  const match = value.trim().match(/^(?:\[)?(\d+):([0-5]?\d)(?:[.:](\d{1,2}))?(?:\])?$/u);
  if (!match) return null;
  const fraction = (match[3] ?? "0").padEnd(2, "0").slice(0, 2);
  return Number(match[1]) * 60 + Number(match[2]) + Number(fraction) / 100;
}

export function autoIncrementLrcLines(lines: LrcLine[], startSeconds: number, intervalSeconds: number): LrcLine[] {
  let nextTime = Math.max(0, startSeconds);
  const interval = Math.max(0.01, intervalSeconds);
  return lines.map((line) => {
    if (!line.text.trim()) return { ...line, timeSeconds: null };
    const result = { ...line, timeSeconds: nextTime };
    nextTime += interval;
    return result;
  });
}

export function offsetLrcLines(lines: LrcLine[], offsetSeconds: number): LrcLine[] {
  return lines.map((line) => ({
    ...line,
    timeSeconds: line.timeSeconds === null ? null : Math.max(0, line.timeSeconds + offsetSeconds),
  }));
}

export function isLrcReady(lines: LrcLine[]): boolean {
  const lyricLines = lines.filter((line) => line.text.trim());
  return lyricLines.length > 0 && lyricLines.every((line) => line.timeSeconds !== null);
}

export function buildLrc(lines: LrcLine[]): string {
  return lines
    .map((line) => {
      if (!line.text.trim()) return "";
      if (line.timeSeconds === null) return `[--:--.--]${line.text}`;
      return `${formatLrcTimestamp(line.timeSeconds)}${line.text}`;
    })
    .join("\n");
}

export function sanitizeLrcFilename(value: string): string {
  const base = value.replace(/\.[^.]+$/u, "").replace(/[\\/:*?"<>|\u0000-\u001F]/gu, " ").replace(/\s+/gu, " ").trim();
  return `${base || "lyrics"}.lrc`;
}
