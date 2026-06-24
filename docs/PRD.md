# TrueRemittance MVP PRD

## Mission
TrueRemittance helps users compare remittance providers and choose the option that maximizes the recipient amount for international transfers.

## MVP Corridor
- Origin: United Arab Emirates
- Destination: India
- Send currency: AED
- Receive currency: INR

## MVP Providers
The MVP includes only these providers:
- Wise
- Western Union
- MoneyGram
- Remitly
- LuLu Exchange
- Al Ansari Exchange
- Emirates NBD
- ICICI Bank
- Xpress Money, only if manually maintained data is available

Total providers must not exceed 10 in MVP.

## User Goal
A sender enters an AED amount and immediately sees ranked provider options ordered by highest recipient amount in INR.

## Ranking Rule
Recipient amount is calculated as:

```text
recipientAmount = (sendAmount - baseFee) * exchangeRate
```

Providers are sorted descending by `recipientAmount`.

## Quote Fields
Each manually entered quote must include:
- Base fee in AED
- Provider exchange rate
- Delivery method: `bank_transfer`, `cash_pickup`, or `wallet`
- Payment method: `bank_transfer`, `debit_card`, or `cash`
- Timestamp
- Optional mid-market rate for hidden margin display

## Admin Requirements
MVP rates are manually managed only.

Admin users can:
- Create and update providers
- Add corridor pricing for UAE to India
- Enter fee and exchange rate per provider
- Save timestamped quote snapshots

## Out of Scope
- Provider API integrations
- Scraping
- Full user authentication
- Multi-corridor support
- Complex tiered or promotional fee modeling
- Compliance workflows

## Trust Requirements
- Do not show fabricated live-rate claims.
- Clearly show fee, exchange rate, and last updated time.
- Protect admin routes with server-side authentication.
