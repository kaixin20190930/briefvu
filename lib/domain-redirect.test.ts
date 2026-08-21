import { describe, expect, it } from "vitest";
import { canonicalRedirectUrl, LEGACY_HOSTS } from "./domain-redirects";

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
});
