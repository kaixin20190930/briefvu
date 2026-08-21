import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import {
  isAnalyticsEventName,
  isValidAnalyticsSessionId,
  sanitizeEventMetadata,
} from "@/lib/analytics-events";
import { recordMonitoringEvent } from "@/lib/monitoring";

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  let body: { sessionId?: unknown; name?: unknown; metadata?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    await recordMonitoringEvent({
      route: "events",
      outcome: "validation_error",
      statusCode: 400,
      startedAt,
      requestId,
    });
    return NextResponse.json(
      { error: "Invalid event." },
      { status: 400, headers: { "X-Request-Id": requestId } },
    );
  }
  if (
    typeof body.sessionId !== "string" ||
    typeof body.name !== "string" ||
    !isValidAnalyticsSessionId(body.sessionId) ||
    !isAnalyticsEventName(body.name)
  ) {
    await recordMonitoringEvent({
      route: "events",
      outcome: "validation_error",
      statusCode: 400,
      startedAt,
      requestId,
    });
    return NextResponse.json(
      { error: "Invalid event." },
      { status: 400, headers: { "X-Request-Id": requestId } },
    );
  }

  const metadata = JSON.stringify(sanitizeEventMetadata(body.name, body.metadata));
  let storageFailed = false;
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (env.DB) {
      await env.DB.prepare(
        "INSERT INTO analytics_events (id, session_id, event_name, metadata) VALUES (?, ?, ?, ?)",
      )
        .bind(crypto.randomUUID(), body.sessionId, body.name, metadata)
        .run();
    }
  } catch (error) {
    storageFailed = true;
    console.warn(JSON.stringify({ event: "analytics_write_skipped", message: String(error) }));
  }
  await recordMonitoringEvent({
    route: "events",
    outcome: storageFailed ? "storage_error" : "success",
    statusCode: 204,
    startedAt,
    requestId,
  });
  return new NextResponse(null, {
    status: 204,
    headers: { "X-Request-Id": requestId },
  });
}
