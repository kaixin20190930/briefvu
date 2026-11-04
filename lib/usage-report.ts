export type UsageRow = { tool: string; event: string; events: number };
export function usageCredentials(env: Record<string, string | undefined>) {
  const accountId = env.BRIEFVU_ANALYTICS_ACCOUNT_ID || env.CLOUDFLARE_ACCOUNT_ID;
  const token = env.BRIEFVU_ANALYTICS_API_TOKEN || env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !/^[a-f0-9]{32}$/i.test(accountId)) throw new Error("Set BRIEFVU_ANALYTICS_ACCOUNT_ID or CLOUDFLARE_ACCOUNT_ID to the target Cloudflare account ID.");
  if (!token) throw new Error("Set BRIEFVU_ANALYTICS_API_TOKEN to a token with Account Analytics Read on the target account.");
  return { accountId, token, tokenSource: env.BRIEFVU_ANALYTICS_API_TOKEN ? "BRIEFVU_ANALYTICS_API_TOKEN" : "CLOUDFLARE_API_TOKEN (legacy fallback)" };
}
export function usageWindow(hours: number, until = new Date()) {
  if (!Number.isInteger(hours) || hours < 1 || hours > 2160 || !Number.isFinite(until.getTime())) throw new Error("Use 1–2160 whole hours and a valid --until ISO timestamp.");
  const end = new Date(Math.floor(until.getTime() / 1000) * 1000);
  return { from: new Date(end.getTime() - hours * 3600000).toISOString(), until: end.toISOString(), hours };
}
export function usageQuery(window: ReturnType<typeof usageWindow>) {
  // Format only Date-derived values; dataset and SQL identifiers are fixed.
  const stamp = (iso: string) => new Date(iso).toISOString().slice(0, 19).replace("T", " ");
  return `SELECT index1 AS tool, blob1 AS event, SUM(_sample_interval) AS events
FROM briefvu_tool_events
WHERE timestamp >= toDateTime('${stamp(window.from)}') AND timestamp < toDateTime('${stamp(window.until)}')
GROUP BY tool, event ORDER BY tool, event FORMAT JSON`;
}
export function parseUsageResponse(value: unknown): UsageRow[] {
  if (!value || typeof value !== "object" || !Array.isArray((value as {data?:unknown}).data)) throw new Error("Unexpected Analytics Engine JSON response: expected a data array; not treating this as zero usage.");
  return (value as {data:unknown[]}).data.map(row => {
    if (!row || typeof row !== "object") throw new Error("Invalid Analytics Engine row.");
    const r = row as Record<string, unknown>;
    if (typeof r.tool !== "string" || typeof r.event !== "string" || !["number", "string"].includes(typeof r.events) || r.events === "" || !Number.isFinite(Number(r.events)) || Number(r.events) < 0) throw new Error("Invalid Analytics Engine row.");
    return { tool: r.tool, event: r.event, events: Number(r.events) };
  });
}
export function usageHttpError(status: number) {
  if (status === 401 || status === 403) return `Analytics Engine query denied (HTTP ${status}). The token must have Account → Account Analytics → Read on this account. An active token or Worker deployment permission alone is insufficient. Configure BRIEFVU_ANALYTICS_API_TOKEN; no zero-usage report was generated.`;
  return `Analytics Engine query failed (HTTP ${status}); no usage report was generated.`;
}
