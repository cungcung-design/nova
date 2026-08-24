import {
  NextResponse,
} from "next/server";

import {
  getCurrentWorkspace,
} from "@/lib/current-workspace";

import {
  db,
} from "@/lib/db";

export async function GET(
  request: Request,
) {
  try {
    const workspace =
      await getCurrentWorkspace();

    const url =
      new URL(request.url);

    const query =
      url.searchParams
        .get("q")
        ?.trim();

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

    const search =
      query.slice(0, 100);

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
    console.error(
      "GET /api/search",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to perform search.",
      },
      {
        status: 500,
      },
    );
  }
}
