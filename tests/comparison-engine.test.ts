import assert from "node:assert/strict";
import test from "node:test";
import { compareQuotes, calculateFxSpreadPercent, calculateRecipientAmount, getQuoteFreshnessStatus } from "../src/lib/comparison/engine";
import type { QuoteForComparison } from "../src/lib/comparison/types";

const now = new Date("2026-09-15T08:00:00.000Z");

function quote(overrides: Partial<QuoteForComparison>): QuoteForComparison {
  return {
    providerId: "provider-a",
    providerName: "Provider A",
    providerSlug: "provider-a",
    sendAmount: 1000,
    sendCurrency: "AED",
    receiveCurrency: "INR",
    baseFee: 0,
    feeCurrency: "AED",
    exchangeRate: 26,
    midMarketRate: null,
    deliveryMethod: "bank_transfer",
    paymentMethod: "bank_transfer",
    deliverySpeed: null,
    sourceType: "MANUAL",
    sourceReference: null,
    verificationStatus: "MANUAL_REVIEWED",
    isPromotional: false,
    promotionExpiresAt: null,
    minimumAmount: null,
    maximumAmount: null,
    notes: null,
    statusMessage: null,
    fetchedAt: null,
    timestamp: new Date("2026-09-15T07:59:00.000Z"),
    ...overrides
  };
}

test("calculates recipient amount after fee", () => {
  assert.equal(calculateRecipientAmount(1000, 5, 26), 25870);
  assert.equal(calculateRecipientAmount(1000, 0, 25.6), 25600);
});

test("ranks providers by recipient payout by default", () => {
  const results = compareQuotes(
    1000,
    [
      quote({ providerId: "a", providerName: "A", providerSlug: "a", exchangeRate: 25.9 }),
      quote({ providerId: "b", providerName: "B", providerSlug: "b", exchangeRate: 25.7 }),
      quote({ providerId: "c", providerName: "C", providerSlug: "c", exchangeRate: 25.85 })
    ],
    {},
    now
  );

  assert.deepEqual(results.map((result) => result.providerName), ["A", "C", "B"]);
  assert.equal(results[0].rank, 1);
  assert.equal(results[0].isBestOption, true);
});

test("stale quotes rank below fresher quotes", () => {
  const results = compareQuotes(
    1000,
    [
      quote({
        providerId: "stale",
        providerName: "Stale High",
        providerSlug: "stale",
        exchangeRate: 30,
        timestamp: new Date("2026-09-15T06:00:00.000Z")
      }),
      quote({
        providerId: "fresh",
        providerName: "Fresh Lower",
        providerSlug: "fresh",
        exchangeRate: 25,
        timestamp: new Date("2026-09-15T07:59:00.000Z")
      })
    ],
    {},
    now
  );

  assert.equal(results[0].providerName, "Fresh Lower");
  assert.equal(results[1].freshnessStatus, "stale");
});

test("filters invalid amounts and unusable quotes", () => {
  assert.deepEqual(compareQuotes(0, [quote({})]), []);
  assert.deepEqual(compareQuotes(-10, [quote({})]), []);
  assert.deepEqual(compareQuotes(Number.NaN, [quote({})]), []);
  assert.deepEqual(compareQuotes(1000, [quote({ baseFee: 1000 })]), []);
  assert.deepEqual(compareQuotes(1000, [quote({ exchangeRate: 0 })]), []);
});

test("supports amount limits", () => {
  assert.equal(compareQuotes(500, [quote({ minimumAmount: 1000 })]).length, 0);
  assert.equal(compareQuotes(5000, [quote({ maximumAmount: 1000 })]).length, 0);
  assert.equal(compareQuotes(1000, [quote({ minimumAmount: 500, maximumAmount: 5000 })]).length, 1);
});

test("classifies quote freshness", () => {
  assert.equal(getQuoteFreshnessStatus(new Date("2026-09-15T07:59:00.000Z"), now), "fresh");
  assert.equal(getQuoteFreshnessStatus(new Date("2026-09-15T07:45:00.000Z"), now), "recent");
  assert.equal(getQuoteFreshnessStatus(new Date("2026-09-15T07:15:00.000Z"), now), "aging");
  assert.equal(getQuoteFreshnessStatus(new Date("2026-09-15T06:59:00.000Z"), now), "stale");
});

test("only shows mathematically plausible FX spread", () => {
  assert.equal(calculateFxSpreadPercent(25, 26), 3.85);
  assert.equal(calculateFxSpreadPercent(40, 26), null);
  assert.equal(calculateFxSpreadPercent(25, null), null);
});
