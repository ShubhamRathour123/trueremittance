import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "About",
  description: "Learn what TrueRemittance does and what it does not do."
};

export default function AboutPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">About TrueRemittance</h1>
        <p className="mt-4 text-slate-600">
          TrueRemittance helps UAE residents compare available provider quotes before sending money to India. The
          product focuses on the final estimated INR payout after fees and exchange rates are applied.
        </p>
        <div className="mt-8 grid gap-4">
          <Info title="What we do" text="We compare manually maintained provider quote data and show the estimated recipient payout, fees, rates and quote timestamp." />
          <Info title="What we do not do" text="We do not hold funds, execute transfers, store recipient bank details or guarantee provider rates." />
          <Info title="Before sending" text="Always confirm the final transfer amount, fees and delivery details on the provider website before completing a transfer." />
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
