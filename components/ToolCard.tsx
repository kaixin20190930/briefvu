import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import type { ToolRegistryEntry } from "@/lib/tools/registry";

export function ToolCard({ tool }: { tool: ToolRegistryEntry }) {
  const available = tool.status === "available";

  return (
    <article className="tool-card">
      <div className="tool-card-meta">
        <span>{tool.category}</span>
        <span className={available ? "status-live" : "status-soon"}>
          {available ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
          {available ? "Ready" : "Coming soon"}
        </span>
      </div>
      <h2>{tool.name}</h2>
      <p>{tool.shortDescription}</p>
      {available ? (
        <Link href={tool.href}>Open tool <ArrowRight size={16} /></Link>
      ) : (
        <span className="disabled-link">In development</span>
      )}
    </article>
  );
}
