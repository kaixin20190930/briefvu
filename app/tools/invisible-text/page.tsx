import type { Metadata } from "next";
import { AlertTriangle, ArrowDown, CheckCircle2, Copy, ScanSearch } from "lucide-react";
import { InvisibleTextTool } from "@/components/InvisibleTextTool";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { absoluteUrl, createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Invisible Text Generator — Copy Blank Characters",
  description: "Generate, copy, and test invisible Unicode text in your browser. Choose blank or zero-width characters, set a quantity, and verify what was preserved.",
  path: "/tools/invisible-text",
});

const faqs = [
  { question: "How do I copy and paste invisible text?", answer: "Choose a blank-looking or zero-width character, set the quantity, and press the copy button. Paste the result into the field you want to test. Because an empty-looking selection is hard to inspect visually, copy the saved result back into BriefVu's verifier. It will show whether the original Unicode code points survived, changed, or were removed by the other application." },
  { question: "How do I make an invisible name?", answer: "Generate one character first and test it in the name or display-name field. Some services accept blank-looking Unicode, while others reject, trim, or normalize it. Follow the service's naming rules and use the verifier after saving. An invisible name should never be used to impersonate another person, avoid identification requirements, or bypass moderation and enforcement systems." },
  { question: "Can I use an invisible name on Discord?", answer: "Discord can change how it validates usernames, server nicknames, and display names, and those fields may not follow the same rules. BriefVu therefore does not promise a permanently working Discord invisible name. Test only in a field where the platform permits it, respect community rules, and paste the saved result back into the verifier to check what Discord retained." },
  { question: "How do I copy blank space for an Instagram bio?", answer: "Copy a small quantity of a visible-width blank character, paste it into your Instagram bio draft, and preview the result before saving. Instagram may trim or normalize the character at any time. Use blank space for legitimate layout or formatting only, keep the bio accessible and understandable, and verify the saved version instead of assuming the pasted sequence remained unchanged." },
  { question: "Why did an app remove or change my invisible character?", answer: "Many apps normalize Unicode, trim whitespace, reject format controls, or replace unsupported characters before saving text. The exact behavior can differ by field and can change after an app update. Copy the final text back into BriefVu to see its code points. If a service removes the character, respect that behavior rather than trying to defeat its validation rules." },
  { question: "Is my pasted text uploaded to BriefVu?", answer: "No. Generation, clipboard comparison, and code-point analysis run locally in your browser. BriefVu does not send or save the text entered into this tool. The browser clipboard still requires your permission, and anything you paste into another website or application is subject to that service's own privacy practices, retention policy, and community rules." },
];

export default function InvisibleTextPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "BriefVu Invisible Text Generator",
      url: absoluteUrl("/tools/invisible-text"),
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires a modern browser with JavaScript enabled",
      description: "Generate, copy and locally verify blank or zero-width Unicode text.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: ["Five Unicode character options", "Quantity controls", "Clipboard copy", "Local paste-back code point verifier"],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
        { "@type": "ListItem", position: 3, name: "Invisible Text Generator", item: absoluteUrl("/tools/invisible-text") },
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
      <section className="tool-hero">
        <span className="eyebrow">Free Unicode utility</span>
        <h1>Invisible Text Generator</h1>
        <p>Generate blank or zero-width Unicode text, copy the exact payload, and check what survived after you paste it somewhere else.</p>
        <div className="hero-notice"><AlertTriangle size={17} /><span>No character is guaranteed to work on every platform. Treat each option as a test, not a bypass.</span></div>
        <ArrowDown className="hero-down" aria-hidden="true" size={20} />
      </section>

      <div className="tool-page-wrap">
        <InvisibleTextTool />

        <section className="content-section" aria-labelledby="differences-title">
          <div className="content-heading"><span>Character guide</span><h2 id="differences-title">Blank-looking does not mean identical</h2><p>Invisible characters are Unicode data with different meanings, not a single universal blank. Some occupy width, some influence line breaking, and some are ordinary whitespace. Choosing the right option depends on what you are testing, while the receiving app decides whether that character is allowed, transformed, or removed.</p></div>
          <div className="comparison-grid">
            <article><strong>Blank glyphs</strong><p>U+3164 HANGUL FILLER and U+2800 BRAILLE PATTERN BLANK often occupy horizontal width while showing no visible mark. They are letters or symbols rather than ordinary keyboard spaces, so a form may accept, reject, or preserve them differently. They can be useful when testing how software handles nonstandard blank-looking input.</p></article>
            <article><strong>Format controls</strong><p>U+200B ZERO WIDTH SPACE and U+2060 WORD JOINER take no visible width but have different line-breaking purposes. They are formatting controls, not empty data. Messaging, social, and game services often remove them during validation or normalization, which is why a paste-back comparison is more reliable than a visual check.</p></article>
            <article><strong>Unicode whitespace</strong><p>U+00A0 NO-BREAK SPACE is a real space separator that prevents a line break at its position. Browsers and editors commonly use it for layout, but another application may trim it or convert it into a regular U+0020 space. The verifier shows the actual code point so you can distinguish preserved text from normalized text.</p></article>
          </div>
        </section>

        <section className="content-section steps" aria-labelledby="steps-title">
          <div className="content-heading"><span>How to use it</span><h2 id="steps-title">How to Copy and Paste Invisible Text</h2><p>The safest workflow includes verification rather than stopping after the first paste. A field can appear blank while silently changing the underlying text. Generate a known sequence, try it only where permitted, and inspect the saved result. That loop gives you evidence about the actual code points instead of relying on appearance or an outdated compatibility claim.</p></div>
          <div className="steps-grid">
            <article><span>1</span><Copy size={22} /><h3>Generate and copy</h3><p>Choose the Unicode character that matches your test, set a small quantity, and press copy. BriefVu places exactly that code point sequence on your clipboard. Start with one character so it is easier to understand the result, then increase the quantity only when the target field and its rules allow the formatting you need.</p></article>
            <article><span>2</span><CheckCircle2 size={22} /><h3>Try the target field</h3><p>Paste the invisible text into the app, profile, form, or editor you want to test. Preview the result and save only when appropriate. A blank-looking character is still real text, so it can affect character limits, line wrapping, screen readers, or validation. Follow the service&apos;s terms and never use it to conceal harmful content or evade enforcement.</p></article>
            <article><span>3</span><ScanSearch size={22} /><h3>Copy back and compare</h3><p>After the other app processes the text, copy its saved result and paste it into BriefVu&apos;s verifier. The comparison reports whether the sequence is exact, changed, or missing and lists the detected code points. This final step matters because a field can look blank even after it replaced your character with a regular space or removed part of the sequence.</p></article>
          </div>
        </section>

        <section className="content-section" aria-labelledby="invisible-names-title">
          <div className="content-heading"><span>Names and profiles</span><h2 id="invisible-names-title">Invisible Names for Discord, Games and Social Media</h2><p>People often search for a Discord invisible name, a blank game name, or spacing for an Instagram bio, but each platform and field has its own policy. Treat the options below as compatibility tests, not promised shortcuts. A visible alternative is always the better choice when a service requires an identifiable or searchable name.</p></div>
          <div className="comparison-grid">
            <article><strong>Test the exact field</strong><p>A username, display name, server nickname, biography, and chat message can each use different validation rules. An invisible name that appears to work in one field may be rejected in another. Begin with a single character, preview the result, and copy the saved value back into BriefVu before relying on it.</p></article>
            <article><strong>Expect compatibility to change</strong><p>Discord, games, Instagram, and other services update their Unicode handling to improve search, accessibility, and abuse prevention. They may trim whitespace, remove zero-width controls, or reserve blank-looking names. BriefVu is a generator and verifier, not a compatibility guarantee, so current platform behavior always takes priority.</p></article>
            <article><strong>Respect people and platform rules</strong><p>Use invisible text for legitimate formatting, testing, and learning. Do not use an invisible name to impersonate someone, hide abusive content, bypass a ban, defeat anti-cheat systems, or avoid moderation. If a service rejects the character, choose a normal visible name that follows its rules rather than searching for a bypass.</p></article>
          </div>
        </section>

        <section className="content-section use-limits" aria-labelledby="limits-title">
          <div className="content-heading"><span>Use responsibly</span><h2 id="limits-title">Useful for formatting tests—not rule evasion</h2><p>Unicode testing is useful for developers, content creators, and anyone diagnosing clipboard or form behavior. The same characters can also reduce clarity or accessibility when misused. Keep the intent understandable, respect the target service, and do not treat a blank appearance as permission to hide identity, content, or actions from other people.</p></div>
          <div className="split-copy">
            <div><h3>Reasonable uses</h3><ul><li>Testing form validation and Unicode handling</li><li>Preserving intentional spacing in your own content</li><li>Debugging normalization and clipboard behavior</li><li>Learning how code points differ</li></ul></div>
            <div><h3>Important limits</h3><ul><li>Do not use it to evade moderation, anti-cheat, bans, or username rules</li><li>Accessibility tools may interpret these code points differently</li><li>Compatibility can change without notice</li><li>Always check the target service&apos;s terms</li></ul></div>
          </div>
        </section>

        <section className="content-section faq" aria-labelledby="faq-title">
          <div className="content-heading"><span>FAQ</span><h2 id="faq-title">Common questions</h2></div>
          <div className="faq-list">
            {faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
          </div>
        </section>

        <RelatedTools currentSlug="invisible-text" />
      </div>
    </main>
  );
}
