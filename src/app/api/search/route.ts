import {
  NextResponse,
} from "next/server";

import {
  getCurrentWorkspace,
} from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { apiErrorResponse } from "@/lib/api-error";
import { sanitizeSearchQuery } from "@/lib/security/security";

import {
  db,
} from "@/lib/db";

export async function GET(
  request: Request,
) {
  try {
    const workspace =
      await getCurrentWorkspace();

    await requireRole(
      workspace.id,
      [...permissions.workspace.view],
    );

    const url =
      new URL(request.url);

    const query = sanitizeSearchQuery(
      url.searchParams.get("q") ?? "",
    );

    if (!query) {
      return NextResponse.json({
        customers: [],
        products: [],
        orders: [],
      });
    }

    if (query.length < 2) {
      return NextResponse.json({
        customers: [],
        products: [],
        orders: [],
      });
    }

    const search = query;

    const [
      customers,
      products,
      orders,
    ] = await Promise.all([
      db.customer.findMany({
        where: {
          workspaceId:
            workspace.id,

          OR: [
            {
              name: {
                contains:
                  search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains:
                  search,
                mode: "insensitive",
              },
            },
          ],
        },

        select: {
          id: true,
          name: true,
          email: true,
        },

        take: 5,

        orderBy: {
          createdAt: "desc",
        },
      }),

      db.product.findMany({
        where: {
          workspaceId:
            workspace.id,

          OR: [
            {
              name: {
                contains:
                  search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains:
                  search,
                mode: "insensitive",
              },
            },
          ],
        },

        select: {
          id: true,
          name: true,
        },

        take: 5,

        orderBy: {
          createdAt: "desc",
        },
      }),

      db.order.findMany({
        where: {
          workspaceId:
            workspace.id,

          OR: [
            {
              id: {
                contains:
                  search,
                mode: "insensitive",
              },
            },
          ],
        },

        select: {
          id: true,
          status: true,
        },

        take: 5,

        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return NextResponse.json({
      customers,
      products,
      orders,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to perform search.");
  }
}
