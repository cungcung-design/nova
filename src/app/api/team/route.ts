import { NextResponse } from "next/server";

import { WorkspaceRole } from "@prisma/client";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import { requireWorkspaceRole } from "@/lib/workspace-permissions";

import { createInvitation, getTeam } from "@/services/team.service";

export async function GET() {
  try {
    const workspace = await getCurrentWorkspace();

    const team = await getTeam(workspace.id);

    return NextResponse.json(team);
  } catch (error) {
    console.error("GET /api/team", error);

    return NextResponse.json(
      {
        error: "Unable to load team.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();

    await requireWorkspaceRole(
      workspace.id,
      workspace.userId,
      WorkspaceRole.ADMIN,
    );

    const body = await request.json();

    const email = String(body.email ?? "").trim().toLowerCase();

    const role =
      body.role === "ADMIN"
        ? WorkspaceRole.ADMIN
        : WorkspaceRole.MEMBER;

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required.",
        },
        {
          status: 400,
        },
      );
    }

    const invitation = await createInvitation({
      workspaceId: workspace.id,
      email,
      role,
      actorId: workspace.userId,
    });

    return NextResponse.json(
      {
        invitation,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST /api/team", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to invite member.",
      },
      {
        status: 400,
      },
    );
  }
}
