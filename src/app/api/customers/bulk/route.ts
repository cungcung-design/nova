import { NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { db } from "@/lib/db";
import { apiErrorResponse } from "@/lib/api-error";
import { parseIdList } from "@/lib/validation/common";
import type { BulkActionRequest } from "@/types/bulk-action";

export async function POST(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();
    await requireRole(workspace.id, [...permissions.customers.delete]);

    const body = (await request.json()) as BulkActionRequest;
    const parsed = parseIdList(body.ids, 100);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const ids = parsed.ids;

    if (!["archive", "restore", "activate", "delete"].includes(body.action)) {
      return NextResponse.json(
        { error: "Invalid bulk action." },
        { status: 400 },
      );
    }

    const customers = await db.customer.findMany({
      where: {
        id: { in: ids },
        workspaceId: workspace.id,
      },
      select: { id: true },
    });

    if (customers.length !== ids.length) {
      return NextResponse.json(
        {
          error:
            "One or more selected customers do not belong to this workspace.",
        },
        { status: 403 },
      );
    }

    const action = body.action === "restore" ? "activate" : body.action;

    await db.$transaction(async (tx) => {
      let count = 0;

      if (action === "archive") {
        const result = await tx.customer.updateMany({
          where: { id: { in: ids }, workspaceId: workspace.id },
          data: { status: "INACTIVE" },
        });
        count = result.count;
      } else if (action === "activate") {
        const result = await tx.customer.updateMany({
          where: { id: { in: ids }, workspaceId: workspace.id },
          data: { status: "ACTIVE" },
        });
        count = result.count;
      } else if (action === "delete") {
        const result = await tx.customer.deleteMany({
          where: { id: { in: ids }, workspaceId: workspace.id },
        });
        count = result.count;
      }

      await tx.auditLog.create({
        data: {
          workspaceId: workspace.id,
          userId: workspace.userId,
          action:
            action === "delete" ? AuditAction.DELETE : AuditAction.UPDATE,
          entity: "Customer",
          entityId: ids[0],
          description:
            action === "archive"
              ? `Archived ${ids.length} customers.`
              : action === "activate"
                ? `Activated ${ids.length} customers.`
                : `Deleted ${ids.length} customers.`,
          metadata: { ids, action, count },
        },
      });
    });

    return NextResponse.json({
      success: true,
      affected: ids.length,
    });
  } catch (error) {
    return apiErrorResponse(error, "Bulk operation failed.");
  }
}
