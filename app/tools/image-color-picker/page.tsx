import type { Metadata } from "next";
import { Copy, Crosshair, MonitorSmartphone, MousePointer2, Upload } from "lucide-react";
import { ImageColorPicker } from "@/components/ImageColorPicker";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { absoluteUrl, createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Color Picker from Image — Get HEX, RGB & HSL",
  description: "Use a private color picker from image files or screenshots to sample exact pixels and copy HEX, RGB and HSL values directly in your browser.",
  path: "/tools/image-color-picker",
});

const faqs = [
  {
    question: "How do I pick a color from an image?",
    answer: "Open an image, then move the pointer over the area you want to inspect. The magnifier shows the current pixel and its color values. Click or tap to lock that pixel, choose HEX, RGB, or HSL, and copy the value. This color picker from image files works directly in your browser, so you can sample a photo without first moving it into a design application.",
  },
  {
    question: "How do I get the HEX color from an image?",
    answer: "Upload or paste the image, select the required pixel, and use the HEX row in the result panel. BriefVu converts the sampled red, green, and blue channels into a six-digit HEX value such as #2563EB. Copy that value into CSS, a design system, or another color tool. For the most accurate result, zoom in visually and select a solid area rather than an anti-aliased edge.",
  },
  {
    question: "Can a color picker identify colors from an image?",
    answer: "Yes, if you need the exact digital value of a pixel. BriefVu identifies the selected color as HEX, RGB, and HSL so you can reuse it consistently. It does not assign subjective names such as ocean blue or warm beige, because color-name lists differ between products. The numeric values are more precise and can be pasted into most web, presentation, and design software.",
  },
  {
    question: "Can I use a color picker on a screenshot?",
    answer: "Yes. Copy a screenshot and press Ctrl+V or Cmd+V anywhere on this page, or save the screenshot and drag it into the upload area. The screenshot remains on your device while you inspect it. This is useful for matching a color from a website, presentation, dashboard, or app mockup when you have the right to use the source image.",
  },
  {
    question: "Does BriefVu upload my image?",
    answer: "No. BriefVu decodes the file and samples its pixels locally in your browser. The image is not uploaded to BriefVu, stored on our server, or added to an account. Closing or refreshing the page clears the current image. As with any local file, avoid sharing the screen or copied color values if the source contains information you need to keep private.",
  },
  {
    question: "Why can the same pixel look different on another screen?",
    answer: "The HEX, RGB, and HSL values can remain identical while their appearance changes. Screen brightness, panel technology, calibration, browser color management, and an image's embedded profile all affect what you see. Use the copied numeric value as the reproducible reference, then check important brand or accessibility colors on the actual devices and backgrounds where they will be displayed.",
  },
];

export default function ImageColorPickerPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "BriefVu Image Color Picker",
      url: absoluteUrl("/tools/image-color-picker"),
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires a modern browser with JavaScript and Canvas enabled",
      description: "Pick a pixel from a local image and copy its HEX, RGB, or HSL color value.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: ["Local image processing", "Pixel magnifier", "HEX, RGB and HSL output", "Clipboard copy", "Screenshot paste"],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
        { "@type": "ListItem", position: 3, name: "Image Color Picker", item: absoluteUrl("/tools/image-color-picker") },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  return (
    <main>
      <JsonLd data={structuredData} />
      <section className="tool-hero color-tool-hero">
        <span className="eyebrow">Free browser color utility</span>
        <h1>Image Color Picker</h1>
        <p>Use this image color picker to sample any pixel from a photo or screenshot. The private color picker from image files gives you precise HEX, RGB, and HSL values without sending the source image anywhere.</p>
      </section>

      <div className="tool-page-wrap">
        <ImageColorPicker />

        <section className="content-section steps" aria-labelledby="color-steps-title">
          <div className="content-heading"><span>How it works</span><h2 id="color-steps-title">Color Picker from Image — How It Works</h2><p>Use the tool when you need to match a website color, recover a palette from a reference photo, inspect a screenshot, or document an interface. The process is intentionally direct: provide the source, choose the precise pixel, and copy a standard color value. You do not need an account, browser extension, or desktop design application.</p></div>
          <div className="steps-grid">
            <article><span>1</span><Upload size={22} /><h3>Open a local image</h3><p>Choose a photo from your device, drag a file into the drop area, or paste a screenshot with Ctrl+V or Cmd+V. The image is decoded locally by your browser and is not sent to BriefVu. Most common formats supported by your browser will work; if an unusual file does not open, export it as PNG or JPEG and try again.</p></article>
            <article><span>2</span><MousePointer2 size={22} /><h3>Inspect the exact pixel</h3><p>Move the pointer across the image to preview its color values in real time. The magnifier enlarges the nearby pixels so you can distinguish a solid fill from a shadow, highlight, or anti-aliased edge. When accuracy matters, sample from the center of an even-colored area and compare a few neighboring pixels before choosing the final value.</p></article>
            <article><span>3</span><Copy size={22} /><h3>Lock and copy the value</h3><p>Click or tap to lock the selected coordinate. The result panel shows the same sampled color as HEX, RGB, and HSL, letting you choose the notation your next application expects. Copy the value with one click and paste it into CSS, a design token, a presentation theme, or an image editor. You can unlock the result and repeat the process for more colors.</p></article>
          </div>
        </section>

        <section className="content-section" aria-labelledby="color-formats-title">
          <div className="content-heading"><span>Color formats</span><h2 id="color-formats-title">HEX, RGB and HSL Colors from Any Image</h2><p>The three outputs are not three different colors. They are alternative descriptions of the same sampled pixel, designed for different workflows. Choose HEX for compact web values, RGB when you need individual channel numbers, or HSL when you want to reason about hue, intensity, and lightness. Keeping all three visible also makes it easier to move between tools without using a separate converter.</p></div>
          <div className="comparison-grid color-context-grid">
            <article><strong>HEX for web and design</strong><p>A HEX code expresses the red, green, and blue channels as six hexadecimal characters, such as #2563EB. It is compact, easy to copy, and widely accepted by website builders, graphics applications, and design systems. Use the HEX color picker from image workflow when you need a quick value for CSS, a brand palette, or a reusable design token.</p></article>
            <article><strong>RGB for direct channel values</strong><p>RGB shows how much red, green, and blue the selected pixel contains on a scale from 0 to 255. It maps closely to how digital images store color and is useful when another application asks for separate channel values. RGB also makes it easier to see how two nearby pixels differ even when their colors look almost identical.</p></article>
            <article><strong>HSL for easier adjustments</strong><p>HSL describes hue, saturation, and lightness. Designers often find it easier to adjust a palette by changing one of these properties while keeping the others stable. The value still represents the same sampled RGB color; it is simply another notation. Copy HSL when you plan to make systematic lighter, darker, stronger, or softer variations.</p></article>
          </div>
        </section>

        <section className="content-section" aria-labelledby="color-differences-title">
          <div className="content-heading"><span>Color context</span><h2 id="color-differences-title">Why Colors Look Different on Screens</h2><p>A picker can report the source pixel accurately, but it cannot control every screen that later displays the result. Separate the measurable color value from its physical appearance: use the numeric code as your shared reference, then evaluate the final design under realistic conditions. This distinction helps prevent repeated sampling from becoming a substitute for device and accessibility testing.</p></div>
          <div className="comparison-grid color-context-grid">
            <article><Crosshair size={22} /><strong>Pixels are the reference</strong><p>The image color picker reads the red, green, blue, and alpha channels that your browser decoded at the chosen coordinate. A photograph can contain thousands of subtly different pixels, even inside an area that looks uniform. Compression, shadows, transparency, gradients, and softened edges can all change the sampled value, so inspect the magnifier before locking a result.</p></article>
            <article><MonitorSmartphone size={22} /><strong>Displays interpret the result</strong><p>Two screens can render the same numeric color differently because of brightness, panel type, calibration, viewing angle, operating-system settings, or browser color management. An embedded image profile can also influence how the source appears. The copied code records the decoded pixel value; it cannot make every physical display produce exactly the same light.</p></article>
            <article><Copy size={22} /><strong>Use portable numeric values</strong><p>HEX, RGB, and HSL describe the same sampled RGB channels in formats commonly used by web and design tools. Keeping the numeric value gives collaborators a reproducible reference even when their screens differ. For brand-critical work, also test the color in its final interface, against its real background, and on representative devices rather than judging it from one monitor alone.</p></article>
          </div>
        </section>

        <section className="content-section faq" aria-labelledby="color-faq-title">
          <div className="content-heading"><span>FAQ</span><h2 id="color-faq-title">Common questions</h2></div>
          <div className="faq-list">
            {faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
          </div>
        </section>

        <RelatedTools currentSlug="image-color-picker" />
      </div>
    </main>
  );
}
