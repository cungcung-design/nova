import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireUser, requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { createCheckoutSession } from "@/services/billing.service";
import { apiErrorResponse } from "@/lib/api-error";

export async function POST() {
  try {
    const user = await requireUser();
    const workspace = await getCurrentWorkspace();

    await requireRole(workspace.id, [...permissions.billing.manage]);

    if (!user.email) {
      return NextResponse.json(
        { error: "Your account needs an email address to start checkout." },
        { status: 400 },
      );
    }

    const session = await createCheckoutSession(
      workspace.id,
      workspace.name,
      user.email,
    );

    if (!session.url) {
      return NextResponse.json(
        { error: "Unable to create checkout session." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to start checkout.");
  }
}
