import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { apiErrorResponse } from "@/lib/api-error";

import {
  getNotifications,
  getUnreadCount,
} from "@/services/notification.service";

export async function GET() {
  try {
    const workspace = await getCurrentWorkspace();

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(workspace.userId, workspace.id),
      getUnreadCount(workspace.userId, workspace.id),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to load notifications.");
  }
}
