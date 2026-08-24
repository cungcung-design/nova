import { NextResponse } from "next/server";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions, hasPermission } from "@/lib/permissions";
import { getOrders } from "@/services/order.service";

export async function GET(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();

    const membership = await requireRole(workspace.id, [...permissions.orders.view]);

    if (!hasPermission(membership.role, permissions.orders.view)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const url = new URL(request.url);

    const search = url.searchParams.get("search")?.trim() ?? "";
    const status = url.searchParams.get("status");
    const paymentStatus = url.searchParams.get("paymentStatus");
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
      page: 1,
      pageSize: 10000,
      sortBy: safeSortBy,
      sortDirection,
    });

    const orders = result.orders;

    const headers: Record<string, string> = {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().split("T")[0]}.csv"`,
    };

    const csvRows = [
      ["Order #", "Customer", "Status", "Payment", "Total", "Created At"],
      ...orders.map((o) => [
        `"${(o.orderNumber || "").replace(/"/g, '""')}"`,
        `"${(o.customer?.name || "").replace(/"/g, '""')}"`,
        o.status,
        o.paymentStatus,
        Number(o.total).toFixed(2),
        new Date(o.createdAt).toISOString(),
      ]),
    ];

    const csv = csvRows.map((row) => row.join(",")).join("\n");

    return new NextResponse(csv, { headers });
  } catch (error) {
    console.error("GET /api/orders/export", error);
    return NextResponse.json(
      { error: "Export failed." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();

    const membership = await requireRole(workspace.id, [...permissions.orders.view]);

    if (!hasPermission(membership.role, permissions.orders.view)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = (await request.json()) as { ids?: string[] };
    const ids = Array.isArray(body.ids) ? body.ids : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "No orders selected." }, { status: 400 });
    }

    const result = await getOrders({
      workspaceId: workspace.id,
      page: 1,
      pageSize: 10000,
    });

    const orders = result.orders.filter((order) => ids.includes(order.id));

    const headers: Record<string, string> = {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().split("T")[0]}.csv"`,
    };

    const csvRows = [
      ["Order #", "Customer", "Status", "Payment", "Total", "Created At"],
      ...orders.map((o) => [
        `"${(o.orderNumber || "").replace(/"/g, '""')}"`,
        `"${(o.customer?.name || "").replace(/"/g, '""')}"`,
        o.status,
        o.paymentStatus,
        Number(o.total).toFixed(2),
        new Date(o.createdAt).toISOString(),
      ]),
    ];

    const csv = csvRows.map((row) => row.join(",")).join("\n");

    return new NextResponse(csv, { headers });
  } catch (error) {
    console.error("POST /api/orders/export", error);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
