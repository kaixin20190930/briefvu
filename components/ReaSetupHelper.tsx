"use client";

import { Check, CheckCircle2, Clipboard, TerminalSquare } from "lucide-react";
import { useState } from "react";
import {
  analysisTargets,
  buildReaSetupPlan,
  formatReaSetupPlan,
  nativeProviders,
  operatingSystems,
  reaAgents,
  type AnalysisTarget,
  type InstallScope,
  type NativeProvider,
  type OperatingSystem,
  type ReaAgent,
} from "@/lib/rea-setup";
import { trackToolEvent, trackToolStarted } from "@/lib/tool-events-client";

export function ReaSetupHelper() {
  const [agent, setAgent] = useState<ReaAgent>("claude_code");
  const [operatingSystem, setOperatingSystem] = useState<OperatingSystem>("macos");
  const [scope, setScope] = useState<InstallScope>("user");
  const [target, setTarget] = useState<AnalysisTarget>("javascript");
  const [provider, setProvider] = useState<NativeProvider>("none");
  const [generated, setGenerated] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const plan = buildReaSetupPlan({ agent, operatingSystem, scope, target, provider });

  function generate() {
    trackToolStarted("rea-mcp-config");
    setGenerated(true);
    setCopyState("idle");
  }

  async function copyPlan() {
    try {
      await navigator.clipboard.writeText(formatReaSetupPlan(plan));
      setCopyState("copied");
      trackToolEvent("rea-mcp-config", "copy_completed");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <section className="rea-builder" aria-labelledby="rea-builder-title">
      <div className="generator-heading">
        <div>
          <span className="section-label">Official-command helper</span>
          <h2 id="rea-builder-title">Build your REA setup plan</h2>
          <p>Choose your environment. BriefVu generates commands for you to review and run in your own terminal.</p>
        </div>
        <span className="local-badge"><CheckCircle2 size={15} /> No files uploaded</span>
      </div>

      <div className="rea-form-grid">
        <label>Agent
          <select value={agent} onChange={(event) => {
            const nextAgent = event.target.value as ReaAgent;
            setAgent(nextAgent);
            if (nextAgent !== "claude_code") setScope("user");
            setGenerated(false);
          }}>
            {reaAgents.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}
          </select>
        </label>
        <label>Operating system
          <select value={operatingSystem} onChange={(event) => { setOperatingSystem(event.target.value as OperatingSystem); setGenerated(false); }}>
            {operatingSystems.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}
          </select>
        </label>
        <label>Installation scope
          <select value={scope} onChange={(event) => { setScope(event.target.value as InstallScope); setGenerated(false); }}>
            <option value="user">Agent user profile (recommended)</option>
            {agent === "claude_code" ? <option value="claude-project">Current Claude Code project only</option> : null}
          </select>
        </label>
        <label>Analysis task
          <select value={target} onChange={(event) => { setTarget(event.target.value as AnalysisTarget); setGenerated(false); }}>
            {analysisTargets.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}
          </select>
        </label>
        {target === "native" ? <label>Native analysis engine
          <select value={provider} onChange={(event) => { setProvider(event.target.value as NativeProvider); setGenerated(false); }}>
            {nativeProviders.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}
          </select>
        </label> : null}
      </div>

      <button className="copy-primary rea-generate-button" type="button" onClick={generate}>
        <TerminalSquare size={18} /> Generate setup plan
      </button>

      {generated ? <div className="rea-plan" aria-live="polite">
        <div className="rea-plan-heading">
          <div><span>Recommended plan</span><h3>{plan.title}</h3><p>{plan.summary}</p></div>
          <button className={copyState === "copied" ? "copied" : copyState === "failed" ? "failed" : ""} type="button" onClick={copyPlan}>
            {copyState === "copied" ? <Check size={17} /> : <Clipboard size={17} />}
            {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy all"}
          </button>
        </div>
        <div className="rea-command-list">
          {plan.commands.map((item, index) => <article key={`${item.label}-${index}`}>
            <span>Step {index + 1}</span><h4>{item.label}</h4><pre><code>{item.command}</code></pre><p>{item.note}</p>
          </article>)}
        </div>
        <div className="rea-checklist"><h4>Before you continue</h4><ul>{plan.checklist.map((item) => <li key={item}><Check size={16} /> {item}</li>)}</ul>{plan.warning ? <p>{plan.warning}</p> : null}</div>
      </div> : null}
    </section>
  );
}
