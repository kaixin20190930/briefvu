import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import { absoluteUrl } from "@/lib/site";

export type ContentSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type ContentPageData = {
  eyebrow: string;
  title: string;
  intro: string;
  path: string;
  sections: ContentSection[];
  callout: { heading: string; body: string };
};

export function ContentPage({ data }: { data: ContentPageData }) {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: data.title, item: absoluteUrl(data.path) },
    ],
  };
  return (
    <main>
      <JsonLd data={breadcrumb} />
      <SiteHeader />
      <article className="content-page">
        <header className="content-hero">
          <span className="section-kicker">{data.eyebrow}</span>
          <h1>{data.title}</h1>
          <p>{data.intro}</p>
          <Link className="content-primary-link" href="/#top">Try a customer enquiry <ArrowRight size={17} /></Link>
        </header>
        <div className="content-sections">
          {data.sections.map((section, index) => (
            <section key={section.heading}>
              <span className="content-section-number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
                {section.bullets && (
                  <ul>{section.bullets.map((item) => <li key={item}><CheckCircle2 size={18} />{item}</li>)}</ul>
                )}
              </div>
            </section>
          ))}
        </div>
        <aside className="content-callout">
          <div><span className="section-kicker">Human-reviewed intake</span><h2>{data.callout.heading}</h2><p>{data.callout.body}</p></div>
          <Link href="/examples">See tested enquiry examples <ArrowRight size={17} /></Link>
        </aside>
      </article>
      <SiteFooter />
    </main>
  );
}
