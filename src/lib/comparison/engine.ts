import { MAX_SEND_AMOUNT, QUOTE_FRESHNESS_THRESHOLDS_MINUTES } from "../constants";
import type { ComparisonFilters, ProviderComparisonResult, QuoteForComparison, QuoteFreshnessStatus } from "./types";

export function calculateRecipientAmount(sendAmount: number, baseFee: number, exchangeRate: number): number {
  return roundMoney((sendAmount - baseFee) * exchangeRate);
}

export function calculateFxSpreadPercent(exchangeRate: number, midMarketRate: number | null): number | null {
  if (midMarketRate === null || midMarketRate <= 0 || exchangeRate <= 0 || exchangeRate > midMarketRate * 1.25) {
    return null;
  }

  return roundPercent(((midMarketRate - exchangeRate) / midMarketRate) * 100);
}

export function calculateEffectiveRate(recipientAmount: number, sendAmount: number): number {
  return sendAmount > 0 ? roundRate(recipientAmount / sendAmount) : 0;
}

export function getQuoteFreshnessStatus(timestamp: Date, now: Date = new Date()): QuoteFreshnessStatus {
  const ageMinutes = getQuoteAgeMinutes(timestamp, now);

  if (ageMinutes < QUOTE_FRESHNESS_THRESHOLDS_MINUTES.fresh) {
    return "fresh";
  }

  if (ageMinutes < QUOTE_FRESHNESS_THRESHOLDS_MINUTES.recent) {
    return "recent";
  }

  if (ageMinutes < QUOTE_FRESHNESS_THRESHOLDS_MINUTES.aging) {
    return "aging";
  }

  return "stale";
}

export function getQuoteAgeMinutes(timestamp: Date, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - timestamp.getTime()) / 60000));
}

export function isValidSendAmount(sendAmount: number): boolean {
  return Number.isFinite(sendAmount) && sendAmount > 0 && sendAmount <= MAX_SEND_AMOUNT;
}

export function compareQuotes(
  sendAmount: number,
  quotes: QuoteForComparison[],
  filters: ComparisonFilters = {},
  now: Date = new Date()
): ProviderComparisonResult[] {
  if (!isValidSendAmount(sendAmount)) {
    return [];
  }

  const rankingMode = filters.rankingMode ?? "best_payout";
  const rankedResults = quotes
    .filter((quote) => isQuoteUsableForAmount(quote, sendAmount))
    .filter((quote) => !filters.deliveryMethod || quote.deliveryMethod === filters.deliveryMethod)
    .filter((quote) => !filters.paymentMethod || quote.paymentMethod === filters.paymentMethod)
    .map((quote) => ({
      ...quote,
      recipientAmount: calculateRecipientAmount(sendAmount, quote.baseFee, quote.exchangeRate),
      effectiveRate: calculateEffectiveRate(calculateRecipientAmount(sendAmount, quote.baseFee, quote.exchangeRate), sendAmount),
      totalFee: quote.baseFee,
      fxSpreadPercent: calculateFxSpreadPercent(quote.exchangeRate, quote.midMarketRate),
      amountMoreThanNextBest: null,
      freshnessStatus: getQuoteFreshnessStatus(quote.timestamp, now),
      ageMinutes: getQuoteAgeMinutes(quote.timestamp, now),
      isStale: getQuoteFreshnessStatus(quote.timestamp, now) === "stale",
      rank: 0,
      isBestOption: false,
      isRecommended: false
    }))
    .sort((left, right) => compareResults(left, right, rankingMode));

  const bestFreshnessAwarePayout = [...rankedResults].sort((left, right) => compareResults(left, right, "best_payout"));
  const bestPayout = bestFreshnessAwarePayout[0];
  const nextBest = bestFreshnessAwarePayout[1];
  const bestDifference =
    bestPayout && nextBest ? roundMoney(bestPayout.recipientAmount - nextBest.recipientAmount) : null;

  return rankedResults
    .map((result, index) => ({
      ...result,
      rank: index + 1,
      isBestOption: index === 0,
      isRecommended: result.providerId === bestPayout?.providerId,
      amountMoreThanNextBest: result.providerId === bestPayout?.providerId ? bestDifference : null
    }));
}

function isQuoteUsableForAmount(quote: QuoteForComparison, sendAmount: number): boolean {
  if (quote.baseFee >= sendAmount || quote.exchangeRate <= 0 || quote.baseFee < 0) {
    return false;
  }

  if (quote.minimumAmount !== null && sendAmount < quote.minimumAmount) {
    return false;
  }

  if (quote.maximumAmount !== null && sendAmount > quote.maximumAmount) {
    return false;
  }

  if (quote.promotionExpiresAt && quote.promotionExpiresAt.getTime() < Date.now()) {
    return false;
  }

  return true;
}

function compareResults(
  left: ProviderComparisonResult,
  right: ProviderComparisonResult,
  rankingMode: NonNullable<ComparisonFilters["rankingMode"]>
): number {
  const freshnessDifference = freshnessRank(left.freshnessStatus) - freshnessRank(right.freshnessStatus);

  if (freshnessDifference !== 0) {
    return freshnessDifference;
  }

  if (rankingMode === "lowest_cost") {
    const feeDifference = left.totalFee - right.totalFee;

    return feeDifference !== 0 ? feeDifference : right.recipientAmount - left.recipientAmount;
  }

  if (rankingMode === "fastest") {
    const speedDifference = deliverySpeedRank(left.deliverySpeed) - deliverySpeedRank(right.deliverySpeed);

    return speedDifference !== 0 ? speedDifference : right.recipientAmount - left.recipientAmount;
  }

  return right.recipientAmount - left.recipientAmount;
}

function freshnessRank(status: QuoteFreshnessStatus): number {
  const ranks: Record<QuoteFreshnessStatus, number> = {
    fresh: 0,
    recent: 1,
    aging: 2,
    stale: 3
  };

  return ranks[status];
}

function deliverySpeedRank(deliverySpeed: string | null): number {
  if (!deliverySpeed) {
    return 99;
  }

  const normalized = deliverySpeed.toLowerCase();

  if (normalized.includes("minute") || normalized.includes("instant")) {
    return 0;
  }

  if (normalized.includes("same day") || normalized.includes("same-day")) {
    return 1;
  }

  if (normalized.includes("1 day") || normalized.includes("24")) {
    return 2;
  }

  return 50;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundRate(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000000) / 1000000;
}
