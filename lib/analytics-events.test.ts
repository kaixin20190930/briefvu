import { describe, expect, it } from "vitest";
import {
  isAnalyticsEventName,
  isValidAnalyticsSessionId,
  sanitizeEventMetadata,
} from "./analytics-events";

describe("analytics event privacy", () => {
  it("keeps only the numeric and enum metadata required by an event", () => {
    expect(sanitizeEventMetadata("analysis_completed", {
      input_length: 129,
      extracted_fields: 5,
      quote_mode: "formal",
      source: "openai",
      enquiry: "Please quote 100 natural tote bags",
      evidence: "100 natural tote bags",
    })).toEqual({
      input_length: 129,
      extracted_fields: 5,
      quote_mode: "formal",
      source: "openai",
    });
  });

  it("drops arbitrary strings even when they use an allowed metadata key", () => {
    expect(sanitizeEventMetadata("field_accepted", {
      field: "Customer email text disguised as a field",
    })).toEqual({});
  });

  it("requires a generated UUID session id", () => {
    expect(isValidAnalyticsSessionId("1396db78-6861-466e-b96f-1622c9b24101")).toBe(true);
    expect(isValidAnalyticsSessionId("customer@example.com")).toBe(false);
    expect(isValidAnalyticsSessionId("Fall fundraiser shirts")).toBe(false);
  });

  it("rejects unknown event names", () => {
    expect(isAnalyticsEventName("analysis_completed")).toBe(true);
    expect(isAnalyticsEventName("store_customer_enquiry")).toBe(false);
  });
});
