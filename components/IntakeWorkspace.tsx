"use client";

import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Clipboard,
  FileJson, FileText, History, LoaderCircle, MessageSquarePlus, Pencil, Plus,
  RotateCcw, ShieldCheck, Sparkles, Trash2, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { PilotApplication } from "@/components/PilotApplication";
import {
  clearActiveJob, extendJobExpiry, getActiveJobSnapshot, getServerJobSnapshot,
  saveActiveJob, subscribeToActiveJob,
} from "@/lib/active-job-store";
import {
  applyMergeDecisions, countDecisions, getQuoteReadiness, proposeReplyChanges,
  readinessLabel, tagFieldsWithMessage,
} from "@/lib/job-rules";
import {
  clarificationDraft, clarificationQuestions, jobSpecJson, jobSpecText,
} from "@/lib/presenters";
import { applyMissingRules } from "@/lib/rules";
import type {
  AnalysisResult, CapabilityIssue, ExtractedField, FieldRevision, FieldStatus, ProductEvent, ProposedChange,
  QuoteMode, TemporaryJob,
} from "@/lib/types";

const SAMPLE = `Hi there — we're looking at around 50 black shirts for our fall fundraiser. Actually, after checking with the team, we'll probably need 75 shirts.

We want our logo on the front and a larger 2-color design on the back. Screen printing should be fine. I've attached our logo, but I'm not sure if it's the right file type.

We need them by October 10. We can pick them up. No rush if that date works. Thanks!`;

const REPLY_SAMPLE = `Let's do 75 exactly. Gildan 5000 works. The logo is two colors, and yes, print the back too. Event is October 15.`;
const EMPTY_FIELDS: ExtractedField[] = [];

const statusClass: Record<FieldStatus, string> = {
  Confirmed: "confirmed", Approximate: "approximate", Ambiguous: "ambiguous",
  Conflicting: "conflicting", Missing: "missing", "Needs Review": "review",
  "Not Applicable": "na",
};

const actionLabels: Record<ProposedChange["action"], string> = {
  fill_missing: "Fill missing detail", confirm_existing: "Confirm existing value",
  refine_existing: "Refine existing value", replace_existing: "Replace confirmed value",
  create_conflict: "New conflict", no_change: "No change", needs_review: "Needs review",
};

function getSessionId() {
  const key = "threadline_session";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }
  return value;
}

function track(event: ProductEvent) {
  const body = JSON.stringify({ sessionId: getSessionId(), name: event.name, metadata: event.metadata });
  void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body });
}

function blockerCount(fields: ExtractedField[], mode: QuoteMode, capabilityIssues: CapabilityIssue[] = []) {
  return applyMissingRules(fields, mode).filter((field) => field.missingPriority === "Quote Blocker").length
    + capabilityIssues.filter((issue) => issue.severity === "quote_blocker").length;
}

function jobStatus(fields: ExtractedField[], mode: QuoteMode, capabilityIssues: CapabilityIssue[] = []) {
  const readiness = getQuoteReadiness(fields, mode, capabilityIssues);
  return readiness === "ready_for_ballpark" || readiness === "ready_for_formal"
    ? "ready_to_quote" as const : "needs_clarification" as const;
}

function trackReadinessChange(
  previous: TemporaryJob["readiness"],
  next: TemporaryJob["readiness"],
  startedAt: string,
) {
  if (previous === next) return;
  const handlingSeconds = Math.max(
    0,
    Math.round((Date.now() - new Date(startedAt).getTime()) / 1000),
  );
  track({
    name: "quote_readiness_changed",
    metadata: { from: previous, to: next, handling_seconds: handlingSeconds },
  });
  if (next === "ready_for_ballpark") {
    track({ name: "ready_for_ballpark_reached", metadata: { handling_seconds: handlingSeconds } });
  }
  if (next === "ready_for_formal") {
    track({ name: "ready_for_formal_reached", metadata: { handling_seconds: handlingSeconds } });
  }
}

export function IntakeWorkspace() {
  const job = useSyncExternalStore(subscribeToActiveJob, getActiveJobSnapshot, getServerJobSnapshot);
  const [enquiry, setEnquiry] = useState("");
  const [initialMode, setInitialMode] = useState<QuoteMode>("formal");
  const [persistLocally, setPersistLocally] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState("Order basics");
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState("");
  const [extraQuestion, setExtraQuestion] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replyChanges, setReplyChanges] = useState<ProposedChange[] | null>(null);
  const [replyWarnings, setReplyWarnings] = useState<string[]>([]);
  const [replyCapabilityIssues, setReplyCapabilityIssues] = useState<CapabilityIssue[]>([]);
  const [pendingMessageId, setPendingMessageId] = useState("");
  const replyModalRef = useRef<HTMLElement>(null);
  const replyTextRef = useRef<HTMLTextAreaElement>(null);
  const replyTriggerRef = useRef<HTMLButtonElement>(null);

  const mode = job?.quoteMode ?? initialMode;
  const fields = job?.fields ?? EMPTY_FIELDS;
  const analysed = Boolean(job);
  const ruledFields = useMemo(() => applyMissingRules(fields, mode), [fields, mode]);
  const groups = useMemo(() => [...new Set(ruledFields.map((field) => field.group))], [ruledFields]);
  const blockers = ruledFields.filter((field) => field.missingPriority === "Quote Blocker");
  const capabilityIssues = job?.capabilityIssues ?? [];
  const capabilityBlockers = capabilityIssues.filter((issue) => issue.severity === "quote_blocker");
  const totalBlockers = blockers.length + capabilityBlockers.length;
  const priceAffecting = ruledFields.filter((field) => field.missingPriority === "Price Affecting");
  const productionChecks = ruledFields.filter((field) => field.missingPriority === "Production Later");
  const isQuoteReady = (job?.readiness === "ready_for_ballpark" || job?.readiness === "ready_for_formal")
    && capabilityIssues.length === 0;
  const confirmed = ruledFields.filter((field) => field.status === "Confirmed" || field.accepted).length;
  const currentFields = ruledFields.filter((field) => field.group === activeGroup);
  const needsClarification = clarificationQuestions(ruledFields).length > 0 || capabilityBlockers.length > 0;
  const currentDraft = draft || clarificationDraft(ruledFields, mode, capabilityIssues);
  const specPreviewKeys = new Set([
    "quantity", "garment_type", "garment_brand", "garment_style", "garment_color",
    "decoration_method", "print_locations", "deadline",
  ]);
  const specPreviewFields = ruledFields.filter(
    (field) => specPreviewKeys.has(field.key) && field.value && field.status !== "Conflicting",
  );

  useEffect(() => {
    if (!replyOpen) return;
    const modal = replyModalRef.current;
    const trigger = replyTriggerRef.current;
    const focusTimer = window.setTimeout(() => replyTextRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setReplyOpen(false);
        return;
      }
      if (event.key !== "Tab" || !modal) return;
      const focusable = [...modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.hasAttribute("hidden"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [replyOpen]);

  function saveJob(next: TemporaryJob) { saveActiveJob(extendJobExpiry(next)); }

  async function analyse() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enquiry, mode: initialMode, kind: "initial" }),
      });
      const result = (await response.json()) as AnalysisResult & { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not analyse this enquiry.");
      const now = new Date().toISOString();
      const messageId = crypto.randomUUID();
      const taggedFields = tagFieldsWithMessage(result.fields, messageId, "Initial enquiry");
      const resultCapabilityIssues = result.capabilityIssues ?? [];
      const readiness = getQuoteReadiness(taggedFields, initialMode, resultCapabilityIssues);
      const nextJob: TemporaryJob = {
        id: crypto.randomUUID(), createdAt: now, updatedAt: now,
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        persistence: persistLocally ? "local" : "session", quoteMode: initialMode,
        status: "needs_review", readiness,
        messages: [{ id: messageId, type: "initial_enquiry", sequence: 0, rawText: enquiry, createdAt: now }],
        fields: taggedFields, revisions: [], clarificationRounds: [],
        metrics: {
          startedAt: now, initialBlockerCount: blockerCount(taggedFields, initialMode, resultCapabilityIssues),
          replyCount: 0, acceptedMergeCount: 0, editedMergeCount: 0, ignoredMergeCount: 0,
        },
        source: result.source, warnings: result.warnings, capabilityIssues: resultCapabilityIssues,
      };
      saveActiveJob(nextJob);
      setActiveGroup("Order basics");
      setDraft(clarificationDraft(applyMissingRules(taggedFields, initialMode), initialMode, resultCapabilityIssues));
      const previous = Number(localStorage.getItem("threadline_analysis_count") || 0);
      localStorage.setItem("threadline_analysis_count", String(previous + 1));
      track({ name: previous ? "repeat_enquiry_processed" : "analysis_completed", metadata: {
        input_length: enquiry.length, extracted_fields: taggedFields.filter((field) => field.value).length,
        missing_fields: taggedFields.filter((field) => field.status === "Missing").length,
        conflicting_fields: taggedFields.filter((field) => field.status === "Conflicting").length,
        quote_mode: initialMode, source: result.source,
      } });
      track({ name: "active_job_created", metadata: { persistence: nextJob.persistence, quote_mode: initialMode } });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong."); }
    finally { setLoading(false); }
  }

  function patchField(key: string, patch: Partial<ExtractedField>, event?: string) {
    if (!job) return;
    const nextFields = job.fields.map((field) => field.key === key ? { ...field, ...patch } : field);
    const readiness = getQuoteReadiness(nextFields, job.quoteMode, capabilityIssues);
    saveJob({ ...job, fields: nextFields, readiness, status: jobStatus(nextFields, job.quoteMode, capabilityIssues) });
    setDraft(clarificationDraft(applyMissingRules(nextFields, job.quoteMode), job.quoteMode, capabilityIssues));
    trackReadinessChange(job.readiness, readiness, job.metrics.startedAt);
    if (event) track({ name: event, metadata: { field: key } });
  }

  function resolveConflict(field: ExtractedField, value: string) {
    const candidate = field.candidates.find((item) => item.value === value);
    patchField(field.key, { value, status: "Confirmed", evidence: candidate?.evidence ?? null, candidates: [], accepted: true }, "conflict_resolved");
  }

  function changeMode(nextMode: QuoteMode) {
    if (!job) { setInitialMode(nextMode); return; }
    const readiness = getQuoteReadiness(job.fields, nextMode, capabilityIssues);
    saveJob({ ...job, quoteMode: nextMode, readiness, status: jobStatus(job.fields, nextMode, capabilityIssues) });
    setDraft(clarificationDraft(applyMissingRules(job.fields, nextMode), nextMode, capabilityIssues));
    trackReadinessChange(job.readiness, readiness, job.metrics.startedAt);
  }

  function reset() {
    if (job && !window.confirm("Clear this active job and its customer messages from this device?")) return;
    clearActiveJob(); setEnquiry(""); setError(""); setEditing(null); setDraft(""); setReplyOpen(false);
    track({ name: "active_job_cleared" });
  }

  async function copy(value: string, kind: string, event?: string) {
    await navigator.clipboard.writeText(value); setCopied(kind);
    window.setTimeout(() => setCopied(""), 1800);
    if (event) track({ name: event, metadata: { format: kind } });
  }

  async function copyClarification() {
    if (!job) return;
    if (!needsClarification) {
      await copy(currentDraft, "clarification", "quote_ready_reply_copied");
      return;
    }
    await copy(currentDraft, "clarification", "clarification_copied");
    const round = { id: crypto.randomUUID(), number: job.clarificationRounds.length + 1,
      draft: currentDraft, blockerCount: totalBlockers, copiedAt: new Date().toISOString() };
    saveJob({ ...job, status: "awaiting_customer_reply", clarificationRounds: [...job.clarificationRounds, round] });
    track({ name: "clarification_round_copied", metadata: { round: round.number, blocker_count: round.blockerCount } });
  }

  function applyIgnoredRevision(revision: FieldRevision) {
    if (!job || revision.decision !== "ignored" || !revision.proposedValue) return;
    const nextFields = job.fields.map((field) =>
      field.key === revision.key
        ? {
            ...field,
            value: revision.proposedValue,
            status: revision.proposedStatus,
            evidence: revision.evidence,
            candidates: [],
            accepted: true,
            edited: false,
          }
        : field,
    );
    const readiness = getQuoteReadiness(nextFields, job.quoteMode, capabilityIssues);
    const nextRevisions = job.revisions.map((item) =>
      item.id === revision.id
        ? { ...item, decision: "accepted" as const, finalValue: item.proposedValue }
        : item,
    );
    saveJob({
      ...job,
      fields: nextFields,
      revisions: nextRevisions,
      readiness,
      status: jobStatus(nextFields, job.quoteMode, capabilityIssues),
    });
    setDraft(clarificationDraft(applyMissingRules(nextFields, job.quoteMode), job.quoteMode, capabilityIssues));
    trackReadinessChange(job.readiness, readiness, job.metrics.startedAt);
    track({ name: "ignored_merge_applied", metadata: { field: revision.key } });
  }

  function addQuestion() {
    if (!extraQuestion.trim()) return;
    setDraft(`${currentDraft.trim()}\n${extraQuestion.trim().replace(/^\d+\.\s*/, "")}`);
    setExtraQuestion(""); track({ name: "missing_question_added" });
  }

  function openReply() {
    setReplyOpen(true); setReplyText(""); setReplyChanges(null); setReplyWarnings([]); setReplyCapabilityIssues([]); setReplyError("");
    setPendingMessageId(crypto.randomUUID());
    track({ name: "customer_reply_opened", metadata: { reply_number: (job?.metrics.replyCount ?? 0) + 1 } });
  }

  async function analyseReply() {
    if (!job) return;
    setReplyLoading(true); setReplyError("");
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enquiry: replyText, mode: job.quoteMode, kind: "reply" }) });
      const result = (await response.json()) as AnalysisResult & { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not analyse this reply.");
      const replyNumber = job.metrics.replyCount + 1;
      const changes = proposeReplyChanges(job.fields, result.fields, pendingMessageId, `Customer reply ${replyNumber}`);
      setReplyChanges(changes); setReplyWarnings(result.warnings); setReplyCapabilityIssues(result.capabilityIssues ?? []);
      track({ name: "reply_analysis_completed", metadata: { reply_number: replyNumber, input_length: replyText.length, proposed_changes: changes.length, evidence_warnings: result.warnings.length } });
    } catch (caught) { setReplyError(caught instanceof Error ? caught.message : "Something went wrong."); track({ name: "reply_analysis_failed" }); }
    finally { setReplyLoading(false); }
  }

  function updateReplyChange(id: string, patch: Partial<ProposedChange>) {
    setReplyChanges((current) => current?.map((change) => change.id === id ? { ...change, ...patch } : change) ?? null);
  }

  function commitReply() {
    if (!job || !replyChanges || replyChanges.some((change) => change.decision === "pending")) return;
    const beforeBlockers = blockerCount(job.fields, job.quoteMode, capabilityIssues);
    const merged = applyMergeDecisions(job.fields, replyChanges, pendingMessageId);
    const nextCapabilityIssues = [...capabilityIssues];
    replyCapabilityIssues.forEach((issue) => {
      if (!nextCapabilityIssues.some((current) => current.code === issue.code)) nextCapabilityIssues.push(issue);
    });
    const readiness = getQuoteReadiness(merged.fields, job.quoteMode, nextCapabilityIssues);
    const afterBlockers = blockerCount(merged.fields, job.quoteMode, nextCapabilityIssues);
    const now = new Date().toISOString();
    const accepted = countDecisions(replyChanges, "accepted");
    const edited = countDecisions(replyChanges, "edited");
    const ignored = countDecisions(replyChanges, "ignored");
    saveJob({ ...job, fields: merged.fields, revisions: [...job.revisions, ...merged.revisions],
      messages: [...job.messages, { id: pendingMessageId, type: "customer_reply", sequence: job.messages.length, rawText: replyText, createdAt: now }],
      warnings: [...job.warnings, ...replyWarnings], capabilityIssues: nextCapabilityIssues,
      readiness, status: jobStatus(merged.fields, job.quoteMode, nextCapabilityIssues),
      metrics: { ...job.metrics, replyCount: job.metrics.replyCount + 1,
        acceptedMergeCount: job.metrics.acceptedMergeCount + accepted,
        editedMergeCount: job.metrics.editedMergeCount + edited,
        ignoredMergeCount: job.metrics.ignoredMergeCount + ignored },
    });
    setDraft(clarificationDraft(applyMissingRules(merged.fields, job.quoteMode), job.quoteMode, nextCapabilityIssues));
    trackReadinessChange(job.readiness, readiness, job.metrics.startedAt);
    track({ name: "customer_reply_added", metadata: { reply_number: job.metrics.replyCount + 1, changes_accepted: accepted, changes_edited: edited, changes_ignored: ignored, blockers_before: beforeBlockers, blockers_after: afterBlockers } });
    replyChanges.forEach((change) => {
      const eventName = change.decision === "accepted" ? "merge_change_accepted" : change.decision === "edited" ? "merge_change_edited" : "merge_change_ignored";
      track({ name: eventName, metadata: { field: change.key, action: change.action } });
      if (change.action === "replace_existing" && change.decision !== "ignored") track({ name: "confirmed_field_replacement_approved", metadata: { field: change.key } });
    });
    setReplyOpen(false); setReplyChanges(null); setReplyText("");
    const firstChanged = replyChanges.find((change) => change.decision !== "ignored");
    if (firstChanged) setActiveGroup(firstChanged.group);
  }

  return <section className={`workspace ${analysed ? "is-analysed" : ""}`}>
    <div className="workspace-topbar"><div className="step-label"><span>1</span> Customer enquiry</div><label className="mode-control"><span>Quote mode</span><select value={mode} onChange={(event) => changeMode(event.target.value as QuoteMode)}><option value="formal">Formal quote</option><option value="ballpark">Ballpark estimate</option></select><ChevronDown size={15} /></label></div>

    {!analysed ? <div className="input-stage"><div className="input-copy"><span className="mini-kicker">START HERE</span><h2>Paste the message<br />exactly as you received it.</h2><p>Email, contact form, or DM — messy is fine. Briefvu will organize it without making up details.</p><button className="sample-button" onClick={() => setEnquiry(SAMPLE)}><Sparkles size={15} /> Try a messy sample</button></div><div className="composer"><div className="composer-label"><span>Customer message</span><small>{enquiry.length.toLocaleString()} / 20,000</small></div><textarea value={enquiry} onChange={(event) => setEnquiry(event.target.value.slice(0, 20000))} placeholder="Paste the customer’s email, form submission, or DM here…" aria-label="Customer enquiry" />{error && <p className="form-error"><AlertTriangle size={15} /> {error}</p>}<label className="privacy-choice"><input type="checkbox" checked={persistLocally} onChange={(event) => setPersistLocally(event.target.checked)} /><span><ShieldCheck size={14} /> Keep this active job on this device for 7 days</span></label><div className="composer-footer"><span><LockKeyholeSmall /> Never added to server-side job history</span><button className="primary-button" disabled={loading || enquiry.trim().length < 10} onClick={analyse}>{loading ? <><LoaderCircle className="spin" size={17} /> Analysing…</> : <>Build job spec <ArrowRight size={17} /></>}</button></div></div></div> : job ? <div className="review-stage">
      <div className={`readiness-banner ${job.readiness}`}><span><CheckCircle2 size={21} /></span><div><small>QUOTE READINESS</small><strong>{readinessLabel(job.readiness)}</strong><p>{totalBlockers ? `${totalBlockers} quote blocker${totalBlockers > 1 ? "s" : ""} remaining` : priceAffecting.length ? `${priceAffecting.length} price-affecting detail${priceAffecting.length > 1 ? "s" : ""} remaining` : productionChecks.length ? `Pricing details resolved · ${productionChecks.length} production check${productionChecks.length > 1 ? "s" : ""} remain` : "All required details are resolved"}</p></div><button ref={replyTriggerRef} className="reply-button" onClick={openReply}><MessageSquarePlus size={16} /> Add customer reply</button></div>
      <div className="review-summary"><div><span className="summary-icon"><History size={20} /></span><div><strong>Active job</strong><small>{job.messages.length} message{job.messages.length > 1 ? "s" : ""} · {job.clarificationRounds.length} clarification round{job.clarificationRounds.length !== 1 ? "s" : ""}</small></div></div><div className="summary-counts"><span><b>{confirmed}</b> ready</span><span className="warn"><b>{totalBlockers}</b> blockers</span><span><b>{priceAffecting.length}</b> price affecting</span></div><span className="storage-note"><ShieldCheck size={13} /> {job.persistence === "local" ? "Stored on this device · expires in 7 days" : "This tab session only"}</span><button className="text-button" onClick={reset}><RotateCcw size={15} /> Clear job</button></div>
      {capabilityIssues.length > 0 && <div className="capability-banner"><AlertTriangle size={19} /><div><strong>Manual workflow required</strong>{capabilityIssues.map((issue) => <p key={issue.code}><b>{issue.title}:</b> {issue.message}</p>)}</div></div>}
      {job.warnings.length > 0 && <div className="warning-banner"><AlertTriangle size={17} /><span>{job.warnings.length} result{job.warnings.length > 1 ? "s" : ""} need review because their evidence could not be matched.</span></div>}
      <div className="message-timeline">{job.messages.map((message) => <details key={message.id}><summary><span>{message.type === "initial_enquiry" ? "Initial enquiry" : `Customer reply ${message.sequence}`}</span><small>{new Date(message.createdAt).toLocaleString()}</small></summary><p>{message.rawText}</p></details>)}</div>
      <div className="review-grid"><aside className="group-tabs"><p>JOB DETAILS</p>{groups.map((group) => { const items = ruledFields.filter((field) => field.group === group); const issues = items.filter((field) => field.missingPriority === "Quote Blocker" || field.status === "Conflicting").length; const checks = items.filter((field) => !issues && (field.missingPriority === "Price Affecting" || field.missingPriority === "Production Later" || field.status === "Needs Review" || field.status === "Ambiguous")).length; return <button key={group} className={activeGroup === group ? "active" : ""} onClick={() => setActiveGroup(group)}><span>{group}</span>{issues ? <em>{issues}</em> : checks ? <em className="soft">{checks}</em> : <Check size={14} />}</button>; })}<div className="legend"><p>STATUS</p><span><i className="dot green" /> Confirmed</span><span><i className="dot amber" /> Check it</span><span><i className="dot gray" /> Missing</span></div></aside>
        <div className="field-panel"><div className="panel-heading"><div><span className="mini-kicker">REVIEW & APPROVE</span><h2>{activeGroup}</h2></div><p>Confirm what’s right. Fix what isn’t.</p></div><div className="field-list">{currentFields.map((field) => { const latestRevision = [...job.revisions].reverse().find((revision) => revision.key === field.key); return <article className={`field-card ${field.status === "Conflicting" ? "has-conflict" : ""}`} key={field.key}><div className="field-head"><div><h3>{field.label}</h3><span className={`status ${statusClass[field.status]}`}>{field.status}</span>{field.missingPriority && <span className={`priority ${field.missingPriority.toLowerCase().replace(" ", "-")}`}>{field.missingPriority}</span>}</div>{field.value && field.status !== "Conflicting" && <div className="field-actions">{!field.accepted && <button title="Accept" onClick={() => patchField(field.key, { accepted: true, status: "Confirmed" }, "field_accepted")}><Check size={15} /></button>}<button title="Edit" onClick={() => setEditing(editing === field.key ? null : field.key)}><Pencil size={14} /></button><button title="Remove" onClick={() => patchField(field.key, { value: "", status: "Missing", evidence: null, accepted: false }, "extracted_value_deleted")}><Trash2 size={14} /></button></div>}</div>{field.status === "Conflicting" ? <div className="conflict-box"><p><AlertTriangle size={15} /> Different values were found. Choose the right one.</p>{field.candidates.map((candidate) => <button key={`${candidate.value}-${candidate.evidence.start}`} onClick={() => resolveConflict(field, candidate.value)}><span className="radio" /><strong>{candidate.value}</strong><q>{candidate.evidence.snippet}</q></button>)}</div> : editing === field.key ? <div className="edit-row"><input autoFocus value={field.value} onChange={(event) => patchField(field.key, { value: event.target.value })} /><button onClick={() => { patchField(field.key, { edited: true, accepted: true, status: "Confirmed" }, "field_corrected"); setEditing(null); }}>Save</button></div> : <><p className={`field-value ${!field.value ? "empty" : ""}`}>{field.value || "Not provided"}{field.accepted && <CheckCircle2 size={15} />}</p>{field.evidence && <div className="evidence"><span>Evidence</span><q>{field.evidence.snippet}</q><small>{field.evidence.sourceLabel ?? `chars ${field.evidence.start}–${field.evidence.end}`}</small></div>}{latestRevision && <div className={`revision-note ${latestRevision.decision === "ignored" ? "ignored" : ""}`}><span><History size={12} /> {actionLabels[latestRevision.action]} · {latestRevision.decision === "ignored" ? "Ignored — kept previous value" : latestRevision.decision}</span>{latestRevision.decision === "ignored" && latestRevision.proposedValue && <button onClick={() => applyIgnoredRevision(latestRevision)}>Apply proposed update</button>}</div>}</>}</article>; })}</div></div>
        <aside className="output-panel"><section className="output-card blockers-card"><div className="output-heading"><span><AlertTriangle size={16} /></span><div><h3>Still needed</h3><p>For this {mode === "formal" ? "formal quote" : "ballpark"}</p></div></div>{capabilityBlockers.map((issue) => <div className="capability-blocker" key={issue.code}>{issue.title}</div>)}{blockers.map((field) => <button key={field.key} onClick={() => setActiveGroup(field.group)}><span>{field.label}</span><ArrowRight size={14} /></button>)}{!totalBlockers && <div className="all-clear"><CheckCircle2 size={18} /> No quote blockers</div>}{!totalBlockers && productionChecks.length > 0 && <p className="production-note">{productionChecks.length} production check{productionChecks.length > 1 ? "s" : ""} remain for later.</p>}</section><section className="output-card"><div className="output-heading"><span className="violet"><Sparkles size={16} /></span><div><h3>{needsClarification ? "Clarification draft" : "Quote-ready reply"}</h3><p>{needsClarification ? `Round ${job.clarificationRounds.length + 1} · only what remains` : "No more pricing questions"}</p></div></div><textarea className="draft-area" value={currentDraft} onChange={(event) => setDraft(event.target.value)} aria-label={needsClarification ? "Clarification draft" : "Quote-ready reply"} /><div className="add-question"><input value={extraQuestion} onChange={(event) => setExtraQuestion(event.target.value)} placeholder="Add a question…" onKeyDown={(event) => { if (event.key === "Enter") addQuestion(); }} /><button aria-label="Add question" onClick={addQuestion}><Plus size={15} /></button></div><button className="copy-button" onClick={copyClarification}><Clipboard size={15} /> {copied === "clarification" ? "Copied" : "Copy message"}</button></section><section className="output-card spec-card"><div className="output-heading"><span className="ink"><FileText size={16} /></span><div><h3>Job spec</h3><p>{isQuoteReady ? "Ready for your quote desk" : capabilityIssues.length ? "Draft · manual review required" : "Draft · updates as replies arrive"}</p></div></div><div className="spec-preview">{specPreviewFields.map((field) => <div key={field.key}><span>{field.label}</span><b>{field.value}</b></div>)}</div><div className="export-buttons"><button onClick={() => copy(jobSpecText(ruledFields, mode, job.readiness, capabilityIssues), "text", "job_spec_copied")}><Clipboard size={14} /> {copied === "text" ? "Copied" : isQuoteReady ? "Copy text" : "Copy draft"}</button><button onClick={() => copy(jobSpecJson(ruledFields, mode, job.readiness, capabilityIssues), "json", "job_spec_copied")}><FileJson size={14} /> {copied === "json" ? "Copied" : "JSON"}</button></div></section></aside>
      </div>
    </div> : null}

    {analysed && <PilotApplication
      onOpen={() => track({ name: "pilot_application_started", metadata: { price: 39 } })}
      onSubmitted={() => track({ name: "pilot_application_submitted", metadata: { price: 39 } })}
    />}

    {replyOpen && job && <div className="modal-backdrop" role="presentation"><section ref={replyModalRef} className="reply-modal" role="dialog" aria-modal="true" aria-labelledby="reply-title"><div className="modal-head"><div><span className="mini-kicker">CUSTOMER REPLY {job.metrics.replyCount + 1}</span><h2 id="reply-title">Update this job</h2><p>Paste the latest reply. Nothing changes until you approve each proposed update.</p></div><button aria-label="Close reply dialog" onClick={() => setReplyOpen(false)}><X size={18} /></button></div>{replyChanges === null ? <><textarea ref={replyTextRef} value={replyText} onChange={(event) => setReplyText(event.target.value.slice(0, 20000))} placeholder="Paste the customer’s latest reply…" aria-label="Customer reply" /><div className="reply-helper"><button onClick={() => setReplyText(REPLY_SAMPLE)}><Sparkles size={14} /> Use sample reply</button><span>{replyText.length.toLocaleString()} / 20,000</span></div>{replyError && <p className="form-error"><AlertTriangle size={15} /> {replyError}</p>}<div className="modal-actions"><button className="secondary-button" onClick={() => setReplyOpen(false)}>Cancel</button><button className="primary-button" disabled={replyLoading || replyText.trim().length < 5} onClick={analyseReply}>{replyLoading ? <><LoaderCircle className="spin" size={16} /> Analysing…</> : <>Review proposed changes <ArrowRight size={16} /></>}</button></div></> : <><div className="changes-summary"><div><strong>{replyChanges.length}</strong><span>proposed updates</span></div><p><ShieldCheck size={15} /> Evidence checked against this reply only</p></div>{replyWarnings.length > 0 && <div className="warning-banner"><AlertTriangle size={16} /> {replyWarnings.length} result{replyWarnings.length > 1 ? "s" : ""} need manual review.</div>}<div className="proposed-list">{replyChanges.length ? replyChanges.map((change) => <article className={`proposed-change ${change.action === "replace_existing" || change.action === "create_conflict" ? "critical" : ""}`} key={change.id}><div className="change-head"><div><h3>{change.label}</h3><span>{actionLabels[change.action]}</span></div>{(change.action === "replace_existing" || change.action === "create_conflict") && <AlertTriangle size={17} />}</div><div className="value-change"><div><small>BEFORE</small><strong>{change.previousValue || "Not provided"}</strong></div><ArrowRight size={15} /><div><small>PROPOSED</small><strong>{change.proposedValue || (change.candidates.map((candidate) => candidate.value).join(" / ") || "Needs review")}</strong></div></div>{change.evidence && <q>{change.evidence.snippet}</q>}{change.decision === "edited" && <input className="merge-edit" value={change.editedValue ?? change.proposedValue} onChange={(event) => updateReplyChange(change.id, { editedValue: event.target.value })} aria-label={`Edit ${change.label}`} />}<div className="decision-buttons"><button className={change.decision === "accepted" ? "selected accept" : ""} onClick={() => updateReplyChange(change.id, { decision: "accepted" })}><Check size={14} /> Accept</button><button className={change.decision === "edited" ? "selected" : ""} onClick={() => updateReplyChange(change.id, { decision: "edited", editedValue: change.editedValue ?? change.proposedValue })}><Pencil size={13} /> Edit</button><button className={change.decision === "ignored" ? "selected ignore" : ""} onClick={() => updateReplyChange(change.id, { decision: "ignored" })}><X size={14} /> Ignore</button></div></article>) : <div className="no-changes"><CheckCircle2 size={24} /><h3>No safe updates found</h3><p>You can still add this reply to the timeline for reference.</p></div>}</div><div className="modal-actions"><button className="secondary-button" onClick={() => setReplyChanges(null)}>Back</button><button className="primary-button" disabled={replyChanges.some((change) => change.decision === "pending")} onClick={commitReply}>Apply reviewed changes <ArrowRight size={16} /></button></div></>}</section></div>}
  </section>;
}

function LockKeyholeSmall() { return <span aria-hidden="true">◈</span>; }
