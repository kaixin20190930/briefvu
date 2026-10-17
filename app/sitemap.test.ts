import { describe, expect, it } from "vitest";
import sitemap, { sitemapEntries } from "./sitemap";

describe("sitemap", () => {
  it("contains only the current product pages", () => {
    expect(sitemapEntries.map((entry) => entry.path)).toEqual([
      "/",
      "/tools",
      "/tools/invisible-text",
      "/tools/image-color-picker",
      "/tools/wordcraft-online",
      "/tools/photocraft-online",
      "/privacy",
      "/terms",
    ]);
    expect(sitemap().every((entry) => entry.url.startsWith("https://briefvu.com"))).toBe(true);
  });
});
