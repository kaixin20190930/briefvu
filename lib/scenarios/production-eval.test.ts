import { describe, expect, it } from "vitest";
import { getQuoteReadiness } from "../job-rules";
import type { ExtractedField, FieldKey, FieldStatus } from "../types";
import type { CapabilityIssue } from "../types";
import { publishedScenarios, scenarioRegistry } from "./registry";

type LiveField = {
  key: FieldKey;
  value: string;
  status: FieldStatus;
  candidates?: Array<{ value: string; evidence?: { snippet?: string } }>;
  evidence?: { snippet: string } | null;
};

type LiveAnalysis = {
  fields: LiveField[];
  source: "openai" | "demo";
  warnings: string[];
  capabilityIssues?: CapabilityIssue[];
};

const baseUrl = process.env.SCENARIO_EVAL_BASE_URL?.replace(/\/$/, "");
const scope = process.env.SCENARIO_EVAL_SCOPE ?? "published";
const requestedIds = new Set(
  (process.env.SCENARIO_EVAL_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean),
);
const scopedScenarios = scope === "all"
  ? scenarioRegistry
  : scope === "supported"
    ? scenarioRegistry.filter((scenario) => scenario.capability.status === "supported")
    : publishedScenarios;
const evaluatedScenarios = requestedIds.size
  ? scopedScenarios.filter((scenario) => requestedIds.has(scenario.id))
  : scopedScenarios;
const liveDescribe = baseUrl ? describe : describe.skip;

function comparable(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function valuesMatch(actual: string, expected: string) {
  const left = comparable(actual);
  const right = comparable(expected);
  return left === right || left.includes(right) || right.includes(left);
}

function sizeBreakdownMatches(actual: string, expected: string) {
  const pairs = (value: string) => Array.from(
    value.toUpperCase().matchAll(/(\d+)\s*(XS|S|M|L|XL|2XL|3XL|4XL)/g),
    (match) => `${match[1]}:${match[2]}`,
  );
  return JSON.stringify(pairs(actual)) === JSON.stringify(pairs(expected));
}

function assertFieldSafety(result: LiveAnalysis, enquiry: string, scenarioId: string) {
  for (const field of result.fields) {
    if (field.status === "Missing" || field.status === "Not Applicable") {
      expect(field.value, `${scenarioId}:${field.key} missing sentinel`).toBe("");
      expect(field.evidence ?? null, `${scenarioId}:${field.key} missing evidence`).toBeNull();
    }
    if (field.status === "Conflicting") {
      expect(field.value, `${scenarioId}:${field.key} conflicting value`).toBe("");
      expect((field.candidates?.length ?? 0) > 1, `${scenarioId}:${field.key} candidates`).toBe(true);
    } else {
      expect(field.candidates ?? [], `${scenarioId}:${field.key} unexpected candidates`).toEqual([]);
    }
    if (field.evidence?.snippet) {
      expect(enquiry.includes(field.evidence.snippet), `${scenarioId}:${field.key} evidence`).toBe(true);
    }
    for (const candidate of field.candidates ?? []) {
      if (candidate.evidence?.snippet) {
        expect(enquiry.includes(candidate.evidence.snippet), `${scenarioId}:${field.key} candidate evidence`).toBe(true);
      }
    }
  }
  expect(result.warnings.some((warning) => warning.startsWith("File received:")), `${scenarioId}:file warning`).toBe(false);
}

async function analyze(enquiry: string, mode: "ballpark" | "formal", kind: "initial" | "reply") {
  const response = await fetch(`${baseUrl}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enquiry, mode, kind }),
  });
  if (!response.ok) {
    throw new Error(`Production analysis failed (${response.status}): ${await response.text()}`);
  }
  return await response.json() as LiveAnalysis;
}

liveDescribe(`${scope} scenario production evaluation`, () => {
  it.each(evaluatedScenarios)("$id passes its production extraction contract", async (scenario) => {
    const result = await analyze(scenario.initialEnquiry, scenario.taxonomy.quoteModes[0], "initial");
    expect(result.source).toBe("openai");
    assertFieldSafety(result, scenario.initialEnquiry, scenario.id);
    for (const expected of scenario.expectations) {
      const actual = result.fields.find((field) => field.key === expected.key);
      expect(actual, `${scenario.id}:${expected.key}`).toBeDefined();
      const matches = expected.key === "size_breakdown"
        ? sizeBreakdownMatches(actual?.value ?? "", expected.value)
        : valuesMatch(actual?.value ?? "", expected.value);
      expect(matches, `${scenario.id}:${expected.key}=${actual?.value}`).toBe(true);
      if (expected.status) expect(actual?.status).toBe(expected.status);
    }

    const issues = result.capabilityIssues ?? [];
    if (scenario.capability.status === "supported") {
      expect(issues, `${scenario.id}: unexpected capability issue`).toEqual([]);
    }
    if (scenario.capability.status === "partial") {
      const expectedCode = scenario.taxonomy.intakeProblems.includes("design-spec-matrix")
        ? "design_spec_matrix"
        : "personalization_matrix";
      expect(issues.map((issue) => issue.code), scenario.id).toContain(expectedCode);
      expect(getQuoteReadiness(result.fields as ExtractedField[], scenario.taxonomy.quoteModes[0], issues)).toBe("not_ready");
    }
    if (scenario.capability.status === "unsupported") {
      expect(issues.map((issue) => issue.code), scenario.id).toContain("multi_product_order");
      expect(result.fields.find((field) => field.key === "garment_type")?.status).toBe("Conflicting");
      expect(result.fields.find((field) => field.key === "print_locations")?.value).toBe("");
      expect(getQuoteReadiness(result.fields as ExtractedField[], scenario.taxonomy.quoteModes[0], issues)).toBe("not_ready");
    }
    if (scenario.id === "M18") {
      const printColors = result.fields.find((field) => field.key === "print_colors");
      expect(["Conflicting", "Needs Review"], "M18 must not collapse design-specific colors").toContain(printColors?.status);
    }
    if (scenario.id === "M19") {
      const deadline = result.fields.find((field) => field.key === "deadline");
      expect(deadline?.status, "M19 deadline status").toBe("Conflicting");
      expect(deadline?.candidates?.map((candidate) => comparable(candidate.value))).toEqual([
        comparable("November 3"),
        comparable("November 10"),
      ]);
    }
  }, 45_000);

  it("M01 extracts every reply replacement before the local merge review", async () => {
    if (requestedIds.size && !requestedIds.has("M01")) return;
    const scenario = publishedScenarios.find((item) => item.id === "M01")!;
    const result = await analyze(scenario.replies[0].text, scenario.taxonomy.quoteModes[0], "reply");
    assertFieldSafety(result, scenario.replies[0].text, "M01-reply");
    for (const key of scenario.replies[0].expectedChanges) {
      const field = result.fields.find((item) => item.key === key);
      expect(field, key).toBeDefined();
      expect(field?.status, key).not.toBe("Missing");
      expect(field?.value, key).not.toBe("");
    }
  }, 45_000);

  it("M20 extracts DTF as a reply replacement candidate", async () => {
    if (requestedIds.size && !requestedIds.has("M20")) return;
    const scenario = scenarioRegistry.find((item) => item.id === "M20")!;
    const result = await analyze(scenario.replies[0].text, scenario.taxonomy.quoteModes[0], "reply");
    assertFieldSafety(result, scenario.replies[0].text, "M20-reply");
    const method = result.fields.find((field) => field.key === "decoration_method");
    expect(method?.value).toBe("DTF");
    expect(method?.status).not.toBe("Missing");
  }, 45_000);
});
