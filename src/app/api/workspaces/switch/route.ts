import { NextResponse } from "next/server";

import { requireUser } from "@/lib/authz";

import {
  setActiveWorkspaceId,
  getUserWorkspaces,
} from "@/lib/workspace-context";

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const body = await request.json();

    const workspaceId = String(
      body.workspaceId ?? "",
    );

    if (!workspaceId) {
      return NextResponse.json(
        {
          error: "Workspace ID is required.",
        },
        { status: 400 },
      );
    }

    const memberships =
      await getUserWorkspaces(user.id);

    const membership = memberships.find(
      (item) =>
        item.workspace.id === workspaceId,
    );

    if (!membership) {
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
    console.error(
      "POST /api/workspaces/switch",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to switch workspace.",
      },
      { status: 500 },
    );
  }
}