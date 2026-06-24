import { ArrowRight, Clock, Landmark } from "lucide-react";
import Link from "next/link";
import { DELIVERY_METHOD_LABELS, PAYMENT_METHOD_LABELS, SOURCE_CURRENCY, TARGET_CURRENCY } from "@/lib/constants";
import type { ProviderComparisonResult } from "@/lib/comparison/types";
import { formatDateTime, formatMoney, formatPercent, formatRate } from "@/lib/format";

type ProviderCardProps = {
  result: ProviderComparisonResult;
};

export function ProviderCard({ result }: ProviderCardProps): React.ReactElement {
  return (
    <article className="rounded-lg border border-line bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-500">#{result.rank}</span>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{result.providerName}</h2>
            {result.isBestOption ? (
              <span className="rounded-full bg-mint/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-mint">
                Best option
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            <span>{DELIVERY_METHOD_LABELS[result.deliveryMethod]}</span>
            <span>{PAYMENT_METHOD_LABELS[result.paymentMethod]}</span>
            <span className="inline-flex items-center gap-1">
              <Clock aria-hidden="true" size={14} />
              {formatDateTime(result.timestamp)}
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-medium text-slate-500">Recipient receives</p>
          <p className="text-2xl font-semibold tracking-tight text-ink">
            {formatMoney(result.recipientAmount, TARGET_CURRENCY)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-3">
        <Metric label="Fee" value={formatMoney(result.baseFee, SOURCE_CURRENCY)} />
        <Metric label="Exchange rate" value={`1 AED = ${formatRate(result.exchangeRate)} INR`} />
        <Metric
          label="FX margin"
          value={result.hiddenMarginPercent === null ? "Not entered" : formatPercent(result.hiddenMarginPercent)}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href={`/redirect/${result.providerSlug}`}
          className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink hover:bg-slate-50"
        >
          <Landmark aria-hidden="true" size={17} />
          Go to provider
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
