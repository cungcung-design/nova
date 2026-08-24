import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { createBillingPortalSession } from "@/services/billing.service";
import { apiErrorResponse } from "@/lib/api-error";

export async function POST() {
  try {
    const workspace = await getCurrentWorkspace();

    await requireRole(workspace.id, [...permissions.billing.manage]);

    const session = await createBillingPortalSession(workspace.id);

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to open billing portal.");
  }
}
