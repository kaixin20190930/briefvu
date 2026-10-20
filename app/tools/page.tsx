import type { Metadata } from "next";
import { ToolCard } from "@/components/ToolCard";
import { createPageMetadata } from "@/lib/site";
import { toolRegistry } from "@/lib/tools/registry";

export const metadata: Metadata = createPageMetadata({
  title: "Free Browser Tools",
  description: "Browse BriefVu image, text, document, audio, and developer tools. Core file processing runs privately in your browser with no account required.",
  path: "/tools",
});

export default function ToolsPage() {
  const categories = ["Images", "Text", "Documents", "Audio & Lyrics", "Developer"];
  return (
    <main className="content-shell">
      <section className="page-hero compact">
        <span className="section-label">BriefVu tool library</span>
        <h1>Free Browser Tools</h1>
        <p>Start with private image tools, then browse focused utilities for text, documents, audio, and developer workflows.</p>
      </section>
      {categories.map((category) => {
        const tools = toolRegistry.filter((tool) => tool.category === category);
        if (!tools.length) return null;
        return <section className="tool-category" key={category} aria-labelledby={`category-${category.replaceAll(" ", "-").toLowerCase()}`}>
          <div className="section-heading"><span className="section-label">{category === "Images" ? "Start here" : "Utilities"}</span><h2 id={`category-${category.replaceAll(" ", "-").toLowerCase()}`}>{category}</h2></div>
          <div className="tool-directory">{tools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div>
        </section>;
      })}
    </main>
  );
}
