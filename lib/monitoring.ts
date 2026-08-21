import { getCloudflareContext } from "@opennextjs/cloudflare";
export { monitoringThresholds, summarizeMonitoringRows } from "./monitoring-policy";

export const monitoringRoutes = ["analyze", "events", "pilot"] as const;
export type MonitoringRoute = (typeof monitoringRoutes)[number];

export const monitoringOutcomes = [
  "success",
  "validation_error",
  "rate_limited",
  "upstream_error",
  "schema_validation_failed",
  "timeout",
  "storage_error",
  "bot_accepted",
] as const;
export type MonitoringOutcome = (typeof monitoringOutcomes)[number];
export type MonitoringSource = "none" | "openai" | "demo";

export interface MonitoringEventInput {
  route: MonitoringRoute;
  outcome: MonitoringOutcome;
  statusCode: number;
  startedAt: number;
  requestId: string;
  source?: MonitoringSource;
}

function clampInteger(value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}

export function createMonitoringRecord(input: MonitoringEventInput) {
  return {
    event: "api_request_completed" as const,
    route: input.route,
    outcome: input.outcome,
    status_code: clampInteger(input.statusCode, 100, 599),
    duration_ms: clampInteger(Date.now() - input.startedAt, 0, 120_000),
    source: input.source ?? "none",
    request_id: input.requestId,
  };
}

export async function recordMonitoringEvent(input: MonitoringEventInput) {
  const record = createMonitoringRecord(input);
  console.log(JSON.stringify(record));

  try {
    const { env, ctx } = await getCloudflareContext({ async: true });
    if (!env.DB) return;
    const write = env.DB.prepare(
      `INSERT INTO monitoring_events (
         id, route, outcome, status_code, duration_ms, source, request_id
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        record.route,
        record.outcome,
        record.status_code,
        record.duration_ms,
        record.source,
        record.request_id,
      )
      .run()
      .then(() => undefined)
      .catch(() => {
        console.warn(JSON.stringify({
          event: "monitoring_write_failed",
          route: record.route,
          request_id: record.request_id,
        }));
      });
    ctx.waitUntil(write);
  } catch {
    console.warn(JSON.stringify({
      event: "monitoring_context_unavailable",
      route: record.route,
      request_id: record.request_id,
    }));
  }
}
