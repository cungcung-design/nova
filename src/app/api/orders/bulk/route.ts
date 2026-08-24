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
    await requireRole(workspace.id, [...permissions.orders.update]);

    const body = await request.json();
    const parsed = parseIdList(body.ids, 100);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    if (body.action !== "cancel") {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const result = await db.order.updateMany({
      where: {
        id: { in: parsed.ids },
        workspaceId: workspace.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    return apiErrorResponse(error, "Bulk action failed.");
  }
}
