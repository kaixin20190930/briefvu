"use client";

import type { ToolEventName, ToolId } from "@/lib/tool-events";

const startedTools = new Set<ToolId>();

export function trackToolEvent(tool: ToolId, event: ToolEventName) {
  const body = JSON.stringify({ tool, event });
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => undefined);
}

export function trackToolStarted(tool: ToolId) {
  if (startedTools.has(tool)) return;
  startedTools.add(tool);
  trackToolEvent(tool, "tool_started");
}
