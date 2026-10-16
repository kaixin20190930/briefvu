import { describe, expect, it } from "vitest";
import { canonicalWorkerRedirect } from "./canonical-worker-redirect";

describe("Cloudflare entry canonical redirect", () => {
  it("returns an absolute canonical 308 before OpenNext handles the request", () => {
    const response = canonicalWorkerRedirect(
      new Request("http://127.0.0.1:8787/tools/invisible-text?source=worker", {
        headers: { "x-forwarded-host": "www.briefvu.com" },
      }),
    );

    expect(response?.status).toBe(308);
    expect(response?.headers.get("location")).toBe(
      "https://briefvu.com/tools/invisible-text?source=worker",
    );
  });

  it("passes the canonical host to OpenNext", () => {
    expect(
      canonicalWorkerRedirect(new Request("https://briefvu.com/tools/invisible-text")),
    ).toBeNull();
  });
});
