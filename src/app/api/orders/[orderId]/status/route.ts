import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";

import {
  updateOrderStatus,
} from "@/services/order.service";

import { z } from "zod";

const statusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
  ]),
});

type Context = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: Context,
) {
  try {
    const { orderId } =
      await params;

    const workspace =
      await getCurrentWorkspace();

    const body =
      await request.json();

    const parsed =
      statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Invalid order status.",
        },
        { status: 400 },
      );
    }

    await updateOrderStatus(
      workspace.id,
      orderId,
      parsed.data.status,
    );

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to update order.",
      },
      { status: 500 },
    );
  }
}
