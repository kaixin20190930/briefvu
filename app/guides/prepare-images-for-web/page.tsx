import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, createPageMetadata } from "@/lib/site";

const path = "/guides/prepare-images-for-web";

export const metadata: Metadata = createPageMetadata({
  title: "How to Prepare Images for the Web — Practical Workflow",
  description:
    "Prepare images for websites without repeated quality loss: crop, resize, choose JPG, PNG or WebP, compress once, review metadata, and verify the result.",
  path,
});

export default function PrepareImagesForWebGuide() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "How to Prepare Images for the Web",
      description:
        "A practical browser workflow for cropping, resizing, converting, compressing, and checking metadata before publishing an image.",
      url: absoluteUrl(path),
      mainEntityOfPage: absoluteUrl(path),
      datePublished: "2026-10-20",
      dateModified: "2026-10-20",
      author: { "@type": "Organization", name: "BriefVu", url: absoluteUrl("/") },
      publisher: { "@type": "Organization", name: "Moxion Labs LLC", url: absoluteUrl("/") },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Learn", item: absoluteUrl("/guides") },
        { "@type": "ListItem", position: 3, name: "Prepare Images for the Web", item: absoluteUrl(path) },
      ],
    },
  ];

  return (
    <main className="guide-shell">
      <JsonLd data={data} />
      <article>
        <header className="guide-hero">
          <nav aria-label="Breadcrumb"><Link href="/guides">Learn</Link><span>/</span><span>Prepare images for the web</span></nav>
          <span className="eyebrow">Image publishing workflow</span>
          <h1>How to Prepare Images for the Web</h1>
          <p>Use a deliberate order—crop, resize, convert, compress, inspect metadata, then verify—to avoid repeated quality loss and oversized downloads.</p>
          <div><time dateTime="2026-10-20">Updated October 20, 2026</time><span>9 minute read</span></div>
        </header>

        <section>
          <h2>Start with a source and create a delivery copy</h2>
          <p>Keep the highest-quality original you have. It may be a camera file, a transparent PNG, a layered design, or a larger export than the website needs. That source is for future editing. The web copy is a separate derivative made for one destination.</p>
          <p>This distinction prevents a common failure: repeatedly opening, editing, and saving the same lossy JPG. Each new encoding can add artifacts. A named delivery copy also makes it easier to compare file size and appearance without risking the original.</p>
        </section>

        <section>
          <h2>1. Crop before you resize</h2>
          <p>Choose the composition and aspect ratio first. Cropping after resizing can force another export or leave too few pixels for the final slot. Use the <Link href="/tools/crop-image">image cropper</Link> to remove unused edges and match the shape required by a card, article, profile, or banner.</p>
          <p>Do not assume one universal aspect ratio. A wide hero, square product tile, vertical social image, and inline screenshot serve different layouts. Check the actual publishing template, keep important content away from edges that may be clipped, and preview the crop at a realistic size.</p>
        </section>

        <section>
          <h2>2. Resize to the real display requirement</h2>
          <p>A camera image can contain far more pixels than a browser will display. Use the <Link href="/tools/resize-image">image resizer</Link> after cropping so the delivery file is close to the largest size it will actually appear. Preserve the aspect ratio unless intentional stretching is part of the design.</p>
          <p>High-density displays may benefit from an image larger than its CSS display width, but that does not mean every image should remain at full camera resolution. Avoid enlarging a small source just to meet a number: upscaling creates more pixels, not more captured detail. If the source is too small, use a different image or accept the limitation rather than sharpening artifacts into prominence.</p>
        </section>

        <section>
          <h2>3. Choose the final image format</h2>
          <div className="guide-troubleshooting">
            <article><h3>JPG</h3><p>Use for photographs when broad compatibility and a small file matter. It has no alpha transparency and uses lossy compression.</p></article>
            <article><h3>PNG</h3><p>Use for transparent graphics, logos, screenshots, diagrams, or pixel art when lossless detail matters more than file size.</p></article>
            <article><h3>WebP</h3><p>Use for modern web delivery when the destination accepts it and you want efficient lossy or lossless compression with optional transparency.</p></article>
          </div>
          <p>Read the <Link href="/guides/image-formats-jpg-png-webp">JPG, PNG, and WebP comparison</Link> when the choice is unclear. If the source format does not match the destination, use the <Link href="/tools/image-converter">image converter</Link> once, after the crop and dimensions are settled.</p>
        </section>

        <section>
          <h2>4. Compress once and inspect the details that matter</h2>
          <p>Compression is a visual decision, not just a percentage. Use the <Link href="/tools/compress-image">image compressor</Link> to compare the output with the source at text, edges, gradients, skin, shadows, and repeated patterns. The smallest file is not useful if the image looks damaged where users will notice.</p>
          <p>Lossy formats can show ringing around high-contrast text, block artifacts in detailed areas, and banding in smooth gradients. PNG behaves differently because its compression is lossless. If a JPG or WebP result looks poor, increase quality or reduce the dimensions instead of repeatedly compressing the same output.</p>
        </section>

        <section>
          <h2>5. Review metadata and visible privacy risks</h2>
          <p>A public image may carry GPS, camera, editing, color-profile, descriptive, or provenance information. Inspect the final delivery copy with the <Link href="/tools/remove-metadata">photo metadata remover</Link> when that information should not travel with the file. Do this after conversion because a converter may preserve, discard, or create container metadata.</p>
          <p>Metadata removal is not complete anonymization. Look at the pixels for faces, names, addresses, account details, reflections, landmarks, QR codes, and other identifying context. Keep color profiles or orientation information when removing them would make the delivered image appear wrong.</p>
        </section>

        <section>
          <h2>6. Verify the real page, not only the local file</h2>
          <p>Publish to a preview or staging page and test the image in context. Confirm that it is sharp at the intended size, does not crop important content, preserves transparency, and loads at an acceptable speed. Check a narrow mobile viewport as well as a larger screen.</p>
          <p>Finally, inspect what the publishing system actually serves. A CMS, social network, optimization proxy, or CDN may resize, recompress, rename, or convert the upload. Keep your prepared delivery copy, but evaluate the derivative users receive rather than assuming it is byte-for-byte identical.</p>
        </section>

        <section>
          <h2>A simple order that avoids duplicate work</h2>
          <ol>
            <li>Keep the untouched source.</li>
            <li>Crop to the required composition.</li>
            <li>Resize for the largest real display.</li>
            <li>Convert to the final JPG, PNG, or WebP format.</li>
            <li>Compress once and compare the result.</li>
            <li>Inspect metadata and visible private details.</li>
            <li>Verify the image on the actual page.</li>
          </ol>
          <p>The order is a default, not a rigid law. A publisher may impose its own dimensions or conversion rules. The important principle is to make each destructive change once, near the end, while retaining the original.</p>
        </section>

        <section className="guide-next">
          <span className="section-label">Start the workflow</span>
          <h2>Prepare a private web copy</h2>
          <div><Link href="/tools/crop-image">Crop an image</Link><Link href="/tools/resize-image">Resize an image</Link><Link href="/tools/image-converter">Convert the format</Link></div>
        </section>
      </article>
    </main>
  );
}
