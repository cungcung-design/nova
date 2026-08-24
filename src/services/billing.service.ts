import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";

import { db } from "@/lib/db";

import { stripe } from "@/lib/stripe";

import { billingPlans } from "@/config/billing";

export async function getWorkspaceSubscription(
  workspaceId: string,
) {
  const subscription =
    await db.subscription.findUnique({
      where: {
        workspaceId,
      },
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
  if (!stripe) {
    throw new Error(
      "Stripe is not configured on the server.",
    );
  }

  const existing =
    await db.subscription.findUnique({
      where: {
        workspaceId,
      },
    });

  if (
    existing &&
    !existing.stripeCustomerId.startsWith("pending_")
  ) {
    return existing;
  }

  const customer = await stripe.customers.create({
    name: workspaceName,

    email,

    metadata: {
      workspaceId,
    },
  });

  if (existing) {
    return db.subscription.update({
      where: {
        workspaceId,
      },

      data: {
        stripeCustomerId: customer.id,
      },
    });
  }

  return db.subscription.create({
    data: {
      workspaceId,

      stripeCustomerId: customer.id,

      plan: SubscriptionPlan.FREE,

      status: SubscriptionStatus.ACTIVE,
    },
  });
}

export async function createCheckoutSession(
  workspaceId: string,
  workspaceName: string,
  email: string,
) {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured on the server.",
    );
  }

  const priceId = billingPlans.PRO.stripePriceId;

  if (!priceId) {
    throw new Error(
      "STRIPE_PRO_PRICE_ID is not configured.",
    );
  }

  const subscription =
    await createStripeCustomer(
      workspaceId,
      workspaceName,
      email,
    );

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured.",
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",

    customer: subscription.stripeCustomerId,

    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],

    success_url: `${appUrl}/dashboard/settings/billing?success=true`,

    cancel_url: `${appUrl}/dashboard/settings/billing?canceled=true`,

    metadata: {
      workspaceId,
    },

    subscription_data: {
      metadata: {
        workspaceId,
      },
    },
  });

  return session;
}

export async function createBillingPortalSession(
  workspaceId: string,
) {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured on the server.",
    );
  }

  const subscription =
    await db.subscription.findUnique({
      where: {
        workspaceId,
      },
    });

  if (!subscription) {
    throw new Error("Billing customer not found.");
  }

  if (
    subscription.stripeCustomerId.startsWith("pending_")
  ) {
    throw new Error(
      "No Stripe customer exists yet.",
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured.",
    );
  }

  return stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,

    return_url: `${appUrl}/dashboard/settings/billing`,
  });
}
