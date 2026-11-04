import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ColorPalette } from "@/components/ColorPalette";
import { ImageToolBreadcrumbs } from "@/components/ImageToolBreadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { absoluteUrl, createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Color Palette From Image — HEX & RGB Colors",
  description: "Extract a color palette from an image locally. Get dominant and average colors, up to 10 swatches, HEX, RGB, HSL, and CSS or JSON exports. No upload.",
  path: "/tools/color-palette-from-image",
});

const faqs = [
  { question: "How many colors should I extract?", answer: "Start with five for a compact reference palette. Choose up to ten to explore more variation, or two for a simple pair. A flat logo may produce fewer colors than requested because the tool does not invent additional color groups." },
  { question: "Which image formats can I use?", answer: "Use JPG, PNG, WebP, or AVIF when your browser can decode it. SVG and animated formats are not supported in this tool. Files must be no larger than 20 MB, 20 megapixels, or 8,192 pixels on either side. Convert unsupported images to PNG first." },
  { question: "Does my image leave the browser?", answer: "No. Decoding, sampling, and palette extraction run on your device. The image, filename, and extracted colors are not sent in tool usage events. Refreshing or closing the page clears the working image; files you choose to download remain on your device." },
  { question: "Why does the average color look muted?", answer: "An average mixes every visible sampled color into one result. Opposing hues can balance into a neutral color even when none of the original objects is gray. BriefVu averages alpha-weighted linear-light RGB values, then converts back to sRGB. Tools that average encoded sRGB values directly may produce a darker result." },
  { question: "Can I pick the exact color of one pixel?", answer: "Use the separate image color picker for a specific coordinate. A palette contains representative color groups from a reduced sample; it is not a list of every original pixel value." },
  { question: "How accurate is the extracted palette?", answer: "It is a practical approximation of the browser-decoded image. Sampling at up to 256 by 256 pixels reduces processing work but may miss small details. Color profiles, browser decoding, transparency, and the selected number of colors can affect the result. Dominant means the largest extracted group, not necessarily the color your eye notices first." },
  { question: "Can I export the palette as JSON or CSS?", answer: "Yes. Copy or download CSS variables or JSON containing the average, dominant color, and each palette swatch. JSON includes HEX, RGB, HSL, and alpha values. Extracted swatches are opaque; source transparency influences their weight rather than becoming a swatch opacity." },
  { question: "Is the color palette generator free?", answer: "Yes. The tool needs no account. You can extract, copy, and download palettes in your browser. Only use images you have permission to use, and verify important brand colors against your original design specifications." },
];

export default function ColorPalettePage() {
  return <main>
    <JsonLd data={[
      { "@context": "https://schema.org", "@type": "WebApplication", name: "BriefVu Color Palette From Image", url: absoluteUrl("/tools/color-palette-from-image"), applicationCategory: "DesignApplication", operatingSystem: "Any", browserRequirements: "JavaScript and Canvas enabled", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, featureList: ["Local color palette extraction", "Average and dominant colors", "HEX, RGB and HSL", "CSS and JSON export"] },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Image Tools", item: absoluteUrl("/tools") },
        { "@type": "ListItem", position: 3, name: "Color Palette From Image", item: absoluteUrl("/tools/color-palette-from-image") },
      ] },
    ]} />
    <ImageToolBreadcrumbs current="Color Palette From Image" />
    <section className="tool-hero color-tool-hero"><span className="eyebrow">Free browser color utility</span><h1>Color Palette From Image</h1><p>Extract a color palette from an image without uploading it. Find dominant colors, an average color, and up to 10 representative swatches as HEX, RGB, or HSL.</p><p className="color-intent-link">Looking for the exact color of one spot? <Link href="/tools/image-color-picker">Use the color picker to grab a single pixel value.</Link></p></section>
    <div className="tool-page-wrap">
      <ColorPalette />
      <section className="content-section"><div className="content-heading"><span>Three simple steps</span><h2>How to extract a color palette from an image</h2></div><div className="steps-grid">
        <article><span>1</span><h3>Choose a reference image</h3><p>Open a local photo, screenshot, or logo. Drag it into the tool or use Choose image. The image is decoded locally. If a file does not open, <Link href="/tools/image-converter">convert it to PNG</Link> and try again.</p></article>
        <article><span>2</span><h3>Choose the palette size</h3><p>Start with five colors and increase the count to explore more groups. The largest group appears as the dominant color. Compare it with the separately calculated average rather than treating them as interchangeable.</p></article>
        <article><span>3</span><h3>Copy or export</h3><p>Switch between HEX, RGB, and HSL, copy individual swatches, or download CSS variables and JSON. The visible export code remains selectable if your browser blocks clipboard access.</p></article>
      </div></section>
      <section className="content-section" id="worked-example">
        <div className="content-heading"><span>Try it yourself</span><h2>Example: extract five colors from a reference image</h2></div>
        <p><a href="/examples/five-color-reference.png" download>Download the five-color sample PNG</a>, open it with Choose image, and keep Palette size at 5 colors and Color format at HEX. You can then copy a swatch or download the CSS variables.</p>
        <figure className="tool-example">
          <a href="/examples/palette-five-colors.png"><Image src="/examples/palette-five-colors.png" alt="Five-color sample in the palette tool, with five HEX swatches and a separate average color of #B3B4A8" width={1102} height={818} unoptimized /></a>
          <figcaption>Actual tool result. The average is a blend, not one of the five source colors. Sampling gives the dark band a slightly larger share here, even though the original bands have equal widths. Open the screenshot to see the labels at full size.</figcaption>
        </figure>
      </section>
      <section className="content-section"><div className="content-heading"><h2>Extract colors from a specific area of an image</h2></div><p>Want the colors of a flower, product, or background rather than the whole photo? First <Link href="/tools/crop-image">crop the image to the area you want</Link>. Adjust the crop box around your subject, download the cropped image, then open that file in this palette tool. Choose five colors to start and compare the dominant and average results. Excluding a large background lets the selected subject contribute more of the sampled colors. This page does not include a region selector; cropping is a separate step. Keep your original file if you want to compare several regions or return to the full-image palette later.</p></section>
      <section className="content-section"><div className="content-heading"><span>Understand the result</span><h2>Average color, dominant colors, and palettes</h2></div><div className="comparison-grid">
        <article><strong>Average: one blended result</strong><p>The average combines visible sampled pixels using their opacity as weight. We convert sRGB channels to linear light before averaging. Use it for a rough overall color impression, not to recover an exact brand color or predict the most noticeable object.</p></article>
        <article><strong>Dominant: the largest group</strong><p>The dominant swatch represents the extracted color group with the greatest weight. A large background can dominate even when a small bright object attracts your attention. Changing the requested color count can change group boundaries and the dominant result.</p></article>
        <article><strong>Palette: several representatives</strong><p>The palette divides a sampled color histogram into groups and calculates representative RGB values. Percentages describe visible sample weight, not exact object coverage. Use these colors as a starting point for design decisions rather than a finished accessible theme.</p></article>
      </div></section>
      <section className="content-section"><div className="content-heading"><h2>HEX, RGB, or HSL — which do you need?</h2><p>HEX is compact and convenient for CSS and design applications. RGB makes channel values explicit. HSL expresses the same color through hue, saturation, and lightness, which is helpful when creating variations. These are screen-color representations, not a calibrated print or CMYK workflow.</p><h2>Copy your palette as CSS variables or JSON</h2><p>CSS export names the average, dominant color, and numbered swatches. Paste the variables into your stylesheet and reference a value such as <code>var(--palette-1)</code>. JSON preserves each color in multiple formats for scripts and design handoffs. Tailwind users can reference the CSS variables through arbitrary color utilities; this release does not generate a Tailwind configuration or match a built-in Tailwind shade.</p></div></section>
      <section className="content-section"><div className="content-heading"><h2>Use a photo palette as a starting point</h2><p>Extract colors from an illustration to explore a website theme, compare product-photo backgrounds, or collect references for a presentation. Check text against its actual background with the <Link href="/tools/image-color-picker">color picker and contrast checker</Link> before using an extracted color in an interface.</p><p>Use your chosen colors in a logo or simple brand mark, save it as an image, then <Link href="/tools/image-to-ico">turn your brand image into a favicon</Link>. The converter takes an image, not a palette file.</p><h2>Transparent images, large files, and mobile browsers</h2><p>Fully transparent pixels do not count; partially transparent pixels count in proportion to opacity. No white or black background is added for extraction. A completely transparent image returns an explanation instead of a fake black palette.</p><p>The source is limited to 20 MB, 20 megapixels, and 8,192 px per side. We reduce it to at most 256 × 256 pixels for extraction. On a phone, <Link href="/tools/resize-image">resize large images first</Link>; <Link href="/tools/compress-image">compression</Link> reduces file bytes but does not necessarily reduce decoded memory. AVIF depends on browser decoding support. Work is local after the application has loaded, but this is not an installable offline app.</p></div></section>
      <section className="content-section faq"><div className="content-heading"><span>FAQ</span><h2>Palette questions</h2></div><div className="faq-list">{faqs.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
      <RelatedTools currentSlug="color-palette-from-image" />
    </div>
  </main>;
}
