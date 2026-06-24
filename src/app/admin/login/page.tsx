import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { SiteHeader } from "@/components/site-header";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps): Promise<React.ReactElement> {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams.error === "invalid" ? "Invalid admin secret." : undefined;

  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-md place-items-center px-4 py-10">
        <AdminLoginForm error={error} />
      </section>
    </main>
  );
}
