import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { createOrder, getOrders } from "@/services/order.service";
import { orderSchema } from "@/lib/validations/order";
import { apiErrorResponse } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();

    await requireRole(workspace.id, [...permissions.orders.view]);

    const url = new URL(request.url);

    const search = url.searchParams.get("search")?.trim() ?? "";
    const status = url.searchParams.get("status");
    const paymentStatus = url.searchParams.get("paymentStatus");
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(10, Number(url.searchParams.get("pageSize") ?? "25")));
    const sortBy = url.searchParams.get("sortBy") ?? "createdAt";
    const sortDirection = url.searchParams.get("sortDirection") === "asc" ? "asc" : "desc";

    const allowedSortFields = ["createdAt", "total", "status", "orderNumber"] as const;
    const safeSortBy = allowedSortFields.includes(sortBy as (typeof allowedSortFields)[number])
      ? sortBy
      : "createdAt";

    const result = await getOrders({
      workspaceId: workspace.id,
      search: search || undefined,
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      page,
      pageSize,
      sortBy: safeSortBy,
      sortDirection,
    });

    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error, "Unable to fetch orders.");
  }
}

export async function POST(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();

    await requireRole(workspace.id, [...permissions.orders.create]);

    const body = await request.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const order = await createOrder(workspace.id, parsed.data);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message !== "UNAUTHORIZED" &&
      error.message !== "FORBIDDEN"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return apiErrorResponse(error, "Unable to create order.");
  }
}
