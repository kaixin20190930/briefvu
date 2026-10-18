import { describe, expect, it } from "vitest";
import { buildReaSetupPlan, formatReaSetupPlan } from "./rea-setup";

describe("REA setup plans", () => {
  it("builds the official Claude Code guided setup flow", () => {
    const plan = buildReaSetupPlan({
      agent: "claude_code",
      operatingSystem: "macos",
      scope: "user",
      target: "javascript",
      provider: "none",
    });
    expect(plan.commands.map((item) => item.command)).toContain(
      "npx rea-agents@latest setup --client claude_code --dry-run",
    );
    expect(formatReaSetupPlan(plan)).toContain("analyze-javascript-application /absolute/path/to/app");
  });

  it("uses the documented Windows wrapper for a project-only registration", () => {
    const plan = buildReaSetupPlan({
      agent: "claude_code",
      operatingSystem: "windows",
      scope: "claude-project",
      target: "native",
      provider: "ghidra",
    });
    expect(plan.commands[0].command).toBe(
      "claude mcp add --scope local rea -- cmd.exe /d /c npx -y rea-agents@6.5.0 mcp",
    );
    expect(plan.commands.at(-1)?.command).toBe("npx rea-agents@latest doctor --provider ghidra --json");
  });

  it("falls back to guided setup when project scope is invalid for another agent", () => {
    const plan = buildReaSetupPlan({
      agent: "cursor",
      operatingSystem: "linux",
      scope: "claude-project",
      target: "unsure",
      provider: "none",
    });
    expect(plan.title).toBe("Cursor guided setup");
    expect(plan.commands[0].command).toContain("--client cursor --dry-run");
  });
});
