import { redirect } from "next/navigation";
import { Plus, Save, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { DELIVERY_METHOD_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { getAdminDashboardData } from "@/lib/data/providers";
import { formatDateTime, formatMoney, formatRate } from "@/lib/format";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const deliveryMethods = ["bank_transfer", "cash_pickup", "wallet"] as const;
const paymentMethods = ["bank_transfer", "debit_card", "cash"] as const;

type AdminPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

function getStatusMessage(status: string | undefined): string | null {
  if (status === "invalid-provider") {
    return "Provider details were not saved. Check the name, slug, and URLs.";
  }

  if (status === "invalid-quote") {
    return "Rate snapshot was not saved. Check the provider, corridor, fee, FX rate, and methods.";
  }

  if (status === "save-failed") {
    return "The admin change could not be saved. Check the database connection and try again.";
  }

  return null;
}

export default async function AdminPage(props: AdminPageProps): Promise<React.ReactElement> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [{ status }, { providers, corridorId, latestQuotes, errorMessage }] = await Promise.all([
    props.searchParams,
    getAdminDashboardData()
  ]);
  const statusMessage = getStatusMessage(status) ?? errorMessage;
  const canCreateQuote = Boolean(corridorId) && providers.length > 0;

  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-mint">
              <ShieldCheck aria-hidden="true" size={16} />
              Protected admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Rate management</h1>
            <p className="mt-2 text-sm text-slate-600">Manual UAE to India quote snapshots only.</p>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink">
              Sign out
            </button>
          </form>
        </div>

        {statusMessage ? (
          <p className="mt-6 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber-800">{statusMessage}</p>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form action="/api/admin/providers" method="post" className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Create or update provider</h2>
            <div className="mt-4 grid gap-4">
              <TextField name="name" label="Provider name" placeholder="Wise" required />
              <TextField name="slug" label="Slug" placeholder="wise" required />
              <TextField name="websiteUrl" label="Website URL" placeholder="https://wise.com" />
              <TextField name="affiliateUrl" label="Affiliate URL" placeholder="https://..." />
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input name="isActive" type="checkbox" defaultChecked className="h-4 w-4 rounded border-line" />
                Active provider
              </label>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                <Plus aria-hidden="true" size={17} />
                Save provider
              </button>
            </div>
          </form>

          <form action="/api/admin/quotes" method="post" className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Add rate snapshot</h2>
            {corridorId ? <input type="hidden" name="corridorId" value={corridorId} /> : null}
            {!corridorId ? (
              <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber-800">
                Seed the UAE to India corridor before adding quotes.
              </p>
            ) : null}
            {corridorId && providers.length === 0 ? (
              <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber-800">
                Add at least one provider before saving quote snapshots.
              </p>
            ) : null}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-600">Provider</span>
                <select
                  name="providerId"
                  required
                  disabled={providers.length === 0}
                  className="rounded-md border border-line px-3 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                      {provider.isActive ? "" : " (inactive)"}
                    </option>
                  ))}
                </select>
              </label>
              <TextField name="baseFee" label="Base fee (AED)" placeholder="10.00" required type="number" step="0.01" />
              <TextField
                name="exchangeRate"
                label="Provider FX rate"
                placeholder="22.6500"
                required
                type="number"
                step="0.0001"
              />
              <TextField
                name="midMarketRate"
                label="Mid-market rate (optional)"
                placeholder="22.7600"
                type="number"
                step="0.0001"
              />
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-600">Delivery method</span>
                <select name="deliveryMethod" required className="rounded-md border border-line px-3 py-3 outline-none">
                  {deliveryMethods.map((method) => (
                    <option key={method} value={method}>
                      {DELIVERY_METHOD_LABELS[method]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-600">Payment method</span>
                <select name="paymentMethod" required className="rounded-md border border-line px-3 py-3 outline-none">
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {PAYMENT_METHOD_LABELS[method]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                disabled={!canCreateQuote}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-mint px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
              >
                <Save aria-hidden="true" size={17} />
                Save timestamped quote
              </button>
            </div>
          </form>
        </div>

        <section className="mt-8 rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Latest quote snapshots</h2>
          <div className="mt-4 grid gap-3">
            {latestQuotes.length > 0 ? (
              latestQuotes.map((quote) => (
                <div key={quote.id} className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-5 sm:items-center">
                  <p className="font-semibold text-ink">{quote.providerName}</p>
                  <p className="text-sm text-slate-600">{formatMoney(quote.baseFee, "AED")} fee</p>
                  <p className="text-sm text-slate-600">{formatRate(quote.exchangeRate)} INR</p>
                  <p className="text-sm text-slate-600">{DELIVERY_METHOD_LABELS[quote.deliveryMethod]}</p>
                  <p className="text-sm text-slate-500">{formatDateTime(quote.timestamp)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">No quote snapshots entered yet.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

type TextFieldProps = {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  step?: string;
};

function TextField({ name, label, placeholder, required, type = "text", step }: TextFieldProps): React.ReactElement {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-line px-3 py-3 outline-none focus:ring-2 focus:ring-mint/30"
      />
    </label>
  );
}
