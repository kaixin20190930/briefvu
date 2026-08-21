import { describe, expect, it } from "vitest";
import { parseEnquiryLocally } from "../demo-parser";
import { applyCapabilityFieldSafety, detectCapabilityIssues } from "../capability-boundaries";
import { applyMergeDecisions, getQuoteReadiness, proposeReplyChanges } from "../job-rules";
import { publishedScenarios, scenarioRegistry } from "./registry";
import { summarizeScenarioCoverage, validateScenarioRegistry } from "./validate";

function comparable(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

describe("scenario registry v2", () => {
  it("passes structural and publication safety validation", () => {
    expect(validateScenarioRegistry(scenarioRegistry)).toEqual([]);
    expect(scenarioRegistry).toHaveLength(24);
    expect(publishedScenarios.every((scenario) => scenario.capability.status === "supported")).toBe(true);
  });

  it("reports product and SEO coverage from one source", () => {
    const coverage = summarizeScenarioCoverage(scenarioRegistry);
    expect(coverage.total).toBe(24);
    expect(coverage.capability.supported).toBe(17);
    expect(coverage.capability.partial).toBe(4);
    expect(coverage.capability.unsupported).toBe(3);
    expect(coverage.seo.published).toBe(3);
    expect(coverage.seo.candidate).toBe(10);
    expect(coverage.seo.internal).toBe(11);
    expect(publishedScenarios.every((scenario) => scenario.seo.outcome && scenario.seo.lessons?.length)).toBe(true);
  });

  it.each(scenarioRegistry.filter((scenario) => scenario.capability.status !== "unsupported"))(
    "$id extracts the conservative expected field set",
    (scenario) => {
      const result = parseEnquiryLocally(scenario.initialEnquiry);
      for (const expected of scenario.expectations) {
        const actual = result.fields.find((field) => field.key === expected.key);
        expect(comparable(actual?.value ?? ""), expected.key).toBe(comparable(expected.value));
        if (expected.status) expect(actual?.status).toBe(expected.status);
      }
    },
  );

  it("M01 reply proposes and applies the new deadline", () => {
    const scenario = scenarioRegistry.find((item) => item.id === "M01")!;
    const existing = parseEnquiryLocally(scenario.initialEnquiry).fields;
    const reply = parseEnquiryLocally(scenario.replies[0].text).fields;
    const changes = proposeReplyChanges(existing, reply, "reply-1", "Customer reply 1");
    for (const key of scenario.replies[0].expectedChanges) {
      expect(changes.some((change) => change.key === key), key).toBe(true);
    }
    for (const change of changes) change.decision = "accepted";
    const merged = applyMergeDecisions(existing, changes, "reply-1");
    expect(merged.fields.find((field) => field.key === "deadline")?.value).toBe("October 15");
  });

  it("M19 keeps both conflicting deadlines and exact evidence", () => {
    const scenario = scenarioRegistry.find((item) => item.id === "M19")!;
    const deadline = parseEnquiryLocally(scenario.initialEnquiry).fields.find(
      (field) => field.key === "deadline",
    );
    expect(deadline?.status).toBe("Conflicting");
    expect(deadline?.candidates.map((candidate) => candidate.value)).toEqual([
      "November 3",
      "November 10",
    ]);
    expect(deadline?.candidates.every((candidate) =>
      scenario.initialEnquiry.includes(candidate.evidence.snippet))).toBe(true);
  });

  it("M20 requires review before replacing the decoration method", () => {
    const scenario = scenarioRegistry.find((item) => item.id === "M20")!;
    const existing = parseEnquiryLocally(scenario.initialEnquiry).fields;
    const reply = parseEnquiryLocally(scenario.replies[0].text).fields;
    const changes = proposeReplyChanges(existing, reply, "reply-1", "Customer reply 1");
    const method = changes.find((change) => change.key === "decoration_method")!;

    expect(method.action).toBe("replace_existing");
    expect(method.decision).toBe("pending");
    expect(existing.find((field) => field.key === "decoration_method")?.value).toBe("screen printing");
    method.decision = "accepted";
    const merged = applyMergeDecisions(existing, changes, "reply-1");
    expect(merged.fields.find((field) => field.key === "decoration_method")?.value).toBe("DTF");
  });

  it.each(["M21", "M22"])("%s blocks an unsupported personalization matrix", (id) => {
    const scenario = scenarioRegistry.find((item) => item.id === id)!;
    const issues = detectCapabilityIssues(scenario.initialEnquiry);
    expect(issues.map((issue) => issue.code)).toContain("personalization_matrix");
    expect(getQuoteReadiness(parseEnquiryLocally(scenario.initialEnquiry).fields, "formal", issues)).toBe("not_ready");
  });

  it.each(["M23", "M24"])("%s blocks and clears a multi-product job", (id) => {
    const scenario = scenarioRegistry.find((item) => item.id === id)!;
    const issues = detectCapabilityIssues(scenario.initialEnquiry);
    const fields = applyCapabilityFieldSafety(
      scenario.initialEnquiry,
      parseEnquiryLocally(scenario.initialEnquiry).fields,
      issues,
    );
    expect(issues.map((issue) => issue.code)).toContain("multi_product_order");
    expect(fields.find((field) => field.key === "garment_type")?.status).toBe("Conflicting");
    expect(fields.find((field) => field.key === "print_locations")?.value).toBe("");
    expect(getQuoteReadiness(fields, "formal", issues)).toBe("not_ready");
  });

  it("M13 explicit no-personalization statement does not create a false blocker", () => {
    const scenario = scenarioRegistry.find((item) => item.id === "M13")!;
    expect(detectCapabilityIssues(scenario.initialEnquiry)).toEqual([]);
  });

  it("M18 blocks a design-specific color matrix and preserves both color candidates", () => {
    const scenario = scenarioRegistry.find((item) => item.id === "M18")!;
    const issues = detectCapabilityIssues(scenario.initialEnquiry);
    const printColors = parseEnquiryLocally(scenario.initialEnquiry).fields.find(
      (field) => field.key === "print_colors",
    );
    expect(issues.map((issue) => issue.code)).toContain("design_spec_matrix");
    expect(printColors?.status).toBe("Conflicting");
    expect(printColors?.candidates.map((candidate) => candidate.value)).toEqual(["1", "2"]);
    expect(getQuoteReadiness(parseEnquiryLocally(scenario.initialEnquiry).fields, "formal", issues)).toBe("not_ready");
  });
});
