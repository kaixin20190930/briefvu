import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { availableTools } from "@/lib/tools/registry";

export function RelatedTools({ currentSlug }: { currentSlug: string }) {
  const relatedTools = availableTools.filter((tool) => tool.slug !== currentSlug);
  if (!relatedTools.length) return null;

  return (
    <section className="related-tools" aria-labelledby="related-tools-title">
      <div>
        <span className="section-label">More from BriefVu</span>
        <h2 id="related-tools-title">Try another free tool</h2>
      </div>
      <div className="related-tool-links">
        {relatedTools.map((tool) => (
          <Link href={tool.href} key={tool.slug}>
            <span><strong>{tool.name}</strong><small>{tool.shortDescription}</small></span>
            <ArrowRight size={18} />
          </Link>
        ))}
      </div>
    </section>
  );
}
