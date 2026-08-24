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
  createCsv,
} from "@/lib/csv";

import {
  AuditAction,
} from "@prisma/client";

import type {
  ExportRequest,
} from "@/types/export";

import { getCustomerFilters } from "@/lib/filters";
import { getCustomers } from "@/services/customer.service";

export async function GET(
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
            .view,
        ],
      );

    if (
      !hasPermission(
        membership.role,
        permissions
          .customers
          .view,
      )
    ) {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 },
      );
    }

    const url = new URL(
      request.url,
    );
    const filters = getCustomerFilters(url.searchParams);

    const result = await getCustomers({
      workspaceId: workspace.id,
      search: filters.search,
      statuses: filters.statuses,
      page: 1,
      pageSize: 10000,
      createdFrom: filters.createdFrom,
      createdTo: filters.createdTo,
      minRevenue: filters.minRevenue,
      maxRevenue: filters.maxRevenue,
    });

    const csv = createCsv(
      [
        "ID",
        "Name",
        "Email",
        "Status",
        "Created At",
      ],
      result.customers.map(
        (customer) => [
          customer.id,
          customer.name,
          customer.email,
          customer.status,
          customer
            .createdAt
            .toISOString(),
        ],
      ),
    );

    await db.auditLog.create({
      data: {
        workspaceId: workspace.id,
        userId: workspace.userId,
        action: AuditAction.EXPORT_DATA,
        entity: "Customer",
        description: `Exported ${result.customers.length} customers.`,
        metadata: {
          scope: "filtered",
          count: result.customers.length,
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.minRevenue != null ? { minRevenue: filters.minRevenue } : {}),
          ...(filters.maxRevenue != null ? { maxRevenue: filters.maxRevenue } : {}),
          ...(filters.createdFrom ? { createdFrom: filters.createdFrom } : {}),
          ...(filters.createdTo ? { createdTo: filters.createdTo } : {}),
        },
      },
    });

    return new NextResponse(
      csv,
      {
        status: 200,

        headers: {
          "Content-Type":
            "text/csv; charset=utf-8",

          "Content-Disposition":
            `attachment; filename="customers-${new Date()
              .toISOString()
              .slice(
                0,
                10,
              )}.csv"`,

          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "GET /api/customers/export",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Export failed.",
      },
      {
        status: 500,
      },
    );
  }
}

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
            .view,
        ],
      );

    if (
      !hasPermission(
        membership.role,
        permissions
          .customers
          .view,
      )
    ) {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 },
      );
    }

    const body =
      (await request.json()) as ExportRequest;

    if (body.format !== "csv") {
      return NextResponse.json(
        {
          error:
            "Only CSV export is currently supported.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.scope ===
        "selected"
    ) {
      if (
        !body.ids ||
        body.ids.length ===
          0
      ) {
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
    }

    return await db.$transaction(
      async (tx) => {
        const where: {
          workspaceId: string;
          id?: { in: string[] };
          OR?: Array<{
            name?: { contains: string; mode: "insensitive" };
            email?: { contains: string; mode: "insensitive" };
          }>;
        } = {
          workspaceId:
            workspace
              .id,
        };

        if (
          body.scope ===
            "selected" &&
          body.ids
        ) {
          where.id = {
            in: body
              .ids,
          };
        } else if (
          body.scope ===
            "filtered" &&
          body
            .search
        ) {
          where.OR = [
            {
              name: {
                contains:
                  body
                    .search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains:
                  body
                    .search,
                mode: "insensitive",
              },
            },
          ];
        }

        const customers =
          await tx.customer.findMany(
            {
              where,
              orderBy: {
                createdAt:
                  "desc",
              },
              take: 10000,
              select: {
                id: true,
                name: true,
                email: true,
                createdAt:
                  true,
                status: true,
              },
            },
          );

        const csv = createCsv(
          [
            "ID",
            "Name",
            "Email",
            "Status",
            "Created At",
          ],
          customers.map(
            (customer) => [
              customer.id,
              customer.name,
              customer.email,
              customer.status,
              customer
                .createdAt
                .toISOString(),
            ],
          ),
        );

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
                AuditAction
                  .EXPORT_DATA,
              entity:
                "Customer",
              description: `Exported ${customers.length} customers.`,
              metadata: {
                scope:
                  body
                    .scope,
                search:
                  body
                    .search,
                ids:
                  body
                    .ids,
                count:
                  customers
                    .length,
              },
            },
          },
        );

        return new NextResponse(
          csv,
          {
            status: 200,

            headers: {
              "Content-Type":
                "text/csv; charset=utf-8",

              "Content-Disposition":
                `attachment; filename="customers-${new Date()
                  .toISOString()
                  .slice(
                    0,
                    10,
                  )}.csv"`,

              "Cache-Control":
                "no-store",
            },
          },
        );
      },
    );
  } catch (error) {
    console.error(
      "POST /api/customers/export",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Export failed.",
      },
      {
        status: 500,
      },
    );
  }
}
