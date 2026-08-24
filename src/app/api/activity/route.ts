import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import { getActivities } from "@/services/activity.service";

export async function GET() {
  try {
    const workspace = await getCurrentWorkspace();

    const activities = await getActivities(workspace.id);

    return NextResponse.json({
      activities,
    });
  } catch (error) {
    console.error("GET /api/activity", error);

    return NextResponse.json(
      {
        error: "Unable to load activity.",
      },
      {
        status: 500,
      },
    );
  }
}
