# PhotoCraft shared apps runtime

PhotoCraft is published at `https://apps.briefvu.com/photocraft/`. Its indexable product page is
`https://briefvu.com/tools/photocraft-online`. The runtime host sends
`X-Robots-Tag: noindex, nofollow` and its host-wide `robots.txt` disallows crawling.

## Pinned upstream release

- Release: `v0.9.0`
- Asset: `photocraft-web-0.9.0.zip`
- SHA-256: `b3fa5ab6a9d32bc5ff7dfdde31939a2337471a196a2e70f1ff961a61b1bb02e6`
- Source: <https://github.com/storytold/photocraft/releases/tag/v0.9.0>

The official release archive was downloaded and its checksum verified on 2026-10-17. The
upstream `index.html`, JavaScript, WebAssembly, licenses, README, and hosting guide are served
unchanged. The release ZIP omits the repository's `NOTICE`, `ATTRIBUTION.md`, and brand-license
file, so those files were fetched from the same `v0.9.0` tag and published beside the bundle.

R2 keys use the immutable `photocraft/v0.9.0/` prefix. The allow-list and stable public routing
are defined in `lib/apps-runtime.ts`; deploy them with:

```bash
npm run apps:deploy
```

## Production verification

Completed on 2026-10-17:

1. `/photocraft` redirects to `/photocraft/` while preserving the query string.
2. The HTML shell revalidates; hashed JavaScript and WebAssembly use immutable caching.
3. HTML, WASM, robots, and error responses send `X-Robots-Tag: noindex, nofollow`.
4. The WASM response uses `application/wasm`.
5. Desktop Chrome launched the editor and opened a local PNG.
6. A new image layer was created.
7. Export As produced a downloadable PNG.
8. Unlisted runtime files returned 404.

The official static build has no image-upload or cloud-storage API. Do not add document or image
content, filenames, or editing history to analytics. Re-run the open/edit/export smoke path when
the pinned release changes.
