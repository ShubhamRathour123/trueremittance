# TrueRemittance

Production-grade MVP for comparing UAE to India remittance providers by highest recipient amount.

## Setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Use `npm run prisma:push` only for local development schema experiments. Production database changes should use committed Prisma migrations.

Required environment variables:

```text
DATABASE_URL=
ADMIN_SECRET=
ADMIN_SESSION_SECRET=
```

## MVP Scope
- UAE to India corridor only
- Manual admin-managed provider quotes
- Ranking by `(sendAmount - baseFee) * exchangeRate`
- Protected internal admin panel using `ADMIN_SECRET`
