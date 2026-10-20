import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/site";
import { photocraftRuntimeReady } from "../lib/photocraft";
import { wordcraftRuntimeReady } from "../lib/wordcraft";

export const sitemapEntries = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/tools", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/tools/invisible-text", priority: 1, changeFrequency: "monthly" as const },
  { path: "/tools/image-color-picker", priority: 1, changeFrequency: "monthly" as const },
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
  { path: "/guides/rea-claude-code", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-20T00:00:00.000Z");
  return sitemapEntries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
