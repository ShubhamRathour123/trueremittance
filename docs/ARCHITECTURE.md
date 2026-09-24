# TrueRemittance Architecture

## Production System

TrueRemittance is deployed at https://trueremittance.vercel.app/ as a Next.js full-stack application backed by Prisma and PostgreSQL.

The current production scope is the UAE to India remittance corridor. Provider rates are maintained through an internal admin dashboard and exposed through a public comparison page.

## Code Boundaries

- UI components: `src/components`
- Public and admin routes: `src/app`
- Comparison logic: `src/lib/comparison`
- Data access: `src/lib/data`
- Admin auth: `src/lib/admin-auth`
- Prisma schema and migrations: `prisma`

## Public Comparison Flow

1. User enters an AED send amount on `/`.
2. Server loads the UAE to India corridor by slug.
3. Server reads active providers and their latest quote snapshot.
4. Comparison engine calculates final INR payout, effective rate, freshness status, and difference from the next best provider.
5. Results render as provider cards ranked by the selected priority, with stale quotes ranked below fresher quotes.

If no corridor or quotes exist yet, the public page renders an empty state instead of failing.

## Admin Rate Management Flow

1. Admin logs in through `/admin/login`.
2. Server validates the password against `ADMIN_SECRET`.
3. Server sets a signed HTTP-only session cookie.
4. Protected admin pages and API routes validate the session.
5. Admin creates or updates providers and adds timestamped quote snapshots.

The admin dashboard does not overwrite historical quote rows. Each rate entry creates a new `RateQuote` snapshot.

## Redirect Flow

1. User clicks the provider action.
2. `/redirect/[providerSlug]` loads the provider by slug.
3. Active providers redirect to affiliate URL when present, otherwise website URL.
4. The click is recorded with provider, corridor, placement, CTA type, destination, and timestamp.
5. Missing, inactive, or URL-less providers return `404`.

Affiliate destinations are configured on the `Provider` record through `affiliateUrl`. The Remitly referral link is also defined once in `src/lib/provider-affiliates.ts` so the redirect route has a server-side fallback for existing database rows where `affiliateUrl` has not been populated yet. The admin dashboard remains the preferred place to change provider affiliate URLs without changing comparison UI code.

## Quote Normalization

The comparison engine consumes normalized `RateQuote` data regardless of source. Current quotes are manual, but the schema supports future `API`, `SCRAPER`, `PARTNER_FEED`, and `OTHER` source types.

Manual/API/Scraper/Partner Feed -> normalized quote -> validation -> comparison engine -> ranking.

## Freshness Policy

- Fresh: less than 10 minutes old
- Recent: 10-30 minutes old
- Aging: 30-60 minutes old
- Stale: more than 60 minutes old

Stale quotes are not hidden automatically, but they are ranked below fresher usable quotes and labelled in the UI.

## Data Policy

All provider quotes are manually entered. The production system does not include scraping, scheduled imports, or third-party provider API integrations.

## Operational Notes

- Vercel hosts the Next.js application.
- Neon hosts the PostgreSQL database.
- Prisma migrations define production schema changes.
- Required environment variables are documented in `.env.example` and `README.md`.

## Future Upgrade Points

- Role-based admin accounts
- Multi-corridor support
- Quote import tooling
- Audit logs for admin rate changes
- Provider API integrations where legally and technically available
- Rate alerts and historical trend analysis
- Provider profile and provider-vs-provider SEO pages backed by real data
