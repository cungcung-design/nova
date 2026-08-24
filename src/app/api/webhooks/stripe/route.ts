import { NextResponse } from "next/server";

import Stripe from "stripe";

import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";

import { stripe } from "@/lib/stripe";

import { db } from "@/lib/db";

import { createAuditLog } from "@/services/audit.service";

const webhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(
  request: Request,
) {
  if (!webhookSecret) {
    return NextResponse.json(
      {
        error: "Stripe webhook secret is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  const signature =
    request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error: "Missing Stripe signature.",
      },
      {
        status: 400,
      },
    );
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed.",
      error,
    );

    return NextResponse.json(
      {
        error: "Invalid webhook signature.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription,
        );

        break;
      }

      case "invoice.paid": {
        await handleInvoicePaid(
          event.data.object as Stripe.Invoice,
        );

        break;
      }

      case "invoice.payment_failed": {
        await handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice,
        );

        break;
      }

      default:
        break;
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Stripe webhook processing error.",
      error,
    );

    return NextResponse.json(
      {
        error: "Webhook processing failed.",
      },
      {
        status: 500,
      },
    );
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
) {
  const workspaceId = session.metadata?.workspaceId;

  if (!workspaceId) {
    console.warn(
      "Checkout session missing workspaceId.",
    );

    return;
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!customerId) {
    return;
  }

  await db.subscription.upsert({
    where: {
      workspaceId,
    },

    create: {
      workspaceId,

      stripeCustomerId: customerId,

      stripeSubscriptionId: subscriptionId,

      plan: SubscriptionPlan.PRO,

      status: SubscriptionStatus.ACTIVE,
    },

    update: {
      stripeCustomerId: customerId,

      stripeSubscriptionId: subscriptionId,

      plan: SubscriptionPlan.PRO,
    },
  });
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
) {
  const workspaceId =
    subscription.metadata?.workspaceId;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const stripeStatus = subscription.status;

  const statusMap: Record<
    Stripe.Subscription.Status,
    SubscriptionStatus
  > = {
    active: SubscriptionStatus.ACTIVE,

    trialing: SubscriptionStatus.TRIALING,

    past_due: SubscriptionStatus.PAST_DUE,

    canceled: SubscriptionStatus.CANCELED,

    incomplete: SubscriptionStatus.INCOMPLETE,

    incomplete_expired:
      SubscriptionStatus.INCOMPLETE_EXPIRED,

    unpaid: SubscriptionStatus.UNPAID,

    paused: SubscriptionStatus.PAUSED,
  };

  const status = statusMap[stripeStatus];

  const priceId =
    subscription.items.data[0]?.price.id;

  const plan =
    priceId === process.env.STRIPE_PRO_PRICE_ID
      ? SubscriptionPlan.PRO
      : SubscriptionPlan.FREE;

  const currentPeriodStart =
    subscription.items.data[0]
      ?.current_period_start;

  const currentPeriodEnd =
    subscription.items.data[0]
      ?.current_period_end;

  if (workspaceId) {
    await db.subscription.upsert({
      where: {
        workspaceId,
      },

      create: {
        workspaceId,

        stripeCustomerId: customerId,

        stripeSubscriptionId: subscription.id,

        stripePriceId: priceId,

        plan,

        status,

        currentPeriodStart: currentPeriodStart
          ? new Date(currentPeriodStart * 1000)
          : null,

        currentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000)
          : null,

        cancelAtPeriodEnd:
          subscription.cancel_at_period_end,

        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      },

      update: {
        stripeCustomerId: customerId,

        stripeSubscriptionId: subscription.id,

        stripePriceId: priceId,

        plan,

        status,

        currentPeriodStart: currentPeriodStart
          ? new Date(currentPeriodStart * 1000)
          : null,

        currentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000)
          : null,

        cancelAtPeriodEnd:
          subscription.cancel_at_period_end,

        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      },
    });
  } else {
    await db.subscription.updateMany({
      where: {
        stripeCustomerId: customerId,
      },

      data: {
        stripeSubscriptionId: subscription.id,

        stripePriceId: priceId,

        plan,

        status,

        currentPeriodStart: currentPeriodStart
          ? new Date(currentPeriodStart * 1000)
          : null,

        currentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000)
          : null,

        cancelAtPeriodEnd:
          subscription.cancel_at_period_end,
      },
    });
  }
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice,
) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) {
    return;
  }

  const subscription =
    await db.subscription.findUnique({
      where: {
        stripeCustomerId: customerId,
      },
    });

  if (!subscription) {
    return;
  }

  await createAuditLog({
    workspaceId: subscription.workspaceId,

    action: "PAYMENT_SUCCESS",

    entity: "Subscription",

    entityId: subscription.id,

    description:
      "Subscription payment was successfully processed.",
  });
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) {
    return;
  }

  const subscription =
    await db.subscription.findUnique({
      where: {
        stripeCustomerId: customerId,
      },
    });

  if (!subscription) {
    return;
  }

  await createAuditLog({
    workspaceId: subscription.workspaceId,

    action: "PAYMENT_FAILED",

    entity: "Subscription",

    entityId: subscription.id,

    description: "Subscription payment failed.",
  });
}
