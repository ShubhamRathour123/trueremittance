const PROVIDER_AFFILIATE_URLS: Readonly<Record<string, string>> = {
  remitly: "https://www.remitly.com/r/2ffavozv"
};

export function getConfiguredAffiliateUrl(providerSlug: string): string | null {
  return PROVIDER_AFFILIATE_URLS[providerSlug] ?? null;
}

export function hasAffiliateRelationship(providerSlug: string): boolean {
  return providerSlug in PROVIDER_AFFILIATE_URLS;
}
