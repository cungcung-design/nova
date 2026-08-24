import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import {
  markAllNotificationsRead,
} from "@/services/notification.service";

export async function PATCH() {
  try {
    const workspace = await getCurrentWorkspace();

    await markAllNotificationsRead(workspace.userId, workspace.id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("PATCH notifications/read-all", error);

    return NextResponse.json(
      {
        error: "Unable to mark notifications as read.",
      },
      {
        status: 500,
      },
    );
  }
}
