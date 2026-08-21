import type {
  CapabilityIssue,
  ExtractedField,
  MissingPriority,
  QuoteMode,
  QuoteReadiness,
} from "./types";

const priorityOrder: MissingPriority[] = [
  "Quote Blocker",
  "Price Affecting",
  "Production Later",
  "Optional",
];

const questions: Partial<Record<ExtractedField["key"], string>> = {
  quantity: "What is the final quantity?",
  garment_type: "What type of garment would you like?",
  garment_brand: "Do you have a preferred garment brand?",
  garment_style: "Do you have a preferred garment style or product number?",
  garment_color: "What garment color would you like?",
  size_breakdown: "What is the size breakdown?",
  decoration_method: "Which decoration method should we quote?",
  print_locations: "Which print locations do you need?",
  print_colors: "How many colors are in each design?",
  number_of_designs: "How many unique designs are included?",
  deadline: "What is the required in-hand date?",
  rush_requirement: "Should we treat this as a rush order?",
  shipping_pickup: "Will this order be shipped or picked up?",
  artwork_readiness: "Is the artwork final and production-ready?",
};

export function clarificationQuestions(fields: ExtractedField[]): string[] {
  const conflicts = fields
    .filter((field) => field.status === "Conflicting")
    .map((field) => {
      const choices = field.candidates.map((candidate) => candidate.value).join(" or ");
      return `Could you confirm the final ${field.label.toLowerCase()}: ${choices}?`;
    });

  const missing = priorityOrder.flatMap((priority) =>
    fields
      .filter(
        (field) =>
          field.status !== "Conflicting" &&
          field.missingPriority === priority &&
          (priority === "Quote Blocker" || priority === "Price Affecting"),
      )
      .map((field) => questions[field.key])
      .filter((question): question is string => Boolean(question)),
  );

  return [...new Set([...conflicts, ...missing])];
}

export function clarificationDraft(
  fields: ExtractedField[],
  mode: QuoteMode = "formal",
  capabilityIssues: CapabilityIssue[] = [],
): string {
  const hasMultiProductBlocker = capabilityIssues.some(
    (issue) => issue.code === "multi_product_order" && issue.severity === "quote_blocker",
  );
  const capabilityQuestions = capabilityIssues
    .filter((issue) => issue.severity === "quote_blocker")
    .map((issue) => {
      if (issue.code === "personalization_matrix") {
        return "Please send the personalization roster with each person’s name or number, garment size, and quantity; we’ll review it separately before quoting.";
      }
      if (issue.code === "multi_product_order") {
        return "Could we split this enquiry into one job per product, or should we review the multi-product order manually?";
      }
      return "Please provide separate details for each design and print location so we can review the line items manually before quoting.";
    });
  const fieldQuestions = hasMultiProductBlocker ? [] : clarificationQuestions(fields);
  const list = [...new Set([...capabilityQuestions, ...fieldQuestions])];
  if (!list.length) {
    return mode === "ballpark"
      ? "Thanks — I have everything I need to prepare your ballpark estimate. I’ll be in touch shortly with the details."
      : "Thanks — I have everything I need to prepare your formal quote. I’ll be in touch shortly with the details.";
  }
  return [
    "Thanks — I have most of the details.",
    "",
    "Before I prepare the quote, could you confirm:",
    "",
    ...list.map((question, index) => `${index + 1}. ${question}`),
    "",
    "Thank you!",
  ].join("\n");
}

function quoteIsReady(readiness: QuoteReadiness, capabilityIssues: CapabilityIssue[]) {
  return (
    readiness === "ready_for_ballpark" || readiness === "ready_for_formal"
  ) && capabilityIssues.length === 0;
}

function exportStatus(readiness: QuoteReadiness, capabilityIssues: CapabilityIssue[]) {
  if (quoteIsReady(readiness, capabilityIssues)) return "quote_ready" as const;
  if (capabilityIssues.length) return "manual_review_required" as const;
  return "not_ready" as const;
}

const readinessLabels: Record<QuoteReadiness, string> = {
  not_ready: "Not ready to quote",
  ready_for_ballpark: "Ready for a ballpark estimate",
  almost_ready_for_formal: "Almost ready for a formal quote",
  ready_for_formal: "Ready for a formal quote",
};

function outstandingFields(fields: ExtractedField[]) {
  return fields.filter(
    (field) => field.missingPriority === "Quote Blocker" || field.status === "Conflicting",
  );
}

export function jobSpecText(
  fields: ExtractedField[],
  mode: QuoteMode,
  readiness: QuoteReadiness,
  capabilityIssues: CapabilityIssue[] = [],
): string {
  const status = exportStatus(readiness, capabilityIssues);
  const resolved = fields.filter(
    (field) =>
      field.value &&
      (field.status === "Confirmed" || field.status === "Approximate"),
  );
  const outstanding = outstandingFields(fields);
  const conflicts = fields.filter(
    (field) => field.status === "Conflicting" && field.candidates.length,
  );
  const header = status === "quote_ready"
    ? "QUOTE-READY JOB SPEC"
    : status === "manual_review_required"
      ? "DRAFT JOB SPEC — MANUAL REVIEW REQUIRED"
      : "DRAFT JOB SPEC — NOT READY";
  return [
    header,
    "",
    `Quote mode\n${mode === "formal" ? "Formal Quote" : "Ballpark Estimate"}`,
    "",
    `Quote readiness\n${readinessLabels[readiness]}`,
    ...(capabilityIssues.length
      ? [
          "",
          "Manual review required",
          ...capabilityIssues.flatMap((issue) => [
            `• ${issue.title}: ${issue.message}`,
            `  Evidence: ${issue.evidence}`,
          ]),
        ]
      : []),
    ...(conflicts.length
      ? [
          "",
          "Conflict options",
          ...conflicts.flatMap((field) => [
            `• ${field.label}`,
            ...field.candidates.map(
              (candidate) => `  - ${candidate.value} — “${candidate.evidence.snippet}”`,
            ),
          ]),
        ]
      : []),
    "",
    "Resolved details",
    ...(resolved.length ? resolved.flatMap((field) => [field.label, field.value]) : ["None"]),
    "",
    "Outstanding items",
    ...(
      outstanding.length || capabilityIssues.length
        ? [
            ...outstanding.map((field) => `• ${field.label}`),
            ...capabilityIssues.map((issue) => `• Capability: ${issue.title}`),
          ]
        : ["None"]
    ),
  ].join("\n");
}

export function jobSpecJson(
  fields: ExtractedField[],
  mode: QuoteMode,
  readiness: QuoteReadiness,
  capabilityIssues: CapabilityIssue[] = [],
): string {
  return JSON.stringify(
    {
      quoteMode: mode,
      readiness,
      exportStatus: exportStatus(readiness, capabilityIssues),
      capabilityIssues,
      fields: Object.fromEntries(
        fields.map((field) => [
          field.key,
          {
            value: field.value || null,
            status: field.status,
            accepted: field.accepted,
            evidence: field.evidence,
            candidates: field.candidates,
          },
        ]),
      ),
      outstanding: {
        fields: outstandingFields(fields).map((field) => field.key),
        capabilities: capabilityIssues
          .filter((issue) => issue.severity === "quote_blocker")
          .map((issue) => issue.code),
      },
    },
    null,
    2,
  );
}
