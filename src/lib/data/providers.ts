import type { DeliveryMethod, PaymentMethod } from "@prisma/client";
import { PRODUCTION_CORRIDOR_SLUG } from "@/lib/constants";
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
  try {
    const corridor = await prisma.corridor.findUnique({
      where: { slug: PRODUCTION_CORRIDOR_SLUG },
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
  } catch (error) {
    console.error("Unable to load comparison quotes", error);
    return [];
  }
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
  errorMessage: string | null;
}> {
  try {
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
        where: { slug: PRODUCTION_CORRIDOR_SLUG },
        select: { id: true }
      })
    ]);

    if (!corridor) {
      return {
        providers,
        corridorId: null,
        latestQuotes: [],
        errorMessage: null
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
      })),
      errorMessage: null
    };
  } catch (error) {
    console.error("Unable to load admin dashboard data", error);

    return {
      providers: [],
      corridorId: null,
      latestQuotes: [],
      errorMessage: "Admin data could not be loaded. Check the database connection and required seed data."
    };
  }
}
