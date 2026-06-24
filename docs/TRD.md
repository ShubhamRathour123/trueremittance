# TrueRemittance MVP TRD

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Vercel deployment target

## Runtime Assumptions
- `DATABASE_URL` points to PostgreSQL.
- `ADMIN_SECRET` stores the internal admin password.
- `ADMIN_SESSION_SECRET` signs admin session cookies.

## Data Model
Core entities:
- `Provider`
- `Corridor`
- `RateQuote`

`RateQuote` snapshots are immutable records for historical accuracy. Updating a provider's rate creates a new quote row rather than overwriting previous quote data.

## Admin Auth
MVP admin auth is a minimal password gate:
- Admin submits password on `/admin/login`.
- Server compares it with `ADMIN_SECRET`.
- Server issues an HTTP-only signed session cookie.
- `/admin` pages and `/api/admin/*` endpoints validate the cookie server-side.

No user table, OAuth, or NextAuth is used in MVP.

## Comparison Logic
Inputs:
- Send amount in AED
- Corridor, fixed to UAE to India for MVP

Outputs:
- Provider ranking by recipient amount
- Fee, FX rate, delivery method, payment method, hidden margin if mid-market rate is present

Formula:

```text
recipientAmount = (sendAmount - baseFee) * exchangeRate
```

Validation:
- Send amount must be positive.
- Quotes with a fee greater than or equal to send amount are excluded from ranking.
- Provider quotes must belong to the selected corridor.

## Security Constraints
- `ADMIN_SECRET` is never exposed to client components.
- Admin cookies are HTTP-only, same-site strict, and secure in production.
- Public routes cannot mutate quote data.

## Deployment Notes
- Run Prisma migrations against PostgreSQL before deployment.
- Configure `DATABASE_URL`, `ADMIN_SECRET`, and `ADMIN_SESSION_SECRET` in Vercel.
- Seed static corridor and provider records before entering production rates.
