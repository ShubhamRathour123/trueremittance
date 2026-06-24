import { KeyRound } from "lucide-react";

type AdminLoginFormProps = {
  error?: string;
};

export function AdminLoginForm({ error }: AdminLoginFormProps): React.ReactElement {
  return (
    <form action="/api/admin/login" method="post" className="grid gap-4 rounded-lg border border-line bg-white p-6 shadow-soft">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Admin login</h1>
        <p className="mt-2 text-sm text-slate-600">Use the internal secret configured as ADMIN_SECRET.</p>
      </div>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-600">Admin secret</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-line px-4 py-3 outline-none focus:ring-2 focus:ring-mint/30"
        />
      </label>
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        <KeyRound aria-hidden="true" size={17} />
        Sign in
      </button>
    </form>
  );
}
