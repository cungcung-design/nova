import type { BillingInterval, PaidPlanSlug } from "@/lib/payments/provider";

export function getPaymentSecretKey() {
  return (
    process.env.PAYMENT_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY ||
    ""
  );
}

export function getPaymentWebhookSecret() {
  return (
    process.env.PAYMENT_WEBHOOK_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    ""
  );
}

export function getPriceId(
  planSlug: string,
  interval: BillingInterval,
) {
  const slug = planSlug.toLowerCase() as PaidPlanSlug;

  if (slug === "pro" && interval === "MONTH") {
    return (
      process.env.PAYMENT_PRO_MONTHLY_PRICE_ID ||
      process.env.PAYMENT_PRO_PRICE_ID ||
      process.env.STRIPE_PRO_PRICE_ID ||
      null
    );
  }

  if (slug === "pro" && interval === "YEAR") {
    return (
      process.env.PAYMENT_PRO_YEARLY_PRICE_ID ||
      process.env.STRIPE_PRO_YEARLY_PRICE_ID ||
      null
    );
  }

  if (slug === "business" && interval === "MONTH") {
    return (
      process.env.PAYMENT_BUSINESS_MONTHLY_PRICE_ID ||
      process.env.PAYMENT_BUSINESS_PRICE_ID ||
      process.env.STRIPE_BUSINESS_PRICE_ID ||
      null
    );
  }

  if (slug === "business" && interval === "YEAR") {
    return (
      process.env.PAYMENT_BUSINESS_YEARLY_PRICE_ID ||
      process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID ||
      null
    );
  }

  return null;
}

export function planFromPriceId(priceId?: string | null) {
  if (!priceId) {
    return null;
  }

  const businessIds = [
    process.env.PAYMENT_BUSINESS_MONTHLY_PRICE_ID,
    process.env.PAYMENT_BUSINESS_YEARLY_PRICE_ID,
    process.env.PAYMENT_BUSINESS_PRICE_ID,
    process.env.STRIPE_BUSINESS_PRICE_ID,
    process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID,
  ].filter(Boolean);

  const proIds = [
    process.env.PAYMENT_PRO_MONTHLY_PRICE_ID,
    process.env.PAYMENT_PRO_YEARLY_PRICE_ID,
    process.env.PAYMENT_PRO_PRICE_ID,
    process.env.STRIPE_PRO_PRICE_ID,
    process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  ].filter(Boolean);

  if (businessIds.includes(priceId)) {
    return "BUSINESS" as const;
  }

  if (proIds.includes(priceId)) {
    return "PRO" as const;
  }

  return null;
}
