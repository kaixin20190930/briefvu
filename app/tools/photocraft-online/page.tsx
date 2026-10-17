import type { Metadata } from "next";
import {
  AlertTriangle,
  Brush,
  CheckCircle2,
  Code2,
  Download,
  ExternalLink,
  FileImage,
  FolderOpen,
  ImageIcon,
  Layers3,
  Save,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { TrackedEditorLink } from "@/components/TrackedEditorLink";
import {
  photocraftFaqs,
  photocraftRelease,
  photocraftRuntimeReady,
  photocraftRuntimeUrl,
} from "@/lib/photocraft";
import { absoluteUrl, createPageMetadata } from "@/lib/site";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "PhotoCraft Online — Free Browser Photo Editor",
    description:
      "PhotoCraft Online — free browser photo editor. Open PSD files, edit with layers and masks, export PNG/JPEG/WebP. No install, no account — runs in your browser.",
    path: "/tools/photocraft-online",
  }),
  robots: photocraftRuntimeReady ? undefined : { index: false, follow: false },
};

const formats = [
  ["PSD / PSB", "Open layered files", "Save layered files"],
  ["TIFF", "Open flat or layered files", "Export flat or layered files"],
  ["OpenRaster", "Open layered files", "Save layered files"],
  ["PNG", "Open", "Export"],
  ["JPEG", "Open", "Export"],
  ["WebP", "Open", "Export"],
  ["SVG", "Open as shapes or place", "—"],
  ["HEIC", "Open in official builds", "Read only"],
] as const;

export default function PhotoCraftOnlinePage() {
  const structuredData = [
    ...(photocraftRuntimeReady
      ? [{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "PhotoCraft Online on BriefVu",
          url: absoluteUrl("/tools/photocraft-online"),
          description:
            "Run the open-source PhotoCraft photo editor in a browser with layers, masks, adjustments, and PSD support.",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          browserRequirements:
            "Modern desktop browser with WebGPU or WebGL2; desktop Chrome recommended",
          softwareVersion: photocraftRelease.version,
          sameAs: photocraftRelease.repositoryUrl,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          featureList: [
            "Browser-based image editing",
            "Layers and masks",
            "Adjustment layers",
            "PSD and PSB support",
            "Local image processing",
          ],
        }]
      : []),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
        {
          "@type": "ListItem",
          position: 3,
          name: "PhotoCraft Online",
          item: absoluteUrl("/tools/photocraft-online"),
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: photocraftFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  return (
    <main>
      <JsonLd data={structuredData} />

      <section className="tool-hero photocraft-hero">
        <span className="eyebrow"><ImageIcon size={15} /> Open-source image editor</span>
        <h1>PhotoCraft Online — Free Photo Editor in Your Browser</h1>
        <p>
          Edit images with layers, masks, adjustment tools, and PSD support. No install or
          account required — image processing stays in your browser.
        </p>
        {photocraftRuntimeReady && (
          <div className="hero-actions tool-hero-actions">
            <TrackedEditorLink
              className="button-primary"
              href={photocraftRuntimeUrl}
              tool="photocraft-online"
            >
              Open PhotoCraft Editor <ExternalLink size={17} />
            </TrackedEditorLink>
          </div>
        )}
      </section>

      <div className="tool-page-wrap photocraft-page">
        <section className="wordcraft-launch photocraft-launch" aria-labelledby="photocraft-launch-title">
          <div className="wordcraft-launch-icon"><ImageIcon size={30} /></div>
          <div>
            <span className="section-label">PhotoCraft v{photocraftRelease.version}</span>
            <h2 id="photocraft-launch-title">PhotoCraft Online Editor — No Download Required</h2>
            <p>
              {photocraftRuntimeReady
                ? "The editor opens in a new tab on BriefVu's shared apps host, leaving this guide available for format, privacy, and compatibility details."
                : "The verified release is being prepared for the shared BriefVu apps host. The editor will be enabled after production runtime checks pass."}
            </p>
            <div className="wordcraft-launch-notes">
              <span><AlertTriangle size={16} /> Early alpha software — work from a copy.</span>
              <span><Download size={16} /> First launch downloads a large WebAssembly application.</span>
            </div>
          </div>
          {photocraftRuntimeReady ? (
            <TrackedEditorLink
              className="button-primary wordcraft-open-button"
              href={photocraftRuntimeUrl}
              tool="photocraft-online"
            >
              Open PhotoCraft Editor <ExternalLink size={17} />
            </TrackedEditorLink>
          ) : (
            <span className="wordcraft-open-button wordcraft-open-disabled" aria-disabled="true">
              Production verification pending
            </span>
          )}
        </section>

        <section className="content-section" aria-labelledby="photocraft-capabilities-title">
          <div className="content-heading">
            <span>Capabilities</span>
            <h2 id="photocraft-capabilities-title">Layer-Based Editing Without an Install</h2>
            <p>
              PhotoCraft is more than a crop-and-filter utility. The official v{photocraftRelease.version}
              release brings a desktop-style editing workspace to the browser while keeping the
              project&apos;s early-alpha limits visible.
            </p>
          </div>
          <div className="wordcraft-feature-grid">
            <article><Layers3 size={22} /><strong>Layers and masks</strong><p>Organize edits with groups, pixel and vector masks, clipping masks, blend modes, and opacity.</p></article>
            <article><SlidersHorizontal size={22} /><strong>Non-destructive adjustments</strong><p>Use adjustment layers such as Levels, Curves, Vibrance, Hue/Saturation, and Gradient Map.</p></article>
            <article><Brush size={22} /><strong>Paint and retouch</strong><p>Work with brushes, selections, transforms, fills, gradients, type, paths, and shape tools.</p></article>
            <article><FileImage size={22} /><strong>Layered PSD workflows</strong><p>Open and save PSD or PSB documents, then check complex files before replacing the original.</p></article>
          </div>
          <div className="wordcraft-format-table" role="region" aria-label="PhotoCraft file format support" tabIndex={0}>
            <table>
              <caption>Selected formats documented by the PhotoCraft v{photocraftRelease.version} upstream release</caption>
              <thead><tr><th>Format</th><th>Open</th><th>Save or export</th></tr></thead>
              <tbody>
                {formats.map(([format, open, save]) => (
                  <tr key={format}><th scope="row">{format}</th><td>{open}</td><td>{save}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-section" aria-labelledby="photocraft-audience-title">
          <div className="content-heading photocraft-audience-copy">
            <span>Who it is for</span>
            <h2 id="photocraft-audience-title">Who PhotoCraft Online Is For</h2>
            <p>
              PhotoCraft Online is for designers, photographers, marketers, students, and
              anyone who needs to open a PSD without installing software. It is useful for
              quick edits such as cropping an image, adding text, adjusting colours, checking
              layers, or exporting a web-ready copy when you do not want to launch a full
              desktop editor.
            </p>
            <p>
              It also gives occasional editors a practical way to inspect a layered file on a
              shared or temporary computer. There is no BriefVu account or subscription to set
              up: open the editor, choose a local file, make the change, and save or export the
              result before closing the tab.
            </p>
          </div>
        </section>

        <section className="content-section" aria-labelledby="photocraft-privacy-title">
          <div className="wordcraft-privacy photocraft-privacy">
            <div><ShieldCheck size={30} /><span className="section-label">Local image processing</span><h2 id="photocraft-privacy-title">Your image stays on your device</h2></div>
            <div>
              <p>
                PhotoCraft&apos;s static WebAssembly application opens and processes image bytes
                in your browser. BriefVu does not provide an image-upload API or cloud document
                storage for this runtime.
              </p>
              <ul>
                <li><CheckCircle2 size={17} /> No BriefVu account required</li>
                <li><CheckCircle2 size={17} /> Images open through browser file controls</li>
                <li><CheckCircle2 size={17} /> Save and Export create local downloads</li>
                <li><AlertTriangle size={17} /> No dependable web autosave — save before closing</li>
              </ul>
              <p className="wordcraft-fine-print">
                Your browser still downloads application assets from apps.briefvu.com. Normal
                server logs can record requests for those files without receiving your image.
              </p>
            </div>
          </div>
        </section>

        <section className="content-section steps" aria-labelledby="photocraft-steps-title">
          <div className="content-heading">
            <span>How to use</span>
            <h2 id="photocraft-steps-title">Open, Edit, Save, and Verify</h2>
            <p>Keep the original file while PhotoCraft remains in alpha, especially when working with layered PSD or TIFF documents.</p>
          </div>
          <div className="wordcraft-steps-grid photocraft-steps-grid">
            <article><span>1</span><ExternalLink size={21} /><h3>Open the editor</h3><p>Launch PhotoCraft in a new tab and wait for the WebAssembly application to finish loading.</p></article>
            <article><span>2</span><FolderOpen size={21} /><h3>Choose an image</h3><p>Start a new canvas or open a supported image from your device using the browser file picker.</p></article>
            <article><span>3</span><Brush size={21} /><h3>Edit in layers</h3><p>Add layers, masks, type, shapes, adjustments, or brush edits while keeping the original nearby.</p></article>
            <article><span>4</span><Save size={21} /><h3>Save or export</h3><p>Save a layered working file or export a delivery format such as PNG, JPEG, or WebP.</p></article>
            <article><span>5</span><CheckCircle2 size={21} /><h3>Check the output</h3><p>Reopen the saved file and inspect dimensions, transparency, layers, text, and colour before use.</p></article>
          </div>
        </section>

        <section className="content-section" aria-labelledby="photocraft-limits-title">
          <div className="content-heading">
            <span>Known limitations</span>
            <h2 id="photocraft-limits-title">Early Alpha: What to Check First</h2>
            <p>PhotoCraft has a broad feature surface, but the upstream project does not yet describe it as a replacement for daily professional Photoshop work.</p>
          </div>
          <div className="wordcraft-limit-grid">
            <article><strong>Complex PSD fidelity</strong><p>Uncommon effects, typography, smart objects, colour modes, linked assets, or metadata can behave differently after a round trip. Keep the source file untouched, then compare the exported image and reopened layer structure before using PhotoCraft for a critical handoff.</p></article>
            <article><strong>Manual saving</strong><p>The hosted web build has no dependable crash recovery. Save or export before refreshing or closing the tab.</p></article>
            <article><strong>Browser memory</strong><p>Large canvases and many layers can use substantial device memory. Close other heavy tabs if editing slows down.</p></article>
            <article><strong>Fonts</strong><p>The web release includes a limited font set. Missing fonts can change text layout or appearance.</p></article>
            <article><strong>Desktop-first interface</strong><p>The dense editing workspace is intended for a larger screen, keyboard, and pointing device.</p></article>
            <article><strong>No BriefVu cloud storage</strong><p>There is no project library, account sync, or BriefVu backup. Your exported file is your copy.</p></article>
          </div>
          <a className="wordcraft-source-link" href={photocraftRelease.roadmapUrl} target="_blank" rel="noopener noreferrer">
            Read the upstream roadmap <ExternalLink size={16} />
          </a>
        </section>

        <section className="content-section faq" aria-labelledby="photocraft-faq-title">
          <div className="content-heading"><span>FAQ</span><h2 id="photocraft-faq-title">Common Questions About PhotoCraft Online</h2></div>
          <div className="faq-list">
            {photocraftFaqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
          </div>
        </section>

        <section className="content-section" aria-labelledby="photocraft-source-title">
          <div className="wordcraft-attribution">
            <div>
              <Code2 size={30} />
              <span className="section-label">Source and licenses</span>
              <h2 id="photocraft-source-title">Pinned, Open Source, and Clearly Attributed</h2>
              <p>
                PhotoCraft is developed by the ArtCraft team and contributors. BriefVu {photocraftRuntimeReady ? "independently hosts" : "is preparing to host"} the
                official web release and is not affiliated with or endorsed by its maintainers.
              </p>
            </div>
            <dl>
              <div><dt>Release</dt><dd>PhotoCraft v{photocraftRelease.version}</dd></div>
              <div><dt>Archive SHA-256</dt><dd><code>{photocraftRelease.releaseSha256}</code></dd></div>
              <div><dt>Upstream</dt><dd><a href={photocraftRelease.repositoryUrl} target="_blank" rel="noopener noreferrer">storytold/photocraft <ExternalLink size={14} /></a></dd></div>
              <div><dt>Release page</dt><dd><a href={photocraftRelease.releaseUrl} target="_blank" rel="noopener noreferrer">v{photocraftRelease.version} <ExternalLink size={14} /></a></dd></div>
              <div><dt>License</dt><dd>MIT or Apache-2.0</dd></div>
              <div><dt>Notices</dt><dd><a href={photocraftRelease.noticeUrl} target="_blank" rel="noopener noreferrer">NOTICE</a> · <a href={photocraftRelease.attributionUrl} target="_blank" rel="noopener noreferrer">ATTRIBUTION</a> · <a href={photocraftRelease.brandLicenseUrl} target="_blank" rel="noopener noreferrer">Brand license</a></dd></div>
            </dl>
          </div>
        </section>

        <RelatedTools currentSlug="photocraft-online" />
      </div>
    </main>
  );
}
