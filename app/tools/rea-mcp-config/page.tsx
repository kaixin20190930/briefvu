import type { Metadata } from "next";
import { CheckCircle2, ExternalLink, FileWarning, Laptop, ShieldCheck, TerminalSquare } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { ReaSetupHelper } from "@/components/ReaSetupHelper";
import { RelatedTools } from "@/components/RelatedTools";
import { REA_PACKAGE_VERSION, REA_VERIFIED_DATE } from "@/lib/rea-setup";
import { absoluteUrl, createPageMetadata } from "@/lib/site";

const path = "/tools/rea-mcp-config";

export const metadata: Metadata = createPageMetadata({
  title: "REA MCP Setup & Config Helper",
  description: "Generate the correct REA MCP setup, verification, and troubleshooting commands for Claude Code, Cursor, Codex, and other supported agents.",
  path,
});

const faqs = [
  ["Does this tool edit my MCP configuration?", "No. BriefVu only generates commands and a checklist in your browser. You decide what to copy and run in your own terminal. REA's official setup command previews its planned paths and changes, asks for approval, and maintains its own configuration backups."],
  ["Do I need Ghidra to use REA?", "Not for every workflow. Static JavaScript and Electron inspection can run without a native analysis engine. Deep native-binary analysis normally needs a supported engine such as Ghidra, Hopper, or IDA. Select your intended task above and the helper will only show provider checks when they are relevant."],
  ["Can I configure REA for one Claude Code project?", "Yes. The advanced project-only option generates Claude Code's local-scope registration command. Run it from that project directory. Unlike guided user-level setup, this route does not install the bundled REA skill and must be updated manually when its pinned package version changes."],
  ["Does REA work with Cursor and Codex?", "REA's guided setup currently lists Claude Code, Cursor, Codex, Gemini CLI, Windsurf, and several other agents. This helper covers the most common supported client IDs and sends the selected ID to REA's official setup and doctor commands."],
  ["Does BriefVu upload my binary or project?", "No. This page does not accept files, inspect paths, connect to your Agent, or run terminal commands. If you later use REA with an AI agent, review that agent and model provider's own data policy before analyzing sensitive material."],
  ["Is REA safe to use on commercial software?", "Only analyze software you own or are authorized to inspect, and respect applicable licenses and law. Legitimate uses may include interoperability, security research, malware analysis, education, and maintaining legacy systems. This helper does not authorize bypassing access controls or copying proprietary products."],
] as const;

export default function ReaMcpConfigPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "BriefVu REA MCP Setup & Config Helper",
      url: absoluteUrl(path),
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows, macOS, Linux",
      browserRequirements: "Requires a modern browser with JavaScript enabled",
      description: "Generate official REA setup, verification, and task-readiness commands for supported AI coding agents.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: ["Agent-specific setup commands", "Operating-system guidance", "Read-only verification commands", "Native provider checks"],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
        { "@type": "ListItem", position: 3, name: "REA MCP Setup Helper", item: absoluteUrl(path) },
      ],
    },
  ];

  return <main>
    <JsonLd data={structuredData} />
    <section className="tool-hero rea-tool-hero">
      <span className="eyebrow">Free developer utility</span>
      <h1>REA MCP Setup &amp; Config Helper</h1>
      <p>Generate the right REA MCP setup, verification, and troubleshooting commands for your agent and operating system. Nothing is installed or changed by this page.</p>
      <a className="button-primary photo-hero-cta" href="#rea-setup">Build my setup plan</a>
    </section>

    <div className="tool-page-wrap" id="rea-setup">
      <ReaSetupHelper />

      <section className="content-section" aria-labelledby="rea-output-title">
        <div className="content-heading"><span>What you get</span><h2 id="rea-output-title">A reviewable plan, not mystery JSON</h2><p>REA’s current guided installer already knows how to register its MCP server with supported agents. BriefVu helps you choose the right official command, preview it safely, verify the result, and identify any task-specific prerequisite.</p></div>
        <div className="comparison-grid">
          <article><TerminalSquare size={23} /><strong>Setup commands</strong><p>Start with a dry run, review the paths REA detected, and only then run the approved setup. The selected official client ID is included for you.</p></article>
          <article><ShieldCheck size={23} /><strong>Read-only checks</strong><p>Use REA doctor to inspect the selected registration, bundled workflow, and optional native provider without changing your target project.</p></article>
          <article><Laptop size={23} /><strong>Task-aware next steps</strong><p>JavaScript and Electron workflows get a direct inspection command. Native workflows get the relevant Ghidra, Hopper, or IDA readiness check.</p></article>
        </div>
      </section>

      <section className="content-section" aria-labelledby="rea-how-title">
        <div className="content-heading"><span>How it works</span><h2 id="rea-how-title">How REA MCP setup works</h2><p>The normal path uses REA’s own setup interface instead of asking you to hand-edit an agent configuration file. This reduces stale JSON, invalid paths, and accidental changes to unrelated MCP servers.</p></div>
        <div className="steps-grid">
          <article><span>1</span><TerminalSquare size={22} /><h3>Preview</h3><p>Run the generated command with <code>--dry-run</code>. REA reports the selected agent, proposed configuration paths, workflow destination, and any detected analysis engine without applying the plan.</p></article>
          <article><span>2</span><ShieldCheck size={22} /><h3>Review and approve</h3><p>Run guided setup, inspect the exact changes, and approve only the scope you intended. REA preserves unrelated configuration and creates its managed backup before it publishes an edit.</p></article>
          <article><span>3</span><CheckCircle2 size={22} /><h3>Restart and verify</h3><p>Restart the selected Agent, then run the generated doctor command. A failed check should be repaired from its diagnostic instead of repeatedly replacing configuration files.</p></article>
        </div>
      </section>

      <section className="content-section" aria-labelledby="rea-engines-title">
        <div className="content-heading"><span>Analysis engines</span><h2 id="rea-engines-title">When you need Ghidra, Hopper, or IDA</h2><p>An MCP connection and a native analysis engine solve different parts of the workflow. Configure only what your task actually needs.</p></div>
        <div className="split-copy">
          <div><h3>No native engine required</h3><ul><li>Static JavaScript and Electron application inspection</li><li>Early setup and Agent registration checks</li><li>Workflows whose required adapters are already included by REA</li></ul></div>
          <div><h3>Native engine usually required</h3><ul><li>Disassembly and decompilation of native binaries</li><li>Function, import, and cross-reference investigation</li><li>Provider-specific operations exposed through Ghidra, Hopper, or IDA</li></ul></div>
        </div>
      </section>

      <section className="content-section" aria-labelledby="rea-safety-title">
        <div className="wordcraft-privacy rea-safety-card">
          <div><FileWarning size={30} /><span className="section-label">Privacy and lawful use</span><h2 id="rea-safety-title">Your commands stay under your control</h2></div>
          <div><p>BriefVu does not run REA, read your Agent configuration, or receive your project. The helper uses your selections only to render a plan in this browser session.</p><ul><li><CheckCircle2 size={17} /> No binary or project upload</li><li><CheckCircle2 size={17} /> No automatic configuration changes</li><li><CheckCircle2 size={17} /> No account or saved setup history</li><li><FileWarning size={17} /> Analyze only targets you own or are authorized to inspect</li></ul><p className="wordcraft-fine-print">Your AI agent and model provider have their own data-handling policies. Review them before sharing sensitive analysis results.</p></div>
        </div>
      </section>

      <section className="content-section faq" aria-labelledby="rea-faq-title">
        <div className="content-heading"><span>FAQ</span><h2 id="rea-faq-title">REA MCP setup questions</h2></div>
        <div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="content-section rea-next" aria-labelledby="rea-next-title">
        <div><span className="section-label">Next step</span><h2 id="rea-next-title">Set up REA with Claude Code</h2><p>Follow the complete path from prerequisites and dry-run setup to connection verification and your first authorized analysis.</p></div>
        <Link className="button-primary" href="/guides/rea-claude-code">Read the Claude Code guide</Link>
      </section>

      <section className="rea-source-note" aria-label="Source and version note">
        <p>Commands verified against the official <a href="https://github.com/morluto/rea" target="_blank" rel="noreferrer">morluto/rea repository <ExternalLink size={13} /></a> and published <code>rea-agents@{REA_PACKAGE_VERSION}</code> on {REA_VERIFIED_DATE}. Guided commands use <code>@latest</code>; the advanced project-only registration is pinned for repeatability.</p>
      </section>

      <RelatedTools currentSlug="rea-mcp-config" />
    </div>
  </main>;
}
