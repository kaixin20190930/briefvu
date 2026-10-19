import type { Metadata } from "next";
import { ArrowDown, Languages, LockKeyhole, ScanText } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { TextReverser } from "@/components/TextReverser";
import { absoluteUrl, createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Text Reverser — Reverse Letters, Words & Sentences",
  description: "Reverse text by characters, words, individual words, or sentences. Unicode-aware, free, and private—your text stays in your browser.",
  path: "/tools/text-reverser",
});

const faqs = [
  { question: "How do I reverse text online?", answer: "Paste or type text into the input, choose Characters, Word order, Each word, or Sentences, and copy the live result. BriefVu performs the transformation locally in your browser." },
  { question: "Does the text reverser work with emoji?", answer: "Yes. Character mode uses Unicode grapheme segmentation, so combined emoji, skin-tone modifiers, flags, and accented characters stay together instead of being split into broken code points." },
  { question: "What is the difference between reversing words and reversing each word?", answer: "Word order moves whole words from last to first. Each word keeps the original word order but reverses the characters inside every word." },
  { question: "Is my text uploaded or saved?", answer: "No. The reversal runs in your browser. BriefVu records only anonymous tool-use events such as a successful copy, never the text you enter or produce." },
];

export default function TextReverserPage() {
  const data = [{ "@context": "https://schema.org", "@type": "WebApplication", name: "BriefVu Text Reverser", url: absoluteUrl("/tools/text-reverser"), applicationCategory: "UtilitiesApplication", operatingSystem: "Any", description: "Reverse text by characters, words, individual words, or sentences in your browser.", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") }, { "@type": "ListItem", position: 3, name: "Text Reverser", item: absoluteUrl("/tools/text-reverser") }] }, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }];
  return <main><JsonLd data={data} />
    <section className="tool-hero"><span className="eyebrow">Free text utility</span><h1>Text Reverser</h1><p>Reverse letters, word order, individual words, or complete sentences without breaking emoji and accented characters.</p><ArrowDown className="hero-down" aria-hidden="true" size={20} /></section>
    <div className="tool-page-wrap"><TextReverser />
      <section className="content-section"><div className="content-heading"><span>Four useful modes</span><h2>Reverse text without damaging Unicode</h2><p>A basic letter-by-letter script can split the code points that form one visible character. This text reverser works with grapheme clusters, giving multilingual text and modern emoji a safer result.</p></div><div className="comparison-grid"><article><ScanText size={23} /><strong>Characters or whole words</strong><p>Character mode mirrors the visible text. Word-order mode moves complete words while retaining the original whitespace positions, which is useful for wordplay and quick text experiments.</p></article><article><Languages size={23} /><strong>Each word or sentence order</strong><p>Reverse every word in place without moving it, or move complete sentences from last to first. Switching modes updates the result immediately.</p></article><article><LockKeyhole size={23} /><strong>Private by design</strong><p>No account or server processing is required. Your source text and result remain in the current browser session until you clear or leave the page.</p></article></div></section>
      <section className="content-section"><div className="content-heading"><span>Common uses</span><h2>When a reverse text generator helps</h2><p>Use it to create mirror-style captions, inspect text-processing behavior, build puzzles, or understand the difference between visible characters and Unicode code points. The tool changes order only; it does not translate, encode, encrypt, or permanently store the text.</p></div><div className="split-copy"><div><h3>Good fits</h3><ul><li>Word games, puzzles, and classroom exercises</li><li>Mirrored captions and playful messages</li><li>Unicode and software input testing</li><li>Reordering words or sentences in drafts</li></ul></div><div><h3>Important distinction</h3><ul><li>Reversed text is not encryption</li><li>Results can be reversed again to recover the input</li><li>Visual direction differs from right-to-left writing systems</li><li>Always review mixed-language text before publishing</li></ul></div></div></section>
      <section className="content-section faq"><div className="content-heading"><span>FAQ</span><h2>Text reverser questions</h2></div><div className="faq-list">{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section><RelatedTools currentSlug="text-reverser" />
    </div></main>;
}
