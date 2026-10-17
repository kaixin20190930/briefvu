import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Use",
  description: "Terms governing your use of BriefVu browser tools, hosted editors, and related services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main className="legal-shell">
      <span className="section-label">Last updated October 17, 2026</span>
      <h1>Terms of Use</h1>
      <p className="legal-lead">These Terms govern your use of briefvu.com, apps.briefvu.com, and the tools available through them. BriefVu is operated by Moxion Labs LLC, a Wyoming limited liability company in the United States. By using the service, you agree to these Terms.</p>
      <section><h2>The service</h2><p>BriefVu provides browser-based utilities for working with text, images, documents, and other digital content. Some tools are built by BriefVu, while others provide browser access to open-source software. Features may be labeled experimental, alpha, or subject to known limitations.</p></section>
      <section><h2>Eligibility</h2><p>You must be at least 13 years old to use BriefVu. If you are not old enough to enter into a binding agreement where you live, you may use the service only with permission from a parent or legal guardian.</p></section>
      <section><h2>Your content and responsibility</h2><p>You keep any rights you have in files, text, images, documents, and other content you use with BriefVu. You are responsible for that content, for having permission to use it, and for deciding whether an output is accurate, suitable, and lawful. BriefVu does not store a backup of locally processed work. Save or export anything you want to keep before closing or refreshing a tool.</p></section>
      <section>
        <h2>Acceptable use</h2>
        <p>You may not use BriefVu to:</p>
        <ul>
          <li>break the law, infringe intellectual property or privacy rights, or distribute unlawful content;</li>
          <li>mislead, impersonate, harass, exploit, or harm another person;</li>
          <li>evade moderation, bans, anti-cheat systems, account restrictions, identity requirements, or other safety controls;</li>
          <li>introduce malware, probe for vulnerabilities without permission, disrupt the service, or impose an unreasonable load on its infrastructure; or</li>
          <li>use automated access in a way that ignores published technical limits or interferes with other users.</li>
        </ul>
      </section>
      <section><h2>Local processing and compatibility</h2><p>Many BriefVu tools process content locally in your browser, but performance and format support depend on your browser, device, memory, and the specific file. Other apps and websites may remove, normalize, reject, or display outputs differently. We do not guarantee compatibility with every file, browser, device, or third-party service.</p></section>
      <section><h2>Open-source and third-party software</h2><p>Certain hosted editors are based on third-party open-source projects. Their code, names, and components remain subject to their applicable licenses and notices. BriefVu does not claim ownership of third-party projects and is not endorsed by their maintainers unless expressly stated. Links to third-party sites and repositories are provided for convenience, and their own terms and privacy policies apply.</p></section>
      <section><h2>Availability and changes</h2><p>We may update, suspend, limit, replace, or discontinue a tool or feature. We may also restrict access when reasonably necessary to protect users, the service, or third parties. We do not promise uninterrupted availability or that a feature will remain unchanged.</p></section>
      <section><h2>Disclaimer</h2><p>To the maximum extent permitted by law, BriefVu is provided “as is” and “as available,” without warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, availability, or compatibility. Nothing in these Terms excludes warranties or consumer rights that cannot lawfully be excluded.</p></section>
      <section><h2>Limitation of liability</h2><p>To the maximum extent permitted by law, Moxion Labs LLC and its owners, employees, and service providers will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data, profits, business, or goodwill arising from your use of or inability to use BriefVu. These limitations do not apply where liability cannot lawfully be limited.</p></section>
      <section><h2>Governing law</h2><p>These Terms are governed by the laws of the State of Wyoming, without regard to conflict-of-laws rules, except where mandatory law in your place of residence provides otherwise.</p></section>
      <section><h2>Changes to these Terms</h2><p>We may update these Terms as BriefVu changes. The revision date at the top identifies the current version. Your continued use of the service after updated Terms take effect means you accept the updated Terms, to the extent permitted by law.</p></section>
      <section><h2>Contact</h2><p>For questions about these Terms, email <a href="mailto:legal@briefvu.com">legal@briefvu.com</a>.</p></section>
    </main>
  );
}
