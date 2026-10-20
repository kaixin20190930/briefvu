import { CheckCircle2, Download, MousePointer2, ShieldCheck, Upload } from "lucide-react";
import { ImageToolBreadcrumbs } from "@/components/ImageToolBreadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PhotoEditor } from "@/components/PhotoEditor";
import { RelatedTools } from "@/components/RelatedTools";
import type { PhotoToolConfig } from "@/lib/photo-tools";
import { absoluteUrl } from "@/lib/site";

export function PhotoToolLanding({ config }: { config: PhotoToolConfig }) {
  const path = `/tools/${config.slug}`;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: `BriefVu ${config.title}`,
      url: absoluteUrl(path),
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      browserRequirements: "Modern browser with JavaScript and Canvas enabled",
      description: config.description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: ["Local image processing", "PNG, JPEG and WebP export", "No account required"],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Image Tools", item: absoluteUrl("/tools") },
        { "@type": "ListItem", position: 3, name: config.title, item: absoluteUrl(path) },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: config.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
    },
  ];

  return <main>
    <JsonLd data={structuredData} />
    <ImageToolBreadcrumbs current={config.title} />
    <section className="tool-hero photo-tool-hero">
      <span className="eyebrow">{config.eyebrow}</span>
      <h1>{config.title}</h1>
      <p>{config.hero}</p>
      <a className="button-primary photo-hero-cta" href="#editor">Open the editor</a>
    </section>
    <div className="tool-page-wrap" id="editor">
      <PhotoEditor mode={config.mode} />

      <section className="content-section steps" aria-labelledby={`${config.slug}-steps`}>
        <div className="content-heading"><span>{config.introLabel}</span><h2 id={`${config.slug}-steps`}>{config.introTitle}</h2><p>{config.intro}</p></div>
        <div className="steps-grid">
          {config.steps.map(([title, text], index) => <article key={title}><span>{index + 1}</span>{index === 0 ? <Upload size={22} /> : index === 1 ? <MousePointer2 size={22} /> : <Download size={22} />}<h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="content-section" aria-labelledby={`${config.slug}-uses`}>
        <div className="content-heading"><span>Use cases</span><h2 id={`${config.slug}-uses`}>{config.useCasesTitle}</h2><p>Keep the original image and export a new copy after checking the preview. These focused controls cover common one-image tasks without the setup and complexity of a full desktop editor.</p></div>
        <div className="comparison-grid">{config.useCases.map(([title, text]) => <article key={title}><strong>{title}</strong><p>{text}</p></article>)}</div>
      </section>

      <section className="content-section" aria-labelledby={`${config.slug}-guide`}>
        <div className="content-heading"><span>Practical guide</span><h2 id={`${config.slug}-guide`}>{config.guideTitle}</h2></div>
        <div className="photo-tool-guide">{config.guideParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </section>

      <section className="content-section" aria-labelledby={`${config.slug}-privacy`}>
        <div className="wordcraft-privacy photo-editor-privacy">
          <div><ShieldCheck size={30} /><span className="section-label">Local processing</span><h2 id={`${config.slug}-privacy`}>Your image stays on your device</h2></div>
          <div><p>The editor uses browser file, image, and canvas features. It does not send the image to a BriefVu upload service or save it in an account.</p><ul><li><CheckCircle2 size={17} /> No account or software install</li><li><CheckCircle2 size={17} /> PNG, JPEG, and WebP workflows</li><li><CheckCircle2 size={17} /> The original file is not overwritten</li><li><CheckCircle2 size={17} /> Refreshing clears the current session</li></ul><p className="wordcraft-fine-print">Browser memory limits vary by device. The editor caps input at 25 MB and 24 megapixels to keep everyday sessions responsive.</p></div>
        </div>
      </section>

      <section className="content-section faq" aria-labelledby={`${config.slug}-faq`}>
        <div className="content-heading"><span>FAQ</span><h2 id={`${config.slug}-faq`}>Common questions</h2></div>
        <div className="faq-list">{config.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
      </section>
      <RelatedTools currentSlug={config.slug} />
    </div>
  </main>;
}

