import { existsSync, writeFileSync } from "node:fs";
import { usageCredentials, usageWindow, usageQuery, parseUsageResponse, usageHttpError } from "../lib/usage-report.ts";

async function main() {
  const args = process.argv.slice(2);
  let hours = 168, until = new Date(), json = false, output: string | undefined;
  if (args[0] && !args[0].startsWith("--")) hours = Number(args.shift());
  while (args.length) {
    const arg = args.shift();
    if (arg === "--json") json = true;
    else if (arg === "--until" && args[0]) until = new Date(args.shift()!);
    else if (arg === "--output" && args[0]) output = args.shift();
    else throw new Error("Usage: npm run usage:report -- [hours] [--until ISO] [--json] [--output path.json]");
  }
  const window = usageWindow(hours, until);
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const credentials = usageCredentials(process.env);
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${credentials.accountId}/analytics_engine/sql`, {
    method: "POST", headers: { Authorization: `Bearer ${credentials.token}`, "Content-Type": "text/plain" }, body: usageQuery(window), signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(usageHttpError(response.status));
  const rows = parseUsageResponse(await response.json());
  const report = { fetchedAt: new Date().toISOString(), window: { ...window, timezone: "UTC", endExclusive: true }, dataset: "briefvu_tool_events", credentialSource: credentials.tokenSource, unit: "sample-weighted action count; not unique users", qaNote: "Includes QA activity. Events have no session/source identifier, so historical QA cannot be reliably subtracted.", rows };
  const content = JSON.stringify(report, null, 2);
  if (output) writeFileSync(output, content + "\n");
  if (json) console.log(content);
  else {
    console.log(`BriefVu events: ${window.from} ≤ timestamp < ${window.until} (UTC)`);
    console.log(`Credential source: ${credentials.tokenSource}. Counts include QA activity, not unique users.`);
    if (!rows.length) console.log("Query succeeded: no recorded events in this window.");
    else console.table(rows);
    if (output) console.log(`Saved report: ${output}`);
  }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Usage report failed."); process.exitCode = 1; });
