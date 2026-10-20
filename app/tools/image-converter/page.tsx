import type { Metadata } from "next";
import { ArrowDown, FileImage, ImageIcon, ShieldCheck } from "lucide-react";
import { ImageConverter } from "@/components/ImageConverter";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { absoluteUrl, createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({ title: "Image Converter — JPG, PNG, WebP & AVIF", description: "Convert JPG, PNG, WebP, and AVIF images in your browser. Export JPG, PNG, or WebP with quality and transparency controls. No upload or account.", path: "/tools/image-converter" });

const faqs = [
  { question: "Which image formats can I convert?", answer: "BriefVu accepts JPG, PNG, WebP, and AVIF when your browser can decode them. It exports JPG, PNG, or WebP. AVIF decoding support varies by browser, so the tool reports a clear error instead of uploading the file elsewhere." },
  { question: "Can I convert HEIC to JPG?", answer: "Not in this release. HEIC decoding is not consistently available through browser image APIs, and BriefVu will not claim support until a local decoder has been tested across supported browsers." },
  { question: "What happens to transparent pixels when I choose JPG?", answer: "JPG has no alpha transparency. Choose a background color before conversion and BriefVu fills transparent areas with that color before creating the JPG." },
  { question: "Does conversion resize my image?", answer: "No. This converter keeps the decoded width and height. Use the separate resize tool when you need different pixel dimensions." },
  { question: "Is my image uploaded?", answer: "No. Decoding, canvas rendering, encoding, and download run on your device. BriefVu receives anonymous tool-use events but not the image file." },
];

export default function ImageConverterPage() {
  const data = [{ "@context": "https://schema.org", "@type": "WebApplication", name: "BriefVu Image Converter", url: absoluteUrl("/tools/image-converter"), applicationCategory: "MultimediaApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") }, { "@type": "ListItem", position: 3, name: "Image Converter", item: absoluteUrl("/tools/image-converter") }] }, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }];
  return <main><JsonLd data={data}/><section className="tool-hero"><span className="eyebrow">Free private image converter</span><h1>Image Converter</h1><p>Convert JPG, PNG, WebP, and AVIF images to a practical browser format without uploading the file.</p><ArrowDown className="hero-down" size={20}/></section><div className="tool-page-wrap"><ImageConverter/>
    <section className="content-section"><div className="content-heading"><span>Format choices</span><h2>Choose JPG, PNG, or WebP output</h2><p>The best format depends on the image and where it will be used. Conversion keeps the pixel dimensions but creates a new encoded file.</p></div><div className="comparison-grid"><article><FileImage size={23}/><strong>JPG for photographs</strong><p>JPG is broadly compatible and often compact for photos. It uses lossy compression and cannot preserve transparency.</p></article><article><ImageIcon size={23}/><strong>PNG for transparency</strong><p>PNG preserves alpha transparency and sharp graphics with lossless encoding, but photographic files can be larger.</p></article><article><ShieldCheck size={23}/><strong>WebP for modern websites</strong><p>WebP supports transparency and efficient lossy or lossless encoding in modern browsers and publishing systems.</p></article></div></section>
    <section className="content-section faq"><div className="content-heading"><span>FAQ</span><h2>Image conversion questions</h2></div><div className="faq-list">{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section><RelatedTools currentSlug="image-converter"/></div></main>;
}
