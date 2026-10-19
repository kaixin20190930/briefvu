import { describe, expect, it } from "vitest";
import sitemap, { sitemapEntries } from "./sitemap";

describe("sitemap", () => {
  it("contains only the current product pages", () => {
    expect(sitemapEntries.map((entry) => entry.path)).toEqual([
      "/",
      "/tools",
      "/tools/invisible-text",
      "/tools/image-color-picker",
      "/tools/crop-image",
      "/tools/rotate-image",
      "/tools/add-text-to-photo",
      "/tools/photo-editor",
      "/tools/rea-mcp-config",
      "/tools/text-reverser",
      "/tools/character-remover",
      "/tools/text-to-lrc",
      "/tools/wordcraft-online",
      "/tools/photocraft-online",
      "/guides",
      "/guides/rea-claude-code",
      "/privacy",
      "/terms",
    ]);
    expect(sitemap().every((entry) => entry.url.startsWith("https://briefvu.com"))).toBe(true);
  });
});
