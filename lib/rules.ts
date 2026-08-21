import {
  FIELD_DEFINITIONS,
  type ExtractedField,
  type FieldKey,
  type MissingPriority,
  type QuoteMode,
} from "./types";

const formalBlockers = new Set<FieldKey>([
  "quantity",
  "garment_type",
  "decoration_method",
  "print_locations",
]);

const ballparkBlockers = new Set<FieldKey>(["quantity", "garment_type"]);

const priceAffecting = new Set<FieldKey>([
  "garment_brand",
  "garment_style",
  "garment_color",
  "decoration_method",
  "print_locations",
  "print_colors",
  "number_of_designs",
  "deadline",
  "rush_requirement",
]);

const productionLater = new Set<FieldKey>([
  "size_breakdown",
  "artwork_readiness",
  "file_received",
  "shipping_pickup",
]);

export function classifyMissing(
  key: FieldKey,
  mode: QuoteMode,
): MissingPriority {
  if ((mode === "formal" ? formalBlockers : ballparkBlockers).has(key)) {
    return "Quote Blocker";
  }
  if (priceAffecting.has(key)) return "Price Affecting";
  if (productionLater.has(key)) return "Production Later";
  return "Optional";
}

export function applyMissingRules(
  fields: ExtractedField[],
  mode: QuoteMode,
): ExtractedField[] {
  return fields.map((field) => {
    const unresolved =
      field.status === "Missing" ||
      field.status === "Ambiguous" ||
      field.status === "Conflicting" ||
      field.status === "Needs Review";
    return {
      ...field,
      missingPriority: unresolved
        ? field.status === "Conflicting"
          ? "Quote Blocker"
          : classifyMissing(field.key, mode)
        : undefined,
    };
  });
}

export function ensureAllFields(fields: ExtractedField[]): ExtractedField[] {
  const byKey = new Map(fields.map((field) => [field.key, field]));
  return FIELD_DEFINITIONS.map((definition) => {
    const existing = byKey.get(definition.key);
    return (
      existing ?? {
        ...definition,
        value: "",
        status: "Missing",
        evidence: null,
        candidates: [],
        accepted: false,
        edited: false,
      }
    );
  });
}

export function evidenceFor(source: string, snippet: string) {
  if (!snippet) return null;
  const start = source.indexOf(snippet);
  if (start < 0) return null;
  return { snippet, start, end: start + snippet.length };
}

function hasRelevantBooleanEvidence(field: ExtractedField) {
  const patterns: Partial<Record<FieldKey, RegExp>> = {
    artwork_mentioned: /\b(art(?:work)?|logo|design|graphic|vector)\b/i,
    attachment_claimed: /\b(attach(?:ed|ment)?|enclos(?:ed|ure)?|upload(?:ed)?|sent|send|file)\b/i,
    customer_supplied_garments: /\b(customer[- ]supplied|bring|supply|our own|own garments?|own blanks?)\b/i,
    rush_requirement: /\b(rush|urgent|asap|expedit(?:e|ed))\b/i,
  };
  const pattern = patterns[field.key];
  if (!pattern) return true;
  if (!field.evidence) return false;
  const snippet = field.evidence.snippet;
  if (pattern && !pattern.test(snippet)) return false;
  if (
    field.value.trim().toLowerCase() === "no" &&
    !/\b(no|not|without|didn['’]?t|did not|won['’]?t|will not)\b/i.test(snippet)
  ) {
    return false;
  }
  return true;
}

export function verifyEvidence(
  source: string,
  fields: ExtractedField[],
): { fields: ExtractedField[]; warnings: string[] } {
  const warnings: string[] = [];
  const verified = fields.map((field) => {
    if (field.status === "Missing" || field.status === "Not Applicable") {
      return { ...field, evidence: null };
    }

    if (field.status === "Needs Review" && !field.evidence && !field.candidates.length) {
      return field;
    }

    const evidence = field.evidence
      ? evidenceFor(source, field.evidence.snippet)
      : null;
    const candidates = field.candidates.map((candidate) => ({
      ...candidate,
      evidence:
        evidenceFor(source, candidate.evidence.snippet) ?? candidate.evidence,
    }));

    const candidateMismatch = field.candidates.some(
      (candidate) => !evidenceFor(source, candidate.evidence.snippet),
    );

    if (!hasRelevantBooleanEvidence(field)) {
      return {
        ...field,
        value: "",
        status: "Missing" as const,
        evidence: null,
        candidates: [],
        accepted: false,
      };
    }

    if ((!evidence && field.status !== "Conflicting") || candidateMismatch) {
      warnings.push(`${field.label}: evidence could not be verified.`);
      return {
        ...field,
        status: "Needs Review" as const,
        evidence: null,
        candidates,
        accepted: false,
      };
    }
    return { ...field, evidence, candidates };
  });
  return { fields: verified, warnings };
}
