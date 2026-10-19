import { describe, expect, it } from "vitest";
import { autoIncrementLrcLines, buildLrc, formatLrcTimestamp, isLrcReady, offsetLrcLines, parseLrcTimestamp, parseLyrics, sanitizeLrcFilename } from "./text-to-lrc";

describe("text to LRC", () => {
  it("formats and parses centisecond timestamps", () => {
    expect(formatLrcTimestamp(75.204)).toBe("[01:15.20]");
    expect(formatLrcTimestamp(59.999)).toBe("[01:00.00]");
    expect(parseLrcTimestamp("01:15.20")).toBe(75.2);
    expect(parseLrcTimestamp("[2:03.5]")).toBe(123.5);
    expect(parseLrcTimestamp("not a time")).toBeNull();
  });

  it("auto-increments non-empty lines and preserves paragraph gaps", () => {
    const lines = autoIncrementLrcLines(parseLyrics("First\n\nSecond"), 10, 2.5);
    expect(lines.map((line) => line.timeSeconds)).toEqual([10, null, 12.5]);
    expect(buildLrc(lines)).toBe("[00:10.00]First\n\n[00:12.50]Second");
    expect(isLrcReady(lines)).toBe(true);
  });

  it("applies a safe offset and sanitizes downloads", () => {
    const shifted = offsetLrcLines([{ text: "Line", timeSeconds: 1 }], -2);
    expect(shifted[0].timeSeconds).toBe(0);
    expect(sanitizeLrcFilename("my/song?.mp3")).toBe("my song.lrc");
  });

  it("marks incomplete lyrics as not ready", () => {
    const lines = parseLyrics("One\nTwo");
    expect(isLrcReady(lines)).toBe(false);
    expect(buildLrc(lines)).toContain("[--:--.--]One");
  });
});
