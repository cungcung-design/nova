import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { updateOrderStatus } from "@/services/order.service";
import { apiErrorResponse } from "@/lib/api-error";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit/audit-service";

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

    await requireRole(
      workspace.id,
      [...permissions.orders.update],
    );

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

    await createAuditLog({
      workspaceId: workspace.id,
      userId: workspace.userId,
      action:
        parsed.data.status === "CANCELLED"
          ? "ORDER_CANCELLED"
          : "ORDER_UPDATED",
      entityType: "ORDER",
      entityId: orderId,
      metadata: {
        status: parsed.data.status,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return apiErrorResponse(error, "Unable to update order.");
  }
}
