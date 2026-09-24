import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Trust Center",
  description: "TrueRemittance trust, privacy, ranking and affiliate disclosure."
};

export default function TrustPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Trust Center</h1>
        <p className="mt-4 text-slate-600">
          TrueRemittance is built around transparent timestamps, visible fees, clear ranking rules and honest
          limitations.
        </p>
        <div className="mt-8 grid gap-4">
          <Info title="Data sources" text="The current MVP uses manually entered provider quote data. The source type and verification status are stored with each quote." />
          <Info title="Privacy" text="The comparison tool does not require user accounts and does not collect recipient bank details." />
          <Info title="Security" text="Admin routes are protected by server-side authentication and HTTP-only signed session cookies." />
          <Info title="Affiliate disclosure" text="Some links may earn referral revenue. This should not change the ranking formula or the provider quote displayed." />
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
