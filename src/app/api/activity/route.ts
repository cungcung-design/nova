import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { getActivities } from "@/services/activity.service";
import { apiErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const workspace = await getCurrentWorkspace();
    await requireRole(workspace.id, [...permissions.workspace.view]);

    const activities = await getActivities(workspace.id);

    return NextResponse.json({
      activities,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to load activity.");
  }
}
