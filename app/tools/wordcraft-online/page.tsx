import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Code2,
  Download,
  ExternalLink,
  FileOutput,
  FileText,
  FolderOpen,
  Keyboard,
  PencilLine,
  ShieldCheck,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { TrackedEditorLink } from "@/components/TrackedEditorLink";
import { absoluteUrl, createPageMetadata } from "@/lib/site";
import {
  wordcraftFaqs,
  wordcraftRelease,
  wordcraftRuntimeReady,
  wordcraftRuntimeUrl,
} from "@/lib/wordcraft";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "WordCraft Online — Free Browser Word Processor",
    description:
      "Run the open-source WordCraft editor in your browser. Open and edit DOCX files locally, then save or export your work. Alpha software; desktop recommended.",
    path: "/tools/wordcraft-online",
  }),
  robots: wordcraftRuntimeReady ? undefined : { index: false, follow: false },
};

const formats = [
  ["DOCX", "Open", "Save"],
  ["DOC", "Import", "—"],
  ["ODT", "Import", "Export"],
  ["RTF", "Import", "Export"],
  ["HTML", "Import", "Export"],
  ["Markdown", "Import", "Export"],
  ["TeX", "Import", "Export"],
  ["TXT", "Import", "Export"],
  ["PDF", "—", "Export"],
] as const;

export default function WordCraftOnlinePage() {
  const structuredData = [
    ...(wordcraftRuntimeReady ? [{
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "WordCraft Online on BriefVu",
      url: absoluteUrl("/tools/wordcraft-online"),
      description:
        "Run the open-source WordCraft word processor in a browser and edit documents locally.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      browserRequirements:
        "Modern desktop browser with WebGPU or WebGL2; desktop recommended",
      softwareVersion: wordcraftRelease.version,
      sameAs: wordcraftRelease.repositoryUrl,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Browser-based document editing",
        "DOCX read and write",
        "Comments and tracked changes",
        "PDF export",
        "Local document processing",
      ],
    }] : []),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
        {
          "@type": "ListItem",
          position: 3,
          name: "WordCraft Online",
          item: absoluteUrl("/tools/wordcraft-online"),
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: wordcraftFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  return (
    <main>
      <JsonLd data={structuredData} />

      <section className="tool-hero wordcraft-hero">
        <span className="eyebrow"><PencilLine size={15} /> Open-source document editor</span>
        <h1>WordCraft Online — Free Word Processor in Your Browser</h1>
        <p>
          Edit DOCX, ODT, RTF, and Markdown files. No install, no account — everything runs in your browser.
        </p>
      </section>

      <div className="tool-page-wrap wordcraft-page">
        <section className="wordcraft-launch" aria-labelledby="wordcraft-launch-title">
          <div className="wordcraft-launch-icon"><FileText size={30} /></div>
          <div>
            <span className="section-label">WordCraft v{wordcraftRelease.version}</span>
            <h2 id="wordcraft-launch-title">Open the full document editor</h2>
            <p>{wordcraftRuntimeReady
              ? "The editor opens in a new tab on BriefVu's shared apps host, leaving this guide available when you need format, privacy, or compatibility details."
              : "The verified release is ready for upload, but the production runtime remains disabled until its storage permission and final checks are complete."}
            </p>
            <div className="wordcraft-launch-notes">
              <span><AlertTriangle size={16} /> Alpha software — desktop recommended.</span>
              <span><Download size={16} /> The first launch downloads a large WebAssembly app; cached visits may be faster.</span>
            </div>
          </div>
          {wordcraftRuntimeReady ? (
            <TrackedEditorLink
              className="button-primary wordcraft-open-button"
              href={wordcraftRuntimeUrl}
              tool="wordcraft-online"
            >
              Open WordCraft Editor <ExternalLink size={17} />
            </TrackedEditorLink>
          ) : (
            <span className="wordcraft-open-button wordcraft-open-disabled" aria-disabled="true">
              Production deployment pending
            </span>
          )}
        </section>

        <section className="content-section" aria-labelledby="wordcraft-capabilities-title">
          <div className="content-heading">
            <span>Capabilities</span>
            <h2 id="wordcraft-capabilities-title">What You Can Do in WordCraft Online</h2>
            <p>
              The selected hosted build uses the official v{wordcraftRelease.version} web release. The upstream
              project documents the formats below; real-world fidelity still depends on the file&apos;s
              complexity, fonts, and advanced Word features.
            </p>
          </div>
          <div className="wordcraft-feature-grid">
            <article><FolderOpen size={22} /><strong>Open documents</strong><p>Start with a blank page or import a supported local document from your device.</p></article>
            <article><Keyboard size={22} /><strong>Write and format</strong><p>Edit text, paragraphs, lists, tables, pictures, styles, headers, and page settings.</p></article>
            <article><PencilLine size={22} /><strong>Review changes</strong><p>Use comments, spelling tools, tracked changes, and accept or reject review edits.</p></article>
            <article><FileOutput size={22} /><strong>Save and export</strong><p>Save editable formats or export a PDF, then verify the result in its target application.</p></article>
          </div>
          <div className="wordcraft-format-table" role="region" aria-label="WordCraft file format support" tabIndex={0}>
            <table>
              <caption>Formats documented by the WordCraft v{wordcraftRelease.version} upstream release</caption>
              <thead><tr><th>Format</th><th>Open</th><th>Save or export</th></tr></thead>
              <tbody>
                {formats.map(([format, open, save]) => (
                  <tr key={format}><th scope="row">{format}</th><td>{open}</td><td>{save}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-section" aria-labelledby="wordcraft-privacy-title">
          <div className="wordcraft-privacy">
            <div><ShieldCheck size={30} /><span className="section-label">Local document processing</span><h2 id="wordcraft-privacy-title">Edit documents inside your browser</h2></div>
            <div>
              <p>
                The static WordCraft app reads and edits document bytes in your browser. The BriefVu
                runtime does not provide a document-upload API and is not designed to send document
                contents to BriefVu for editing or storage.
              </p>
              <ul>
                <li><CheckCircle2 size={17} /> No BriefVu account required</li>
                <li><CheckCircle2 size={17} /> Files are opened through browser file controls</li>
                <li><CheckCircle2 size={17} /> Saving and export use browser file or download controls</li>
                <li><AlertTriangle size={17} /> No automatic cloud save — save your work before closing</li>
              </ul>
              <p className="wordcraft-fine-print">
                The browser still downloads application assets from apps.briefvu.com. Normal server
                logs can record those asset requests without receiving the document itself.
              </p>
            </div>
          </div>
        </section>

        <section className="content-section steps" aria-labelledby="wordcraft-steps-title">
          <div className="content-heading"><span>How to use</span><h2 id="wordcraft-steps-title">Open, Edit, Save, and Check</h2><p>Use a copy of important documents while WordCraft remains in alpha, and verify the output before replacing the original.</p></div>
          <div className="wordcraft-steps-grid">
            <article><span>1</span><ExternalLink size={21} /><h3>Open the editor</h3><p>Launch WordCraft in a new tab and wait for the WebAssembly application to finish loading.</p></article>
            <article><span>2</span><FolderOpen size={21} /><h3>Choose a document</h3><p>Start blank or use the Open command to select a supported file from your device.</p></article>
            <article><span>3</span><Keyboard size={21} /><h3>Edit your copy</h3><p>Use the ribbon or keyboard shortcuts. Save frequently with Ctrl+S or Cmd+S.</p></article>
            <article><span>4</span><FileOutput size={21} /><h3>Save or export</h3><p>Use WordCraft&apos;s Save, Save As, or Export command for the format you need.</p></article>
            <article><span>5</span><CheckCircle2 size={21} /><h3>Review the result</h3><p>Reopen the output in WordCraft and its target app, and check layout, fonts, and advanced objects.</p></article>
          </div>
        </section>

        <section className="content-section" aria-labelledby="wordcraft-limits-title">
          <div className="content-heading"><span>Known limitations</span><h2 id="wordcraft-limits-title">Alpha Software: What to Check First</h2><p>WordCraft&apos;s roadmap estimates it is about 60% of the way toward replacing Word for real work. That is a project estimate, not a guarantee for any individual document.</p></div>
          <div className="wordcraft-limit-grid">
            <article><strong>Complex Word fidelity</strong><p>Pagination, fonts, nested tables, text boxes, headers, and specialized layouts may differ after opening or saving.</p></article>
            <article><strong>Charts and SmartArt</strong><p>The upstream roadmap identifies reliable chart and SmartArt round trips as work still needed for beta.</p></article>
            <article><strong>Macros and controls</strong><p>Do not expect browser execution of VBA, ActiveX, or other desktop automation and security features.</p></article>
            <article><strong>Fonts and printing</strong><p>Unavailable fonts can be substituted, changing line and page breaks. Review the exported PDF before printing.</p></article>
            <article><strong>Manual saving</strong><p>This hosted version does not provide BriefVu cloud autosave. Save a local copy before closing or refreshing the tab.</p></article>
            <article><strong>Desktop-first UI</strong><p>A modern browser with WebGPU or WebGL2 is required. Mobile is not part of the supported v1 experience.</p></article>
            <article><strong>Interface language</strong><p>If localized labels render as missing glyphs, choose File → Options → Language → English.</p></article>
          </div>
          <a className="wordcraft-source-link" href={wordcraftRelease.roadmapUrl} target="_blank" rel="noopener noreferrer">Read the upstream roadmap <ArrowRight size={16} /></a>
        </section>

        <section className="content-section faq" aria-labelledby="wordcraft-faq-title">
          <div className="content-heading"><span>FAQ</span><h2 id="wordcraft-faq-title">Common Questions About WordCraft Online</h2></div>
          <div className="faq-list">
            {wordcraftFaqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
          </div>
        </section>

        <section className="content-section" aria-labelledby="wordcraft-tested-title">
          <div className="content-heading"><span>Hosted release</span><h2 id="wordcraft-tested-title">Pinned and Auditable</h2><p>BriefVu pins one upstream web release instead of silently following a moving branch. This keeps the public copy, license notices, runtime files, and compatibility testing tied to the same version.</p></div>
          <div className="wordcraft-release-card">
            <div><span>Release</span><strong>WordCraft v{wordcraftRelease.version}</strong></div>
            <div><span>Web archive SHA-256</span><code>{wordcraftRelease.releaseSha256}</code></div>
            <div><span>Production verification</span><strong>Official checksum, browser editing, and DOCX save confirmed · 2026-10-16</strong></div>
            <p>The production runtime passed custom-domain, asset MIME, cache, noindex, and upload-rejection checks before this page was released.</p>
          </div>
        </section>

        <section className="content-section" aria-labelledby="wordcraft-source-title">
          <div className="wordcraft-attribution">
            <div><Code2 size={30} /><span className="section-label">Source and licenses</span><h2 id="wordcraft-source-title">Open Source, Clearly Attributed</h2><p>WordCraft is developed by the ArtCraft team and contributors. BriefVu {wordcraftRuntimeReady ? "independently hosts" : "is preparing to host"} the official web release and is not affiliated with or endorsed by its maintainers.</p></div>
            <dl>
              <div><dt>Upstream</dt><dd><a href={wordcraftRelease.repositoryUrl} target="_blank" rel="noopener noreferrer">storytold/wordcraft <ExternalLink size={14} /></a></dd></div>
              <div><dt>Release</dt><dd><a href={wordcraftRelease.releaseUrl} target="_blank" rel="noopener noreferrer">v{wordcraftRelease.version} <ExternalLink size={14} /></a></dd></div>
              <div><dt>License</dt><dd>MIT or Apache-2.0</dd></div>
              <div><dt>Notices</dt><dd><a href={wordcraftRelease.noticeUrl} target="_blank" rel="noopener noreferrer">NOTICE</a> · <a href={wordcraftRelease.attributionUrl} target="_blank" rel="noopener noreferrer">ATTRIBUTION</a> · <a href={wordcraftRelease.brandLicenseUrl} target="_blank" rel="noopener noreferrer">Brand license</a></dd></div>
            </dl>
          </div>
        </section>

        <RelatedTools currentSlug="wordcraft-online" />
      </div>
    </main>
  );
}
