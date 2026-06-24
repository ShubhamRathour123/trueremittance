import { notFound, redirect } from "next/navigation";
import { getProviderForRedirect } from "@/lib/data/providers";

type RedirectRouteProps = {
  params: Promise<{
    providerSlug: string;
  }>;
};

export async function GET(_request: Request, { params }: RedirectRouteProps): Promise<never> {
  const { providerSlug } = await params;
  const provider = await getProviderForRedirect(providerSlug);

  if (!provider || !provider.isActive) {
    notFound();
  }

  const destinationUrl = provider.affiliateUrl ?? provider.websiteUrl;

  if (!destinationUrl) {
    notFound();
  }

  redirect(destinationUrl);
}
