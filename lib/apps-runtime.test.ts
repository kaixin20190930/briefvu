import { describe, expect, it } from "vitest";
import {
  cacheControlFor,
  contentTypeFor,
  hostedApps,
  resolveHostedAppAsset,
  runtimeSecurityHeaders,
} from "./apps-runtime";

describe("shared apps runtime routing", () => {
  it("uses one apps host with a stable folder per editor", () => {
    expect(resolveHostedAppAsset("/wordcraft")).toEqual({
      kind: "redirect",
      location: "/wordcraft/",
    });
    expect(resolveHostedAppAsset("/wordcraft/")).toEqual({
      kind: "asset",
      asset: {
        app: "wordcraft",
        file: "index.html",
        key: "wordcraft/v0.7.0/index.html",
      },
    });
  });

  it("serves only files pinned in the verified release manifest", () => {
    expect(resolveHostedAppAsset("/wordcraft/wordcraft-web-8f83828293ff7c4d_bg.wasm")).toMatchObject({
      kind: "asset",
    });
    expect(resolveHostedAppAsset("/wordcraft/../secret")).toEqual({ kind: "not-found" });
    expect(resolveHostedAppAsset("/wordcraft/unverified.js")).toEqual({ kind: "not-found" });
    expect(resolveHostedAppAsset("/unknown/")).toEqual({ kind: "not-found" });
  });

  it("sets MIME, cache and indexing headers for the editor shell", () => {
    expect(contentTypeFor("app.wasm")).toBe("application/wasm");
    expect(contentTypeFor("LICENSE-MIT")).toBe("text/plain; charset=utf-8");
    expect(cacheControlFor("index.html")).toContain("must-revalidate");
    expect(cacheControlFor("app.js")).toContain("immutable");
    expect(runtimeSecurityHeaders("index.html")["X-Robots-Tag"]).toBe("noindex, nofollow");
  });

  it("pins the audited upstream release", () => {
    expect(hostedApps.wordcraft).toMatchObject({
      version: "0.7.0",
      releaseTag: "v0.7.0",
      releaseSha256: "98df7c68a0ac788a9ac0f531fd34c31ab7d89965abb4935f57168d287dab3189",
    });
  });
});
