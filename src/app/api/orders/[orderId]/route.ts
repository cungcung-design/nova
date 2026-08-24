import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import {
  getOrderById,
  updateOrderStatus,
} from "@/services/order.service";

type Context = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Context,
) {
  try {
    const { orderId } =
      await params;

    const workspace =
      await getCurrentWorkspace();

    const order =
      await getOrderById(
        workspace.id,
        orderId,
      );

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to fetch order.",
      },
      { status: 500 },
    );
  }
}
