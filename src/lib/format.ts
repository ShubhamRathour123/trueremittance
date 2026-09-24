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

export function formatRelativeAge(minutes: number): string {
  if (minutes < 1) {
    return "Updated just now";
  }

  if (minutes === 1) {
    return "Updated 1 minute ago";
  }

  if (minutes < 60) {
    return `Updated ${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours === 1) {
    return "Updated 1 hour ago";
  }

  return `Updated ${hours} hours ago`;
}
