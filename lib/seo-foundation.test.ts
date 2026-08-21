import { describe, expect, it } from "vitest";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { checklistPage, embroideryPage, productPage, screenPrintingPage } from "./seo-pages";
import { publishedScenarios } from "./scenarios/registry";
import { getSiteUrl } from "./site";

describe("SEO foundation v1", () => {
  it("uses one valid HTTPS canonical origin", () => {
    const origin = new URL(getSiteUrl());
    expect(origin.protocol).toBe("https:");
    expect(origin.pathname).toBe("/");
  });

  it("publishes a unique, allowlisted sitemap", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toHaveLength(9);
    expect(urls).toContain(`${getSiteUrl()}/examples`);
    expect(urls.every((url) => url.startsWith(`${getSiteUrl()}/`))).toBe(true);
    expect(urls.every((url) => !url.includes("/api/"))).toBe(true);
    for (const scenario of publishedScenarios) {
      expect(urls).toContain(`${getSiteUrl()}${scenario.seo.pagePath}`);
    }
  });

  it("keeps first-party page paths unique", () => {
    const paths = [productPage.path, screenPrintingPage.path, embroideryPage.path, checklistPage.path];
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.every((path) => path.startsWith("/"))).toBe(true);
  });

  it("allows public content, blocks API crawling and declares the sitemap", () => {
    const directives = robots();
    expect(directives.rules).toEqual({ userAgent: "*", allow: "/", disallow: ["/api/"] });
    expect(directives.sitemap).toBe(`${getSiteUrl()}/sitemap.xml`);
    expect(directives.host).toBe(new URL(getSiteUrl()).host);
  });
});
