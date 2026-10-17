export const TOOL_IDS = [
  "invisible-text",
  "image-color-picker",
  "crop-image",
  "rotate-image",
  "add-text-to-photo",
  "photo-editor",
  "wordcraft-online",
  "photocraft-online",
] as const;

export const TOOL_EVENT_NAMES = [
  "tool_started",
  "file_loaded",
  "copy_completed",
  "export_completed",
  "editor_opened",
] as const;

export type ToolId = (typeof TOOL_IDS)[number];
export type ToolEventName = (typeof TOOL_EVENT_NAMES)[number];
export type ToolEvent = { tool: ToolId; event: ToolEventName };

const toolIds = new Set<string>(TOOL_IDS);
const eventNames = new Set<string>(TOOL_EVENT_NAMES);

export function parseToolEvent(value: unknown): ToolEvent | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const keys = Object.keys(candidate);
  if (keys.length !== 2 || !keys.includes("tool") || !keys.includes("event")) return null;
  if (typeof candidate.tool !== "string" || typeof candidate.event !== "string") return null;
  if (!toolIds.has(candidate.tool) || !eventNames.has(candidate.event)) return null;
  return { tool: candidate.tool as ToolId, event: candidate.event as ToolEventName };
}
