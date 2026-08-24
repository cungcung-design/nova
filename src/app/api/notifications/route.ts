import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";

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
    console.error("GET /api/notifications", error);

    return NextResponse.json(
      {
        error: "Unable to load notifications.",
      },
      {
        status: 500,
      },
    );
  }
}
