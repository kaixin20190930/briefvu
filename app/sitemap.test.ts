import { describe, expect, it } from "vitest";
import sitemap, { sitemapEntries } from "./sitemap";

describe("sitemap", () => {
  it("contains only the current product pages", () => {
    expect(sitemapEntries.map((entry) => entry.path)).toEqual([
      "/",
      "/tools",
      "/tools/invisible-text",
      "/tools/image-color-picker",
      "/tools/color-palette-from-image",
      "/tools/image-to-ico",
      "/tools/tga-viewer",
      "/tools/image-converter",
      "/tools/crop-image",
      "/tools/rotate-image",
      "/tools/mirror-image",
      "/tools/resize-image",
      "/tools/compress-image",
      "/tools/invert-image",
      "/tools/add-text-to-photo",
      "/tools/photo-editor",
      "/tools/rea-mcp-config",
      "/tools/text-reverser",
      "/tools/character-remover",
      "/tools/text-to-lrc",
      "/tools/remove-metadata",
      "/tools/sprite-sheet",
      "/tools/wordcraft-online",
      "/tools/photocraft-online",
      "/guides",
      "/guides/what-is-photo-metadata",
      "/guides/sprite-sheet-game-development",
      "/guides/image-formats-jpg-png-webp",
      "/guides/prepare-images-for-web",
      "/guides/rea-claude-code",
      "/guides/compress-image-to-target-size",
      "/privacy",
      "/terms",
    ]);
    expect(sitemap().every((entry) => entry.url.startsWith("https://briefvu.com"))).toBe(true);
    expect(sitemap().every((entry) => !("priority" in entry) && !("changeFrequency" in entry))).toBe(true);
  });

  it("uses stable per-page dates and leaves untouched pages unchanged", () => {
    const dates = Object.fromEntries(sitemap().map((entry) => [new URL(entry.url).pathname, entry.lastModified]));
    expect(dates["/tools/color-palette-from-image"]).toEqual(new Date("2026-11-01T00:00:00.000Z"));
    expect(dates["/tools/image-color-picker"]).toEqual(new Date("2026-11-01T00:00:00.000Z"));
    expect(dates["/tools/image-to-ico"]).toEqual(new Date("2026-11-03T00:00:00.000Z"));
    expect(dates["/tools/tga-viewer"]).toEqual(new Date("2026-11-03T00:00:00.000Z"));
    expect(dates["/guides/compress-image-to-target-size"]).toEqual(new Date("2026-11-03T00:00:00.000Z"));
    expect(dates["/privacy"]).toEqual(new Date("2026-10-20T00:00:00.000Z"));
    expect(dates["/tools/remove-metadata"]).toEqual(new Date("2026-11-01T00:00:00.000Z"));
    expect(new Set(sitemap().map((entry) => entry.url)).size).toBe(sitemap().length);
  });
});
