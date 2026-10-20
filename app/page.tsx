import { ArrowRight, Check, MousePointerClick, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { ToolCard } from "@/components/ToolCard";
import { availableTools } from "@/lib/tools/registry";
import { absoluteUrl } from "@/lib/site";

export default function Home() {
  const imageToolSlugs = new Set(["image-converter", "crop-image", "rotate-image", "mirror-image", "invert-image", "add-text-to-photo", "image-color-picker", "photo-editor", "resize-image", "compress-image", "remove-metadata", "sprite-sheet", "photocraft-online"]);
  const imageTools = availableTools.filter((tool) => imageToolSlugs.has(tool.slug));
  const utilityTools = availableTools.filter((tool) => !imageToolSlugs.has(tool.slug));
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BriefVu",
    url: absoluteUrl("/"),
    description: "Free, private image tools for cropping, rotating, removing metadata, making sprite sheets, picking colors, and adding text in your browser.",
  };
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Moxion Labs LLC",
    url: absoluteUrl("/"),
    brand: { "@type": "Brand", name: "BriefVu" },
  };

  return (
    <main>
      <JsonLd data={[website, organization]} />
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={15} /> Private, browser-based utilities</span>
          <h1>Free Online<br /><span>Image Tools.</span></h1>
          <p>Crop, rotate, remove metadata, create sprite sheets, pick colors, and add text without uploading your files. Every core image tool runs directly in your browser.</p>
          <div className="hero-actions">
            <Link className="button-primary" href="#image-tools">Explore image tools <ArrowRight size={18} /></Link>
            <Link className="button-secondary" href="/tools">Browse all tools</Link>
          </div>
          <ul className="hero-trust" aria-label="Product principles">
            <li><Check size={16} /> No account</li>
            <li><Check size={16} /> No file upload</li>
            <li><Check size={16} /> No installation</li>
          </ul>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="signal-card signal-card-one"><span>#136FE8</span><i className="color-chip blue" /><i className="color-chip lime" /><i className="color-chip ink" /></div>
          <div className="signal-card signal-card-two"><span>U+3164</span><i /><i /></div>
          <div className="signal-card signal-card-three"><span>{imageTools.length} image tools ready</span><Check size={22} /></div>
          <div className="hidden-grid" />
        </div>
      </section>

      <section className="home-featured section-wrap" id="image-tools" aria-labelledby="featured-title">
        <div className="section-heading">
          <span className="section-label">Image tools</span>
          <h2 id="featured-title">Edit an image without sending it away</h2>
          <p>Choose one focused action or open the full editor. These tools process your image on your device, so you can finish the job without creating an account or waiting for an upload.</p>
        </div>
        <div className="featured-tool-grid">
          {imageTools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
        </div>
      </section>

      <section className="home-privacy-story section-wrap" aria-labelledby="privacy-story-title">
        <span className="section-label">Why BriefVu</span>
        <h2 id="privacy-story-title">Your files never leave your device</h2>
        <p>BriefVu is built by Moxion Labs LLC around a simple principle: common image jobs should not require handing your files to a server. Our browser tools perform the work locally whenever the page says they do. We do not receive the photo, document, or metadata you process. Close the tab and the working data is gone.</p>
        <p>We started with image tools because photos can contain private location, camera, and editing information. Each tool is designed to do one job clearly, explain its limits honestly, and connect to the next useful step.</p>
      </section>

      <section className="home-utilities section-wrap" aria-labelledby="utilities-title">
        <div className="section-heading">
          <span className="section-label">More utilities</span>
          <h2 id="utilities-title">Text, document, and developer tools</h2>
          <p>BriefVu also keeps a smaller set of focused utilities for other practical jobs. They remain available in the complete tool directory without diluting the image workflow above.</p>
        </div>
        <div className="utility-tool-row">
          {utilityTools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
        </div>
      </section>

      <section className="principle-band">
        <article><MousePointerClick size={24} /><h2>Direct</h2><p>The useful action comes first, not a wall of content.</p></article>
        <article><ShieldCheck size={24} /><h2>Private by default</h2><p>Current tools process inputs in your browser and do not store them.</p></article>
        <article><Sparkles size={24} /><h2>Honest limits</h2><p>Each tool explains what it changes, what it preserves, and what it cannot do.</p></article>
      </section>
    </main>
  );
}
