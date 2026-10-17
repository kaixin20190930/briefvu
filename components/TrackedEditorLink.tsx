"use client";

import type { ReactNode } from "react";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";
import type { ToolId } from "@/lib/tool-events";

export function TrackedEditorLink({
  children,
  className,
  href,
  tool,
}: {
  children: ReactNode;
  className: string;
  href: string;
  tool: Extract<ToolId, "wordcraft-online" | "photocraft-online">;
}) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => {
        trackToolStarted(tool);
        trackToolEvent(tool, "editor_opened");
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}
