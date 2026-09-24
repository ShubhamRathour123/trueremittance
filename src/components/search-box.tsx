"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { AMOUNT_PRESETS, TARGET_CURRENCY } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

type SearchBoxProps = {
  initialAmount: number;
  estimatedRecipientAmount: number | null;
};

export function SearchBox({ initialAmount, estimatedRecipientAmount }: SearchBoxProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState(String(initialAmount));
  const [isPending, startTransition] = useTransition();

  function updateSearch(nextAmount: string): void {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("amount", nextAmount);

    startTransition(() => {
      router.replace(`/?${nextParams.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="rounded-lg border border-line bg-white p-3 shadow-soft">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-600">You send</span>
          <div className="flex overflow-hidden rounded-md border border-line bg-white focus-within:ring-2 focus-within:ring-mint/30">
            <input
              value={amount}
              onChange={(event) => {
                const nextAmount = event.target.value;
                setAmount(nextAmount);
                updateSearch(nextAmount);
              }}
              inputMode="decimal"
              className="min-w-0 flex-1 px-4 py-3 text-lg font-semibold outline-none"
              aria-label="Send amount in AED"
            />
            <span className="border-l border-line px-4 py-3 text-sm font-semibold text-slate-500">AED</span>
          </div>
        </label>
        <div className="rounded-md border border-line px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Recipient gets</p>
          <p className="text-base font-semibold text-ink">
            {estimatedRecipientAmount === null ? TARGET_CURRENCY : formatMoney(estimatedRecipientAmount, TARGET_CURRENCY)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => updateSearch(amount)}
          disabled={isPending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search aria-hidden="true" size={18} />
          Compare
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {AMOUNT_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              const nextAmount = String(preset);
              setAmount(nextAmount);
              updateSearch(nextAmount);
            }}
            className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-ink hover:text-ink focus:outline-none focus:ring-2 focus:ring-mint/30"
          >
            AED {preset.toLocaleString("en-US")}
          </button>
        ))}
      </div>
    </div>
  );
}
