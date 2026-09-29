import { prisma } from "@/lib/prisma";
import { fetchFrankfurterRate } from "@/lib/fx/frankfurter";

const FRANKFURTER_SOURCE = "frankfurter";

export async function updateFrankfurterReferenceRate(
  baseCurrency: string,
  quoteCurrency: string,
  signal?: AbortSignal
) {
  const result = await fetchFrankfurterRate(baseCurrency, quoteCurrency, signal);
  const sourceDate = parseSourceDate(result.date);

  return prisma.referenceRate.upsert({
    where: {
      baseCurrency_quoteCurrency_source_sourceDate: {
        baseCurrency: result.base,
        quoteCurrency: result.quote,
        source: FRANKFURTER_SOURCE,
        sourceDate
      }
    },
    create: {
      baseCurrency: result.base,
      quoteCurrency: result.quote,
      rate: result.rate,
      source: FRANKFURTER_SOURCE,
      sourceDate
    },
    update: {
      rate: result.rate,
      fetchedAt: new Date()
    }
  });
}

function parseSourceDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid source date: ${value}`);
  }

  return date;
}
