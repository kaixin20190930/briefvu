export const hostedApps = {
  wordcraft: {
    slug: "wordcraft",
    version: "0.7.0",
    releaseTag: "v0.7.0",
    releaseAsset: "wordcraft-web-0.7.0.zip",
    releaseSha256: "98df7c68a0ac788a9ac0f531fd34c31ab7d89965abb4935f57168d287dab3189",
    files: new Set<string>([
      "index.html",
      "wordcraft-web-8f83828293ff7c4d.js",
      "wordcraft-web-8f83828293ff7c4d_bg.wasm",
      "wordcraft-fa59e09a3f921e03.ico",
      "LICENSE-MIT",
      "LICENSE-APACHE",
      "NOTICE",
      "ATTRIBUTION.md",
      "LICENSE-brand.txt",
      "README.md",
      "HOSTING.md",
    ]),
  },
} as const;

export type HostedAppSlug = keyof typeof hostedApps;

export type HostedAppAsset = {
  app: HostedAppSlug;
  file: string;
  key: string;
};

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".wasm": "application/wasm",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

export function resolveHostedAppAsset(pathname: string):
  | { kind: "redirect"; location: string }
  | { kind: "asset"; asset: HostedAppAsset }
  | { kind: "not-found" } {
  const match = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (!match) return { kind: "not-found" };

  const app = match[1] as HostedAppSlug;
  const config = hostedApps[app];
  if (!config) return { kind: "not-found" };

  const suffix = match[2] ?? "";
  if (suffix === "") {
    return { kind: "redirect", location: `/${app}/` };
  }

  const file = suffix === "/" ? "index.html" : suffix.slice(1);
  if (file.includes("/") || file.includes("..") || !config.files.has(file)) {
    return { kind: "not-found" };
  }

  return {
    kind: "asset",
    asset: {
      app,
      file,
      key: `${app}/v${config.version}/${file}`,
    },
  };
}

export function contentTypeFor(file: string) {
  if (file === "NOTICE" || file.startsWith("LICENSE-")) {
    return "text/plain; charset=utf-8";
  }
  const extension = file.includes(".") ? file.slice(file.lastIndexOf(".")) : "";
  return contentTypes[extension] ?? "application/octet-stream";
}

export function cacheControlFor(file: string) {
  return file === "index.html"
    ? "public, max-age=0, must-revalidate"
    : "public, max-age=31536000, immutable";
}

export function runtimeSecurityHeaders(file: string) {
  return {
    "Cache-Control": cacheControlFor(file),
    "Content-Type": contentTypeFor(file),
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
  };
}
