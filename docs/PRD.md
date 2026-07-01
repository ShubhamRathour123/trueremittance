# TrueRemittance PRD

## Product Context

TrueRemittance is a production remittance comparison platform for the UAE to India corridor, deployed at https://trueremittance.vercel.app/.

The product helps a sender compare providers by the final INR amount received, not only by advertised exchange rate. This matters because remittance value depends on both provider fee and FX rate.

## Corridor

- Origin country: United Arab Emirates
- Destination country: India
- Send currency: AED
- Receive currency: INR

## Providers

The production data model supports active and inactive providers. Seed data includes common UAE to India remittance providers such as Wise, Western Union, MoneyGram, Remitly, LuLu Exchange, Al Ansari Exchange, Emirates NBD, ICICI Bank, and Xpress Money.

Only active providers with a current quote for the UAE to India corridor are shown in comparison results.

## User Goal

A sender enters an AED amount and sees providers ranked by highest estimated INR payout.

## Ranking Rule

Recipient amount is calculated as:

```text
recipientAmount = (sendAmount - baseFee) * exchangeRate
```

Providers are sorted from highest to lowest `recipientAmount`. Quotes with a fee greater than or equal to the send amount are excluded.

## Quote Fields

Each admin-entered quote includes:

- Base fee in AED
- Provider exchange rate
- Delivery method: `bank_transfer`, `cash_pickup`, or `wallet`
- Payment method: `bank_transfer`, `debit_card`, or `cash`
- Timestamp
- Optional mid-market rate for hidden margin display

## Admin Requirements

Rates are managed manually through the protected admin dashboard.

Admin users can:

- Create or update providers
- Mark providers active or inactive
- Add timestamped rate snapshots for the UAE to India corridor
- Maintain fee, FX rate, delivery method, and payment method details

## Production Constraints

- The platform does not claim automated live provider feeds.
- Public users cannot mutate provider or quote data.
- Admin routes require server-side session validation.
- The UI must handle empty provider or quote data without crashing.

## Out Of Scope

- Provider API integrations
- Scraping
- User accounts
- Multi-corridor comparison
- Tiered promotional fee modeling
- Compliance workflows
