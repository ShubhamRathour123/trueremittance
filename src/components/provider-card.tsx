import { ArrowRight, Clock, Landmark } from "lucide-react";
import Link from "next/link";
import {
  DELIVERY_METHOD_LABELS,
  PAYMENT_METHOD_LABELS,
  SOURCE_CURRENCY,
  SOURCE_TYPE_LABELS,
  TARGET_CURRENCY,
  VERIFICATION_STATUS_LABELS
} from "@/lib/constants";
import type { ProviderComparisonResult } from "@/lib/comparison/types";
import { formatMoney, formatPercent, formatRate, formatRelativeAge } from "@/lib/format";
import { hasAffiliateRelationship } from "@/lib/provider-affiliates";

type ProviderCardProps = {
  result: ProviderComparisonResult;
};

export function ProviderCard({ result }: ProviderCardProps): React.ReactElement {
  const showsAffiliateDisclosure = hasAffiliateRelationship(result.providerSlug);

  return (
    <article className="rounded-lg border border-line bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-500">#{result.rank}</span>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{result.providerName}</h2>
            {result.isBestOption ? (
              <span className="rounded-full bg-mint/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-mint">
                Best payout
              </span>
            ) : null}
            {result.isStale ? (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                Stale
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            <span>{DELIVERY_METHOD_LABELS[result.deliveryMethod]}</span>
            <span>{PAYMENT_METHOD_LABELS[result.paymentMethod]}</span>
            <span>{result.deliverySpeed ?? "Delivery time unavailable"}</span>
            <span className="inline-flex items-center gap-1">
              <Clock aria-hidden="true" size={14} />
              {formatRelativeAge(result.ageMinutes)}
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-medium text-slate-500">Estimated recipient receives</p>
          <p className="text-2xl font-semibold tracking-tight text-ink">
            {formatMoney(result.recipientAmount, TARGET_CURRENCY)}
          </p>
          {result.amountMoreThanNextBest !== null && result.amountMoreThanNextBest > 0 ? (
            <p className="mt-1 text-sm font-medium text-mint">
              {formatMoney(result.amountMoreThanNextBest, TARGET_CURRENCY)} more than next best
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-3">
        <Metric label="Fee" value={formatMoney(result.baseFee, SOURCE_CURRENCY)} />
        <Metric label="Exchange rate" value={`1 AED = ${formatRate(result.exchangeRate)} INR`} />
        <Metric label="Effective rate" value={`1 AED = ${formatRate(result.effectiveRate)} INR`} />
      </div>

      <details className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <summary className="cursor-pointer font-semibold text-ink">Rate details</summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <p>Mid-market rate: {result.midMarketRate === null ? "Not available" : `1 AED = ${formatRate(result.midMarketRate)} INR`}</p>
          <p>FX spread: {result.fxSpreadPercent === null ? "Not available" : formatPercent(result.fxSpreadPercent)}</p>
          <p>Source: {SOURCE_TYPE_LABELS[result.sourceType]}</p>
          <p>Status: {VERIFICATION_STATUS_LABELS[result.verificationStatus]}</p>
          <p>Quote type: {result.verificationStatus === "PROVIDER_QUOTE" ? "Provider quote" : "Estimated from captured data"}</p>
          <p>Freshness: {result.freshnessStatus}</p>
          {result.notes ? <p className="sm:col-span-2">Notes: {result.notes}</p> : null}
        </div>
      </details>

      <div className="mt-4 flex flex-col items-start gap-2 sm:items-end">
        {showsAffiliateDisclosure ? (
          <p className="max-w-md text-xs leading-5 text-slate-500 sm:text-right">
            Affiliate link - TrueRemittance may earn a commission if you sign up or transfer through this link.
            Terms apply.
          </p>
        ) : null}
        <Link
          href={`/redirect/${result.providerSlug}`}
          className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink hover:bg-slate-50"
        >
          <Landmark aria-hidden="true" size={17} />
          Send with {result.providerName}
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
