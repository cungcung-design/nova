import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { db } from "@/lib/db";
import { apiErrorResponse } from "@/lib/api-error";
import { parseIdList } from "@/lib/validation/common";

export async function POST(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();
    await requireRole(workspace.id, [...permissions.products.delete]);

    const body = await request.json();
    const parsed = parseIdList(body.ids, 100);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const action = body.action as string;
    const allowedActions = ["activate", "deactivate", "delete"];

    if (!allowedActions.includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const ids = parsed.ids;
    let count = 0;

    if (action === "delete") {
      const result = await db.product.deleteMany({
        where: { id: { in: ids }, workspaceId: workspace.id },
      });
      count = result.count;
    } else if (action === "deactivate") {
      const result = await db.product.updateMany({
        where: { id: { in: ids }, workspaceId: workspace.id },
        data: { status: "INACTIVE" },
      });
      count = result.count;
    } else if (action === "activate") {
      const result = await db.product.updateMany({
        where: { id: { in: ids }, workspaceId: workspace.id },
        data: { status: "ACTIVE" },
      });
      count = result.count;
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    return apiErrorResponse(error, "Bulk action failed.");
  }
}
