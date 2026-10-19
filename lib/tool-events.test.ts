import { describe, expect, it } from "vitest";
import { parseToolEvent } from "./tool-events";

describe("tool event validation", () => {
  it("accepts a known anonymous tool event", () => {
    expect(parseToolEvent({ tool: "crop-image", event: "file_loaded" })).toEqual({
      tool: "crop-image",
      event: "file_loaded",
    });
  });

  it("accepts events from the new text tools", () => {
    expect(parseToolEvent({ tool: "text-reverser", event: "copy_completed" })).toEqual({
      tool: "text-reverser",
      event: "copy_completed",
    });
    expect(parseToolEvent({ tool: "text-to-lrc", event: "export_completed" })).not.toBeNull();
  });

  it("rejects unknown fields and values", () => {
    expect(parseToolEvent({ tool: "unknown", event: "file_loaded" })).toBeNull();
    expect(parseToolEvent({ tool: "crop-image", event: "page_view", filename: "private.png" })).toBeNull();
  });
});
