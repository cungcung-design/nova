import { NextResponse } from "next/server";

import { WorkspaceRole } from "@prisma/client";

import { createAuditLog } from "@/lib/audit/audit-service";
import { apiErrorResponse } from "@/lib/api-error";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { db } from "@/lib/db";
import { requireWorkspaceRole } from "@/lib/workspace-permissions";
import {
  updateMemberRole,
  removeMember,
} from "@/services/team.service";

type Props = {
  params: Promise<{
    memberId: string;
  }>;
};

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { memberId } = await params;
    const workspace = await getCurrentWorkspace();

    await requireWorkspaceRole(
      workspace.id,
      workspace.userId,
      WorkspaceRole.ADMIN,
    );

    const existing = await db.workspaceMember.findFirst({
      where: {
        id: memberId,
        workspaceId: workspace.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Member not found.", message: "Member not found." },
        { status: 404 },
      );
    }

    const body = await request.json();
    const newRole =
      body.role === "ADMIN" ? WorkspaceRole.ADMIN : WorkspaceRole.MEMBER;
    const oldRole = existing.role;

    await updateMemberRole(
      workspace.id,
      memberId,
      newRole,
      workspace.userId,
    );

    await createAuditLog({
      workspaceId: workspace.id,
      userId: workspace.userId,
      action: "ROLE_CHANGED",
      entityType: "USER",
      entityId: existing.userId,
      metadata: {
        oldRole,
        newRole,
        memberId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("PATCH /api/team/[memberId]", error);
    return apiErrorResponse(error, "Unable to update member.");
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const { memberId } = await params;
    const workspace = await getCurrentWorkspace();

    await requireWorkspaceRole(
      workspace.id,
      workspace.userId,
      WorkspaceRole.OWNER,
    );

    const existing = await db.workspaceMember.findFirst({
      where: {
        id: memberId,
        workspaceId: workspace.id,
      },
    });

    await removeMember(workspace.id, memberId, workspace.userId);

    await createAuditLog({
      workspaceId: workspace.id,
      userId: workspace.userId,
      action: "USER_DELETED",
      entityType: "USER",
      entityId: existing?.userId ?? memberId,
      metadata: {
        memberId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/team/[memberId]", error);
    return apiErrorResponse(error, "Unable to remove member.");
  }
}
