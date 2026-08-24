import {
  NextResponse,
} from "next/server";

import {
  getCurrentWorkspace,
} from "@/lib/current-workspace";

import {
  requireRole,
} from "@/lib/authz";

import {
  permissions,
  hasPermission,
} from "@/lib/permissions";

import {
  db,
} from "@/lib/db";

import {
  AuditAction,
} from "@prisma/client";

import type {
  BulkActionRequest,
} from "@/types/bulk-action";

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
            .customers
            .delete,
        ],
      );

    if (
      !hasPermission(
        membership.role,
        permissions
          .customers
          .delete,
      )
    ) {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 },
      );
    }

    const body =
      (await request.json()) as BulkActionRequest;

    const ids = Array.from(
      new Set(
        body.ids.filter(
          (id) =>
            typeof id ===
              "string" &&
            id.length > 0,
        ),
      ),
    );

    if (ids.length === 0) {
      return NextResponse.json(
        {
          error:
            "No customers selected.",
        },
        {
          status: 400,
        },
      );
    }

    if (ids.length > 100) {
      return NextResponse.json(
        {
          error:
            "You can process at most 100 customers at once.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      ![
        "archive",
        "restore",
        "activate",
        "delete",
      ].includes(body.action)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid bulk action.",
        },
        {
          status: 400,
        },
      );
    }

    const customers =
      await db.customer.findMany({
        where: {
          id: {
            in: ids,
          },
          workspaceId:
            workspace.id,
        },
        select: {
          id: true,
        },
      });

    if (
      customers.length !==
      ids.length
    ) {
      return NextResponse.json(
        {
          error:
            "One or more selected customers do not belong to this workspace.",
        },
        {
          status: 403,
        },
      );
    }

    const action =
      body.action ===
        "restore"
        ? "activate"
        : body.action;

    const auditAction =
      action === "archive"
        ? AuditAction.UPDATE
        : action === "activate"
          ? AuditAction.UPDATE
          : AuditAction.DELETE;

    const description =
      action === "archive"
        ? `Archived ${ids.length} customers.`
        : action === "activate"
          ? `Activated ${ids.length} customers.`
          : `Deleted ${ids.length} customers.`;

    await db.$transaction(
      async (tx) => {
        let count = 0;

        if (action === "archive") {
          const result =
            await tx.customer.updateMany(
              {
                where: {
                  id: {
                    in: ids,
                  },
                  workspaceId:
                    workspace
                      .id,
                },
                data: {
                  status:
                    "INACTIVE",
                },
              },
            );

          count = result.count;
        } else if (
          action ===
            "activate"
        ) {
          const result =
            await tx.customer.updateMany(
              {
                where: {
                  id: {
                    in: ids,
                  },
                  workspaceId:
                    workspace
                      .id,
                },
                data: {
                  status:
                    "ACTIVE",
                },
              },
            );

          count = result.count;
        } else if (
          action ===
            "delete"
        ) {
          const result =
            await tx.customer.deleteMany(
              {
                where: {
                  id: {
                    in: ids,
                  },
                  workspaceId:
                    workspace
                      .id,
                },
              },
            );

          count = result.count;
        }

        await tx.auditLog.create(
          {
            data: {
              workspaceId:
                workspace
                  .id,
              userId:
                workspace
                  .userId,
              action:
                auditAction,
              entity:
                "Customer",
              entityId: ids[0],
              description,
              metadata: {
                ids,
                action,
                count,
              },
            },
          },
        );

        return { count };
      },
    );

    return NextResponse.json({
      success: true,
      affected: ids.length,
    });
  } catch (error) {
    console.error(
      "POST /api/customers/bulk",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Bulk operation failed.",
      },
      {
        status: 500,
      },
    );
  }
}
