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
            .products
            .delete,
        ],
      );

    if (
      !hasPermission(
        membership.role,
        permissions.products
          .delete,
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
      "activate",
      "deactivate",
      "delete",
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

    let count = 0;

    if (action === "delete") {
      const result =
        await db.product.deleteMany(
          {
            where: {
              id: {
                in: ids,
              },
              workspaceId:
                workspace.id,
            },
          },
        );

      count = result.count;
    } else if (
      action === "deactivate"
    ) {
      const result =
        await db.product.updateMany(
          {
            where: {
              id: {
                in: ids,
              },
              workspaceId:
                workspace.id,
            },
            data: {
              status:
                "INACTIVE",
            },
          },
        );

      count = result.count;
    } else if (
      action === "activate"
    ) {
      const result =
        await db.product.updateMany(
          {
            where: {
              id: {
                in: ids,
              },
              workspaceId:
                workspace.id,
            },
            data: {
              status:
                "ACTIVE",
            },
          },
        );

      count = result.count;
    }

    return NextResponse.json(
      {
        success: true,
        count,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/products/bulk",
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
