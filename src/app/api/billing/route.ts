import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { getWorkspaceSubscription } from "@/services/billing.service";
import { apiErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const workspace = await getCurrentWorkspace();

    await requireRole(workspace.id, [...permissions.billing.view]);

    const subscription = await getWorkspaceSubscription(workspace.id);

    return NextResponse.json({
      subscription,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to load billing information.");
  }
}
