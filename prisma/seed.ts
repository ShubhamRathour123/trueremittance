import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const providers = [
  { name: "Wise", slug: "wise", websiteUrl: "https://wise.com" },
  { name: "Western Union", slug: "western-union", websiteUrl: "https://www.westernunion.com" },
  { name: "MoneyGram", slug: "moneygram", websiteUrl: "https://www.moneygram.com" },
  { name: "Remitly", slug: "remitly", websiteUrl: "https://www.remitly.com" },
  { name: "LuLu Exchange", slug: "lulu-exchange", websiteUrl: "https://www.luluexchange.com" },
  { name: "Al Ansari Exchange", slug: "al-ansari-exchange", websiteUrl: "https://alansariexchange.com" },
  { name: "Emirates NBD", slug: "emirates-nbd", websiteUrl: "https://www.emiratesnbd.com" },
  { name: "ICICI Bank", slug: "icici-bank", websiteUrl: "https://www.icicibank.com" },
  { name: "Xpress Money", slug: "xpress-money", websiteUrl: "https://www.xpressmoney.com", isActive: false }
];

async function main(): Promise<void> {
  await prisma.corridor.upsert({
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
        affiliateUrl: null,
        isActive: provider.isActive ?? true
      },
      create: {
        name: provider.name,
        slug: provider.slug,
        websiteUrl: provider.websiteUrl,
        affiliateUrl: null,
        isActive: provider.isActive ?? true
      }
    });
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
