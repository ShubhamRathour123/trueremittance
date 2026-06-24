"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type SearchBoxProps = {
  initialAmount: number;
};

export function SearchBox({ initialAmount }: SearchBoxProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState(String(initialAmount));
  const [isPending, startTransition] = useTransition();

  function submitSearch(): void {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("amount", amount);

    startTransition(() => {
      router.push(`/?${nextParams.toString()}`);
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
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              className="min-w-0 flex-1 px-4 py-3 text-lg font-semibold outline-none"
              aria-label="Send amount in AED"
            />
            <span className="border-l border-line px-4 py-3 text-sm font-semibold text-slate-500">AED</span>
          </div>
        </label>
        <div className="rounded-md border border-line px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Recipient gets</p>
          <p className="text-base font-semibold text-ink">INR</p>
        </div>
        <button
          type="button"
          onClick={submitSearch}
          disabled={isPending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search aria-hidden="true" size={18} />
          Compare
        </button>
      </div>
    </div>
  );
}
