# TrueRemittance

TrueRemittance is a production remittance comparison platform for the UAE to India corridor. It ranks providers by the actual INR amount a recipient receives after AED fees and provider exchange rates are applied.

## Live Demo

[https://trueremittance.vercel.app/](https://trueremittance.vercel.app/)

## GitHub Repository

[https://github.com/ShubhamRathour123/trueremittance](https://github.com/ShubhamRathour123/trueremittance)

## Features

- UAE to India remittance comparison
- Provider ranking by highest recipient payout
- Transparent fee and exchange-rate breakdown
- Timestamped rate snapshots
- Protected admin dashboard for manual rate management
- Affiliate/provider redirect route
- PostgreSQL data model managed with Prisma
- Vercel-ready Next.js App Router application

## Screenshots

Screenshots will be added here as the product UI evolves.

| Home comparison | Admin dashboard |
| --- | --- |
| Placeholder | Placeholder |

## Tech Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL on Neon
- **ORM:** Prisma
- **Deployment:** Vercel

## Architecture Overview

TrueRemittance keeps the database as the single source of truth for provider rates. The public homepage loads the latest active quote per provider from PostgreSQL, calculates the recipient amount, and ranks providers by payout.

```text
Recipient Amount = (Send Amount - Fee) x Exchange Rate
```

The admin dashboard creates and updates provider records and quote snapshots. No exchange rates or fees are hardcoded in React components.

## Folder Structure

```text
.
├── docs/                     Product and technical documentation
├── prisma/                   Prisma schema, migrations, and seed script
├── src/app/                  Next.js App Router routes
├── src/app/api/admin/        Protected admin API endpoints
├── src/components/           Reusable UI components
├── src/lib/                  Prisma client, data access, auth, and comparison logic
└── README.md                 Project documentation
```

## Installation

```bash
git clone https://github.com/ShubhamRathour123/trueremittance.git
cd trueremittance
npm install
```

## Environment Variables

Create a local `.env` file:

```bash
cp .env.example .env
```

Required variables:

```text
DATABASE_URL=
ADMIN_SECRET=
ADMIN_SESSION_SECRET=
```

- `DATABASE_URL`: PostgreSQL connection string.
- `ADMIN_SECRET`: Password used to access the internal admin dashboard.
- `ADMIN_SESSION_SECRET`: Long random secret used to sign HTTP-only admin session cookies.

Never commit real `.env` values.

## Database Setup

Run Prisma migrations against your PostgreSQL database:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

Seed the MVP corridor, provider list, and initial rate quotes:

```bash
npm run prisma:seed
```

Use `npm run prisma:push` only for local development experiments. Production database changes should use committed Prisma migrations.

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment on Vercel

1. Connect the GitHub repository to Vercel.
2. Add `DATABASE_URL`, `ADMIN_SECRET`, and `ADMIN_SESSION_SECRET` in Vercel project settings.
3. Run Prisma migrations against the production database.
4. Deploy the Next.js application.

The project is designed for Vercel serverless deployment with Neon PostgreSQL.

## Admin Login

The admin dashboard is available at `/admin/login`.

MVP admin access uses a simple server-side password gate:

- Admin enters the password configured as `ADMIN_SECRET`.
- The server validates the password.
- A signed HTTP-only session cookie is issued.
- Protected admin routes and endpoints validate the cookie before allowing access.

This is intentionally minimal for the MVP and can be upgraded to role-based authentication later.

## Exchange Rate Management

Rates are managed manually from the admin dashboard. Each quote stores:

- Provider
- Corridor
- Fee in AED
- Exchange rate to INR
- Delivery method
- Payment method
- Timestamp
- Optional mid-market rate

The homepage, ranking engine, comparison cards, and calculator all use the latest database quote per provider.

## Future Roadmap

- Multi-corridor support
- Role-based admin authentication
- Quote audit logs
- Provider API integrations where available
- Automated rate freshness alerts
- Affiliate click analytics
- User-facing provider filters

## License

This project is currently private/proprietary. Add an open-source license before distributing publicly.

## Author

Built by [Shubham Rathour](https://github.com/ShubhamRathour123).
