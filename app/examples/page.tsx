import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { publishedScenarios } from "@/lib/scenarios/registry";
import { absoluteUrl, createPageMetadata } from "@/lib/site";

const path = "/examples";
const title = "Custom apparel enquiry examples";
const description = "See tested custom apparel enquiries for T-shirts, hoodies and embroidered polos, including the fields Briefvu should capture and the details that still need human review.";

export const metadata = createPageMetadata({ title, description, path });

export default function ExamplesPage() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Examples", item: absoluteUrl(path) },
    ],
  };
  return (
    <main>
      <JsonLd data={breadcrumb} />
      <SiteHeader />
      <article className="content-page example-index-page">
        <header className="content-hero">
          <span className="section-kicker">Tested scenario library</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        <section className="example-index" aria-label="Published enquiry examples">
          {publishedScenarios.map((scenario) => (
            <article key={scenario.id}>
              <span>{scenario.id} · {scenario.taxonomy.decorations.join(" · ")}</span>
              <h2>{scenario.title}</h2>
              <p>{scenario.summary}</p>
              <div className="example-tags">
                {scenario.taxonomy.garments.map((value) => <em key={value}>{value}</em>)}
                {scenario.taxonomy.industries.map((value) => <em key={value}>{value}</em>)}
              </div>
              <Link href={scenario.seo.pagePath!}>Review the example <ArrowRight size={16} /></Link>
            </article>
          ))}
        </section>
        <aside className="content-callout">
          <div><span className="section-kicker">Publication gate</span><h2>Every public example is tied to a regression scenario</h2><p>A scenario must be supported, structurally valid and pass its expected field checks before it can enter this library and the sitemap.</p></div>
          <Link href="/guides/custom-apparel-quote-intake-checklist">Use the intake checklist <ArrowRight size={17} /></Link>
        </aside>
      </article>
      <SiteFooter />
    </main>
  );
}
