import { IntakeWorkspace } from "@/components/IntakeWorkspace";
import { Check, LockKeyhole, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { absoluteUrl } from "@/lib/site";

export default function Home() {
  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Briefvu",
    url: absoluteUrl("/"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "A human-reviewed intake assistant for single-product custom apparel enquiries and customer replies.",
    featureList: ["Evidence-backed field extraction", "Customer reply change review", "Quote-readiness checks", "Clarification draft"],
  };
  return (
    <main>
      <JsonLd data={webApplication} />
      <SiteHeader />

      <section className="hero" id="top">
        <div className="eyebrow"><Sparkles size={14} /> Built for custom apparel shops</div>
        <h1>From inbox mess to<br /><span>quote-ready</span> in minutes.</h1>
        <p>
          Paste any customer enquiry. Briefvu pulls out the job details,
          shows its evidence, and drafts only the follow-up questions you still need.
        </p>
        <div className="hero-proof">
          <span><Check size={15} /> No account needed</span>
          <span><Check size={15} /> Your enquiry isn’t saved</span>
          <span><Check size={15} /> You approve every detail</span>
        </div>
      </section>

      <IntakeWorkspace />

      <section className="how" id="how-it-works">
        <div>
          <span className="section-kicker">A safer kind of AI</span>
          <h2>Fast enough to help.<br />Careful enough to trust.</h2>
        </div>
        <div className="principles">
          <article><b>01</b><h3>Trace every answer</h3><p>Each extracted detail links back to the exact words your customer used.</p></article>
          <article><b>02</b><h3>Catch contradictions</h3><p>Conflicting quantities or dates stay unresolved until you choose the right one.</p></article>
          <article><b>03</b><h3>Keep the human in charge</h3><p>Accept, correct, or remove anything before it enters the final job spec.</p></article>
        </div>
      </section>

      <section className="privacy-panel" id="privacy">
        <LockKeyhole size={26} />
        <div><h3>Built for real customer enquiries</h3><p>Raw enquiry text is processed for the current job and is not written to our analytics database. We record workflow counts, never the email itself.</p></div>
      </section>

      <SiteFooter />
    </main>
  );
}
