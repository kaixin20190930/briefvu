import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/site";
import { wordcraftRuntimeReady } from "../lib/wordcraft";

export const sitemapEntries = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/tools", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/tools/invisible-text", priority: 1, changeFrequency: "monthly" as const },
  { path: "/tools/image-color-picker", priority: 1, changeFrequency: "monthly" as const },
  ...(wordcraftRuntimeReady
    ? [{ path: "/tools/wordcraft-online", priority: 1, changeFrequency: "monthly" as const }]
    : []),
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-16T00:00:00.000Z");
  return sitemapEntries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
