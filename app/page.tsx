import { ArrowRight, Check, MousePointerClick, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { ToolCard } from "@/components/ToolCard";
import { availableTools } from "@/lib/tools/registry";
import { absoluteUrl } from "@/lib/site";

export default function Home() {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BriefVu",
    url: absoluteUrl("/"),
    description: "Small, focused browser tools that solve one job well.",
  };

  return (
    <main>
      <JsonLd data={website} />
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={15} /> Small tools, instantly useful</span>
          <h1>One place.<br /><span>Every useful tool.</span></h1>
          <p>BriefVu is building a growing collection of focused utilities. Each tool runs where you need it, without bloated workflows or a directory of third-party links.</p>
          <div className="hero-actions">
            <Link className="button-primary" href="/tools">Explore all tools <ArrowRight size={18} /></Link>
            <Link className="button-secondary" href="/tools/image-color-picker">Try Color Picker</Link>
          </div>
          <ul className="hero-trust" aria-label="Product principles">
            <li><Check size={16} /> No account for free tools</li>
            <li><Check size={16} /> Browser-local processing</li>
            <li><Check size={16} /> No installation for browser tools</li>
          </ul>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="signal-card signal-card-one"><span>#136FE8</span><i className="color-chip blue" /><i className="color-chip lime" /><i className="color-chip ink" /></div>
          <div className="signal-card signal-card-two"><span>U+3164</span><i /><i /></div>
          <div className="signal-card signal-card-three"><span>{availableTools.length} tools ready</span><Check size={22} /></div>
          <div className="hidden-grid" />
        </div>
      </section>

      <section className="home-featured section-wrap" aria-labelledby="featured-title">
        <div className="section-heading">
          <span className="section-label">Available now</span>
          <h2 id="featured-title">Start with a tool that does the job</h2>
          <p>Pick a focused utility and finish the job directly on BriefVu. More tools can join the same library without changing how you find or use them.</p>
        </div>
        <div className="featured-tool-grid">
          {availableTools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
        </div>
      </section>

      <section className="principle-band">
        <article><MousePointerClick size={24} /><h2>Direct</h2><p>The useful action comes first, not a wall of content.</p></article>
        <article><ShieldCheck size={24} /><h2>Private by default</h2><p>Current tools process inputs in your browser and do not store them.</p></article>
        <article><Sparkles size={24} /><h2>Built to grow</h2><p>Unrelated tools can share one clear, dependable BriefVu experience.</p></article>
      </section>
    </main>
  );
}
