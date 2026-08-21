import { applyMissingRules } from "./rules";
import type {
  CapabilityIssue,
  ExtractedField,
  FieldRevision,
  MergeDecision,
  ProposedChange,
  QuoteMode,
  QuoteReadiness,
} from "./types";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ");
}

function tagEvidence(field: ExtractedField, messageId: string, sourceLabel: string) {
  return {
    ...field,
    evidence: field.evidence
      ? { ...field.evidence, sourceMessageId: messageId, sourceLabel }
      : null,
    candidates: field.candidates.map((candidate) => ({
      ...candidate,
      evidence: { ...candidate.evidence, sourceMessageId: messageId, sourceLabel },
    })),
  };
}

export function tagFieldsWithMessage(
  fields: ExtractedField[],
  messageId: string,
  sourceLabel: string,
) {
  return fields.map((field) => tagEvidence(field, messageId, sourceLabel));
}

export function getQuoteReadiness(
  fields: ExtractedField[],
  mode: QuoteMode,
  capabilityIssues: CapabilityIssue[] = [],
): QuoteReadiness {
  const ruled = applyMissingRules(fields, mode);
  const conflicts = ruled.filter((field) => field.status === "Conflicting");
  const blockers = ruled.filter((field) => field.missingPriority === "Quote Blocker");
  const priceAffecting = ruled.filter(
    (field) => field.missingPriority === "Price Affecting",
  );

  if (
    conflicts.length ||
    capabilityIssues.some((issue) => issue.severity === "quote_blocker")
  ) return "not_ready";
  if (mode === "ballpark") {
    return blockers.length ? "not_ready" : "ready_for_ballpark";
  }
  if (blockers.length > 1) return "not_ready";
  if (blockers.length === 1 || priceAffecting.length) {
    return "almost_ready_for_formal";
  }
  return "ready_for_formal";
}

export function readinessLabel(readiness: QuoteReadiness) {
  const labels: Record<QuoteReadiness, string> = {
    not_ready: "Not ready to quote",
    ready_for_ballpark: "Ready for a ballpark estimate",
    almost_ready_for_formal: "Almost ready for a formal quote",
    ready_for_formal: "Ready for a formal quote",
  };
  return labels[readiness];
}

function mergeAction(existing: ExtractedField, reply: ExtractedField) {
  if (reply.status === "Conflicting") return "create_conflict" as const;
  if (reply.status === "Needs Review") return "needs_review" as const;
  if (existing.status === "Conflicting") return "refine_existing" as const;
  if (!existing.value || existing.status === "Missing") return "fill_missing" as const;
  if (normalize(existing.value) === normalize(reply.value)) {
    if (
      existing.status === "Approximate" ||
      existing.status === "Ambiguous" ||
      existing.status === "Needs Review"
    ) {
      return "confirm_existing" as const;
    }
    return "no_change" as const;
  }
  if (existing.status === "Confirmed" || existing.accepted) {
    return "replace_existing" as const;
  }
  return "refine_existing" as const;
}

export function proposeReplyChanges(
  existingFields: ExtractedField[],
  replyFields: ExtractedField[],
  messageId: string,
  sourceLabel: string,
): ProposedChange[] {
  const tagged = tagFieldsWithMessage(replyFields, messageId, sourceLabel);
  return tagged.flatMap((reply) => {
    const normalizedReplyValue = normalize(reply.value);
    const emptySentinel = ["missing", "not provided", "n/a", "na", "unknown"].includes(
      normalizedReplyValue,
    );
    const duplicatesStructuredField =
      reply.key === "notes" &&
      Boolean(reply.evidence) &&
      tagged.some(
        (field) =>
          field.key !== "notes" &&
          Boolean(field.evidence?.snippet) &&
          (normalize(field.evidence!.snippet).includes(normalize(reply.evidence!.snippet)) ||
            normalize(reply.evidence!.snippet).includes(normalize(field.evidence!.snippet))) &&
          field.status !== "Missing",
      );
    if (
      duplicatesStructuredField ||
      (reply.status === "Needs Review" && emptySentinel) ||
      (!reply.value && reply.status !== "Conflicting") ||
      reply.status === "Missing" ||
      reply.status === "Not Applicable" ||
      (reply.status === "Needs Review" && normalizedReplyValue === "unknown")
    ) {
      return [];
    }
    const existing = existingFields.find((field) => field.key === reply.key);
    if (!existing) return [];
    const action = mergeAction(existing, reply);
    if (action === "no_change") return [];
    return [
      {
        id: crypto.randomUUID(),
        key: reply.key,
        label: reply.label,
        group: reply.group,
        previousValue: existing.value,
        previousStatus: existing.status,
        proposedValue: reply.value,
        proposedStatus: reply.status,
        action,
        evidence: reply.evidence,
        candidates: reply.candidates,
        decision: "pending" as const,
      },
    ];
  });
}

function finalFieldFromChange(
  field: ExtractedField,
  change: ProposedChange,
): ExtractedField {
  const finalValue =
    change.decision === "edited" ? change.editedValue?.trim() ?? "" : change.proposedValue;
  if (change.action === "create_conflict" && change.decision !== "edited") {
    return {
      ...field,
      value: "",
      status: "Conflicting",
      evidence: null,
      candidates: change.candidates,
      accepted: false,
      edited: false,
    };
  }
  return {
    ...field,
    value: finalValue,
    status: change.decision === "edited" ? "Confirmed" : change.proposedStatus,
    evidence: change.evidence,
    candidates: [],
    accepted: true,
    edited: change.decision === "edited",
  };
}

export function applyMergeDecisions(
  fields: ExtractedField[],
  changes: ProposedChange[],
  sourceMessageId: string,
): { fields: ExtractedField[]; revisions: FieldRevision[] } {
  const decided = changes.filter(
    (change) => change.decision !== "pending" && change.decision !== "ignored",
  );
  const nextFields = fields.map((field) => {
    const change = decided.find((item) => item.key === field.key);
    return change ? finalFieldFromChange(field, change) : field;
  });
  const now = new Date().toISOString();
  const revisions = changes
    .filter((change) => change.decision !== "pending")
    .map((change) => ({
      ...change,
      sourceMessageId,
      finalValue:
        change.decision === "ignored"
          ? change.previousValue || null
          : change.decision === "edited"
            ? change.editedValue?.trim() || null
            : change.proposedValue || null,
      createdAt: now,
    }));
  return { fields: nextFields, revisions };
}

export function countDecisions(changes: ProposedChange[], decision: MergeDecision) {
  return changes.filter((change) => change.decision === decision).length;
}
