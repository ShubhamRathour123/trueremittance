import { Suspense } from "react";
import type { ReactElement } from "react";
import Link from "next/link";

import { ProviderCard } from "@/components/provider-card";
import { SearchBox } from "@/components/search-box";
import { SiteHeader } from "@/components/site-header";

import { compareQuotes } from "@/lib/comparison/engine";
import type { RankingMode } from "@/lib/comparison/types";
import { DEFAULT_SEND_AMOUNT, MAX_SEND_AMOUNT, TARGET_CURRENCY } from "@/lib/constants";
import { getLatestQuotesForMvpCorridor } from "@/lib/data/providers";
import { formatMoney, formatRate } from "@/lib/format";

/**
 * Force Node runtime for Prisma (IMPORTANT for Neon + Next.js 15)
 */
export const runtime = "nodejs";

type HomePageProps = {
  searchParams: Promise<{
    amount?: string;
    mode?: string;
  }>;
};

function parseAmount(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= MAX_SEND_AMOUNT ? parsed : DEFAULT_SEND_AMOUNT;
}

function parseRankingMode(value: string | undefined): RankingMode {
  if (value === "lowest_cost" || value === "fastest" || value === "recommended") {
    return value;
  }

  return "best_payout";
}

const rankingModes: Array<{ label: string; value: RankingMode }> = [
  { label: "Best payout", value: "best_payout" },
  { label: "Lowest fee", value: "lowest_cost" },
  { label: "Fastest", value: "fastest" },
  { label: "Recommended", value: "recommended" }
];

function buildModeHref(amount: number, mode: RankingMode): string {
  const params = new URLSearchParams();
  params.set("amount", String(amount));
  params.set("mode", mode);

  return `/?${params.toString()}`;
}

export default async function HomePage(
  props: HomePageProps
): Promise<ReactElement> {
  /**
   * FIX for Next.js 15 dynamic searchParams behavior
   */
  const searchParams = await props.searchParams;

  const sendAmount = parseAmount(searchParams.amount);
  const rankingMode = parseRankingMode(searchParams.mode);

  /**
   * SERVER-SIDE DATA FETCH (Prisma safe here)
   */
  const quotes = await getLatestQuotesForMvpCorridor();

  const results = compareQuotes(sendAmount, quotes, { rankingMode });
  const bestResult = results[0] ?? null;

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-mint">UAE to India</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-5xl">
            Find the best way to send money from UAE to India
          </h1>

          <p className="mt-2 text-slate-600">
            Compare exchange rates, fees and final INR payout across leading remittance providers.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            We rank available quotes by estimated recipient payout after applicable fees.
          </p>
        </div>

        <div className="mt-8">
          <Suspense fallback={null}>
            <SearchBox initialAmount={sendAmount} estimatedRecipientAmount={bestResult?.recipientAmount ?? null} />
          </Suspense>
        </div>

        {bestResult ? (
          <section className="mt-8 rounded-lg border border-mint/20 bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-wide text-mint">Best option today</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-ink">{bestResult.providerName}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {bestResult.amountMoreThanNextBest !== null && bestResult.amountMoreThanNextBest > 0
                    ? `${formatMoney(bestResult.amountMoreThanNextBest, TARGET_CURRENCY)} more than the next best option.`
                    : "Top ranked among currently available quotes."}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-sm font-medium text-slate-500">Estimated recipient receives</p>
                <p className="text-4xl font-semibold tracking-tight text-ink">
                  {formatMoney(bestResult.recipientAmount, TARGET_CURRENCY)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  1 AED = {formatRate(bestResult.exchangeRate)} INR, fee {formatMoney(bestResult.baseFee, "AED")}
                </p>
              </div>
            </div>
            <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              Rates and fees shown are estimates or captured provider quotes at the displayed time. Always confirm the
              final amount on the provider website before sending money.
            </p>
          </section>
        ) : null}

        <section className="mt-8 rounded-lg border border-line bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Ranked by selected priority</p>
              <p className="text-lg font-semibold text-slate-900">{results.length} providers available</p>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Comparison priority">
              {rankingModes.map((mode) => (
                <Link
                  key={mode.value}
                  href={buildModeHref(sendAmount, mode.value)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-mint/30 ${
                    rankingMode === mode.value
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white text-slate-600 hover:border-ink hover:text-ink"
                  }`}
                >
                  {mode.label}
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Some links may earn TrueRemittance a referral commission. This does not change the amount you send or the
            provider quote used in the ranking.
          </p>
        </section>

        <div className="mt-6 grid gap-4">
          {results.length > 0 ? (
            results.map((result) => (
              <ProviderCard key={result.providerId} result={result} />
            ))
          ) : (
            <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-900">
                We&apos;re currently unable to compare providers for this corridor.
              </p>
              <p className="mt-2 text-sm text-slate-600">
                No usable quotes are available right now. Please check again later.
              </p>
            </div>
          )}
        </div>

        <section className="mt-8 grid gap-4 rounded-lg border border-line bg-white p-5 text-sm text-slate-600 shadow-sm sm:grid-cols-3">
          <div>
            <h2 className="font-semibold text-ink">How we compare</h2>
            <p className="mt-2">We compare available provider quotes and rank by estimated INR received after fees.</p>
          </div>
          <div>
            <h2 className="font-semibold text-ink">What happens next</h2>
            <p className="mt-2">Provider buttons take you to the provider website. TrueRemittance does not move money.</p>
          </div>
          <div>
            <h2 className="font-semibold text-ink">Freshness matters</h2>
            <p className="mt-2">Quotes older than 60 minutes are marked stale and ranked below fresher quotes.</p>
          </div>
        </section>
      </section>
    </main>
  );
}
