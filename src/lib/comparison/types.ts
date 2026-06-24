import type { DeliveryMethod, PaymentMethod } from "@prisma/client";

export type QuoteForComparison = {
  providerId: string;
  providerName: string;
  providerSlug: string;
  baseFee: number;
  exchangeRate: number;
  midMarketRate: number | null;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  timestamp: Date;
};

export type ProviderComparisonResult = QuoteForComparison & {
  recipientAmount: number;
  hiddenMarginPercent: number | null;
  rank: number;
  isBestOption: boolean;
};
