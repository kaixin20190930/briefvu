import type { Metadata } from "next";
import { ToolCard } from "@/components/ToolCard";
import { createPageMetadata } from "@/lib/site";
import { toolRegistry } from "@/lib/tools/registry";

export const metadata: Metadata = createPageMetadata({
  title: "Browser Tools",
  description: "Explore focused browser tools on BriefVu for text, image colors, photo editing, documents, and other practical jobs.",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <main className="content-shell">
      <section className="page-hero compact">
        <span className="section-label">BriefVu tool library</span>
        <h1>Small tools that get to the point.</h1>
        <p>Every available tool runs directly on BriefVu. Use the current collection now, with more focused utilities added over time.</p>
      </section>
      <section className="tool-directory" aria-label="Available tools">
        {toolRegistry.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
      </section>
    </main>
  );
}
