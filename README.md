# BriefVu Tools

BriefVu is a first-party browser tool platform: small, focused utilities run directly on BriefVu rather than acting as a directory of third-party products.

## Current tools

- **Invisible Text Generator** generates, copies, and locally verifies documented Unicode characters.
- **Image Color Picker** samples local images and returns HEX, RGB, and HSL values without uploading the image.
- **WordCraft Online** is implemented as a pending third tool. Its product page lives at
  `/tools/wordcraft-online`; the pinned upstream web release will run at
  `https://apps.briefvu.com/wordcraft/` after production runtime acceptance.

The WordCraft runtime is separate from the indexable Next.js site because its WebAssembly file
exceeds the Cloudflare Workers static-asset limit. `apps-worker.ts` streams a strict allow-list
from R2, and `wrangler.apps.jsonc` deploys the shared apps host. Future standalone editors use
another first path segment on the same host rather than a new subdomain.

### Invisible Text Generator

The Invisible Text Generator lets a user:

- choose among five explicitly documented Unicode characters;
- generate 1–500 code points;
- copy the exact payload with a visible success or failure state;
- paste a value back and compare it with the copied payload;
- inspect mutually exclusive counts for supported characters, other Unicode whitespace, and other code points.

Generation and verification happen in React state in the browser. The tool makes no API request, stores no input, and does not use `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000/tools>.

## Verify

```bash
npm test
npm run lint
npm run build
git diff --check
```

## Architecture

- Next.js App Router pages and content remain Server Components.
- `components/InvisibleTextTool.tsx` is the interactive Client Component.
- `lib/invisible-text.ts` contains the Unicode catalog and pure generation, analysis, and verification functions.
- `lib/tools/registry.ts` is the first-party tool registry and already reserves tool status and access tier.
- `lib/apps-runtime.ts` pins standalone app releases and maps stable public paths to immutable R2 keys.
- `apps-worker.ts` serves `apps.briefvu.com` with MIME, cache, and no-index headers.
- `docs/WORDCRAFT_RUNTIME_DEPLOYMENT.md` records the checksum, upload procedure, and acceptance checks.
- OpenNext and Cloudflare configuration deploy the indexable site separately from the shared apps runtime.

## Product boundaries

BriefVu does not promise compatibility with any named platform. Apps can strip, normalize, replace, or reject Unicode characters. The tool is for legitimate formatting and validation tests, not for evading moderation, bans, anti-cheat systems, or service rules.

## Deployment

WordCraft remains `coming-soon`, excluded from the sitemap, and has no live CTA until its R2
bundle, apps Worker, and production smoke checks pass. Set `wordcraftRuntimeReady` in
`lib/wordcraft.ts` to `true` only after completing the deployment checklist.
