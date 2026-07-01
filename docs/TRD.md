# TrueRemittance TRD

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL hosted on Neon in production
- Vercel deployment

## Runtime Configuration

Required environment variables:

```text
DATABASE_URL
ADMIN_SECRET
ADMIN_SESSION_SECRET
```

`DATABASE_URL` points to PostgreSQL. `ADMIN_SECRET` is the internal admin password. `ADMIN_SESSION_SECRET` signs the HTTP-only admin session cookie.

## Data Model

Core entities:

- `Provider`
- `Corridor`
- `RateQuote`

`Provider` stores remittance company details, public URLs, optional affiliate URLs, and active status.

`Corridor` stores the supported transfer route. The current production corridor is UAE to India, using AED as source currency and INR as target currency.

`RateQuote` stores timestamped quote snapshots. New rate entries create new rows instead of overwriting previous quote records.

## Admin Auth

Admin authentication is intentionally small for this project:

- Admin submits the password on `/admin/login`.
- Server compares the submitted value with `ADMIN_SECRET`.
- Server issues an HTTP-only signed session cookie.
- `/admin` and `/api/admin/*` validate the session server-side.

There is no user table, OAuth provider, or NextAuth dependency in the current implementation.

## Comparison Logic

Input:

- Send amount in AED
- Fixed production corridor: UAE to India

Output:

- Ranked provider results
- Base fee, FX rate, delivery method, payment method, hidden margin when mid-market rate exists, and timestamp

Formula:

```text
recipientAmount = (sendAmount - baseFee) * exchangeRate
```

Validation:

- Send amount must be positive.
- Quotes with fees greater than or equal to the send amount are excluded.
- Only active providers are shown.
- Only the latest quote per active provider is used for public ranking.

## Error Handling

- Empty database state returns empty public results instead of throwing.
- Missing corridor data disables quote creation in the admin dashboard.
- Invalid admin form submissions redirect back to `/admin` with a status message.
- Public routes do not expose environment secrets or stack traces.

## Deployment Notes

- Production is deployed on Vercel at https://trueremittance.vercel.app/.
- Production database is PostgreSQL on Neon.
- Run committed Prisma migrations before production deployment.
- Seed the UAE to India corridor and provider records before adding production rate snapshots.
