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
    expect(parseToolEvent({ tool: "image-to-ico", event: "export_completed" })).not.toBeNull();
    expect(parseToolEvent({ tool: "image-to-ico", event: "file_loaded", filename: "logo.png" })).toBeNull();
    expect(parseToolEvent({ tool: "unknown", event: "file_loaded" })).toBeNull();
    expect(parseToolEvent({ tool: "crop-image", event: "page_view", filename: "private.png" })).toBeNull();
  });

  it("accepts palette completion but never image content or extracted colors", () => {
    expect(parseToolEvent({ tool: "color-palette-from-image", event: "export_completed" })).not.toBeNull();
    expect(parseToolEvent({ tool: "color-palette-from-image", event: "file_loaded", filename: "private.png" })).toBeNull();
    expect(parseToolEvent({ tool: "color-palette-from-image", event: "copy_completed", hex: "#112233" })).toBeNull();
  });

  it("accepts anonymous TGA viewer events", () => {
    expect(parseToolEvent({ tool: "tga-viewer", event: "file_loaded" })).not.toBeNull();
    expect(parseToolEvent({ tool: "tga-viewer", event: "export_completed" })).not.toBeNull();
  });
});
