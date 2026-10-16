export const wordcraftRuntimeUrl =
  "https://apps.briefvu.com/wordcraft/?from=wordcraft-online";

// Enabled after the pinned R2 bundle, apps Worker, and production smoke checks passed.
export const wordcraftRuntimeReady = true;

export const wordcraftRelease = {
  version: "0.7.0",
  releaseUrl: "https://github.com/storytold/wordcraft/releases/tag/v0.7.0",
  repositoryUrl: "https://github.com/storytold/wordcraft",
  roadmapUrl: "https://github.com/storytold/wordcraft/blob/v0.7.0/ROADMAP.md",
  noticeUrl: "https://github.com/storytold/wordcraft/blob/v0.7.0/NOTICE",
  attributionUrl: "https://github.com/storytold/wordcraft/blob/v0.7.0/ATTRIBUTION.md",
  brandLicenseUrl:
    "https://github.com/storytold/wordcraft/blob/v0.7.0/docs/brand/LICENSE-brand.txt",
  releaseSha256:
    "98df7c68a0ac788a9ac0f531fd34c31ab7d89965abb4935f57168d287dab3189",
} as const;

export const wordcraftFaqs = [
  {
    question: "Is WordCraft Online free?",
    answer:
      "Yes. WordCraft is open-source software available under the MIT or Apache-2.0 license. BriefVu provides this hosted browser version without an account, time limit, watermark, or paid feature gate. WordCraft is still alpha software, so free access does not mean every Microsoft Word feature or document will behave identically.",
  },
  {
    question: "Is this the official WordCraft website?",
    answer:
      "No. WordCraft is developed by the ArtCraft team and contributors. BriefVu independently hosts an unmodified official v0.7.0 web release for convenient browser access and links to the upstream repository, release, licenses, required notice, and attribution files. BriefVu is not affiliated with or endorsed by the WordCraft or ArtCraft maintainers.",
  },
  {
    question: "Does BriefVu upload or store my document?",
    answer:
      "The static WordCraft web app reads and edits document bytes inside your browser. This BriefVu runtime does not provide a document-upload API and is not designed to send document contents to BriefVu for editing or storage. The browser still downloads the application files from apps.briefvu.com, and ordinary server access logs can record requests for those files without receiving the document itself.",
  },
  {
    question: "Will my DOCX look exactly the same as it does in Microsoft Word?",
    answer:
      "Exact fidelity is not guaranteed. Straightforward documents may transfer well, but complex pagination, fonts, charts, SmartArt, templates, text boxes, or other advanced structures can render or round-trip differently. Work from a copy, save frequently, and review the resulting DOCX or PDF in the application and environment where it will be shared or printed.",
  },
  {
    question: "Which file formats does WordCraft support?",
    answer:
      "The v0.7.0 upstream release documents DOCX read and write, Word 97–2003 DOC import, PDF export, and ODT, RTF, HTML, Markdown, TeX, and TXT import and export. Browser behavior can vary by file and complexity, so keep the original and verify the output before replacing it.",
  },
  {
    question: "Does WordCraft support comments and tracked changes?",
    answer:
      "The upstream v0.7.0 feature list includes comments, tracked changes, and accepting or rejecting changes. WordCraft remains alpha software, so test these workflows with representative copies of your own documents before relying on them for a critical review process.",
  },
  {
    question: "Can I use WordCraft offline?",
    answer:
      "Not as a dependable installed offline app. Once the WebAssembly application has loaded, editing may continue during a temporary connection loss, but this hosted build does not install a service worker. Refreshing the page or returning after the browser cache is cleared requires a connection to download the application again.",
  },
  {
    question: "Which browsers and devices are supported?",
    answer:
      "WordCraft requires a modern browser with WebGPU or WebGL2. BriefVu recommends a desktop browser because the ribbon and document canvas are designed for a larger screen and keyboard. Mobile browsers are not part of the supported v1 experience. If the normal renderer has a driver problem, the upstream web build also supports a WebGL fallback.",
  },
] as const;
