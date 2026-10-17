import { getCloudflareContext } from "@opennextjs/cloudflare";
import { parseToolEvent } from "@/lib/tool-events";

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";", 1)[0] !== "application/json") {
    return new Response(null, { status: 415 });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return new Response(null, { status: 403 });
  }

  if (Number(request.headers.get("content-length") || 0) > 512) {
    return new Response(null, { status: 413 });
  }

  let payload: unknown;
  try {
    const body = await request.text();
    if (body.length > 512) return new Response(null, { status: 413 });
    payload = JSON.parse(body);
  } catch {
    return new Response(null, { status: 400 });
  }

  const toolEvent = parseToolEvent(payload);
  if (!toolEvent) return new Response(null, { status: 400 });

  const { env } = await getCloudflareContext({ async: true });
  if (!env.ANALYTICS) return new Response(null, { status: 503 });

  env.ANALYTICS.writeDataPoint({
    indexes: [toolEvent.tool],
    blobs: [toolEvent.event],
    doubles: [1],
  });

  return new Response(null, { status: 204 });
}
