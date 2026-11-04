"use client";

import { useState } from "react";
import { exportColors, type NamedColor } from "@/lib/color-palette";
import { copyText } from "@/lib/clipboard";
import { trackToolEvent } from "@/lib/tool-events-client";
import type { ToolId } from "@/lib/tool-events";

export function ColorExport({ colors, tool }: { colors: NamedColor[]; tool: ToolId }) {
  const [format, setFormat] = useState<"css" | "json">("css");
  const [message, setMessage] = useState("");
  const output = exportColors(colors, format);
  async function copy() {
    const success = await copyText(output);
    setMessage(success ? "Copied export." : "Copy failed. Select the code below and copy it manually.");
    if (success) trackToolEvent(tool, "copy_completed");
  }
  function download() {
    const blob = new Blob([output], { type: format === "json" ? "application/json" : "text/css" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `briefvu-colors.${format}`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Export downloaded."); trackToolEvent(tool, "export_completed");
  }
  return <section className="color-export" aria-label="Export colors">
    <div className="color-controls">
      <h3>Use these colors</h3>
      <label>Export format <select value={format} onChange={(event) => { setFormat(event.target.value as "css" | "json"); setMessage(""); }}><option value="css">CSS variables</option><option value="json">JSON</option></select></label>
      <button type="button" onClick={() => void copy()}>Copy export</button>
      <button type="button" onClick={download}>Download {format.toUpperCase()}</button>
    </div>
    <textarea aria-label="Color export code" value={output} readOnly spellCheck={false} rows={6} />
    <p className="color-status" role="status">{message}</p>
  </section>;
}
