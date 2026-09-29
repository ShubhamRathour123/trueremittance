const FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v2";

export type FrankfurterRate = {
  base: string;
  quote: string;
  rate: number;
  date: string;
};

export async function fetchFrankfurterRate(
  baseCurrency: string,
  quoteCurrency: string,
  signal?: AbortSignal
): Promise<FrankfurterRate> {
  const base = normalizeCurrency(baseCurrency);
  const quote = normalizeCurrency(quoteCurrency);

  if (base === quote) {
    throw new Error("Base and quote currencies must be different.");
  }

  const response = await fetch(
    `${FRANKFURTER_BASE_URL}/rate/${encodeURIComponent(base)}/${encodeURIComponent(quote)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal
    }
  );

  if (!response.ok) {
    throw new Error(`Frankfurter request failed with HTTP ${response.status}.`);
  }

  const data: unknown = await response.json();

  if (!isFrankfurterRate(data) || data.base !== base || data.quote !== quote) {
    throw new Error("Frankfurter returned an invalid rate payload.");
  }

  if (!Number.isFinite(data.rate) || data.rate <= 0) {
    throw new Error("Frankfurter returned an invalid positive rate.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    throw new Error("Frankfurter returned an invalid source date.");
  }

  return data;
}

function normalizeCurrency(currency: string): string {
  const normalized = currency.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error(`Invalid ISO currency code: ${currency}`);
  }

  return normalized;
}

function isFrankfurterRate(value: unknown): value is FrankfurterRate {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.base === "string" &&
    typeof record.quote === "string" &&
    typeof record.rate === "number" &&
    typeof record.date === "string"
  );
}
