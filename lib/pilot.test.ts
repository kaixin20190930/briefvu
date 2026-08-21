import { describe, expect, it } from "vitest";
import { parsePilotApplication } from "./pilot";

describe("pilot application validation", () => {
  it("normalizes a valid application", () => {
    const result = parsePilotApplication({
      shopName: "  Northside Print Co. ",
      contactName: " Jordan Lee ",
      email: " OWNER@EXAMPLE.COM ",
      weeklyEnquiries: "31-75",
      currentWorkflow: "printavo",
      notes: "We want fewer clarification emails.",
      consent: true,
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.email).toBe("owner@example.com");
      expect(result.data.shopName).toBe("Northside Print Co.");
    }
  });

  it("rejects missing consent and unsupported select values", () => {
    expect(parsePilotApplication({
      shopName: "Northside",
      contactName: "Jordan",
      email: "owner@example.com",
      weeklyEnquiries: "hundreds",
      currentWorkflow: "unknown-crm",
      consent: false,
    }).valid).toBe(false);
  });

  it("keeps the honeypot value available for silent bot handling", () => {
    const result = parsePilotApplication({
      shopName: "Northside",
      contactName: "Jordan",
      email: "owner@example.com",
      weeklyEnquiries: "0-10",
      currentWorkflow: "email",
      website: "https://spam.example",
      consent: true,
    });
    expect(result.valid && result.data.website).toBe("https://spam.example");
  });
});
