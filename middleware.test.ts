import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

describe("canonical host middleware", () => {
  it("returns a path-and-query-preserving 308 for the legacy public host", () => {
    const request = new NextRequest(
      "http://localhost:8787/tools/invisible-text?source=legacy",
      { headers: { "x-forwarded-host": "www.briefvu.com" } },
    );
    const response = middleware(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://briefvu.com/tools/invisible-text?source=legacy",
    );
  });

  it("passes through the canonical host", () => {
    const request = new NextRequest("https://briefvu.com/tools/invisible-text");
    const response = middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
