export const REA_PACKAGE_VERSION = "6.5.0";
export const REA_VERIFIED_DATE = "2026-10-18";

export const reaAgents = [
  { id: "claude_code", name: "Claude Code" },
  { id: "cursor", name: "Cursor" },
  { id: "codex", name: "Codex" },
  { id: "gemini_cli", name: "Gemini CLI" },
  { id: "windsurf", name: "Windsurf" },
] as const;

export const operatingSystems = [
  { id: "macos", name: "macOS" },
  { id: "windows", name: "Windows PowerShell" },
  { id: "linux", name: "Linux" },
] as const;

export const analysisTargets = [
  { id: "javascript", name: "JavaScript / Electron app" },
  { id: "native", name: "Native binary" },
  { id: "dotnet", name: ".NET application" },
  { id: "website", name: "Website" },
  { id: "android", name: "APK / Android app" },
  { id: "unsure", name: "Not sure yet" },
] as const;

export const nativeProviders = [
  { id: "ghidra", name: "Ghidra" },
  { id: "hopper", name: "Hopper" },
  { id: "ida", name: "IDA" },
  { id: "none", name: "Not installed yet" },
] as const;

export type ReaAgent = (typeof reaAgents)[number]["id"];
export type OperatingSystem = (typeof operatingSystems)[number]["id"];
export type AnalysisTarget = (typeof analysisTargets)[number]["id"];
export type NativeProvider = (typeof nativeProviders)[number]["id"];
export type InstallScope = "user" | "claude-project";

export type ReaSetupInput = {
  agent: ReaAgent;
  operatingSystem: OperatingSystem;
  scope: InstallScope;
  target: AnalysisTarget;
  provider: NativeProvider;
};

export type ReaSetupPlan = {
  title: string;
  summary: string;
  commands: Array<{ label: string; command: string; note: string }>;
  checklist: string[];
  warning?: string;
};

function agentName(id: ReaAgent) {
  return reaAgents.find((agent) => agent.id === id)?.name ?? id;
}

export function buildReaSetupPlan(input: ReaSetupInput): ReaSetupPlan {
  const scope = input.scope === "claude-project" && input.agent === "claude_code"
    ? "claude-project"
    : "user";
  const commands: ReaSetupPlan["commands"] = [];

  if (scope === "claude-project") {
    const runner = input.operatingSystem === "windows"
      ? `cmd.exe /d /c npx -y rea-agents@${REA_PACKAGE_VERSION} mcp`
      : `npx -y rea-agents@${REA_PACKAGE_VERSION} mcp`;
    commands.push({
      label: "Register REA in this Claude Code project",
      command: `claude mcp add --scope local rea -- ${runner}`,
      note: "Run this from the project directory. The registration is pinned to the verified REA package version.",
    });
    commands.push({
      label: "Verify the local registration",
      command: "claude mcp list",
      note: "Run this from the same project directory after registration.",
    });
  } else {
    commands.push({
      label: "Preview the setup plan",
      command: `npx rea-agents@latest setup --client ${input.agent} --dry-run`,
      note: "Read-only preview. Review the paths and proposed changes before applying them.",
    });
    commands.push({
      label: `Configure ${agentName(input.agent)}`,
      command: `npx rea-agents@latest setup --client ${input.agent}`,
      note: "REA asks for approval before it changes the selected agent configuration.",
    });
    commands.push({
      label: "Check the registration and bundled workflow",
      command: `npx rea-agents@latest doctor --client ${input.agent} --skill --json`,
      note: "This diagnostic is read-only and reports the checks that need attention.",
    });
  }

  if (input.target === "javascript") {
    commands.push({
      label: "Optional: inspect a JavaScript or Electron app directly",
      command: "npx -y rea-agents@latest analyze-javascript-application /absolute/path/to/app --json",
      note: "Replace the placeholder with an absolute path to an application you own or are authorized to inspect.",
    });
  }

  if (input.target === "native" && input.provider !== "none") {
    commands.push({
      label: `Check the ${nativeProviders.find((provider) => provider.id === input.provider)?.name} provider`,
      command: `npx rea-agents@latest doctor --provider ${input.provider} --json`,
      note: "Repair any reported provider issue before opening a native binary.",
    });
  }

  const checklist = [
    "Use only the official morluto/rea repository, rea.tools, or the rea-agents npm package.",
    "Review every proposed configuration path and change before approving setup.",
    `Restart ${agentName(input.agent)} after the setup or registration changes.`,
    "Start with software you own or have explicit permission to analyze.",
  ];

  if (input.target === "native" && input.provider === "none") {
    checklist.splice(2, 0, "Choose and legally install Ghidra, Hopper, or IDA before deep native analysis.");
  }

  return {
    title: scope === "claude-project" ? "Claude Code project-only setup" : `${agentName(input.agent)} guided setup`,
    summary: scope === "claude-project"
      ? "This route keeps REA discovery local to the selected Claude Code project and does not install the bundled REA skill."
      : "This route uses REA's official guided setup, previews changes first, and then checks the selected agent registration.",
    commands,
    checklist,
    warning: scope === "claude-project"
      ? "Project-only registration is an advanced Claude Code option. It must be maintained manually when the pinned REA version changes."
      : undefined,
  };
}

export function formatReaSetupPlan(plan: ReaSetupPlan) {
  const commandText = plan.commands
    .map((item, index) => `${index + 1}. ${item.label}\n${item.command}\n${item.note}`)
    .join("\n\n");
  const checklistText = plan.checklist.map((item) => `- ${item}`).join("\n");
  return `${plan.title}\n${plan.summary}\n\n${commandText}\n\nChecklist\n${checklistText}${plan.warning ? `\n\nImportant\n${plan.warning}` : ""}`;
}
