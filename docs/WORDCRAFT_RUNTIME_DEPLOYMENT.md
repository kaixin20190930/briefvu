# WordCraft shared apps runtime

WordCraft is published at `https://apps.briefvu.com/wordcraft/`. Future standalone editors use
the same host and a separate first path segment, for example
`https://apps.briefvu.com/another-editor/`. Indexable product pages remain on
`https://briefvu.com/tools/...`; the runtime host sends `X-Robots-Tag: noindex, nofollow` and
serves a host-wide `robots.txt` that disallows crawling.

## Pinned upstream release

- Release: `v0.7.0`
- Asset: `wordcraft-web-0.7.0.zip`
- SHA-256: `98df7c68a0ac788a9ac0f531fd34c31ab7d89965abb4935f57168d287dab3189`
- Source: <https://github.com/storytold/wordcraft/releases/tag/v0.7.0>

The release ZIP was downloaded and its checksum verified on 2026-10-16. Do not edit the
upstream `index.html`, JavaScript, WebAssembly, licenses, or documentation before uploading.
The release ZIP does not contain the repository's `NOTICE`, `ATTRIBUTION.md`, or brand-license
file, so fetch those three files from the same `v0.7.0` tag and publish them beside the bundle:

- `NOTICE`: `8db865867d13975e1199a1ead02e61aeec45c7535cab0d6d48d039b8b6c72915`
- `ATTRIBUTION.md`: `2a28a5dae997462cce0b6bcb64d8f4de800f61ad3c6c09a33fdeec3f54ca13c2`
- `docs/brand/LICENSE-brand.txt`: `ed4475eacf972c9584aa335001c59dfa646eb222549b928ffd6aefd4c805b41a`

## Prepare and upload

Create the bucket once:

```bash
npx wrangler r2 bucket create briefvu-apps
```

Download and verify the release in a temporary directory:

```bash
curl -L https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-web-0.7.0.zip \
  -o /tmp/wordcraft-web-0.7.0.zip
echo "98df7c68a0ac788a9ac0f531fd34c31ab7d89965abb4935f57168d287dab3189  /tmp/wordcraft-web-0.7.0.zip" \
  | shasum -a 256 -c -
unzip -q /tmp/wordcraft-web-0.7.0.zip -d /tmp/wordcraft-web-0.7.0
```

Upload the allow-listed runtime and attribution files under the immutable version prefix
`wordcraft/v0.7.0/`. The names must match `lib/apps-runtime.ts`. Example:

```bash
npx wrangler r2 object put briefvu-apps/wordcraft/v0.7.0/index.html \
  --file /tmp/wordcraft-web-0.7.0/wordcraft-web-0.7.0/index.html \
  --content-type "text/html; charset=utf-8"
```

Repeat for the hashed JS, WASM, icon, both license files, `NOTICE`, `ATTRIBUTION.md`,
`LICENSE-brand.txt`, `README.md`, and `HOSTING.md`. Use the files from the release ZIP where
present and the same-tag repository files listed above for the three missing notices.
Then deploy the shared apps worker:

```bash
npx wrangler deploy --config wrangler.apps.jsonc
```

The worker maps the stable public folder to the pinned R2 prefix, applies the correct WASM MIME
type and cache policy, and rejects files not present in the verified release manifest.

## Release acceptance

Before enabling the landing-page CTA, verify on the production runtime:

1. `GET /wordcraft` redirects to `/wordcraft/` and preserves the query string.
2. `index.html` revalidates; hashed JS/WASM are immutable for one year.
3. Every response sends `X-Robots-Tag: noindex, nofollow`.
4. A blank document opens and accepts typing.
5. A representative DOCX opens, can be edited, saved, reopened, and exported to PDF.
6. Browser network inspection shows no request that uploads document contents.
7. Desktop Chrome completes the full flow; desktop Safari completes launch and save smoke tests.

Record only verified results on the public landing page. Do not publish document contents or test
customer files.
