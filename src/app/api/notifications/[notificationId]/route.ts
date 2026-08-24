import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import { markNotificationRead } from "@/services/notification.service";

type Props = {
  params: Promise<{
    notificationId: string;
  }>;
};

export async function PATCH(
  _request: Request,
  { params }: Props,
) {
  try {
    const { notificationId } = await params;

    const workspace = await getCurrentWorkspace();

    await markNotificationRead(notificationId, workspace.userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("PATCH notification", error);

    return NextResponse.json(
      {
        error: "Unable to update notification.",
      },
      {
        status: 500,
      },
    );
  }
}
