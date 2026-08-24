import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions, hasPermission } from "@/lib/permissions";

import { db } from "@/lib/db";

export async function POST(
  request: Request,
) {
  try {
    const workspace =
      await getCurrentWorkspace();

    const membership =
      await requireRole(
        workspace.id,
        [
          ...permissions
            .orders
            .update,
        ],
      );

    if (
      !hasPermission(
        membership.role,
        permissions.orders
          .update,
      )
    ) {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 },
      );
    }

    const body =
      await request.json();

    const {
      ids,
      action,
    }: {
      ids: string[];
      action: string;
    } = body;

    if (
      !Array.isArray(ids) ||
      ids.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No IDs provided.",
        },
        { status: 400 },
      );
    }

    const allowedActions = [
      "cancel",
    ];

    if (
      !allowedActions.includes(
        action,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid action.",
        },
        { status: 400 },
      );
    }

    const result =
      await db.order.updateMany({
        where: {
          id: {
            in: ids,
          },
          workspaceId:
            workspace.id,
        },
        data: {
          status:
            "CANCELLED",
        },
      });

    return NextResponse.json(
      {
        success: true,
        count: result.count,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/orders/bulk",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Bulk action failed.",
      },
      { status: 500 },
    );
  }
}
