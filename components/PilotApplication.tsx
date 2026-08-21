"use client";

import { ArrowRight, CheckCircle2, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { useState, type FormEvent } from "react";

interface PilotApplicationProps {
  onOpen: () => void;
  onSubmitted: () => void;
}

export function PilotApplication({ onOpen, onSubmitted }: PilotApplicationProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function openForm() {
    setOpen(true);
    setSubmitted(false);
    setError("");
    onOpen();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/pilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: form.get("shopName"),
          contactName: form.get("contactName"),
          email: form.get("email"),
          weeklyEnquiries: form.get("weeklyEnquiries"),
          currentWorkflow: form.get("currentWorkflow"),
          notes: form.get("notes"),
          website: form.get("website"),
          consent: form.get("consent") === "on",
        }),
      });
      const result = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.error || "We could not save your application.");
      }
      setSubmitted(true);
      onSubmitted();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return <>
    <section className="pilot-cta" id="pilot">
      <div><span>EARLY SHOP PLAN</span><h2>Make every enquiry this easy.</h2><p>Reply tracking, quote readiness, and verified job specs for early partner shops.</p></div>
      <div className="pilot-price"><strong>$39<small>/month</small></strong><button onClick={openForm}>Apply for the paid pilot <ArrowRight size={16} /></button></div>
    </section>

    {open && <div className="modal-backdrop" role="presentation">
      <section className="pilot-modal" role="dialog" aria-modal="true" aria-labelledby="pilot-title">
        <div className="modal-head"><div><span className="mini-kicker">EARLY PARTNER APPLICATION</span><h2 id="pilot-title">Tell us about your shop</h2><p>We review each application personally before inviting shops into the $39/month pilot.</p></div><button aria-label="Close pilot application" onClick={() => setOpen(false)}><X size={18} /></button></div>
        {submitted ? <div className="pilot-success"><CheckCircle2 size={34} /><h3>Application received.</h3><p>We’ll review your workflow and follow up using the email you provided.</p><button className="primary-button" onClick={() => setOpen(false)}>Done</button></div> :
          <form className="pilot-form" onSubmit={submit}>
            <div className="pilot-form-grid">
              <label><span>Shop name</span><input name="shopName" required minLength={2} maxLength={120} autoComplete="organization" autoFocus /></label>
              <label><span>Your name</span><input name="contactName" required minLength={2} maxLength={100} autoComplete="name" /></label>
              <label className="wide"><span>Work email</span><input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
              <label><span>Enquiries per week</span><select name="weeklyEnquiries" required defaultValue=""><option value="" disabled>Select volume</option><option value="0-10">0–10</option><option value="11-30">11–30</option><option value="31-75">31–75</option><option value="76+">76+</option></select></label>
              <label><span>Current workflow</span><select name="currentWorkflow" required defaultValue=""><option value="" disabled>Select workflow</option><option value="email">Email / inbox</option><option value="spreadsheets">Spreadsheets</option><option value="printavo">Printavo</option><option value="yoprint">YoPrint</option><option value="other">Other</option></select></label>
              <label className="wide"><span>What would make the pilot valuable? <em>Optional</em></span><textarea name="notes" maxLength={500} rows={3} /></label>
              <label className="pilot-honeypot" aria-hidden="true"><span>Website</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
            <label className="pilot-consent"><input name="consent" type="checkbox" required /><span><ShieldCheck size={15} /> I agree that Briefvu may store these application details and contact me about the paid pilot.</span></label>
            {error && <p className="form-error">{error}</p>}
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setOpen(false)}>Cancel</button><button className="primary-button" disabled={submitting}>{submitting ? <><LoaderCircle className="spin" size={16} /> Sending…</> : <>Submit application <ArrowRight size={16} /></>}</button></div>
          </form>}
      </section>
    </div>}
  </>;
}
