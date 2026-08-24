import { NextResponse } from "next/server";
import { WorkspaceRole } from "@prisma/client";

import { createAuditLog } from "@/lib/audit/audit-service";
import { apiErrorResponse } from "@/lib/api-error";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireWorkspaceRole } from "@/lib/workspace-permissions";
import { cancelInvitation } from "@/services/team.service";

type Props = {
  params: Promise<{
    invitationId: string;
  }>;
};

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const { invitationId } = await params;
    const workspace = await getCurrentWorkspace();

    await requireWorkspaceRole(
      workspace.id,
      workspace.userId,
      WorkspaceRole.ADMIN,
    );

    const result = await cancelInvitation(workspace.id, invitationId);

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Invitation not found.", message: "Invitation not found." },
        { status: 404 },
      );
    }

    await createAuditLog({
      workspaceId: workspace.id,
      userId: workspace.userId,
      action: "DELETE",
      entityType: "INVITATION",
      entityId: invitationId,
      metadata: { invitationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, "Unable to cancel invitation.");
  }
}
