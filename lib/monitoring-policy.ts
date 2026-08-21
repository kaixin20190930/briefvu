export const monitoringThresholds = {
  windowHours: 24,
  minimumRequestsForRateAlerts: 20,
  serverErrorCount: 3,
  serverErrorRate: 0.05,
  rateLimitRate: 0.05,
  providerFailureRate: 0.05,
  schemaValidationFailureRate: 0.03,
  p95LatencyMs: 15_000,
} as const;

export interface MonitoringPolicyRow {
  route: "analyze" | "events" | "pilot";
  outcome:
    | "success"
    | "validation_error"
    | "rate_limited"
    | "upstream_error"
    | "schema_validation_failed"
    | "timeout"
    | "storage_error"
    | "bot_accepted";
  status_code: number;
  duration_ms: number;
  source: "none" | "openai" | "demo";
}

export interface MonitoringAlert {
  code: string;
  severity: "P0" | "P1";
  value: number;
  threshold: number;
}

function rate(count: number, denominator: number) {
  return denominator > 0 ? count / denominator : 0;
}

function percentile(values: number[], percentileValue: number) {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((left, right) => left - right);
  const index = Math.max(0, Math.ceil(percentileValue * ordered.length) - 1);
  return ordered[index];
}

export function summarizeMonitoringRows(rows: MonitoringPolicyRow[]) {
  const total = rows.length;
  const serverErrors = rows.filter((row) => row.status_code >= 500).length;
  const rateLimited = rows.filter((row) => row.status_code === 429).length;
  const analyzeRows = rows.filter((row) => row.route === "analyze");
  const providerFailures = analyzeRows.filter((row) =>
    ["upstream_error", "schema_validation_failed", "timeout"].includes(row.outcome)
  ).length;
  const schemaFailures = analyzeRows.filter(
    (row) => row.outcome === "schema_validation_failed",
  ).length;
  const serverErrorRate = rate(serverErrors, total);
  const rateLimitRate = rate(rateLimited, total);
  const providerFailureRate = rate(providerFailures, analyzeRows.length);
  const schemaValidationFailureRate = rate(schemaFailures, analyzeRows.length);
  const p95LatencyMs = percentile(rows.map((row) => row.duration_ms), 0.95);
  const alerts: MonitoringAlert[] = [];

  if (serverErrors >= monitoringThresholds.serverErrorCount) {
    alerts.push({ code: "server_error_count", severity: "P0", value: serverErrors, threshold: monitoringThresholds.serverErrorCount });
  }
  if (total >= monitoringThresholds.minimumRequestsForRateAlerts && serverErrorRate > monitoringThresholds.serverErrorRate) {
    alerts.push({ code: "server_error_rate", severity: "P0", value: serverErrorRate, threshold: monitoringThresholds.serverErrorRate });
  }
  if (total >= monitoringThresholds.minimumRequestsForRateAlerts && rateLimitRate > monitoringThresholds.rateLimitRate) {
    alerts.push({ code: "rate_limit_rate", severity: "P1", value: rateLimitRate, threshold: monitoringThresholds.rateLimitRate });
  }
  if (analyzeRows.length >= monitoringThresholds.minimumRequestsForRateAlerts && providerFailureRate > monitoringThresholds.providerFailureRate) {
    alerts.push({ code: "provider_failure_rate", severity: "P0", value: providerFailureRate, threshold: monitoringThresholds.providerFailureRate });
  }
  if (analyzeRows.length >= monitoringThresholds.minimumRequestsForRateAlerts && schemaValidationFailureRate > monitoringThresholds.schemaValidationFailureRate) {
    alerts.push({ code: "schema_validation_failure_rate", severity: "P0", value: schemaValidationFailureRate, threshold: monitoringThresholds.schemaValidationFailureRate });
  }
  if (total > 0 && p95LatencyMs > monitoringThresholds.p95LatencyMs) {
    alerts.push({ code: "p95_latency", severity: "P1", value: p95LatencyMs, threshold: monitoringThresholds.p95LatencyMs });
  }

  return {
    total,
    analyzeRequests: analyzeRows.length,
    serverErrors,
    serverErrorRate,
    rateLimited,
    rateLimitRate,
    providerFailures,
    providerFailureRate,
    schemaFailures,
    schemaValidationFailureRate,
    p95LatencyMs,
    alerts,
  };
}
