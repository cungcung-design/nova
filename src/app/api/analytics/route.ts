import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { getAnalytics } from "@/services/analytics.service";
import { apiErrorResponse } from "@/lib/api-error";

export async function GET(
  request: Request,
) {
  try {
    const workspace =
      await getCurrentWorkspace();

    await requireRole(
      workspace.id,
      [...permissions.reports.view],
    );

    const url =
      new URL(request.url);

    const range =
      url.searchParams.get(
        "range",
      );

    const days =
      range === "7"
        ? 7
        : range === "90"
          ? 90
          : 30;

    const analytics =
      await getAnalytics(
        workspace.id,
        days,
      );

    return NextResponse.json(
      analytics,
    );
  } catch (error) {
    return apiErrorResponse(error, "Unable to load analytics.");
  }
}