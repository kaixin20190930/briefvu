# Briefvu Intake MVP

Phase 1 implementation of the Custom Apparel Intake Assistant: paste a customer enquiry, verify structured fields against exact source evidence, resolve conflicts, classify missing details by quote mode, and copy a clarification draft or job spec.

The current product strategy and the complete next-stage Customer Reply Loop specification are documented in [`docs/PRODUCT_STRATEGY_AND_V0_REPLY_LOOP_CN.md`](docs/PRODUCT_STRATEGY_AND_V0_REPLY_LOOP_CN.md).

The production-ready V0 test plan and cross-industry mock enquiry/reply set are in [`docs/V0_TEST_PLAN_AND_MOCK_MESSAGES_CN.md`](docs/V0_TEST_PLAN_AND_MOCK_MESSAGES_CN.md).

The frozen Pilot release baseline is in [`docs/RELEASE_BASELINE_V0_PILOT_CN.md`](docs/RELEASE_BASELINE_V0_PILOT_CN.md). Pilot recruitment, onboarding, interview, and tracking materials are in [`docs/PILOT_RECRUITMENT_AND_ONBOARDING_KIT_CN.md`](docs/PILOT_RECRUITMENT_AND_ONBOARDING_KIT_CN.md), with a participant-facing quick start in [`docs/PILOT_SHOP_QUICKSTART_EN.md`](docs/PILOT_SHOP_QUICKSTART_EN.md).

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Without an API key, the app uses a deterministic demo parser so the full approval workflow remains testable.

To enable OpenAI Structured Outputs, copy `.env.example` to `.env.local` and set `OPENAI_API_KEY`. Set `RATE_LIMIT_SALT` to any long local-only value. The API request uses `store: false`; raw enquiry text is not written to D1.

## Verify

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
npx opennextjs-cloudflare build
```

View the privacy-safe production monitoring report:

```bash
npm run monitoring:report
npm run monitoring:report -- 1
```

## Cloudflare setup

1. Create the analytics database:

   ```bash
   npx wrangler d1 create threadline-intake
   ```

2. Replace the placeholder `database_id` in `wrangler.jsonc` with the returned ID.
3. Apply the privacy-safe analytics migration:

   ```bash
   npx wrangler d1 migrations apply threadline-intake --remote
   ```

4. Add the server-side API key:

   ```bash
   npx wrangler secret put OPENAI_API_KEY
   ```

5. Add a separate random salt for privacy-safe API rate limiting:

   ```bash
   openssl rand -hex 32 | npx wrangler secret put RATE_LIMIT_SALT
   ```

6. Deploy:

   ```bash
   npm run deploy
   ```

Generate binding types again after changing Cloudflare bindings with `npm run cf-typegen`.

## Privacy boundary

D1 analytics stores anonymous session IDs, event names, counts, and small non-content metadata only. It does not store customer enquiry text, extracted field values, evidence snippets, clarification drafts, or job specs.

Paid-pilot applications are a separate, explicit-consent data flow. They store the applicant's shop/contact details and workflow answers in `pilot_leads`, deduplicated by normalized email. Abuse controls store only a salted network hash, route name, time window, and count in `api_rate_limits`; raw IP addresses are never stored.

## Paid-pilot operations

List the newest applications without exposing notes unnecessarily:

```bash
npx wrangler d1 execute threadline-intake --remote --command \
  "SELECT created_at, shop_name, contact_name, email, weekly_enquiries, current_workflow, status FROM pilot_leads ORDER BY created_at DESC LIMIT 25"
```

The public API accepts at most five applications per network per hour. Analysis is limited to 30 calls per network per 15 minutes and OpenAI requests time out after 30 seconds.
