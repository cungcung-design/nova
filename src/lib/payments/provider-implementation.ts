import Stripe from "stripe";

import type {
  CheckoutInput,
  CheckoutResult,
  PaymentProvider,
  WebhookResult,
} from "@/lib/payments/provider";
import {
  getPaymentSecretKey,
  getPaymentWebhookSecret,
} from "@/lib/payments/env";

function getStripe() {
  const secret = getPaymentSecretKey();

  if (!secret) {
    throw new Error("Missing environment variable: PAYMENT_SECRET_KEY");
  }

  return new Stripe(secret);
}

function asId(
  value: string | { id: string } | null | undefined,
) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

function mapStripeEvent(event: Stripe.Event): WebhookResult {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      return {
        type: "checkout.completed",
        data: {
          workspaceId: session.metadata?.workspaceId ?? null,
          planId: session.metadata?.plan ?? null,
          customerId: asId(session.customer),
          subscriptionId: asId(session.subscription),
          userId: session.metadata?.userId ?? null,
        },
      };
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const item = subscription.items.data[0];

      return {
        type: "subscription.updated",
        data: {
          workspaceId: subscription.metadata?.workspaceId ?? null,
          subscriptionId: subscription.id,
          customerId: asId(subscription.customer),
          status: subscription.status,
          priceId: item?.price.id ?? null,
          currentPeriodStart: item?.current_period_start ?? null,
          currentPeriodEnd: item?.current_period_end ?? null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at ?? null,
        },
      };
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      return {
        type: "subscription.deleted",
        data: {
          workspaceId: subscription.metadata?.workspaceId ?? null,
          subscriptionId: subscription.id,
          customerId: asId(subscription.customer),
        },
      };
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceSubscription =
        "subscription" in invoice
          ? (invoice as Stripe.Invoice & {
              subscription?: string | Stripe.Subscription | null;
            }).subscription
          : null;

      return {
        type: "invoice.payment_failed",
        data: {
          customerId: asId(invoice.customer),
          subscriptionId: asId(invoiceSubscription),
        },
      };
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;

      return {
        type: "invoice.paid",
        data: {
          customerId: asId(invoice.customer),
        },
      };
    }

    default:
      return {
        type: event.type,
        data: {},
      };
  }
}

export const paymentProvider: PaymentProvider = {
  async createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
    const stripe = getStripe();

    let customerId = input.customerId ?? undefined;

    if (!customerId && input.email) {
      customerId = await paymentProvider.createCustomer(
        input.email,
        input.customerName,
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ...(customerId ? { customer: customerId } : {}),
      ...(input.email && !customerId ? { customer_email: input.email } : {}),
      line_items: [
        {
          price: input.priceId,
          quantity: 1,
        },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        ...input.metadata,
      },
      subscription_data: {
        metadata: {
          workspaceId: input.workspaceId,
          userId: input.userId,
          ...input.metadata,
        },
      },
    });

    if (!session.url) {
      throw new Error("Payment provider did not return a checkout URL.");
    }

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  },

  async createCustomer(email, name) {
    const stripe = getStripe();

    const customer = await stripe.customers.create({
      email,
      name: name ?? undefined,
    });

    return customer.id;
  },

  async createBillingPortal(customerId, returnUrl) {
    const stripe = getStripe();

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  },

  async verifyWebhook(payload, signature) {
    const secret = getPaymentWebhookSecret();

    if (!secret) {
      throw new Error("Missing environment variable: PAYMENT_WEBHOOK_SECRET");
    }

    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(payload, signature, secret);

    return mapStripeEvent(event);
  },
};
