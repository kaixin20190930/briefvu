import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
}

async function hashClient(request: Request, salt: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = request.headers.get("cf-connecting-ip") ?? forwarded ?? "unknown";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${salt}:${address}`),
  );
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function enforceRateLimit(
  request: Request,
  route: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  const retryAfter = Math.max(1, windowStart + windowSeconds - now);

  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!env.DB) return { allowed: true, limit, remaining: limit, retryAfter };

    const salt = process.env.RATE_LIMIT_SALT;
    if (!salt) {
      console.error(JSON.stringify({ event: "rate_limit_salt_missing", route }));
      return { allowed: false, limit, remaining: 0, retryAfter: 60 };
    }

    const clientHash = await hashClient(request, salt);
    const row = await env.DB.prepare(
      `INSERT INTO api_rate_limits (client_hash, route, window_start, request_count)
       VALUES (?, ?, ?, 1)
       ON CONFLICT (client_hash, route, window_start)
       DO UPDATE SET request_count = request_count + 1
       RETURNING request_count`,
    )
      .bind(clientHash, route, windowStart)
      .first<{ request_count: number }>();
    const count = Number(row?.request_count ?? 1);

    return {
      allowed: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      retryAfter,
    };
  } catch (error) {
    console.warn(
      JSON.stringify({ event: "rate_limit_check_failed", route, message: String(error) }),
    );
    return { allowed: true, limit, remaining: limit, retryAfter };
  }
}
