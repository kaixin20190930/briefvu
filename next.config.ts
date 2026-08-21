import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    const revalidateDocument = [
      {
        key: "Cache-Control",
        value: "public, max-age=0, must-revalidate",
      },
    ];
    return [
      { source: "/", headers: revalidateDocument },
      { source: "/custom-apparel-intake-software", headers: revalidateDocument },
      { source: "/examples", headers: revalidateDocument },
      { source: "/examples/:slug", headers: revalidateDocument },
      { source: "/guides/:path*", headers: revalidateDocument },
      { source: "/use-cases/:path*", headers: revalidateDocument },
      { source: "/robots.txt", headers: revalidateDocument },
      { source: "/sitemap.xml", headers: revalidateDocument },
      { source: "/opengraph-image", headers: revalidateDocument },
      { source: "/icon.svg", headers: revalidateDocument },
    ];
  },
};

export default nextConfig;
