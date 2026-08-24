import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";

import { db } from "@/lib/db";
import { billingPlans } from "@/config/billing";
import { getPriceId } from "@/lib/payments/env";
import type { BillingInterval } from "@/lib/payments/provider";
import { paymentProvider } from "@/lib/payments/provider-implementation";

export async function getWorkspaceSubscription(workspaceId: string) {
  const subscription = await db.subscription.findUnique({
    where: { workspaceId },
  });

  if (subscription) {
    return subscription;
  }

  return db.subscription.create({
    data: {
      workspaceId,
      stripeCustomerId: `pending_${workspaceId}`,
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
    },
  });
}

export async function createStripeCustomer(
  workspaceId: string,
  workspaceName: string,
  email: string,
) {
  const existing = await db.subscription.findUnique({
    where: { workspaceId },
  });

  if (existing && !existing.stripeCustomerId.startsWith("pending_")) {
    return existing;
  }

  const customerId = await paymentProvider.createCustomer(email, workspaceName);

  if (existing) {
    return db.subscription.update({
      where: { workspaceId },
      data: { stripeCustomerId: customerId },
    });
  }

  return db.subscription.create({
    data: {
      workspaceId,
      stripeCustomerId: customerId,
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
    },
  });
}

function parsePaidPlan(planId: string) {
  const normalized = planId.trim().toLowerCase();

  if (normalized === "pro" || normalized === "PRO".toLowerCase()) {
    return "pro" as const;
  }

  if (normalized === "business") {
    return "business" as const;
  }

  return null;
}

export async function createCheckoutSession(input: {
  workspaceId: string;
  workspaceName: string;
  email: string;
  userId: string;
  planId?: string;
  interval?: BillingInterval;
}) {
  const interval = input.interval ?? "MONTH";
  const planSlug = parsePaidPlan(input.planId ?? "pro");

  if (!planSlug) {
    throw new Error("PLAN_NOT_FOUND");
  }

  const subscription = await getWorkspaceSubscription(input.workspaceId);
  const targetPlan =
    planSlug === "business" ? SubscriptionPlan.BUSINESS : SubscriptionPlan.PRO;

  if (
    subscription.plan === targetPlan &&
    subscription.status === SubscriptionStatus.ACTIVE
  ) {
    throw new Error("ALREADY_SUBSCRIBED");
  }

  const priceId = getPriceId(planSlug, interval);

  if (!priceId) {
    throw new Error("PRICE_NOT_CONFIGURED");
  }

  const customer =
    subscription.stripeCustomerId.startsWith("pending_")
      ? await createStripeCustomer(
          input.workspaceId,
          input.workspaceName,
          input.email,
        )
      : subscription;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  }

  return paymentProvider.createCheckoutSession({
    workspaceId: input.workspaceId,
    userId: input.userId,
    priceId,
    customerId: customer.stripeCustomerId,
    email: input.email,
    customerName: input.workspaceName,
    successUrl: `${appUrl}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${appUrl}/dashboard/settings/billing?canceled=true`,
    metadata: {
      plan: targetPlan,
      interval,
    },
  });
}

export async function createBillingPortalSession(workspaceId: string) {
  const subscription = await db.subscription.findUnique({
    where: { workspaceId },
  });

  if (!subscription) {
    throw new Error("Billing customer not found.");
  }

  if (subscription.stripeCustomerId.startsWith("pending_")) {
    throw new Error("No Stripe customer exists yet.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  }

  const url = await paymentProvider.createBillingPortal(
    subscription.stripeCustomerId,
    `${appUrl}/dashboard/settings/billing`,
  );

  return { url };
}

export { billingPlans };
