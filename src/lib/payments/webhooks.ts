import {
  SubscriptionPlan,
  SubscriptionStatus,
  WorkspacePlan,
} from "@prisma/client";

import { db } from "@/lib/db";
import { planFromPriceId } from "@/lib/payments/env";
import type { WebhookResult } from "@/lib/payments/provider";
import { createAuditLog } from "@/lib/audit/audit-service";
import { createNotification } from "@/services/notification.service";

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function mapSubscriptionStatus(status: string | null): SubscriptionStatus {
  switch (status) {
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "past_due":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
      return SubscriptionStatus.CANCELED;
    case "incomplete":
      return SubscriptionStatus.INCOMPLETE;
    case "incomplete_expired":
      return SubscriptionStatus.INCOMPLETE_EXPIRED;
    case "unpaid":
      return SubscriptionStatus.UNPAID;
    case "paused":
      return SubscriptionStatus.PAUSED;
    default:
      return SubscriptionStatus.INCOMPLETE;
  }
}

function mapWorkspacePlan(plan: SubscriptionPlan): WorkspacePlan {
  if (plan === SubscriptionPlan.BUSINESS) {
    return WorkspacePlan.BUSINESS;
  }

  if (plan === SubscriptionPlan.PRO) {
    return WorkspacePlan.PRO;
  }

  return WorkspacePlan.FREE;
}

function parsePlan(value: string | null, priceId: string | null) {
  if (value === "BUSINESS" || value === "business") {
    return SubscriptionPlan.BUSINESS;
  }

  if (value === "PRO" || value === "pro") {
    return SubscriptionPlan.PRO;
  }

  return planFromPriceId(priceId) ?? SubscriptionPlan.PRO;
}

export async function applyPaymentWebhook(event: WebhookResult) {
  switch (event.type) {
    case "checkout.completed":
      await handleCheckoutCompleted(event.data);
      break;
    case "subscription.updated":
      await handleSubscriptionUpdated(event.data);
      break;
    case "subscription.deleted":
      await handleSubscriptionDeleted(event.data);
      break;
    case "invoice.payment_failed":
      await handlePaymentFailed(event.data);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event.data);
      break;
    default:
      break;
  }
}

async function handleCheckoutCompleted(data: Record<string, unknown>) {
  const workspaceId = asString(data.workspaceId);
  const customerId = asString(data.customerId);
  const subscriptionId = asString(data.subscriptionId);
  const userId = asString(data.userId);
  const plan = parsePlan(asString(data.planId), asString(data.priceId));

  if (!workspaceId || !customerId || !subscriptionId) {
    throw new Error("Incomplete checkout webhook.");
  }

  await db.subscription.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      plan,
      status: SubscriptionStatus.ACTIVE,
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      plan,
      status: SubscriptionStatus.ACTIVE,
    },
  });

  await db.workspace.update({
    where: { id: workspaceId },
    data: { plan: mapWorkspacePlan(plan) },
  });

  if (userId) {
    await createNotification({
      userId,
      workspaceId,
      title: "Subscription updated",
      message: `Your workspace is now on the ${plan === "BUSINESS" ? "Business" : "Pro"} plan.`,
      link: "/dashboard/settings/billing",
    }).catch(() => undefined);
  }

  await createAuditLog({
    workspaceId,
    userId: userId ?? undefined,
    action: "SUBSCRIPTION_CREATED",
    entityType: "SUBSCRIPTION",
    metadata: {
      plan,
    },
  });
}

async function handleSubscriptionUpdated(data: Record<string, unknown>) {
  const providerSubscriptionId = asString(data.subscriptionId);
  const customerId = asString(data.customerId);
  const workspaceId = asString(data.workspaceId);
  const priceId = asString(data.priceId);
  const plan = parsePlan(asString(data.planId), priceId);
  const status = mapSubscriptionStatus(asString(data.status));
  const periodStart = asNumber(data.currentPeriodStart);
  const periodEnd = asNumber(data.currentPeriodEnd);
  const cancelAtPeriodEnd = asBoolean(data.cancelAtPeriodEnd);
  const canceledAt = asNumber(data.canceledAt);

  if (!providerSubscriptionId && !customerId && !workspaceId) {
    return;
  }

  const payload = {
    stripeSubscriptionId: providerSubscriptionId ?? undefined,
    stripeCustomerId: customerId ?? undefined,
    stripePriceId: priceId,
    plan,
    status,
    currentPeriodStart: periodStart ? new Date(periodStart * 1000) : undefined,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
    cancelAtPeriodEnd: cancelAtPeriodEnd ?? false,
    canceledAt: canceledAt ? new Date(canceledAt * 1000) : null,
  };

  if (workspaceId) {
    const existing = await db.subscription.findUnique({
      where: { workspaceId },
    });

    if (existing) {
      await db.subscription.update({
        where: { workspaceId },
        data: {
          ...payload,
          stripeCustomerId: customerId ?? existing.stripeCustomerId,
        },
      });
    } else if (customerId) {
      await db.subscription.create({
        data: {
          workspaceId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: providerSubscriptionId,
          stripePriceId: priceId,
          plan,
          status,
          currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          cancelAtPeriodEnd: cancelAtPeriodEnd ?? false,
        },
      });
    }

    await db.workspace.update({
      where: { id: workspaceId },
      data: {
        plan:
          status === SubscriptionStatus.CANCELED ||
          status === SubscriptionStatus.INCOMPLETE_EXPIRED
            ? WorkspacePlan.FREE
            : mapWorkspacePlan(plan),
      },
    });

    await createAuditLog({
      workspaceId,
      action: "SUBSCRIPTION_CHANGED",
      entityType: "SUBSCRIPTION",
      metadata: {
        plan,
        status,
      },
    });

    return;
  }

  if (providerSubscriptionId) {
    await db.subscription.updateMany({
      where: { stripeSubscriptionId: providerSubscriptionId },
      data: payload,
    });
    return;
  }

  if (customerId) {
    await db.subscription.updateMany({
      where: { stripeCustomerId: customerId },
      data: payload,
    });
  }
}

async function handleSubscriptionDeleted(data: Record<string, unknown>) {
  const providerSubscriptionId = asString(data.subscriptionId);
  const customerId = asString(data.customerId);
  let resolvedWorkspaceId = asString(data.workspaceId);

  const where = resolvedWorkspaceId
    ? { workspaceId: resolvedWorkspaceId }
    : providerSubscriptionId
      ? { stripeSubscriptionId: providerSubscriptionId }
      : customerId
        ? { stripeCustomerId: customerId }
        : null;

  if (!where) {
    return;
  }

  await db.subscription.updateMany({
    where,
    data: {
      status: SubscriptionStatus.CANCELED,
      canceledAt: new Date(),
      plan: SubscriptionPlan.FREE,
    },
  });

  if (resolvedWorkspaceId) {
    await db.workspace.update({
      where: { id: resolvedWorkspaceId },
      data: { plan: WorkspacePlan.FREE },
    });
  } else {
    const subscription = await db.subscription.findFirst({
      where,
    });

    if (subscription) {
      await db.workspace.update({
        where: { id: subscription.workspaceId },
        data: { plan: WorkspacePlan.FREE },
      });
      resolvedWorkspaceId = subscription.workspaceId;
    }
  }

  if (resolvedWorkspaceId) {
    await createAuditLog({
      workspaceId: resolvedWorkspaceId,
      action: "SUBSCRIPTION_CANCELLED",
      entityType: "SUBSCRIPTION",
    });
  }
}

async function handlePaymentFailed(data: Record<string, unknown>) {
  const providerSubscriptionId = asString(data.subscriptionId);
  const customerId = asString(data.customerId);

  const subscription = providerSubscriptionId
    ? await db.subscription.findFirst({
        where: { stripeSubscriptionId: providerSubscriptionId },
      })
    : customerId
      ? await db.subscription.findUnique({
          where: { stripeCustomerId: customerId },
        })
      : null;

  if (!subscription) {
    return;
  }

  await db.subscription.update({
    where: { id: subscription.id },
    data: { status: SubscriptionStatus.PAST_DUE },
  });

  await createAuditLog({
    workspaceId: subscription.workspaceId,
    action: "PAYMENT_FAILED",
    entityType: "SUBSCRIPTION",
    entityId: subscription.id,
    description: "Subscription payment failed.",
  });
}

async function handleInvoicePaid(data: Record<string, unknown>) {
  const customerId = asString(data.customerId);

  if (!customerId) {
    return;
  }

  const subscription = await db.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!subscription) {
    return;
  }

  if (subscription.status === SubscriptionStatus.PAST_DUE) {
    await db.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.ACTIVE },
    });
  }

  await createAuditLog({
    workspaceId: subscription.workspaceId,
    action: "PAYMENT_SUCCESS",
    entityType: "SUBSCRIPTION",
    entityId: subscription.id,
    description: "Subscription payment was successfully processed.",
  });
}
