import { describe, expect, it } from "vitest";
import {
  canonicalRedirectUrl,
  LEGACY_HOSTS,
  resolveRequestHostname,
} from "./domain-redirects";

describe("canonical domain redirects", () => {
  it("creates a literal-free, path-and-query-preserving URL for every legacy host", () => {
    for (const host of LEGACY_HOSTS) {
      const redirect = canonicalRedirectUrl(
        `https://${host}/examples/company-event-hoodies?source=test`,
        host,
      );
      expect(redirect?.toString()).toBe(
        "https://briefvu.com/examples/company-event-hoodies?source=test",
      );
      expect(redirect?.toString()).not.toContain(":path*");
    }
  });

  it("does not redirect the canonical host", () => {
    expect(canonicalRedirectUrl("https://briefvu.com/examples", "briefvu.com")).toBeNull();
  });

  it("upgrades HTTP on the canonical host without changing the path or query", () => {
    expect(canonicalRedirectUrl("http://briefvu.com/tools/image-color-picker?source=test", "briefvu.com")?.href)
      .toBe("https://briefvu.com/tools/image-color-picker?source=test");
    expect(canonicalRedirectUrl("http://localhost:3000/tools", "localhost")).toBeNull();
  });

  it("prefers the forwarded host and normalizes port, case, and proxy lists", () => {
    expect(
      resolveRequestHostname(
        "WWW.BRIEFVU.COM:8787, internal.example",
        "localhost:8787",
        "localhost",
      ),
    ).toBe("www.briefvu.com");
    expect(resolveRequestHostname(null, "BRIEFVU.COM:443", "localhost")).toBe("briefvu.com");
  });
});
