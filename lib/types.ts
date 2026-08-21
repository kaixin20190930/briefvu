export type QuoteMode = "ballpark" | "formal";

export type FieldStatus =
  | "Confirmed"
  | "Approximate"
  | "Ambiguous"
  | "Conflicting"
  | "Missing"
  | "Needs Review"
  | "Not Applicable";

export type MissingPriority =
  | "Quote Blocker"
  | "Price Affecting"
  | "Production Later"
  | "Optional";

export type FieldKey =
  | "quantity"
  | "garment_type"
  | "garment_brand"
  | "garment_style"
  | "garment_color"
  | "size_breakdown"
  | "decoration_method"
  | "print_locations"
  | "print_colors"
  | "number_of_designs"
  | "artwork_mentioned"
  | "attachment_claimed"
  | "file_received"
  | "artwork_readiness"
  | "deadline"
  | "rush_requirement"
  | "shipping_pickup"
  | "customer_supplied_garments"
  | "notes";

export interface Evidence {
  snippet: string;
  start: number;
  end: number;
  sourceMessageId?: string;
  sourceLabel?: string;
}

export interface Candidate {
  value: string;
  evidence: Evidence;
}

export interface ExtractedField {
  key: FieldKey;
  label: string;
  group: string;
  value: string;
  status: FieldStatus;
  evidence: Evidence | null;
  candidates: Candidate[];
  accepted: boolean;
  edited: boolean;
  missingPriority?: MissingPriority;
}

export interface AnalysisResult {
  fields: ExtractedField[];
  source: "openai" | "demo";
  warnings: string[];
  capabilityIssues: CapabilityIssue[];
}

export interface CapabilityIssue {
  code: "multi_product_order" | "personalization_matrix" | "design_spec_matrix";
  severity: "quote_blocker" | "manual_review";
  title: string;
  message: string;
  evidence: string;
}

export interface ProductEvent {
  name: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export type JobStatus =
  | "draft"
  | "needs_review"
  | "needs_clarification"
  | "awaiting_customer_reply"
  | "reply_needs_review"
  | "ready_to_quote";

export type QuoteReadiness =
  | "not_ready"
  | "ready_for_ballpark"
  | "almost_ready_for_formal"
  | "ready_for_formal";

export type MergeAction =
  | "fill_missing"
  | "confirm_existing"
  | "refine_existing"
  | "replace_existing"
  | "create_conflict"
  | "no_change"
  | "needs_review";

export type MergeDecision = "pending" | "accepted" | "edited" | "ignored";

export interface JobMessage {
  id: string;
  type: "initial_enquiry" | "customer_reply";
  sequence: number;
  rawText: string;
  createdAt: string;
}

export interface ProposedChange {
  id: string;
  key: FieldKey;
  label: string;
  group: string;
  previousValue: string;
  previousStatus: FieldStatus;
  proposedValue: string;
  proposedStatus: FieldStatus;
  action: MergeAction;
  evidence: Evidence | null;
  candidates: Candidate[];
  decision: MergeDecision;
  editedValue?: string;
}

export interface FieldRevision extends ProposedChange {
  sourceMessageId: string;
  finalValue: string | null;
  createdAt: string;
}

export interface ClarificationRound {
  id: string;
  number: number;
  draft: string;
  blockerCount: number;
  copiedAt: string;
}

export interface LocalJobMetrics {
  startedAt: string;
  initialBlockerCount: number;
  replyCount: number;
  acceptedMergeCount: number;
  editedMergeCount: number;
  ignoredMergeCount: number;
}

export interface TemporaryJob {
  id: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  persistence: "local" | "session";
  quoteMode: QuoteMode;
  status: JobStatus;
  readiness: QuoteReadiness;
  messages: JobMessage[];
  fields: ExtractedField[];
  revisions: FieldRevision[];
  clarificationRounds: ClarificationRound[];
  metrics: LocalJobMetrics;
  source: AnalysisResult["source"];
  warnings: string[];
  capabilityIssues: CapabilityIssue[];
}

export const FIELD_DEFINITIONS: Array<{
  key: FieldKey;
  label: string;
  group: string;
}> = [
  { key: "quantity", label: "Quantity", group: "Order basics" },
  { key: "garment_type", label: "Garment type", group: "Order basics" },
  { key: "garment_brand", label: "Brand", group: "Order basics" },
  { key: "garment_style", label: "Style", group: "Order basics" },
  { key: "garment_color", label: "Garment color", group: "Order basics" },
  { key: "size_breakdown", label: "Size breakdown", group: "Sizing" },
  { key: "decoration_method", label: "Decoration method", group: "Decoration" },
  { key: "print_locations", label: "Print locations", group: "Decoration" },
  { key: "print_colors", label: "Print colors", group: "Decoration" },
  { key: "number_of_designs", label: "Number of designs", group: "Decoration" },
  { key: "artwork_mentioned", label: "Artwork mentioned", group: "Artwork" },
  { key: "attachment_claimed", label: "Attachment claimed", group: "Artwork" },
  { key: "file_received", label: "File received", group: "Artwork" },
  { key: "artwork_readiness", label: "Artwork readiness", group: "Artwork" },
  { key: "deadline", label: "Deadline", group: "Timing" },
  { key: "rush_requirement", label: "Rush requirement", group: "Timing" },
  { key: "shipping_pickup", label: "Shipping / pickup", group: "Fulfilment" },
  {
    key: "customer_supplied_garments",
    label: "Customer-supplied garments",
    group: "Fulfilment",
  },
  { key: "notes", label: "Notes", group: "Additional" },
];
