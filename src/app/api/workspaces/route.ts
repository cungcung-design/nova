import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser, requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { apiErrorResponse } from "@/lib/api-error";
import { createAuditLog } from "@/lib/audit/audit-service";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { db } from "@/lib/db";
import { getUserWorkspaces } from "@/lib/workspace-context";

const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export async function GET() {
  try {
    const user = await requireUser();
    const memberships = await getUserWorkspaces(user.id);

    return NextResponse.json(
      memberships.map((membership) => ({
        id: membership.workspace.id,
        name: membership.workspace.name,
        role: membership.role,
      })),
    );
  } catch (error) {
    return apiErrorResponse(error, "Unable to load workspaces.");
  }
}

export async function PATCH(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();
    await requireRole(workspace.id, [...permissions.workspace.update]);

    const body = await request.json();
    const parsed = updateWorkspaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid workspace name.",
          message: "Invalid workspace name.",
        },
        { status: 400 },
      );
    }

    const updated = await db.workspace.update({
      where: { id: workspace.id },
      data: { name: parsed.data.name },
    });

    await createAuditLog({
      workspaceId: workspace.id,
      userId: workspace.userId,
      action: "UPDATE_WORKSPACE",
      entityType: "WORKSPACE",
      entityId: workspace.id,
      metadata: {
        name: updated.name,
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      plan: updated.plan,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to update workspace.");
  }
}
