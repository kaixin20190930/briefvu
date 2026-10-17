import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "How BriefVu handles files, tool inputs, technical data, browser storage, and privacy requests.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main className="legal-shell">
      <span className="section-label">Last updated October 17, 2026</span>
      <h1>Privacy Policy</h1>
      <p className="legal-lead">
        BriefVu is operated by Moxion Labs LLC, a Wyoming limited liability company in the United States. This policy explains how we handle information when you use briefvu.com, apps.briefvu.com, and the browser tools available through them.
      </p>

      <section>
        <h2>Files and tool inputs</h2>
        <p>BriefVu&apos;s core tools are designed to process text, images, and documents in your browser. Files and tool inputs are not uploaded to BriefVu&apos;s application servers for processing. They remain on your device unless you choose to save, copy, download, or send the result elsewhere. We do not maintain an application database containing those files or inputs.</p>
      </section>
      <section>
        <h2>Technical data</h2>
        <p>Our hosting and security provider may process ordinary request data needed to deliver and protect the service, including an IP address, browser and device information, requested URL, timestamp, and security signals. We use this information to operate the site, prevent abuse, investigate failures, and maintain security. We do not intentionally place your tool inputs in URLs or application logs.</p>
      </section>
      <section>
        <h2>Browser storage, cookies, and clipboard access</h2>
        <p>BriefVu does not currently use advertising cookies or third-party behavioral analytics. A tool may use browser memory, caching, or local storage for essential preferences and local functionality. Clipboard access occurs only after you initiate a copy or paste action. Cloudflare may use essential security technologies when serving or protecting the site.</p>
      </section>
      <section>
        <h2>Communications</h2>
        <p>If you email us, we receive your email address and the information you include. We use it to respond, resolve a request, protect the service, or meet legal obligations. We retain correspondence only as long as reasonably necessary for those purposes.</p>
      </section>
      <section>
        <h2>Service providers and international processing</h2>
        <p>BriefVu uses Cloudflare to host, deliver, and secure the service. Cloudflare may process technical data through its global network under its own contractual safeguards and privacy terms. You can read the <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Cloudflare Privacy Policy</a>. We do not sell personal information or share it for cross-context behavioral advertising.</p>
      </section>
      <section>
        <h2>Retention</h2>
        <p>BriefVu does not retain tool inputs or uploaded files on its application servers. We do not currently maintain visitor accounts or a separate visitor database. Hosting and security records may be retained by Cloudflare according to its service settings and policies. Communications are retained only as described above.</p>
      </section>
      <section>
        <h2>Your privacy rights</h2>
        <p>Depending on where you live, you may have rights to request access, correction, deletion, restriction, or a copy of personal information, or to object to certain processing. You may also have the right to complain to a local data protection authority. Because BriefVu has no user accounts and does not retain tool inputs, we may have limited information with which to identify a visitor. We will respond to verifiable requests as required by applicable law.</p>
      </section>
      <section>
        <h2>Children</h2>
        <p>BriefVu is a general-audience service and is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided personal information to us, contact us so we can review the request.</p>
      </section>
      <section>
        <h2>Security</h2>
        <p>Local browser processing reduces the amount of content sent to us, but no website or network can be guaranteed completely secure. Keep your browser and device updated, and avoid placing sensitive information into a tool unless you are comfortable processing it on that device.</p>
      </section>
      <section>
        <h2>Changes to this policy</h2>
        <p>We may update this policy when BriefVu adds features or our practices change. The revision date at the top of this page shows when the current version took effect. If a future feature materially changes how data is collected, we will update this notice before or when that feature launches.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>For privacy questions or requests, email <a href="mailto:privacy@briefvu.com">privacy@briefvu.com</a>. The data controller for BriefVu is Moxion Labs LLC, a Wyoming limited liability company, United States.</p>
      </section>
    </main>
  );
}
