import { describe, expect, it } from "vitest";
import { parseEnquiryLocally } from "./demo-parser";
import { applyMissingRules, evidenceFor, verifyEvidence } from "./rules";
import { clarificationDraft, jobSpecJson, jobSpecText } from "./presenters";
import {
  applyMergeDecisions,
  getQuoteReadiness,
  proposeReplyChanges,
} from "./job-rules";
import { applyCapabilityFieldSafety, detectCapabilityIssues } from "./capability-boundaries";

describe("local parser safety behavior", () => {
  it("keeps conflicting quantities unresolved with exact evidence", () => {
    const source = "We need around 50 shirts. Actually make that 75 shirts.";
    const result = parseEnquiryLocally(source);
    const quantity = result.fields.find((field) => field.key === "quantity");
    expect(quantity?.status).toBe("Conflicting");
    expect(quantity?.value).toBe("");
    expect(quantity?.candidates.map((candidate) => candidate.value)).toEqual(["50", "75"]);
    expect(quantity?.candidates.every((candidate) => source.includes(candidate.evidence.snippet))).toBe(true);
  });

  it("detects a quantity followed by a garment color", () => {
    const result = parseEnquiryLocally(
      "We are looking at around 50 black shirts. Actually we will need 75 shirts.",
    );
    const quantity = result.fields.find((field) => field.key === "quantity");
    expect(quantity?.status).toBe("Conflicting");
    expect(quantity?.candidates.map((candidate) => candidate.value)).toEqual(["50", "75"]);
    expect(result.fields.find((field) => field.key === "garment_type")?.value).toBe("shirts");
  });

  it("marks hedged quantities as approximate", () => {
    const result = parseEnquiryLocally("Can you quote about 120 hoodies in black?");
    const quantity = result.fields.find((field) => field.key === "quantity");
    expect(quantity?.value).toBe("120");
    expect(quantity?.status).toBe("Approximate");
  });

  it.each([
    ["36 navy polos", "polos"],
    ["24 black hoodies", "hoodies"],
    ["18 gray jackets", "jackets"],
    ["30 red caps", "caps"],
    ["26 blue jerseys", "jerseys"],
    ["40 natural tote bags", "tote bags"],
  ])("supports a single-product %s enquiry", (phrase, expectedType) => {
    const result = parseEnquiryLocally(`Please quote ${phrase} with our logo.`);
    expect(result.fields.find((field) => field.key === "quantity")?.value).toMatch(/\d+/);
    expect(result.fields.find((field) => field.key === "garment_type")?.value).toBe(expectedType);
  });

  it("does not treat an attached logo as production-ready artwork", () => {
    const result = parseEnquiryLocally("I attached our logo for 25 tees.");
    expect(result.fields.find((field) => field.key === "attachment_claimed")?.value).toBe("Yes");
    expect(result.fields.find((field) => field.key === "artwork_readiness")?.value).toBe("Unknown");
    expect(result.fields.find((field) => field.key === "artwork_readiness")?.status).toBe("Needs Review");
  });

  it("returns real character offsets", () => {
    expect(evidenceFor("Please print 30 shirts", "30 shirts")).toEqual({
      snippet: "30 shirts",
      start: 13,
      end: 22,
    });
  });

  it("rejects unrelated evidence for attachment changes", () => {
    const source = "The event moved to October 20.";
    const fields = parseEnquiryLocally(source).fields.map((field) =>
      field.key === "attachment_claimed"
        ? {
            ...field,
            value: "No",
            status: "Confirmed" as const,
            evidence: { snippet: source, start: 0, end: source.length },
          }
        : field,
    );
    const verified = verifyEvidence(source, fields);
    const attachment = verified.fields.find((field) => field.key === "attachment_claimed");
    expect(attachment?.status).toBe("Missing");
    expect(attachment?.value).toBe("");
  });

  it("drops an unsupported boolean value when the model supplies no evidence", () => {
    const source = "Quote 20 yellow safety vests.";
    const fields = parseEnquiryLocally(source).fields.map((field) =>
      field.key === "artwork_mentioned"
        ? {
            ...field,
            value: "No",
            status: "Confirmed" as const,
            evidence: null,
          }
        : field,
    );
    const verified = verifyEvidence(source, fields);
    const artwork = verified.fields.find((field) => field.key === "artwork_mentioned");
    expect(artwork?.status).toBe("Missing");
    expect(artwork?.value).toBe("");
    expect(verified.warnings).toEqual([]);
  });
});

describe("quote rules and clarification", () => {
  it("makes size breakdown production-later for ballpark mode", () => {
    const fields = applyMissingRules(parseEnquiryLocally("Quote 30 shirts please.").fields, "ballpark");
    expect(fields.find((field) => field.key === "size_breakdown")?.missingPriority).toBe("Production Later");
  });

  it("asks conflicts before missing details", () => {
    const fields = applyMissingRules(parseEnquiryLocally("Maybe 40 shirts or actually 60 shirts.").fields, "formal");
    const draft = clarificationDraft(fields);
    expect(draft.indexOf("40 or 60")).toBeLessThan(draft.indexOf("decoration method"));
  });

  it("uses quote-ready wording instead of a clarification when nothing remains", () => {
    const fields = applyMissingRules(
      parseEnquiryLocally(
        "Quote 75 Gildan 5000 black shirts with screen printing on the front by October 15.",
      ).fields,
      "ballpark",
    ).map((field) =>
      field.missingPriority === "Price Affecting"
        ? { ...field, status: "Not Applicable" as const, missingPriority: undefined }
        : field,
    );
    expect(clarificationDraft(fields, "ballpark")).toContain("ballpark estimate");
  });

  it("puts a personalization roster request in the clarification draft", () => {
    const source = "Quote 20 safety vests with each employee's name on the front.";
    const fields = applyMissingRules(parseEnquiryLocally(source).fields, "formal");
    const draft = clarificationDraft(fields, "formal", detectCapabilityIssues(source));
    expect(draft).toContain("personalization roster");
    expect(draft).toContain("garment size");
  });

  it("asks to split a multi-product order instead of choosing one product", () => {
    const source = "Please quote 100 tote bags and 60 caps with different designs.";
    const fields = applyMissingRules(parseEnquiryLocally(source).fields, "formal");
    const draft = clarificationDraft(fields, "formal", detectCapabilityIssues(source));
    expect(draft).toContain("split this enquiry into one job per product");
    expect(draft).not.toContain("final quantity");
    expect(draft).not.toContain("final garment type");
    expect(draft).not.toContain("preferred garment brand");
  });

  it("exports a multi-product order as a manual-review draft with conflict evidence", () => {
    const source = "Please quote 100 natural tote bags with a screen print and 60 red caps with embroidery, using different designs for each product.";
    const capabilityIssues = detectCapabilityIssues(source);
    const fields = applyMissingRules(
      applyCapabilityFieldSafety(source, parseEnquiryLocally(source).fields, capabilityIssues),
      "formal",
    );

    const text = jobSpecText(fields, "formal", "not_ready", capabilityIssues);
    expect(text).toContain("DRAFT JOB SPEC — MANUAL REVIEW REQUIRED");
    expect(text).not.toContain("QUOTE-READY JOB SPEC");
    expect(text).toContain("Split this multi-product enquiry");
    expect(text).toContain("100 natural tote bags");
    expect(text).toContain("60 red caps");
    expect(text).not.toContain("File received\nUnknown");

    const json = JSON.parse(jobSpecJson(fields, "formal", "not_ready", capabilityIssues));
    expect(json.exportStatus).toBe("manual_review_required");
    expect(json.readiness).toBe("not_ready");
    expect(json.capabilityIssues[0].code).toBe("multi_product_order");
    expect(json.fields.quantity.candidates.map((candidate: { value: string }) => candidate.value)).toEqual(["100", "60"]);
    expect(json.fields.garment_type.candidates.map((candidate: { value: string }) => candidate.value)).toEqual(["tote bags", "caps"]);
    expect(json.outstanding.fields).toContain("quantity");
    expect(json.outstanding.capabilities).toContain("multi_product_order");
  });

  it("removes a model-generated full-enquiry note from multi-product output", () => {
    const source = "Please quote 100 tote bags and 60 caps with different designs.";
    const capabilityIssues = detectCapabilityIssues(source);
    const parsed = parseEnquiryLocally(source).fields.map((field) =>
      field.key === "notes"
        ? { ...field, value: source, status: "Confirmed" as const }
        : field,
    );
    const safe = applyCapabilityFieldSafety(source, parsed, capabilityIssues);
    const notes = safe.find((field) => field.key === "notes");
    expect(notes?.value).toBe("");
    expect(notes?.status).toBe("Ambiguous");
  });
});

describe("customer reply loop", () => {
  it("proposes confirming an approximate value without mutating the job", () => {
    const existing = parseEnquiryLocally("Please quote about 80 shirts.").fields;
    const reply = parseEnquiryLocally("Let's do 80 exactly.").fields;
    const changes = proposeReplyChanges(existing, reply, "reply-1", "Customer reply 1");
    const quantity = changes.find((change) => change.key === "quantity");

    expect(quantity?.action).toBe("confirm_existing");
    expect(existing.find((field) => field.key === "quantity")?.status).toBe("Approximate");
    expect(quantity?.evidence?.sourceMessageId).toBe("reply-1");
  });

  it("requires a reviewed replacement before changing a confirmed quantity", () => {
    const existing = parseEnquiryLocally("We need 50 shirts.").fields;
    const reply = parseEnquiryLocally("Actually, make it 75.").fields;
    const changes = proposeReplyChanges(existing, reply, "reply-1", "Customer reply 1");
    const quantity = changes.find((change) => change.key === "quantity")!;

    expect(quantity.action).toBe("replace_existing");
    expect(quantity.decision).toBe("pending");
    expect(existing.find((field) => field.key === "quantity")?.value).toBe("50");

    quantity.decision = "accepted";
    const merged = applyMergeDecisions(existing, changes, "reply-1");
    expect(merged.fields.find((field) => field.key === "quantity")?.value).toBe("75");
  });

  it("keeps new conflicts unresolved after approval", () => {
    const existing = parseEnquiryLocally("We need 40 shirts.").fields;
    const reply = parseEnquiryLocally("Maybe 50 shirts, but the organizer said 75 shirts.").fields;
    const changes = proposeReplyChanges(existing, reply, "reply-2", "Customer reply 2");
    const quantity = changes.find((change) => change.key === "quantity")!;
    expect(quantity.action).toBe("create_conflict");

    quantity.decision = "accepted";
    const merged = applyMergeDecisions(existing, changes, "reply-2");
    const finalQuantity = merged.fields.find((field) => field.key === "quantity");
    expect(finalQuantity?.status).toBe("Conflicting");
    expect(finalQuantity?.value).toBe("");
    expect(getQuoteReadiness(merged.fields, "formal")).toBe("not_ready");
  });

  it("extracts standalone reply details", () => {
    const reply = parseEnquiryLocally(
      "Let's do 80 exactly. Gildan 5000 works. The logo is two colors. Event is October 15.",
    );
    expect(reply.fields.find((field) => field.key === "quantity")?.value).toBe("80");
    expect(reply.fields.find((field) => field.key === "garment_style")?.value).toBe("5000");
    expect(reply.fields.find((field) => field.key === "print_colors")?.value).toBe("2");
    expect(reply.fields.find((field) => field.key === "deadline")?.value).toBe("October 15");
  });

  it("replaces a confirmed deadline only after the reviewer accepts it", () => {
    const existing = parseEnquiryLocally("We need everything by October 10.").fields;
    const reply = parseEnquiryLocally("The event moved to October 15.").fields;
    const changes = proposeReplyChanges(existing, reply, "reply-1", "Customer reply 1");
    const deadline = changes.find((change) => change.key === "deadline")!;

    expect(deadline.action).toBe("replace_existing");
    expect(deadline.proposedValue).toBe("October 15");
    deadline.decision = "accepted";

    const merged = applyMergeDecisions(existing, changes, "reply-1");
    expect(merged.fields.find((field) => field.key === "deadline")?.value).toBe("October 15");
    expect(merged.fields.find((field) => field.key === "deadline")?.evidence?.sourceLabel).toBe("Customer reply 1");
  });

  it("does not duplicate a structured reply update into notes", () => {
    const existing = parseEnquiryLocally("We need everything by October 10.").fields;
    const reply = parseEnquiryLocally("The event moved to October 15.").fields.map((field) =>
      field.key === "notes"
        ? {
            ...field,
            value: "Follow-up: event date change",
            status: "Confirmed" as const,
            evidence: evidenceFor("The event moved to October 15.", "The event moved to October 15."),
          }
        : field,
    );
    const changes = proposeReplyChanges(existing, reply, "reply-1", "Customer reply 1");
    expect(changes.some((change) => change.key === "deadline")).toBe(true);
    expect(changes.some((change) => change.key === "notes")).toBe(false);
  });

  it("does not propose sentinel missing values from a reply", () => {
    const existing = parseEnquiryLocally("I attached the logo for 50 shirts.").fields;
    const reply = parseEnquiryLocally("The event moved to October 15.").fields.map((field) =>
      field.key === "attachment_claimed"
        ? { ...field, value: "Missing", status: "Needs Review" as const }
        : field,
    );
    const changes = proposeReplyChanges(existing, reply, "reply-1", "Customer reply 1");
    expect(changes.some((change) => change.key === "attachment_claimed")).toBe(false);
  });
});
