import { NextResponse } from "next/server";

import { requireUser } from "@/lib/authz";

import {
  getUserWorkspaces,
} from "@/lib/workspace-context";

export async function GET() {
  try {
    const user = await requireUser();

    const memberships =
      await getUserWorkspaces(
        user.id,
      );

    return NextResponse.json(
      memberships.map(
        (membership) => ({
          id: membership.workspace.id,

          name: membership.workspace.name,

          role: membership.role,
        }),
      ),
    );
  } catch (error) {
    console.error(
      "GET /api/workspaces",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load workspaces.",
      },
      {
        status: 500,
      },
    );
  }
}