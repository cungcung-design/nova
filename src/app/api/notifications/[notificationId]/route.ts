import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { markNotificationRead } from "@/services/notification.service";
import { apiErrorResponse } from "@/lib/api-error";

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

    const result = await markNotificationRead(
      notificationId,
      workspace.userId,
      workspace.id,
    );

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Notification not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to update notification.");
  }
}
