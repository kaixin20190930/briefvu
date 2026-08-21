import { spawnSync } from "node:child_process";
import { summarizeMonitoringRows, type MonitoringPolicyRow } from "../lib/monitoring-policy.ts";

const hoursArgument = Number(process.argv[2] ?? 24);
if (!Number.isInteger(hoursArgument) || hoursArgument < 1 || hoursArgument > 168) {
  console.error("Usage: npm run monitoring:report -- [hours from 1 to 168]");
  process.exit(2);
}

const sql = `SELECT route, outcome, status_code, duration_ms, source
FROM monitoring_events
WHERE created_at >= datetime('now', '-${hoursArgument} hours')
ORDER BY created_at DESC
LIMIT 10000`;

const result = spawnSync(
  "./node_modules/.bin/wrangler",
  [
    "d1",
    "execute",
    "threadline-intake",
    "--remote",
    "--command",
    sql,
    "--json",
  ],
  {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      WRANGLER_LOG_PATH: process.env.WRANGLER_LOG_PATH ?? "/tmp/briefvu-wrangler-logs",
    },
  },
);

if (result.status !== 0) {
  console.error(result.stderr.trim() || "Unable to query production monitoring data.");
  process.exit(result.status ?? 1);
}

let payload: Array<{ results?: MonitoringPolicyRow[] }>;
try {
  payload = JSON.parse(result.stdout) as typeof payload;
} catch {
  console.error("Wrangler returned an unreadable monitoring response.");
  process.exit(1);
}

const rows = payload.flatMap((query) => query.results ?? []);
const report = summarizeMonitoringRows(rows);
const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

console.log(`Briefvu Production Monitoring — last ${hoursArgument}h`);
console.log(`Requests: ${report.total} (${report.analyzeRequests} analyze)`);
console.log(`5xx: ${report.serverErrors} / ${percent(report.serverErrorRate)}`);
console.log(`429: ${report.rateLimited} / ${percent(report.rateLimitRate)}`);
console.log(`Provider failures: ${report.providerFailures} / ${percent(report.providerFailureRate)}`);
console.log(`Schema failures: ${report.schemaFailures} / ${percent(report.schemaValidationFailureRate)}`);
console.log(`P95 latency: ${report.p95LatencyMs}ms`);

if (report.alerts.length === 0) {
  console.log("Status: OK — no thresholds exceeded.");
} else {
  console.log("Status: ATTENTION");
  for (const alert of report.alerts) {
    console.log(`- ${alert.severity} ${alert.code}: ${alert.value} (threshold ${alert.threshold})`);
  }
  process.exitCode = report.alerts.some((alert) => alert.severity === "P0") ? 2 : 1;
}
