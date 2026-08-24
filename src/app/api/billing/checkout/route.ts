import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireUser, requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { apiErrorResponse } from "@/lib/api-error";
import { createCheckoutSession } from "@/services/billing.service";
import type { BillingInterval } from "@/lib/payments/provider";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/security";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const workspace = await getCurrentWorkspace();

    await requireRole(workspace.id, [...permissions.billing.manage]);

    const limited = await rateLimit(
      `checkout:${workspace.id}:${getClientIp(request)}`,
      10,
      60,
    );

    if (!limited.success) {
      return rateLimitResponse(
        "Too many checkout attempts. Please try again later.",
      );
    }

    if (!user.email) {
      return NextResponse.json(
        {
          error: "Your account needs an email address to start checkout.",
          message: "Your account needs an email address to start checkout.",
        },
        { status: 400 },
      );
    }

    let body: Record<string, unknown> = {};

    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const planId =
      typeof body.planId === "string" ? body.planId : "PRO";

    const interval: BillingInterval =
      body.interval === "YEAR" ? "YEAR" : "MONTH";

    const checkout = await createCheckoutSession({
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      email: user.email,
      userId: user.id,
      planId,
      interval,
    });

    return NextResponse.json({
      checkoutUrl: checkout.checkoutUrl,
      sessionId: checkout.sessionId,
      url: checkout.checkoutUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "ALREADY_SUBSCRIBED") {
      return NextResponse.json(
        {
          error: "You are already subscribed to this plan.",
          message: "You are already subscribed to this plan.",
        },
        { status: 400 },
      );
    }

    if (message === "PRICE_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error: "Payment price is not configured.",
          message: "Payment price is not configured.",
        },
        { status: 500 },
      );
    }

    if (message === "PLAN_NOT_FOUND") {
      return NextResponse.json(
        {
          error: "Plan not found.",
          message: "Plan not found.",
        },
        { status: 404 },
      );
    }

    return apiErrorResponse(error, "Unable to create checkout session.");
  }
}
