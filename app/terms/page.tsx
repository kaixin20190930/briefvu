import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({ title: "Terms of Use", description: "Terms and responsible-use boundaries for BriefVu browser tools.", path: "/terms" });

export default function TermsPage() {
  return (
    <main className="legal-shell">
      <span className="section-label">Last updated October 16, 2026</span>
      <h1>Terms of Use</h1>
      <p className="legal-lead">BriefVu provides browser utilities on an as-is basis. You are responsible for deciding whether an output is appropriate for your use and permitted by the target service.</p>
      <section><h2>No compatibility guarantee</h2><p>Apps and websites can remove, replace, normalize, reject, or display Unicode characters differently. BriefVu does not guarantee that any invisible character will work in a particular product or continue working later.</p></section>
      <section><h2>Responsible use</h2><p>Do not use BriefVu to evade moderation, bans, anti-cheat systems, account restrictions, identity requirements, or other safety controls. Do not use generated output to mislead, harass, impersonate, or disrupt.</p></section>
      <section><h2>Your data and device</h2><p>You remain responsible for content you place on your clipboard and submit to another service. Review sensitive material before using any browser or clipboard tool.</p></section>
      <section><h2>Changes</h2><p>We may update tools or these terms as BriefVu grows. Material changes will be reflected by a new revision date on this page.</p></section>
    </main>
  );
}
