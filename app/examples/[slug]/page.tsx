import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getPublishedScenario, publishedScenarios } from "@/lib/scenarios/registry";
import { absoluteUrl, createPageMetadata } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

const relatedLabels: Record<string, string> = {
  "/custom-apparel-intake-software": "Custom apparel intake software",
  "/use-cases/screen-printing-enquiries": "Screen-printing enquiries",
  "/use-cases/embroidery-enquiries": "Embroidery enquiries",
  "/guides/custom-apparel-quote-intake-checklist": "Quote intake checklist",
};

export function generateStaticParams() {
  return publishedScenarios.map((scenario) => ({ slug: scenario.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const scenario = getPublishedScenario((await params).slug);
  if (!scenario || !scenario.seo.pagePath) return {};
  return createPageMetadata({ title: `${scenario.title}: enquiry and reply example`, description: scenario.summary, path: scenario.seo.pagePath });
}

export default async function ScenarioPage({ params }: Props) {
  const scenario = getPublishedScenario((await params).slug);
  if (!scenario || !scenario.seo.pagePath) notFound();
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: scenario.title, item: absoluteUrl(scenario.seo.pagePath) },
    ],
  };
  return (
    <main>
      <JsonLd data={breadcrumb} />
      <SiteHeader />
      <article className="content-page example-page">
        <header className="content-hero"><span className="section-kicker">Customer reply loop example · {scenario.id}</span><h1>{scenario.title}</h1><p>{scenario.summary}</p></header>
        <section className="example-flow" aria-label="Example message flow">
          <article><span>01 · Initial enquiry</span><h2>Start with the customer’s own words</h2><pre>{scenario.initialEnquiry}</pre></article>
          {scenario.replies.map((reply, index) => <article key={reply.label}><span>{String(index + 2).padStart(2, "0")} · {reply.label}</span><h2>Review the requested changes</h2><pre>{reply.text}</pre><ul>{reply.expectedChanges.map((key) => <li key={key}><CheckCircle2 size={16} />{key.replaceAll("_", " ")}</li>)}</ul></article>)}
        </section>
        <section className="example-review-grid">
          <article>
            <span className="section-kicker">Regression contract</span>
            <h2>What Briefvu should capture</h2>
            <ul>{scenario.expectations.map((expected) => <li key={expected.key}><CheckCircle2 size={16} /><span><b>{expected.key.replaceAll("_", " ")}</b>{expected.value}{expected.status ? ` · ${expected.status}` : ""}</span></li>)}</ul>
          </article>
          <article>
            <span className="section-kicker">Review notes</span>
            <h2>What this scenario teaches</h2>
            <ul>{scenario.seo.lessons?.map((lesson) => <li key={lesson}><CheckCircle2 size={16} /><span>{lesson}</span></li>)}</ul>
          </article>
        </section>
        <section className="example-outcome"><div><span className="section-kicker">Expected outcome</span><h2>A clearer spec without hidden assumptions</h2><p>{scenario.seo.outcome}</p></div><Link className="content-primary-link" href="/#top">Try this enquiry <ArrowRight size={17} /></Link></section>
        <nav className="example-related" aria-label="Related resources">
          <Link href="/examples">All tested examples <ArrowRight size={15} /></Link>
          {scenario.seo.relatedPagePaths?.map((path) => <Link href={path} key={path}>{relatedLabels[path] ?? path} <ArrowRight size={15} /></Link>)}
        </nav>
      </article>
      <SiteFooter />
    </main>
  );
}
