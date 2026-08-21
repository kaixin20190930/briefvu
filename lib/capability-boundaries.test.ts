import { describe, expect, it } from "vitest";
import {
  applyCapabilityFieldSafety,
  detectCapabilityIssues,
} from "./capability-boundaries";
import { parseEnquiryLocally } from "./demo-parser";
import { getQuoteReadiness } from "./job-rules";

describe("capability boundary safety", () => {
  it("blocks and preserves exact candidates for a multi-product order", () => {
    const source = "We need scrub tops for nurses, jackets for reception and polos for managers.";
    const issues = detectCapabilityIssues(source);
    const fields = applyCapabilityFieldSafety(
      source,
      parseEnquiryLocally(source).fields,
      issues,
    );
    const garment = fields.find((field) => field.key === "garment_type");

    expect(issues.map((issue) => issue.code)).toContain("multi_product_order");
    expect(garment?.status).toBe("Conflicting");
    expect(garment?.candidates.map((candidate) => candidate.value)).toEqual([
      "scrub tops",
      "jackets",
      "polos",
    ]);
    expect(fields.find((field) => field.key === "print_locations")?.value).toBe("");
    expect(fields.find((field) => field.key === "print_locations")?.status).toBe("Ambiguous");
    expect(getQuoteReadiness(fields, "formal", issues)).toBe("not_ready");
  });

  it("blocks a per-person personalization matrix", () => {
    const source = "We need 26 jerseys with each player's name and number on the back.";
    const issues = detectCapabilityIssues(source);
    const fields = parseEnquiryLocally(source).fields;

    expect(issues.map((issue) => issue.code)).toEqual(["personalization_matrix"]);
    expect(getQuoteReadiness(fields, "ballpark", issues)).toBe("not_ready");
  });

  it("does not flag a normal single-product enquiry", () => {
    expect(
      detectCapabilityIssues("Please quote 60 red caps embroidered on the front."),
    ).toEqual([]);
  });

  it("treats shirt, T-shirt and tee wording as one product family", () => {
    expect(
      detectCapabilityIssues(
        "We first planned 50 shirts, but now need 75 black T-shirts with the same tee design.",
      ),
    ).toEqual([]);
  });
});
