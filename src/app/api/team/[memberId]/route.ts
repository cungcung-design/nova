import { NextResponse } from "next/server";

import { AuditAction, WorkspaceRole } from "@prisma/client";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import { requireWorkspaceRole } from "@/lib/workspace-permissions";

import {
  updateMemberRole,
  removeMember,
} from "@/services/team.service";

import { createAuditLog } from "@/services/audit.service";

type Props = {
  params: Promise<{
    memberId: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: Props,
) {
  try {
    const { memberId } = await params;

    const workspace =
      await getCurrentWorkspace();

    await requireWorkspaceRole(
      workspace.id,
      workspace.userId,
      WorkspaceRole.ADMIN,
    );

    const body = await request.json();

    const role =
      body.role === "ADMIN"
        ? WorkspaceRole.ADMIN
        : WorkspaceRole.MEMBER;

    await updateMemberRole(
      workspace.id,
      memberId,
      role,
      workspace.userId,
    );

    await createAuditLog({
      workspaceId: workspace.id,

      userId: workspace.userId,

      action:
        AuditAction.CHANGE_ROLE,

      entity: "WorkspaceMember",

      entityId: memberId,

      description:
        `Member role changed to ${role}.`,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "PATCH /api/team/[memberId]",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update member.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: Props,
) {
  try {
    const { memberId } = await params;

    const workspace =
      await getCurrentWorkspace();

    await requireWorkspaceRole(
      workspace.id,
      workspace.userId,
      WorkspaceRole.OWNER,
    );

    await removeMember(
      workspace.id,
      memberId,
      workspace.userId,
    );

    await createAuditLog({
      workspaceId: workspace.id,

      userId: workspace.userId,

      action:
        AuditAction.REMOVE_MEMBER,

      entity: "WorkspaceMember",

      entityId: memberId,

      description:
        "A member was removed from the workspace.",
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/team/[memberId]",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to remove member.",
      },
      { status: 400 },
    );
  }
}