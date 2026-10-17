import { describe, expect, it } from "vitest";
import { parseToolEvent } from "./tool-events";

describe("tool event validation", () => {
  it("accepts a known anonymous tool event", () => {
    expect(parseToolEvent({ tool: "crop-image", event: "file_loaded" })).toEqual({
      tool: "crop-image",
      event: "file_loaded",
    });
  });

  it("rejects unknown fields and values", () => {
    expect(parseToolEvent({ tool: "unknown", event: "file_loaded" })).toBeNull();
    expect(parseToolEvent({ tool: "crop-image", event: "page_view", filename: "private.png" })).toBeNull();
  });
});
