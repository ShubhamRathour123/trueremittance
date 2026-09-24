import { PrismaClient } from "@prisma/client";
import { getConfiguredAffiliateUrl } from "../src/lib/provider-affiliates";

const prisma = new PrismaClient();

const providers = [
  { name: "Wise", slug: "wise", websiteUrl: "https://wise.com", affiliateUrl: null, isActive: true },
  { name: "Western Union", slug: "western-union", websiteUrl: "https://www.westernunion.com", affiliateUrl: null, isActive: true },
  { name: "MoneyGram", slug: "moneygram", websiteUrl: "https://www.moneygram.com", affiliateUrl: null, isActive: true },
  { name: "Remitly", slug: "remitly", websiteUrl: "https://www.remitly.com", affiliateUrl: getConfiguredAffiliateUrl("remitly"), isActive: true },
  { name: "LuLu Exchange", slug: "lulu-exchange", websiteUrl: "https://www.luluexchange.com", affiliateUrl: null, isActive: true },
  { name: "Al Ansari Exchange", slug: "al-ansari-exchange", websiteUrl: "https://alansariexchange.com", affiliateUrl: null, isActive: true },
  { name: "Emirates NBD", slug: "emirates-nbd", websiteUrl: "https://www.emiratesnbd.com", affiliateUrl: null, isActive: true },
  { name: "ICICI Bank", slug: "icici-bank", websiteUrl: "https://www.icicibank.com", affiliateUrl: null, isActive: true },
  { name: "Xpress Money", slug: "xpress-money", websiteUrl: "https://www.xpressmoney.com", affiliateUrl: null, isActive: true }
];

const productionQuotes = [
  { providerSlug: "wise", baseFee: 0, exchangeRate: 25.6 },
  { providerSlug: "remitly", baseFee: 5, exchangeRate: 26.05 },
  { providerSlug: "al-ansari-exchange", baseFee: 0, exchangeRate: 25.77 },
  { providerSlug: "emirates-nbd", baseFee: 0, exchangeRate: 25.72678 },
  { providerSlug: "icici-bank", baseFee: 12, exchangeRate: 25.67 },
  { providerSlug: "lulu-exchange", baseFee: 0, exchangeRate: 25.8 },
  { providerSlug: "moneygram", baseFee: 0, exchangeRate: 25.75 },
  { providerSlug: "western-union", baseFee: 0, exchangeRate: 25.8407 },
  { providerSlug: "xpress-money", baseFee: 0, exchangeRate: 25.9 }
];

async function main(): Promise<void> {
  const corridor = await prisma.corridor.upsert({
    where: { slug: "uae-to-india" },
    update: {
      sourceCountry: "United Arab Emirates",
      sourceCurrency: "AED",
      targetCountry: "India",
      targetCurrency: "INR",
      isActive: true
    },
    create: {
      slug: "uae-to-india",
      sourceCountry: "United Arab Emirates",
      sourceCurrency: "AED",
      targetCountry: "India",
      targetCurrency: "INR"
    }
  });

  for (const provider of providers) {
    await prisma.provider.upsert({
      where: { slug: provider.slug },
      update: {
        name: provider.name,
        websiteUrl: provider.websiteUrl,
        affiliateUrl: provider.affiliateUrl,
        isActive: provider.isActive
      },
      create: {
        name: provider.name,
        slug: provider.slug,
        websiteUrl: provider.websiteUrl,
        affiliateUrl: provider.affiliateUrl,
        isActive: provider.isActive
      }
    });
  }

  for (const quote of productionQuotes) {
    const provider = await prisma.provider.findUniqueOrThrow({
      where: { slug: quote.providerSlug },
      select: { id: true }
    });
    const latestQuote = await prisma.rateQuote.findFirst({
      where: {
        providerId: provider.id,
        corridorId: corridor.id
      },
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        deliveryMethod: true,
        paymentMethod: true,
        midMarketRate: true
      }
    });
    const rateData = {
      sendAmount: 1000,
      sendCurrency: "AED",
      receiveCurrency: "INR",
      baseFee: quote.baseFee,
      feeCurrency: "AED",
      exchangeRate: quote.exchangeRate,
      midMarketRate: latestQuote?.midMarketRate ?? null,
      deliveryMethod: latestQuote?.deliveryMethod ?? "bank_transfer",
      paymentMethod: latestQuote?.paymentMethod ?? "bank_transfer",
      deliverySpeed: null,
      sourceType: "MANUAL",
      sourceReference: "Seeded manual MVP quote",
      verificationStatus: "MANUAL_REVIEWED",
      isPromotional: false,
      fetchedAt: new Date(),
      timestamp: new Date()
    } as const;

    if (latestQuote) {
      await prisma.rateQuote.update({
        where: { id: latestQuote.id },
        data: rateData
      });
    } else {
      await prisma.rateQuote.create({
        data: {
          ...rateData,
          providerId: provider.id,
          corridorId: corridor.id
        }
      });
    }
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
