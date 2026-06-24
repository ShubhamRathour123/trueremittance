import type { ProviderComparisonResult, QuoteForComparison } from "@/lib/comparison/types";

export function calculateRecipientAmount(sendAmount: number, baseFee: number, exchangeRate: number): number {
  return (sendAmount - baseFee) * exchangeRate;
}

export function calculateHiddenMarginPercent(exchangeRate: number, midMarketRate: number | null): number | null {
  if (midMarketRate === null || midMarketRate <= 0) {
    return null;
  }

  return ((midMarketRate - exchangeRate) / midMarketRate) * 100;
}

export function compareQuotes(sendAmount: number, quotes: QuoteForComparison[]): ProviderComparisonResult[] {
  if (!Number.isFinite(sendAmount) || sendAmount <= 0) {
    return [];
  }

  return quotes
    .filter((quote) => quote.baseFee < sendAmount)
    .map((quote) => ({
      ...quote,
      recipientAmount: calculateRecipientAmount(sendAmount, quote.baseFee, quote.exchangeRate),
      hiddenMarginPercent: calculateHiddenMarginPercent(quote.exchangeRate, quote.midMarketRate),
      rank: 0,
      isBestOption: false
    }))
    .sort((left, right) => right.recipientAmount - left.recipientAmount)
    .map((result, index) => ({
      ...result,
      rank: index + 1,
      isBestOption: index === 0
    }));
}
