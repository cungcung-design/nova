import { NextResponse } from "next/server";

import { requireUser } from "@/lib/authz";
import { apiErrorResponse } from "@/lib/api-error";
import { idSchema } from "@/lib/validation/common";
import { setActiveWorkspaceId } from "@/lib/workspace-context";
import { getWorkspaceForUser } from "@/services/workspace.service";

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const body = await request.json();

    const parsedId = idSchema.safeParse(body.workspaceId);

    if (!parsedId.success) {
      return NextResponse.json(
        {
          error: "Workspace ID is required.",
        },
        { status: 400 },
      );
    }

    const workspaceId = parsedId.data;
    const workspace = await getWorkspaceForUser(user.id, workspaceId);

    if (!workspace) {
      return NextResponse.json(
        {
          error:
            "You do not have access to this workspace.",
        },
        { status: 403 },
      );
    }

    await setActiveWorkspaceId(workspaceId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to switch workspace.");
  }
}