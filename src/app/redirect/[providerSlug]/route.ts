import { notFound, redirect } from "next/navigation";
import { PRODUCTION_CORRIDOR_SLUG } from "@/lib/constants";
import { getProviderForRedirect, recordAffiliateClick } from "@/lib/data/providers";
import { getConfiguredAffiliateUrl } from "@/lib/provider-affiliates";

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

  const destinationUrl = provider.affiliateUrl ?? getConfiguredAffiliateUrl(provider.slug) ?? provider.websiteUrl;

  if (!destinationUrl) {
    notFound();
  }

  try {
    await recordAffiliateClick({
      providerId: provider.id,
      destination: destinationUrl,
      corridorSlug: PRODUCTION_CORRIDOR_SLUG,
      placement: "provider_card",
      ctaType: "send_with_provider"
    });
  } catch (error) {
    console.error("Unable to record affiliate click", error);
  }

  redirect(destinationUrl);
}
