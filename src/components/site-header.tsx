import Link from "next/link";

export function SiteHeader(): React.ReactElement {
  return (
    <header className="border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
          TrueRemittance
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          <Link href="/admin/login" className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-ink">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
