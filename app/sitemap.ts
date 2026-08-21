import type { MetadataRoute } from "next";
import { checklistPage, embroideryPage, productPage, screenPrintingPage } from "../lib/seo-pages";
import { publishedScenarios } from "../lib/scenarios/registry";
import { absoluteUrl } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-20T00:00:00.000Z");
  const staticPages = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: productPage.path, priority: 0.9, changeFrequency: "monthly" as const },
    { path: screenPrintingPage.path, priority: 0.8, changeFrequency: "monthly" as const },
    { path: embroideryPage.path, priority: 0.8, changeFrequency: "monthly" as const },
    { path: checklistPage.path, priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/examples", priority: 0.8, changeFrequency: "monthly" as const },
  ];
  return [
    ...staticPages.map((page) => ({ url: absoluteUrl(page.path), lastModified, changeFrequency: page.changeFrequency, priority: page.priority })),
    ...publishedScenarios.flatMap((scenario) => scenario.seo.pagePath
      ? [{ url: absoluteUrl(scenario.seo.pagePath), lastModified: new Date(`${scenario.seo.publishedOn}T00:00:00.000Z`), changeFrequency: "monthly" as const, priority: 0.7 }]
      : []),
  ];
}
