import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/site";
import { photocraftRuntimeReady } from "../lib/photocraft";
import { wordcraftRuntimeReady } from "../lib/wordcraft";

export const sitemapEntries = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/tools", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/tools/invisible-text", priority: 1, changeFrequency: "monthly" as const },
  { path: "/tools/image-color-picker", priority: 1, changeFrequency: "monthly" as const },
  { path: "/tools/color-palette-from-image", priority: 1, changeFrequency: "monthly" as const },
  { path: "/tools/image-to-ico" },
  { path: "/tools/tga-viewer" },
  { path: "/tools/image-converter", priority: 1, changeFrequency: "monthly" as const },
  { path: "/tools/crop-image", priority: 1, changeFrequency: "monthly" as const },
  { path: "/tools/rotate-image", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/tools/mirror-image", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/tools/resize-image", priority: 1, changeFrequency: "monthly" as const },
  { path: "/tools/compress-image", priority: 1, changeFrequency: "monthly" as const },
  { path: "/tools/invert-image", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/tools/add-text-to-photo", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/tools/photo-editor", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/tools/rea-mcp-config", priority: 1, changeFrequency: "monthly" as const },
  { path: "/tools/text-reverser", priority: 1, changeFrequency: "monthly" as const },
  { path: "/tools/character-remover", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/tools/text-to-lrc", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/tools/remove-metadata", priority: 1, changeFrequency: "monthly" as const },
  { path: "/tools/sprite-sheet", priority: 1, changeFrequency: "monthly" as const },
  ...(wordcraftRuntimeReady
    ? [{ path: "/tools/wordcraft-online", priority: 1, changeFrequency: "monthly" as const }]
    : []),
  ...(photocraftRuntimeReady
    ? [{ path: "/tools/photocraft-online", priority: 1, changeFrequency: "monthly" as const }]
    : []),
  { path: "/guides", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/guides/what-is-photo-metadata", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/guides/sprite-sheet-game-development", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/guides/image-formats-jpg-png-webp", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/guides/prepare-images-for-web", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/guides/rea-claude-code", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/guides/compress-image-to-target-size" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
] as const;

// Editorial dates, not build timestamps. Only bump a URL after a meaningful change.
export const pageLastModified: Readonly<Record<string, string>> = {
  "/tools/tga-viewer": "2026-11-03T00:00:00.000Z",
  "/tools/remove-metadata": "2026-11-01T00:00:00.000Z",
  "/tools/image-to-ico": "2026-11-03T00:00:00.000Z",
  "/": "2026-11-03T00:00:00.000Z",
  "/tools": "2026-11-03T00:00:00.000Z",
  "/tools/color-palette-from-image": "2026-11-01T00:00:00.000Z",
  "/tools/image-color-picker": "2026-11-01T00:00:00.000Z",
  // Preserve the converter metadata update already present in the working tree.
  "/tools/image-converter": "2026-11-03T00:00:00.000Z",
  "/tools/compress-image": "2026-11-03T00:00:00.000Z",
  "/guides": "2026-11-03T00:00:00.000Z",
  "/guides/compress-image-to-target-size": "2026-11-03T00:00:00.000Z",
};

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: new Date(pageLastModified[entry.path] ?? "2026-10-20T00:00:00.000Z"),
  }));
}
