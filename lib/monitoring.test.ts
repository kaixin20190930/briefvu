import { describe, expect, it, vi } from "vitest";
import { createMonitoringRecord } from "./monitoring";
import { summarizeMonitoringRows, type MonitoringPolicyRow } from "./monitoring-policy";

function row(overrides: Partial<MonitoringPolicyRow> = {}): MonitoringPolicyRow {
  return {
    route: "analyze",
    outcome: "success",
    status_code: 200,
    duration_ms: 800,
    source: "openai",
    ...overrides,
  };
}

describe("production monitoring privacy", () => {
  it("creates an allowlisted record without request content or arbitrary metadata", () => {
    vi.spyOn(Date, "now").mockReturnValue(20_000);
    const record = createMonitoringRecord({
      route: "analyze",
      outcome: "success",
      statusCode: 200,
      startedAt: 18_750,
      requestId: "1396db78-6861-466e-b96f-1622c9b24101",
      source: "openai",
    });

    expect(record).toEqual({
      event: "api_request_completed",
      route: "analyze",
      outcome: "success",
      status_code: 200,
      duration_ms: 1_250,
      source: "openai",
      request_id: "1396db78-6861-466e-b96f-1622c9b24101",
    });
    expect(JSON.stringify(record)).not.toContain("enquiry");
    expect(JSON.stringify(record)).not.toContain("evidence");
    vi.restoreAllMocks();
  });
});

describe("production monitoring thresholds", () => {
  it("stays quiet below the minimum sample size when only a rate is elevated", () => {
    const report = summarizeMonitoringRows([
      row({ outcome: "upstream_error", status_code: 502 }),
      row(),
    ]);
    expect(report.providerFailureRate).toBe(0.5);
    expect(report.alerts).toEqual([]);
  });

  it("raises P0 alerts for repeated server and provider failures", () => {
    const rows = Array.from({ length: 20 }, (_, index) =>
      index < 3
        ? row({ outcome: "upstream_error", status_code: 502 })
        : row(),
    );
    const report = summarizeMonitoringRows(rows);
    expect(report.alerts.map((alert) => alert.code)).toEqual([
      "server_error_count",
      "server_error_rate",
      "provider_failure_rate",
    ]);
    expect(report.alerts.every((alert) => alert.severity === "P0")).toBe(true);
  });

  it("uses nearest-rank P95 and flags slow production traffic", () => {
    const rows = Array.from({ length: 20 }, (_, index) =>
      row({ duration_ms: index === 18 ? 15_001 : index === 19 ? 30_000 : 500 }),
    );
    const report = summarizeMonitoringRows(rows);
    expect(report.p95LatencyMs).toBe(15_001);
    expect(report.alerts).toContainEqual({
      code: "p95_latency",
      severity: "P1",
      value: 15_001,
      threshold: 15_000,
    });
  });
});
