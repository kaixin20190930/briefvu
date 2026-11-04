import type { Metadata } from "next";
import { ToolCard } from "@/components/ToolCard";
import { createPageMetadata } from "@/lib/site";
import { toolRegistry } from "@/lib/tools/registry";

export const metadata: Metadata = createPageMetadata({
  title: "Image Tools — Free Browser Utilities",
  description: "Free online image tools that run in your browser: crop, rotate, mirror, invert, convert, resize, compress, and more, plus focused text and document utilities.",
  path: "/tools",
});

export default function ToolsPage() {
  const categories = ["Images", "Text", "Documents", "Audio & Lyrics", "Developer"];
  return (
    <main className="content-shell">
      <section className="page-hero compact">
        <span className="section-label">BriefVu tool library</span>
        <h1>Image Tools</h1>
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
