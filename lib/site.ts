import type { Metadata } from "next";

export const DEFAULT_SITE_URL = "https://briefvu.com";

export const siteConfig = {
  name: "BriefVu",
  defaultTitle: "Free Online Image Tools — Private, No Upload | BriefVu",
  description: "Free online image tools for cropping, rotating, removing metadata, making sprite sheets, picking colors, and adding text. Your files stay in your browser.",
};

export function getSiteUrl() {
  const candidate = process.env.SITE_URL?.trim() || DEFAULT_SITE_URL;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return DEFAULT_SITE_URL;
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function absoluteUrl(path = "/") {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export function createPageMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.path,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_US",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "BriefVu private browser image tools" }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [{ url: "/opengraph-image", alt: "BriefVu private browser image tools" }],
    },
  };
}
