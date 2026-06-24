import type { DeliveryMethod, PaymentMethod } from "@prisma/client";

const deliveryMethods = ["bank_transfer", "cash_pickup", "wallet"] as const;
const paymentMethods = ["bank_transfer", "debit_card", "cash"] as const;

type ProviderFormInput = {
  name: FormDataEntryValue | null;
  slug: FormDataEntryValue | null;
  websiteUrl: FormDataEntryValue | null;
  affiliateUrl: FormDataEntryValue | null;
  isActive: boolean;
};

export type ParsedProviderForm = {
  name: string;
  slug: string;
  websiteUrl: string | undefined;
  affiliateUrl: string | undefined;
  isActive: boolean;
};

type QuoteFormInput = {
  providerId: FormDataEntryValue | null;
  corridorId: FormDataEntryValue | null;
  baseFee: FormDataEntryValue | null;
  exchangeRate: FormDataEntryValue | null;
  midMarketRate: FormDataEntryValue | null;
  deliveryMethod: FormDataEntryValue | null;
  paymentMethod: FormDataEntryValue | null;
};

export type ParsedQuoteForm = {
  providerId: string;
  corridorId: string;
  baseFee: number;
  exchangeRate: number;
  midMarketRate: number | null;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
};

function readString(value: FormDataEntryValue | null, fieldName: string): string {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} is required.`);
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return trimmed;
}

function readOptionalUrl(value: FormDataEntryValue | null, fieldName: string): string | undefined {
  if (value === null || value === "") {
    return undefined;
  }

  const url = readString(value, fieldName);

  try {
    return new URL(url).toString();
  } catch {
    throw new Error(`${fieldName} must be a valid URL.`);
  }
}

function readNumber(value: FormDataEntryValue | null, fieldName: string, minimum: number): number {
  const rawValue = readString(value, fieldName);
  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed) || parsed < minimum) {
    throw new Error(`${fieldName} must be a valid number.`);
  }

  return parsed;
}

function readOptionalPositiveNumber(value: FormDataEntryValue | null, fieldName: string): number | null {
  if (value === null || value === "") {
    return null;
  }

  return readNumber(value, fieldName, Number.MIN_VALUE);
}

function readDeliveryMethod(value: FormDataEntryValue | null): DeliveryMethod {
  const method = readString(value, "Delivery method");

  if (!deliveryMethods.includes(method as DeliveryMethod)) {
    throw new Error("Delivery method is invalid.");
  }

  return method as DeliveryMethod;
}

function readPaymentMethod(value: FormDataEntryValue | null): PaymentMethod {
  const method = readString(value, "Payment method");

  if (!paymentMethods.includes(method as PaymentMethod)) {
    throw new Error("Payment method is invalid.");
  }

  return method as PaymentMethod;
}

export function parseProviderForm(input: ProviderFormInput): ParsedProviderForm {
  const name = readString(input.name, "Provider name");
  const slug = readString(input.slug, "Provider slug");

  if (name.length < 2 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Provider name or slug is invalid.");
  }

  return {
    name,
    slug,
    websiteUrl: readOptionalUrl(input.websiteUrl, "Website URL"),
    affiliateUrl: readOptionalUrl(input.affiliateUrl, "Affiliate URL"),
    isActive: input.isActive
  };
}

export function parseQuoteForm(input: QuoteFormInput): ParsedQuoteForm {
  return {
    providerId: readString(input.providerId, "Provider"),
    corridorId: readString(input.corridorId, "Corridor"),
    baseFee: readNumber(input.baseFee, "Base fee", 0),
    exchangeRate: readNumber(input.exchangeRate, "Exchange rate", Number.MIN_VALUE),
    midMarketRate: readOptionalPositiveNumber(input.midMarketRate, "Mid-market rate"),
    deliveryMethod: readDeliveryMethod(input.deliveryMethod),
    paymentMethod: readPaymentMethod(input.paymentMethod)
  };
}
