export const photocraftRuntimeUrl =
  "https://apps.briefvu.com/photocraft/?from=photocraft-online";

// Enabled after the pinned R2 bundle, apps Worker, and production smoke checks passed.
export const photocraftRuntimeReady = true;

export const photocraftRelease = {
  version: "0.9.0",
  releaseUrl: "https://github.com/storytold/photocraft/releases/tag/v0.9.0",
  repositoryUrl: "https://github.com/storytold/photocraft",
  roadmapUrl: "https://github.com/storytold/photocraft/blob/v0.9.0/ROADMAP.md",
  noticeUrl: "https://github.com/storytold/photocraft/blob/v0.9.0/NOTICE",
  attributionUrl: "https://github.com/storytold/photocraft/blob/v0.9.0/ATTRIBUTION.md",
  brandLicenseUrl:
    "https://github.com/storytold/photocraft/blob/v0.9.0/docs/brand/LICENSE-brand.txt",
  releaseSha256:
    "b3fa5ab6a9d32bc5ff7dfdde31939a2337471a196a2e70f1ff961a61b1bb02e6",
} as const;

export const photocraftFaqs = [
  {
    question: "Is PhotoCraft Online free?",
    answer:
      "Yes. PhotoCraft is open-source software available under the MIT or Apache-2.0 license, and BriefVu provides this hosted browser version without an account or paid feature gate. PhotoCraft is early alpha software, so use copies of important images and check exported files before relying on them.",
  },
  {
    question: "Is this the official PhotoCraft website?",
    answer:
      "No. PhotoCraft is developed by the ArtCraft team and contributors. BriefVu independently hosts an unmodified official v0.9.0 web release for convenient browser access and links to the upstream repository, release, licenses, notice, and attribution files. BriefVu is not affiliated with or endorsed by the maintainers.",
  },
  {
    question: "Does BriefVu upload or store my image?",
    answer:
      "The official static web build opens and processes image data on your device. The BriefVu runtime does not provide an image-upload or cloud-storage API. Your browser downloads the editor files from apps.briefvu.com, while normal server logs may record requests for those application assets without receiving the image you edit.",
  },
  {
    question: "Can PhotoCraft Online open PSD files?",
    answer:
      "PhotoCraft supports layered PSD and PSB files, including many common layers, masks, type, effects, and adjustment workflows. It is still early alpha software, so complex files may not round-trip perfectly. Open a copy, review the layer structure and appearance, then verify the saved result in the application where it will be used.",
  },
  {
    question: "Which image formats can I use?",
    answer:
      "The v0.9.0 project documentation includes PSD, PSB, layered TIFF, OpenRaster, PNG, JPEG, WebP, GIF, BMP, SVG, OpenEXR, HDR, and other formats. Support differs by format: some are read-only, some are flattened on export, and some retain layers. The table on this page highlights the most useful browser workflows.",
  },
  {
    question: "Does PhotoCraft save my work automatically?",
    answer:
      "No dependable web autosave or crash recovery is provided by the official hosted build. Save or export your work before refreshing or closing the tab. Preferences can be stored in browser localStorage, but that is not a backup of the document you are editing.",
  },
  {
    question: "Which browser should I use for PhotoCraft Online?",
    answer:
      "Use a current desktop browser with WebGPU or WebGL2. BriefVu recommends desktop Chrome for the first release because the editor has a dense professional interface and benefits from a keyboard, mouse, and larger screen. PhotoCraft can fall back to WebGL2 when WebGPU is unavailable or has a driver problem.",
  },
] as const;
