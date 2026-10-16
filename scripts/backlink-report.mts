import { readFile } from "node:fs/promises";

type ProspectStatus = "researched" | "ready" | "contacted" | "replied" | "accepted" | "live" | "rejected" | "blocked";

type Prospect = {
  id: string;
  name: string;
  domain: string;
  channel: string;
  priority: "P0" | "P1" | "P2";
  publicUrl: string;
  opportunity: string;
  destinationUrl: string;
  status: ProspectStatus;
  nextAction: string;
  contactedAt: string | null;
  followUpDue: string | null;
  liveUrl: string | null;
};

const trackerPath = new URL("../docs/backlinks/prospects.json", import.meta.url);
const checkLive = process.argv.includes("--check-live");
const knownStatuses = new Set<ProspectStatus>([
  "researched", "ready", "contacted", "replied", "accepted", "live", "rejected", "blocked",
]);

const prospects = JSON.parse(await readFile(trackerPath, "utf8")) as Prospect[];
const ids = new Set<string>();
const errors: string[] = [];

for (const prospect of prospects) {
  if (!prospect.id || ids.has(prospect.id)) errors.push(`Duplicate or missing id: ${prospect.id || "(empty)"}`);
  ids.add(prospect.id);
  if (!knownStatuses.has(prospect.status)) errors.push(`${prospect.id}: invalid status ${prospect.status}`);
  for (const [label, value] of [["publicUrl", prospect.publicUrl], ["destinationUrl", prospect.destinationUrl]] as const) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") errors.push(`${prospect.id}: ${label} must use https`);
    } catch {
      errors.push(`${prospect.id}: invalid ${label}`);
    }
  }
  if (prospect.status === "live" && !prospect.liveUrl) errors.push(`${prospect.id}: live status requires liveUrl`);
}

if (errors.length > 0) {
  console.error("Backlink tracker is invalid:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(2);
}

const countBy = <T extends string>(values: T[]) => values.reduce<Record<string, number>>((counts, value) => {
  counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}, {});

const today = new Date();
today.setHours(0, 0, 0, 0);
const reportDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
const due = prospects.filter((prospect) => {
  if (!prospect.followUpDue || ["live", "rejected", "blocked"].includes(prospect.status)) return false;
  const followUp = new Date(`${prospect.followUpDue}T00:00:00`);
  return Number.isFinite(followUp.getTime()) && followUp <= today;
});

const ready = prospects.filter((prospect) => prospect.status === "ready");
const live = prospects.filter((prospect) => prospect.status === "live");

console.log(`BriefVu backlink report — ${reportDate}`);
console.log(`Prospects: ${prospects.length}`);
console.log(`By status: ${JSON.stringify(countBy(prospects.map((prospect) => prospect.status)))}`);
console.log(`By channel: ${JSON.stringify(countBy(prospects.map((prospect) => prospect.channel)))}`);
console.log(`Live referring domains: ${new Set(live.map((prospect) => prospect.domain)).size}`);
console.log(`Follow-ups due: ${due.length}`);
console.log(`Ready for founder action: ${ready.length}`);

if (due.length > 0) {
  console.log("\nDue follow-ups:");
  for (const prospect of due) console.log(`- ${prospect.name} (${prospect.followUpDue}): ${prospect.nextAction}`);
}

if (ready.length > 0) {
  console.log("\nReady actions:");
  for (const prospect of ready) console.log(`- ${prospect.name}: ${prospect.nextAction}`);
}

if (checkLive && live.length > 0) {
  console.log("\nLive-link checks:");
  for (const prospect of live) {
    try {
      const response = await fetch(prospect.liveUrl!, {
        headers: { "User-Agent": "BriefVuBacklinkMonitor/1.0 (+https://briefvu.com/)" },
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
      });
      const body = await response.text();
      const linksToBriefVu = /href=["'][^"']*briefvu\.com/i.test(body);
      console.log(`- ${prospect.name}: HTTP ${response.status}; BriefVu link ${linksToBriefVu ? "found" : "not found"}`);
      if (!response.ok || !linksToBriefVu) process.exitCode = 1;
    } catch (error) {
      console.log(`- ${prospect.name}: check failed (${error instanceof Error ? error.message : "unknown error"})`);
      process.exitCode = 1;
    }
  }
}
