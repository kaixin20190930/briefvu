import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const hours = Number(process.argv[2] || 168);

if (!accountId || !apiToken) {
  throw new Error("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required.");
}
if (!Number.isInteger(hours) || hours < 1 || hours > 2160) {
  throw new Error("Usage: npm run usage:report -- [hours between 1 and 2160]");
}

const sql = `
SELECT
  index1 AS tool,
  blob1 AS event,
  SUM(_sample_interval) AS events
FROM briefvu_tool_events
WHERE timestamp >= NOW() - INTERVAL '${hours}' HOUR
GROUP BY tool, event
ORDER BY tool, event
`;

const response = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "text/plain",
    },
    body: sql,
  },
);

if (!response.ok) {
  const detail = (await response.text()).slice(0, 500);
  throw new Error(`Cloudflare Analytics Engine query failed (${response.status}): ${detail}`);
}

const rows = await response.json() as Array<{ tool: string; event: string; events: number }>;
if (!rows.length) {
  console.log(`No tool events recorded in the last ${hours} hours.`);
} else {
  console.log(`BriefVu tool events — last ${hours} hours`);
  console.table(rows.map((row) => ({ ...row, events: Math.round(row.events) })));
}
