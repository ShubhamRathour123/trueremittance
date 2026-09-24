export const PRODUCTION_CORRIDOR_SLUG = "uae-to-india";
export const SOURCE_CURRENCY = "AED";
export const TARGET_CURRENCY = "INR";
export const DEFAULT_SEND_AMOUNT = 1000;
export const MAX_SEND_AMOUNT = 1000000;

export const QUOTE_FRESHNESS_THRESHOLDS_MINUTES = {
  fresh: 10,
  recent: 30,
  aging: 60
} as const;

export const AMOUNT_PRESETS = [500, 1000, 2000, 5000, 10000, 20000] as const;

export const DELIVERY_METHOD_LABELS = {
  bank_transfer: "Bank transfer",
  cash_pickup: "Cash pickup",
  wallet: "Wallet"
} as const;

export const PAYMENT_METHOD_LABELS = {
  bank_transfer: "Bank transfer",
  debit_card: "Debit card",
  cash: "Cash"
} as const;

export const SOURCE_TYPE_LABELS = {
  MANUAL: "Manual entry",
  API: "Provider API",
  SCRAPER: "Scraper",
  PARTNER_FEED: "Partner feed",
  OTHER: "Other"
} as const;

export const VERIFICATION_STATUS_LABELS = {
  UNVERIFIED: "Unverified",
  MANUAL_REVIEWED: "Manually reviewed",
  PROVIDER_QUOTE: "Provider quote",
  FAILED: "Failed"
} as const;
