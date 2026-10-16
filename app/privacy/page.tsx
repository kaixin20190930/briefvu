import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({ title: "Privacy", description: "How BriefVu handles tool inputs and basic website data.", path: "/privacy" });

export default function PrivacyPage() {
  return (
    <main className="legal-shell">
      <span className="section-label">Last updated October 16, 2026</span>
      <h1>Privacy</h1>
      <p className="legal-lead">The Invisible Text Generator works locally in your browser. The text you generate or paste into its verifier is not sent to BriefVu, stored in a database, or written to local storage.</p>
      <section><h2>Tool inputs</h2><p>Generated and pasted-back text exists only in the current page&apos;s memory. It disappears when you refresh or close the page. Clipboard access occurs only after you activate a copy action.</p></section>
      <section><h2>Website operations</h2><p>Our hosting provider may process ordinary request data needed to serve and secure the website, such as IP address, user agent, requested URL, and timestamps. We do not put invisible-text payloads into URLs, analytics, or error logs.</p></section>
      <section><h2>Future features</h2><p>If BriefVu later adds accounts, saved presets, subscriptions, or analytics, this notice will be updated before those features collect additional data.</p></section>
      <section><h2>Contact</h2><p>BriefVu will publish a dedicated privacy contact before accounts or paid features launch.</p></section>
    </main>
  );
}
