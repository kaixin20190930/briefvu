import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./JsonLd";

describe("serializeJsonLd", () => {
  it("escapes opening angle brackets to prevent script breakout", () => {
    const output = serializeJsonLd({ value: "</script><script>alert(1)</script>" });
    expect(output).not.toContain("<");
    expect(output).toContain("\\u003c/script>");
  });
});
