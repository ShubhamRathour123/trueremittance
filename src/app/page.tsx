import { Suspense } from "react";
import type { ReactElement } from "react";

import { ProviderCard } from "@/components/provider-card";
import { SearchBox } from "@/components/search-box";
import { SiteHeader } from "@/components/site-header";

import { compareQuotes } from "@/lib/comparison/engine";
import { getLatestQuotesForMvpCorridor } from "@/lib/data/providers";

/**
 * Force Node runtime for Prisma (IMPORTANT for Neon + Next.js 15)
 */
export const runtime = "nodejs";

type HomePageProps = {
  searchParams: Promise<{
    amount?: string;
  }>;
};

function parseAmount(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1000;
}

export default async function HomePage(
  props: HomePageProps
): Promise<ReactElement> {
  /**
   * FIX for Next.js 15 dynamic searchParams behavior
   */
  const searchParams = await props.searchParams;

  const sendAmount = parseAmount(searchParams.amount);

  /**
   * SERVER-SIDE DATA FETCH (Prisma safe here)
   */
  const quotes = await getLatestQuotesForMvpCorridor();

  const results = compareQuotes(sendAmount, quotes);

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            UAE to India Remittance Comparison
          </h1>

          <p className="mt-2 text-slate-600">
            Find the remittance option that sends more INR home.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Compare verified provider quotes by fees, FX rate, and final payout.
          </p>
        </div>

        {/* Search */}
        <div className="mt-8">
          <Suspense fallback={null}>
            <SearchBox initialAmount={sendAmount} />
          </Suspense>
        </div>

        {/* Stats */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Ranked by highest INR received
            </p>

            <p className="text-lg font-semibold text-slate-900">
              {results.length} providers available
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 grid gap-4">
          {results.length > 0 ? (
            results.map((result) => (
              <ProviderCard key={result.providerId} result={result} />
            ))
          ) : (
            <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-900">
                No quotes available
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Add provider quotes via admin panel
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
