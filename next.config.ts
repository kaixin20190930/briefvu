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
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), clipboard-write=(self)" },
        ],
      },
      { source: "/", headers: revalidateDocument },
      { source: "/tools", headers: revalidateDocument },
      { source: "/tools/:path*", headers: revalidateDocument },
      { source: "/privacy", headers: revalidateDocument },
      { source: "/terms", headers: revalidateDocument },
      { source: "/robots.txt", headers: revalidateDocument },
      { source: "/sitemap.xml", headers: revalidateDocument },
      { source: "/opengraph-image", headers: revalidateDocument },
      { source: "/icon.svg", headers: revalidateDocument },
    ];
  },
};

export default nextConfig;
