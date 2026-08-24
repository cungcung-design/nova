import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import {
  createOrder,
  getOrders,
} from "@/services/order.service";

import { orderSchema } from "@/lib/validations/order";

export async function GET(
  request: Request,
) {
  try {
    const workspace =
      await getCurrentWorkspace();

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams.get("search") ||
      undefined;

    const status =
      searchParams.get("status") ||
      undefined;

    const page = Math.max(
      Number(
        searchParams.get("page"),
      ) || 1,
      1,
    );

    const result =
      await getOrders({
        workspaceId: workspace.id,
        search,
        status,
        page,
      });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to fetch orders.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
) {
  try {
    const workspace =
      await getCurrentWorkspace();

    const body =
      await request.json();

    const parsed =
      orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Invalid order data.",
        },
        { status: 400 },
      );
    }

    const order =
      await createOrder(
        workspace.id,
        parsed.data,
      );

    return NextResponse.json(
      order,
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create order.",
      },
      { status: 400 },
    );
  }
}
