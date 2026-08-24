import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { markAllNotificationsRead } from "@/services/notification.service";
import { apiErrorResponse } from "@/lib/api-error";

export async function PATCH() {
  try {
    const workspace = await getCurrentWorkspace();

    await markAllNotificationsRead(workspace.userId, workspace.id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to mark notifications as read.");
  }
}
