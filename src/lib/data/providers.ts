import type { DeliveryMethod, PaymentMethod } from "@prisma/client";
import { MVP_CORRIDOR_SLUG } from "@/lib/constants";
import type { QuoteForComparison } from "@/lib/comparison/types";
import { prisma } from "@/lib/prisma";

export type ProviderSummary = {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string | null;
  affiliateUrl: string | null;
  isActive: boolean;
};

export type AdminQuoteSummary = {
  id: string;
  providerName: string;
  baseFee: number;
  exchangeRate: number;
  midMarketRate: number | null;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  timestamp: Date;
};

export async function getLatestQuotesForMvpCorridor(): Promise<QuoteForComparison[]> {
  const corridor = await prisma.corridor.findUnique({
    where: { slug: MVP_CORRIDOR_SLUG },
    select: { id: true, isActive: true }
  });

  if (!corridor?.isActive) {
    return [];
  }

  const quotes = await prisma.rateQuote.findMany({
    where: {
      corridorId: corridor.id,
      provider: { isActive: true }
    },
    include: {
      provider: true
    },
    orderBy: {
      timestamp: "desc"
    }
  });

  const latestByProvider = new Map<string, QuoteForComparison>();

  for (const quote of quotes) {
    if (latestByProvider.has(quote.providerId)) {
      continue;
    }

    latestByProvider.set(quote.providerId, {
      providerId: quote.providerId,
      providerName: quote.provider.name,
      providerSlug: quote.provider.slug,
      baseFee: quote.baseFee.toNumber(),
      exchangeRate: quote.exchangeRate.toNumber(),
      midMarketRate: quote.midMarketRate?.toNumber() ?? null,
      deliveryMethod: quote.deliveryMethod,
      paymentMethod: quote.paymentMethod,
      timestamp: quote.timestamp
    });
  }

  return Array.from(latestByProvider.values());
}

export async function getProviderForRedirect(slug: string): Promise<ProviderSummary | null> {
  return prisma.provider.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      websiteUrl: true,
      affiliateUrl: true,
      isActive: true
    }
  });
}

export async function getAdminDashboardData(): Promise<{
  providers: ProviderSummary[];
  corridorId: string | null;
  latestQuotes: AdminQuoteSummary[];
}> {
  const [providers, corridor] = await Promise.all([
    prisma.provider.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        websiteUrl: true,
        affiliateUrl: true,
        isActive: true
      }
    }),
    prisma.corridor.findUnique({
      where: { slug: MVP_CORRIDOR_SLUG },
      select: { id: true }
    })
  ]);

  if (!corridor) {
    return {
      providers,
      corridorId: null,
      latestQuotes: []
    };
  }

  const quotes = await prisma.rateQuote.findMany({
    where: {
      corridorId: corridor.id
    },
    include: { provider: true },
    orderBy: { timestamp: "desc" },
    take: 20
  });

  return {
    providers,
    corridorId: corridor.id,
    latestQuotes: quotes.map((quote) => ({
      id: quote.id,
      providerName: quote.provider.name,
      baseFee: quote.baseFee.toNumber(),
      exchangeRate: quote.exchangeRate.toNumber(),
      midMarketRate: quote.midMarketRate?.toNumber() ?? null,
      deliveryMethod: quote.deliveryMethod,
      paymentMethod: quote.paymentMethod,
      timestamp: quote.timestamp
    }))
  };
}
