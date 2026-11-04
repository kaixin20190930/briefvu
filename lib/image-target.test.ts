import { describe, expect, it } from "vitest";
import { encodeToTarget } from "./image-target";

describe("encodeToTarget", () => {
  it("keeps the highest tested quality that reaches the target", async () => {
    const result = await encodeToTarget(async quality => new Blob([new Uint8Array(Math.round(quality * 100_000))]), 50_000);
    expect(result.reached).toBe(true);
    expect(result.blob.size).toBeLessThanOrEqual(50_000);
    expect(result.quality).toBeGreaterThan(0.45);
  });

  it("returns the smallest result when the target cannot be reached", async () => {
    const result = await encodeToTarget(async quality => new Blob([new Uint8Array(80_000 + Math.round(quality * 1000))]), 20_000);
    expect(result.reached).toBe(false);
    expect(result.blob.size).toBeGreaterThan(20_000);
  });
});
