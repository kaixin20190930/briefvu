import type { Metadata } from "next";
import { AlertTriangle, ArrowRight, ExternalLink, TerminalSquare } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { REA_PACKAGE_VERSION, REA_VERIFIED_DATE } from "@/lib/rea-setup";
import { absoluteUrl, createPageMetadata } from "@/lib/site";

const path = "/guides/rea-claude-code";

export const metadata: Metadata = createPageMetadata({
  title: "REA + Claude Code Setup — Install to First Query",
  description: "Install REA for Claude Code, preview its MCP configuration changes, verify the connection, and run your first authorized reverse engineering analysis.",
  path,
});

const faq = [
  ["Is REA free and open source?", "Yes. REA is published under the MIT license. Some optional analysis engines are separate products with their own licenses and requirements, so check the license for Ghidra, Hopper, IDA, or any other software you connect."],
  ["Does REA work with Claude Code on Windows?", "Yes. REA lists Claude Code as a supported client. Use a supported Node.js runtime and run guided setup from PowerShell or another suitable terminal. The project-only registration command needs a Windows command wrapper, which the BriefVu helper adds automatically."],
  ["Do I need Ghidra to use REA?", "No. REA can inspect static JavaScript and Electron applications without a native engine. Ghidra, Hopper, or IDA becomes relevant when you need deeper native-binary capabilities such as disassembly, decompilation, imports, and cross-references."],
  ["Can REA analyze Electron applications?", "Yes. REA documents a direct analyze-javascript-application command for static JavaScript and Electron workflows. Use an absolute path to software you own or are authorized to inspect, and review the generated evidence before asking an agent to interpret it."],
  ["Why does Claude Code not show the REA tools?", "First restart Claude Code after setup. Then run claude mcp list and REA's scoped doctor command. Check the reported configuration path, package runtime, workflow copy, and provider diagnostics instead of adding duplicate MCP registrations."],
  ["Does REA upload my binary to BriefVu?", "No. BriefVu does not receive your binary, configuration, paths, or REA output. REA's analysis runs on your machine, but the connected AI agent may send tool results to its model provider. Review that provider's policy before analyzing sensitive material."],
] as const;

function Command({ children }: { children: string }) {
  return <pre className="guide-command"><code>{children}</code></pre>;
}

export default function ReaClaudeCodeGuide() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "How to Use REA with Claude Code",
      description: "Install REA for Claude Code, preview its MCP configuration changes, verify the connection, and run a first authorized reverse engineering analysis.",
      url: absoluteUrl(path),
      mainEntityOfPage: absoluteUrl(path),
      datePublished: "2026-10-18",
      dateModified: "2026-10-18",
      author: { "@type": "Organization", name: "BriefVu", url: absoluteUrl("/") },
      publisher: { "@type": "Organization", name: "BriefVu", url: absoluteUrl("/") },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
        { "@type": "ListItem", position: 3, name: "REA + Claude Code Setup", item: absoluteUrl(path) },
      ],
    },
  ];

  return <main className="guide-shell">
    <JsonLd data={structuredData} />
    <article>
      <header className="guide-hero">
        <nav aria-label="Breadcrumb"><Link href="/guides">Guides</Link><span>/</span><span>REA + Claude Code</span></nav>
        <span className="eyebrow">Step-by-step setup guide</span>
        <h1>How to Use REA with Claude Code</h1>
        <p>Install REA through its current guided setup, inspect every proposed change, verify Claude Code’s MCP connection, and run a first analysis on software you are authorized to inspect.</p>
        <div><time dateTime="2026-10-18">Updated October 18, 2026</time><span>Commands checked with rea-agents {REA_PACKAGE_VERSION}</span></div>
      </header>

      <aside className="guide-callout"><TerminalSquare size={22} /><div><strong>Want commands tailored to your system?</strong><p>The free helper creates the correct setup, verification, and task-readiness plan without editing your configuration.</p><Link href="/tools/rea-mcp-config">Use the REA setup helper <ArrowRight size={15} /></Link></div></aside>

      <section><h2>What Is REA?</h2><p>REA, short for Reverse Engineer Anything, is an open-source MCP server and analysis workflow that lets supported AI agents call local reverse-engineering tools. With Claude Code connected, you can investigate JavaScript and Electron applications, .NET programs, websites, Android packages, native binaries, and other supported targets through a consistent tool interface.</p><p>REA is not a one-click product cloner, and installing it does not grant permission to inspect third-party software. Use it for software you own, authorized security work, interoperability, education, malware research, preservation, or another lawful purpose. The agent can help organize evidence and operate available tools, but you remain responsible for the target, licenses, and conclusions.</p></section>

      <section><h2>Prerequisites</h2><p>Before connecting REA to Claude Code, confirm that Claude Code opens normally and that your terminal can run Node.js and npm. REA currently requires Node.js 22.x at 22.19 or newer, Node.js 24.x at 24.11 or newer, or Node.js 26 and later. Node.js 18 is not sufficient for the current package.</p><ul><li>Claude Code installed and authenticated</li><li>A currently supported Node.js runtime</li><li>Terminal access to run <code>npx</code></li><li>Permission to analyze your chosen target</li><li>For deep native analysis only: a supported Ghidra, Hopper, or IDA installation</li></ul><p>Static JavaScript and Electron analysis does not require a native engine, so do not delay that workflow by installing tools you do not need.</p></section>

      <section><h2>Preview the REA Setup</h2><p>Begin with a read-only dry run. This tells REA to plan the Claude Code registration and bundled workflow installation without applying them:</p><Command>npx rea-agents@latest setup --client claude_code --dry-run</Command><p>Review the selected client, configuration path, skill destination, detected analysis engines, and package-manager operations. Cancel if the paths are not the ones you intended. The preview is especially useful when Claude Code uses a separate profile through <code>CLAUDE_CONFIG_DIR</code>.</p></section>

      <section><h2>Install REA and Connect It to Claude Code</h2><p>When the preview is correct, run the same setup without <code>--dry-run</code>:</p><Command>npx rea-agents@latest setup --client claude_code</Command><p>REA shows the proposed plan again and asks before changing the Claude Code configuration. Guided setup adds the MCP registration and matching workflow instructions, preserves unrelated entries, and maintains its own backup. Quit or fully restart Claude Code after setup so the new connection can be discovered.</p><p>If you need commands for Windows, another Agent, or a specific analysis task, <Link href="/tools/rea-mcp-config">use the free REA MCP Setup &amp; Config Helper</Link> instead of adapting JSON by hand.</p></section>

      <section><h2>Verify the Claude Code Connection</h2><p>Check the registration and bundled workflow with REA’s scoped, read-only diagnostic:</p><Command>npx rea-agents@latest doctor --client claude_code --skill --json</Command><p>You can also ask Claude Code to list its MCP registrations:</p><Command>claude mcp list</Command><p>A healthy file-based check does not prove that an already-running Claude Code session has reconnected. If the registration looks correct but tools are missing, restart the client before changing anything. Follow the named remediation for a failed check rather than creating a second registration.</p></section>

      <section><h2>Run Your First Authorized Analysis</h2><div className="guide-warning"><AlertTriangle size={21} /><p>Use a sample, binary, or application that you own or have explicit authorization to inspect. Do not begin with proprietary third-party software simply because it is available on your computer.</p></div><p>For a connected native-analysis workflow, open an authorized target and start with a narrow evidence request:</p><Command>List the imported functions in this binary and explain which ones deserve closer inspection.</Command><p>The exact response varies with the target and available provider. Expect a structured list or summary of imports, references, and possible areas for follow-up—not a universal fixed output. Validate important conclusions in the underlying analysis engine.</p></section>

      <section><h2>Three Practical REA Workflows</h2><h3>1. Inspect a JavaScript or Electron application</h3><p>REA provides a direct static-analysis command that works without Claude Code or a native provider. Replace the placeholder with an absolute path to an application you are authorized to inspect:</p><Command>npx -y rea-agents@latest analyze-javascript-application /absolute/path/to/app --json</Command><p>Use the resulting evidence to locate application structure, packaged JavaScript, configuration, and high-value files before asking Claude Code focused questions.</p><h3>2. Review a .NET application’s structure</h3><p>Start by asking REA which operations are available for the current target, then request namespaces, assemblies, classes, or methods relevant to your maintenance or interoperability task. Keep the request narrow and preserve the evidence used for each conclusion.</p><h3>3. Investigate a native binary</h3><p>For imports, functions, decompilation, and cross-references, first check the provider you intend to use:</p><Command>npx rea-agents@latest doctor --provider ghidra --json</Command><p>Substitute <code>hopper</code> or <code>ida</code> when appropriate. A provider failure does not necessarily block unrelated JavaScript or target-free tools, so diagnose the scope you actually need.</p></section>

      <section><h2>Troubleshooting</h2><div className="guide-troubleshooting"><article><h3>Node.js is rejected</h3><p>Check <code>node --version</code>. Upgrade to one of REA’s current supported runtime lines instead of continuing with Node.js 18 or an early Node.js 22 release.</p></article><article><h3>REA is missing in Claude Code</h3><p>Restart Claude Code, run <code>claude mcp list</code>, and then run the scoped doctor command. Confirm you are using the same Claude profile that setup modified.</p></article><article><h3>Setup refuses the configuration</h3><p>Read the exact malformed or unsafe-path diagnostic. Repair that named issue first. Do not delete unrelated MCP entries or overwrite the whole file with generated JSON.</p></article><article><h3>The provider is unavailable</h3><p>Run doctor with the intended provider. Confirm the tool is legally installed, its path is detectable, and its own startup prerequisites are satisfied.</p></article><article><h3>Windows command fails</h3><p>Use PowerShell examples for environment variables. Project-only MCP registration also needs the documented <code>cmd.exe /d /c</code> wrapper around the npm package runner.</p></article><article><h3>Setup succeeded but the session is stale</h3><p>File checks cannot reconnect an existing session. Close and restart the affected Agent after registration, workflow, or pinned-package changes.</p></article></div></section>

      <section><h2>Legal and Privacy Boundaries</h2><div className="split-copy"><div><h3>Appropriate uses</h3><ul><li>Software you own or are authorized to test</li><li>Interoperability and compatible implementation research</li><li>Malware analysis and defensive security work</li><li>Education, preservation, and legacy-system maintenance</li></ul></div><div><h3>Not supported here</h3><ul><li>Bypassing payment, licensing, or access controls</li><li>Stealing source code, credentials, or intellectual property</li><li>Unauthorized intrusion or surveillance</li><li>Cloning a commercial product without permission</li></ul></div></div><p>REA analysis runs locally, but Claude Code may send selected tool results to its model provider. Keep sensitive material out of prompts unless the applicable policy and authorization permit it. Read the <a href="https://github.com/morluto/rea/blob/main/DISCLAIMER.md" target="_blank" rel="noreferrer">official REA disclaimer <ExternalLink size={13} /></a> before substantial work.</p></section>

      <section className="faq"><div className="content-heading"><span>FAQ</span><h2>Common REA and Claude Code questions</h2></div><div className="faq-list">{faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>

      <section className="guide-next"><span className="section-label">Next steps</span><h2>Continue with a verified setup</h2><div><Link href="/tools/rea-mcp-config">Generate your REA setup commands</Link><Link href="/guides">More guides</Link><Link href="/tools">All free tools</Link><a href="https://github.com/morluto/rea" target="_blank" rel="noreferrer">Official REA repository <ExternalLink size={13} /></a></div><p>Source and commands last checked on {REA_VERIFIED_DATE} against the official repository and published <code>rea-agents@{REA_PACKAGE_VERSION}</code>.</p></section>
    </article>
  </main>;
}
