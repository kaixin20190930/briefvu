import { NextResponse } from "next/server";
import { parseEnquiryLocally } from "@/lib/demo-parser";
import { applyCapabilityFieldSafety, detectCapabilityIssues } from "@/lib/capability-boundaries";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  recordMonitoringEvent,
  type MonitoringOutcome,
  type MonitoringSource,
} from "@/lib/monitoring";
import { applyMissingRules, ensureAllFields, verifyEvidence } from "@/lib/rules";
import { FIELD_DEFINITIONS, type ExtractedField, type QuoteMode } from "@/lib/types";

export const runtime = "nodejs";

const statuses = [
  "Confirmed",
  "Approximate",
  "Ambiguous",
  "Conflicting",
  "Missing",
  "Needs Review",
  "Not Applicable",
];

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    fields: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          key: { type: "string", enum: FIELD_DEFINITIONS.map((field) => field.key) },
          value: { type: "string" },
          status: { type: "string", enum: statuses },
          evidence_snippet: { type: "string" },
          candidates: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                value: { type: "string" },
                evidence_snippet: { type: "string" },
              },
              required: ["value", "evidence_snippet"],
            },
          },
        },
        required: ["key", "value", "status", "evidence_snippet", "candidates"],
      },
    },
  },
  required: ["fields"],
};

const baseInstructions = `You extract custom apparel job details from one customer message.
Return every field in the schema exactly once. Use only information in the enquiry.
Evidence snippets MUST be exact, contiguous substrings copied from the enquiry. Never paraphrase evidence.
Normalize field values while keeping evidence verbatim:
- quantity and quantity candidates: numeric value only (for example "75"), or a compact numeric range such as "180-220"; do not include garment words or qualifiers in the value.
- garment_brand: manufacturer name only (for example "Gildan").
- garment_style: product/style identifier only (for example "5000"). When a phrase such as "Gildan 5000" appears, return both garment_brand="Gildan" and garment_style="5000" using that same exact phrase as evidence for each.
- print_locations: canonical comma-separated locations such as "front, back"; keep qualifiers in evidence rather than the value.
- print_colors and number_of_designs: numeric value only when explicit.
- artwork_mentioned, attachment_claimed, customer_supplied_garments, and rush_requirement: use only "Yes" or "No" when explicitly stated. Absence is Missing, never "No". Do not attach an unrelated evidence sentence to these fields.
- deadline: when the customer says a date moved, changed, or is now another date, return the new date as Confirmed with that exact phrase as evidence.
- notes: capture only explicit special instructions that do not belong to another structured field. Never paraphrase quantity, date, artwork, decoration, or fulfilment updates into notes.
Confirmed = explicit and unique. Approximate = around/about/roughly/approximately/maybe/probably.
Ambiguous = present but not uniquely interpretable. Conflicting = two or more incompatible values; include every candidate and exact evidence. Missing = absent.
Never infer artwork readiness from a customer saying they attached a logo. file_received is Needs Review with value Unknown because this version cannot receive files.
For Missing or Not Applicable, value and evidence_snippet are both empty strings. For Conflicting, top-level value and evidence_snippet are empty and candidates contains all values.
Do not calculate, quote, or invent product details.`;

class AnalysisSchemaError extends Error {
  constructor() {
    super("Invalid structured analysis output");
    this.name = "AnalysisSchemaError";
  }
}

async function monitoredJson(
  payload: unknown,
  options: {
    status: number;
    outcome: MonitoringOutcome;
    startedAt: number;
    requestId: string;
    source?: MonitoringSource;
    headers?: HeadersInit;
  },
) {
  await recordMonitoringEvent({
    route: "analyze",
    outcome: options.outcome,
    statusCode: options.status,
    startedAt: options.startedAt,
    requestId: options.requestId,
    source: options.source,
  });
  return NextResponse.json(payload, {
    status: options.status,
    headers: {
      "X-Request-Id": options.requestId,
      ...Object.fromEntries(new Headers(options.headers)),
    },
  });
}

function mapFields(raw: Array<Record<string, unknown>>): ExtractedField[] {
  return raw.flatMap((item) => {
    const definition = FIELD_DEFINITIONS.find((field) => field.key === item.key);
    if (!definition || !statuses.includes(String(item.status))) return [];
    if (definition.key === "file_received") {
      return [{
        ...definition,
        value: "Unknown",
        status: "Needs Review" as const,
        evidence: null,
        candidates: [],
        accepted: false,
        edited: false,
      }];
    }
    const status = item.status as ExtractedField["status"];
    const unresolvedEmpty = status === "Missing" || status === "Not Applicable";
    const snippet = unresolvedEmpty ? "" : String(item.evidence_snippet ?? "");
    const candidates = status === "Conflicting" && Array.isArray(item.candidates)
      ? item.candidates.map((candidate) => {
          const value = candidate as Record<string, unknown>;
          return {
            value: String(value.value ?? ""),
            evidence: {
              snippet: String(value.evidence_snippet ?? ""),
              start: -1,
              end: -1,
            },
          };
        })
      : [];
    return [
      {
        ...definition,
        value: unresolvedEmpty ? "" : String(item.value ?? ""),
        status,
        evidence: snippet ? { snippet, start: -1, end: -1 } : null,
        candidates,
        accepted: false,
        edited: false,
      },
    ];
  });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 30_000) {
    return monitoredJson(
      { error: "Enquiry is too long." },
      { status: 413, outcome: "validation_error", startedAt, requestId },
    );
  }

  const rateLimit = await enforceRateLimit(request, "analyze", 30, 15 * 60);
  if (!rateLimit.allowed) {
    return monitoredJson(
      { error: "Too many analyses from this network. Please try again shortly." },
      {
        status: 429,
        outcome: "rate_limited",
        startedAt,
        requestId,
        headers: {
          "Retry-After": String(rateLimit.retryAfter),
        },
      },
    );
  }

  let body: {
    enquiry?: unknown;
    mode?: unknown;
    kind?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return monitoredJson(
      { error: "Invalid request." },
      { status: 400, outcome: "validation_error", startedAt, requestId },
    );
  }
  const enquiry = typeof body.enquiry === "string" ? body.enquiry.trim() : "";
  const mode: QuoteMode = body.mode === "ballpark" ? "ballpark" : "formal";
  const kind = body.kind === "reply" ? "reply" : "initial";
  if (enquiry.length < 10 || enquiry.length > 20_000) {
    return monitoredJson(
      { error: "Paste an enquiry between 10 and 20,000 characters." },
      { status: 400, outcome: "validation_error", startedAt, requestId },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const capabilityIssues = detectCapabilityIssues(enquiry);
  if (!apiKey) {
    const parsed = parseEnquiryLocally(enquiry);
    return monitoredJson(
      {
        fields: applyMissingRules(
          applyCapabilityFieldSafety(enquiry, parsed.fields, capabilityIssues),
          mode,
        ),
        warnings: parsed.warnings,
        capabilityIssues,
        source: "demo",
      },
      { status: 200, outcome: "success", startedAt, requestId, source: "demo" },
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: AbortSignal.timeout(30_000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        reasoning: { effort: "minimal" },
        instructions:
          kind === "reply"
            ? `${baseInstructions}\nThis message is a follow-up reply. Extract only what the reply itself states. Phrases such as “make it 75”, “80 exactly”, “event is October 15”, and “the event moved to October 15” are explicit replacement values even without a garment noun nearby. A reply that repeats an existing fact is a confirmation, not a new kind of value.`
            : baseInstructions,
        input: enquiry,
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: "apparel_intake",
            strict: true,
            schema,
          },
        },
      }),
    });
    if (!response.ok) {
      console.error(
        JSON.stringify({ event: "openai_request_failed", status: response.status, requestId }),
      );
      return monitoredJson(
        { error: "Analysis is temporarily unavailable. Please try again." },
        {
          status: response.status === 429 ? 503 : 502,
          outcome: "upstream_error",
          startedAt,
          requestId,
          source: "openai",
          headers: { "Retry-After": "30", "X-Request-Id": requestId },
        },
      );
    }
    const result = (await response.json()) as {
      output_text?: string;
      output?: Array<{
        type?: string;
        content?: Array<{ type?: string; text?: string }>;
      }>;
    };
    const outputText =
      result.output_text ??
      result.output
        ?.flatMap((item) => item.content ?? [])
        .find((item) => item.type === "output_text")?.text;
    if (!outputText) throw new AnalysisSchemaError();
    let raw: { fields: Array<Record<string, unknown>> };
    try {
      const parsed = JSON.parse(outputText) as { fields?: unknown };
      if (!Array.isArray(parsed.fields)) throw new AnalysisSchemaError();
      raw = { fields: parsed.fields as Array<Record<string, unknown>> };
    } catch (error) {
      if (error instanceof AnalysisSchemaError) throw error;
      throw new AnalysisSchemaError();
    }
    const modelFields = ensureAllFields(mapFields(raw.fields));
    const localFields = parseEnquiryLocally(enquiry).fields;
    const safeSupplementKeys = new Set(["quantity", "garment_type", "garment_brand", "garment_style", "garment_color", "decoration_method", "print_locations", "print_colors", "deadline", "shipping_pickup"]);
    const conflictSensitiveKeys = new Set(["quantity", "deadline", "print_colors"]);
    const supplemented = modelFields.map((field) => {
      const local = localFields.find((candidate) => candidate.key === field.key);
      if (local?.status === "Conflicting" && conflictSensitiveKeys.has(field.key)) return local;
      if (field.status !== "Missing" || !safeSupplementKeys.has(field.key)) return field;
      return local && local.status !== "Missing" ? local : field;
    });
    const verified = verifyEvidence(enquiry, supplemented);
    const capabilitySafeFields = applyCapabilityFieldSafety(
      enquiry,
      verified.fields,
      capabilityIssues,
    );
    return monitoredJson(
      {
        fields: applyMissingRules(capabilitySafeFields, mode),
        warnings: verified.warnings,
        capabilityIssues,
        source: "openai",
      },
      {
        status: 200,
        outcome: "success",
        startedAt,
        requestId,
        source: "openai",
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    const schemaValidationFailed = error instanceof AnalysisSchemaError;
    console.error(
      JSON.stringify({
        event: timedOut
          ? "analysis_timed_out"
          : schemaValidationFailed
            ? "analysis_schema_validation_failed"
            : "analysis_failed",
        message: error instanceof Error ? error.name : "UnknownError",
        requestId,
      }),
    );
    return monitoredJson(
      { error: timedOut ? "Analysis took too long. Please try again." : "Analysis is temporarily unavailable. Please try again." },
      {
        status: timedOut ? 504 : 502,
        outcome: timedOut
          ? "timeout"
          : schemaValidationFailed
            ? "schema_validation_failed"
            : "upstream_error",
        startedAt,
        requestId,
        source: "openai",
      },
    );
  }
}
