import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { getOrderById } from "@/services/order.service";
import { apiErrorResponse } from "@/lib/api-error";

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

    await requireRole(
      workspace.id,
      [...permissions.orders.view],
    );

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
  } catch (error) {
    return apiErrorResponse(error, "Unable to fetch order.");
  }
}
