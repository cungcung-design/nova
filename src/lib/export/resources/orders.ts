import { db } from "@/lib/db";
import { toNumber } from "@/lib/utils";
import { getFilterString, getFilterStringList } from "@/lib/export/filters";
import { getOrders } from "@/services/order.service";

export async function getOrdersForExport(
  workspaceId: string,
  filters: Record<string, unknown> = {},
) {
  const ids = getFilterStringList(filters, "ids");

  if (ids && ids.length > 0) {
    const orders = await db.order.findMany({
      where: {
        workspaceId,
        id: { in: ids },
      },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    return orders.map((order) => ({
      ID: order.id,
      "Order Number": order.orderNumber,
      Customer: order.customer.name,
      Email: order.customer.email,
      Status: order.status,
      Payment: order.paymentStatus,
      Total: toNumber(order.total),
      Created: order.createdAt.toISOString(),
    }));
  }

  const result = await getOrders({
    workspaceId,
    search: getFilterString(filters, "search"),
    status: getFilterString(filters, "status"),
    paymentStatus: getFilterString(filters, "paymentStatus"),
    sortBy: getFilterString(filters, "sortBy") ?? getFilterString(filters, "sort"),
    sortDirection:
      getFilterString(filters, "sortDirection") === "asc" ||
      getFilterString(filters, "direction") === "asc"
        ? "asc"
        : "desc",
    page: 1,
    pageSize: 10000,
  });

  return result.orders.map((order) => ({
    ID: order.id,
    "Order Number": order.orderNumber,
    Customer: order.customer.name,
    Email: order.customer.email,
    Status: order.status,
    Payment: order.paymentStatus,
    Total: order.total,
    Created: new Date(order.createdAt).toISOString(),
  }));
}
