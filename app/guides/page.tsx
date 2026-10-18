import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Guides",
  description: "Practical setup and usage guides for tools featured on BriefVu.",
  path: "/guides",
});

export default function GuidesPage() {
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
    ],
  };

  return <main className="content-shell guides-index">
    <JsonLd data={breadcrumbs} />
    <section className="page-hero compact">
      <span className="section-label">Practical walkthroughs</span>
      <h1>BriefVu Guides</h1>
      <p>Clear setup and usage guides for the tools in BriefVu’s growing library.</p>
    </section>
    <section className="guide-directory" aria-label="Available guides">
      <article>
        <div><span>Developer tools</span><time dateTime="2026-10-18">Updated October 18, 2026</time></div>
        <h2>REA + Claude Code Setup</h2>
        <p>Install REA with its current guided setup, verify the MCP connection, prepare the right analysis engine, and run a first authorized investigation.</p>
        <Link href="/guides/rea-claude-code">Read guide <ArrowRight size={16} /></Link>
      </article>
    </section>
  </main>;
}
