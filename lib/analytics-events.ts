import { FIELD_DEFINITIONS } from "./types";

const metadataKeysByEvent = {
  analysis_completed: ["input_length", "extracted_fields", "missing_fields", "conflicting_fields", "quote_mode", "source"],
  field_accepted: ["field"],
  field_corrected: ["field"],
  extracted_value_deleted: ["field"],
  conflict_resolved: ["field"],
  missing_question_removed: [],
  missing_question_added: [],
  field_status_changed: ["field"],
  clarification_copied: ["format"],
  job_spec_copied: ["format"],
  repeat_enquiry_processed: ["input_length", "extracted_fields", "missing_fields", "conflicting_fields", "quote_mode", "source"],
  pricing_viewed: [],
  paid_pilot_clicked: ["price"],
  pilot_application_started: ["price"],
  pilot_application_submitted: ["price"],
  quote_ready_reply_copied: ["format"],
  ignored_merge_applied: ["field"],
  active_job_created: ["persistence", "quote_mode"],
  active_job_restored: [],
  customer_reply_opened: ["reply_number"],
  customer_reply_added: ["reply_number", "changes_accepted", "changes_edited", "changes_ignored", "blockers_before", "blockers_after"],
  reply_analysis_completed: ["reply_number", "input_length", "proposed_changes", "evidence_warnings"],
  reply_analysis_failed: [],
  merge_change_accepted: ["field", "action"],
  merge_change_edited: ["field", "action"],
  merge_change_ignored: ["field", "action"],
  confirmed_field_replacement_approved: ["field"],
  quote_readiness_changed: ["from", "to", "handling_seconds"],
  ready_for_ballpark_reached: ["handling_seconds"],
  ready_for_formal_reached: ["handling_seconds"],
  clarification_round_started: ["round", "blocker_count"],
  clarification_round_copied: ["round", "blocker_count"],
  active_job_cleared: [],
} as const;

export type AnalyticsEventName = keyof typeof metadataKeysByEvent;

const fieldKeys = new Set(FIELD_DEFINITIONS.map((field) => field.key));
const mergeActions = new Set([
  "fill_missing", "confirm_existing", "refine_existing", "replace_existing",
  "create_conflict", "no_change", "needs_review",
]);
const readinessValues = new Set([
  "not_ready", "ready_for_ballpark", "almost_ready_for_formal", "ready_for_formal",
]);
const allowedStrings: Record<string, Set<string>> = {
  field: fieldKeys,
  action: mergeActions,
  quote_mode: new Set(["ballpark", "formal"]),
  source: new Set(["openai", "demo"]),
  persistence: new Set(["local", "session"]),
  format: new Set(["clarification", "text", "json"]),
  from: readinessValues,
  to: readinessValues,
};

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return Object.hasOwn(metadataKeysByEvent, value);
}

export function isValidAnalyticsSessionId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function sanitizeEventMetadata(name: AnalyticsEventName, metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  const source = metadata as Record<string, unknown>;
  const safe: Record<string, string | number> = {};
  for (const key of metadataKeysByEvent[name]) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      safe[key] = Math.min(Math.round(value), 1_000_000_000);
      continue;
    }
    if (typeof value === "string" && allowedStrings[key]?.has(value)) {
      safe[key] = value;
    }
  }
  return safe;
}
