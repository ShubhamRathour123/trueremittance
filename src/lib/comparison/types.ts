import type { DeliveryMethod, PaymentMethod, QuoteSourceType, VerificationStatus } from "@prisma/client";

export type QuoteFreshnessStatus = "fresh" | "recent" | "aging" | "stale";

export type RankingMode = "best_payout" | "lowest_cost" | "fastest" | "recommended";

export type QuoteForComparison = {
  providerId: string;
  providerName: string;
  providerSlug: string;
  sendAmount: number | null;
  sendCurrency: string;
  receiveCurrency: string;
  baseFee: number;
  feeCurrency: string;
  exchangeRate: number;
  midMarketRate: number | null;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  deliverySpeed: string | null;
  sourceType: QuoteSourceType;
  sourceReference: string | null;
  verificationStatus: VerificationStatus;
  isPromotional: boolean;
  promotionExpiresAt: Date | null;
  minimumAmount: number | null;
  maximumAmount: number | null;
  notes: string | null;
  statusMessage: string | null;
  fetchedAt: Date | null;
  timestamp: Date;
};

export type ProviderComparisonResult = QuoteForComparison & {
  recipientAmount: number;
  effectiveRate: number;
  totalFee: number;
  fxSpreadPercent: number | null;
  amountMoreThanNextBest: number | null;
  freshnessStatus: QuoteFreshnessStatus;
  ageMinutes: number;
  isStale: boolean;
  rank: number;
  isBestOption: boolean;
  isRecommended: boolean;
};

export type ComparisonFilters = {
  deliveryMethod?: DeliveryMethod;
  paymentMethod?: PaymentMethod;
  rankingMode?: RankingMode;
};
