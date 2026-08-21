import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { parsePilotApplication } from "@/lib/pilot";
import { enforceRateLimit } from "@/lib/rate-limit";
import { recordMonitoringEvent, type MonitoringOutcome } from "@/lib/monitoring";

async function monitoredJson(
  payload: unknown,
  options: {
    status: number;
    outcome: MonitoringOutcome;
    startedAt: number;
    requestId: string;
    headers?: HeadersInit;
  },
) {
  await recordMonitoringEvent({
    route: "pilot",
    outcome: options.outcome,
    statusCode: options.status,
    startedAt: options.startedAt,
    requestId: options.requestId,
  });
  return NextResponse.json(payload, {
    status: options.status,
    headers: {
      "X-Request-Id": options.requestId,
      ...Object.fromEntries(new Headers(options.headers)),
    },
  });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_000) {
    return monitoredJson(
      { error: "Application is too large." },
      { status: 413, outcome: "validation_error", startedAt, requestId },
    );
  }

  const rateLimit = await enforceRateLimit(request, "pilot_application", 5, 60 * 60);
  if (!rateLimit.allowed) {
    return monitoredJson(
      { error: "Too many applications from this network. Please try again later." },
      {
        status: 429,
        outcome: "rate_limited",
        startedAt,
        requestId,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return monitoredJson(
      { error: "Invalid application." },
      { status: 400, outcome: "validation_error", startedAt, requestId },
    );
  }

  // Silently accept obvious bot submissions before validating the visible fields.
  if (typeof body.website === "string" && body.website.trim()) {
    return monitoredJson(
      { success: true },
      { status: 202, outcome: "bot_accepted", startedAt, requestId },
    );
  }

  const parsed = parsePilotApplication(body);
  if (!parsed.valid) {
    return monitoredJson(
      { error: "Complete the required fields and confirm that we may contact you." },
      { status: 400, outcome: "validation_error", startedAt, requestId },
    );
  }
  const {
    shopName,
    contactName,
    email,
    weeklyEnquiries,
    currentWorkflow,
    notes,
    website,
  } = parsed.data;

  // Keep this guard close to the database boundary as defense in depth.
  if (website) {
    return monitoredJson(
      { success: true },
      { status: 202, outcome: "bot_accepted", startedAt, requestId },
    );
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!env.DB) throw new Error("D1 binding unavailable");
    await env.DB.prepare(
      `INSERT INTO pilot_leads (
         id, email, email_normalized, shop_name, contact_name,
         weekly_enquiries, current_workflow, notes, consent, status, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'interested', CURRENT_TIMESTAMP)
       ON CONFLICT (email_normalized) DO UPDATE SET
         email = excluded.email,
         shop_name = excluded.shop_name,
         contact_name = excluded.contact_name,
         weekly_enquiries = excluded.weekly_enquiries,
         current_workflow = excluded.current_workflow,
         notes = excluded.notes,
         consent = 1,
         status = 'interested',
         updated_at = CURRENT_TIMESTAMP`,
    )
      .bind(
        crypto.randomUUID(),
        email,
        email,
        shopName,
        contactName,
        weeklyEnquiries,
        currentWorkflow,
        notes,
      )
      .run();
    return monitoredJson(
      { success: true },
      { status: 201, outcome: "success", startedAt, requestId },
    );
  } catch (error) {
    console.error(
      JSON.stringify({ event: "pilot_application_failed", message: String(error) }),
    );
    return monitoredJson(
      { error: "We could not save your application. Please try again." },
      { status: 503, outcome: "storage_error", startedAt, requestId },
    );
  }
}
