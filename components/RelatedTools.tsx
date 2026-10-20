import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { availableTools } from "@/lib/tools/registry";

const contextualRecommendations: Record<string, string[]> = {
  "crop-image": ["rotate-image", "add-text-to-photo", "photo-editor", "remove-metadata"],
  "rotate-image": ["crop-image", "add-text-to-photo", "remove-metadata", "photo-editor"],
  "add-text-to-photo": ["remove-metadata", "crop-image", "photo-editor", "image-color-picker"],
  "remove-metadata": ["crop-image", "sprite-sheet", "photo-editor", "image-color-picker"],
  "sprite-sheet": ["remove-metadata", "crop-image", "image-color-picker", "photo-editor"],
  "image-color-picker": ["photo-editor", "add-text-to-photo", "crop-image", "remove-metadata"],
  "photo-editor": ["remove-metadata", "sprite-sheet", "crop-image", "add-text-to-photo"],
  "photocraft-online": ["remove-metadata", "image-color-picker", "crop-image", "sprite-sheet"],
};

export function RelatedTools({ currentSlug }: { currentSlug: string }) {
  const currentTool = availableTools.find((tool) => tool.slug === currentSlug);
  const preferredSlugs = contextualRecommendations[currentSlug] ?? [];
  const fallbackTools = availableTools
    .filter((tool) => tool.slug !== currentSlug && !preferredSlugs.includes(tool.slug))
    .sort((a, b) => Number(b.category === currentTool?.category) - Number(a.category === currentTool?.category));
  const preferredTools = preferredSlugs.flatMap((slug) => {
    const tool = availableTools.find((candidate) => candidate.slug === slug);
    return tool ? [tool] : [];
  });
  const relatedTools = [...preferredTools, ...fallbackTools].slice(0, 4);
  if (!relatedTools.length) return null;

  return (
    <section className="related-tools" aria-labelledby="related-tools-title">
      <div>
        <span className="section-label">Continue your workflow</span>
        <h2 id="related-tools-title">{currentTool?.category === "Images" || currentSlug === "image-color-picker" ? "Continue with another image tool" : "More Free Tools from BriefVu"}</h2>
      </div>
      <div className="related-tool-links">
        {relatedTools.map((tool) => (
          <Link href={tool.href} key={tool.slug}>
            <span><strong>{tool.name}</strong><small>{tool.shortDescription}</small></span>
            <ArrowRight size={18} />
          </Link>
        ))}
        <Link className="related-tools-all" href="/tools">
          <span><strong>View all BriefVu tools</strong><small>Browse every available browser utility.</small></span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
