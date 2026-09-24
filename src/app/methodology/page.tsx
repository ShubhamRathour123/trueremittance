import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "How We Rank",
  description: "TrueRemittance ranking methodology for UAE to India remittance comparisons."
};

export default function MethodologyPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">How We Rank Providers</h1>
        <p className="mt-4 text-slate-600">
          The default ranking is based on estimated recipient INR after subtracting the AED transfer fee and applying
          the provider exchange rate.
        </p>
        <div className="mt-6 rounded-lg border border-line bg-white p-5 shadow-sm">
          <p className="font-semibold text-ink">Formula</p>
          <p className="mt-2 rounded-md bg-slate-50 p-3 font-mono text-sm text-slate-700">
            recipient amount = (send amount - fee) x exchange rate
          </p>
        </div>
        <div className="mt-6 grid gap-4">
          <Info title="Freshness rule" text="Quotes less than 10 minutes old are fresh, 10-30 minutes are recent, 30-60 minutes are aging, and older than 60 minutes are stale. Stale quotes are ranked below fresher quotes." />
          <Info title="Commercial disclosure" text="Some provider links may earn TrueRemittance a referral commission. Sponsored or commercial placement must be separated from comparison ranking." />
          <Info title="Limitations" text="Rates can change before you complete a transfer. Missing mid-market rates, delivery speeds or source details are shown as unavailable instead of being estimated." />
        </div>
      </section>
    </main>
  );
}

function Info({ title, text }: { title: string; text: string }): React.ReactElement {
  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}
