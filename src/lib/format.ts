export function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "INR" ? 0 : 2
  }).format(value);
}

export function formatRate(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 2
  }).format(value);
}

export function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dubai"
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}
