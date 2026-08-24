import Link from "next/link";
import { Plus } from "lucide-react";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { getOrders } from "@/services/order.service";
import { OrderDataTable } from "@/components/orders/order-data-table";

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    paymentStatus?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortDirection?: string;
  }>;
};

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const workspace = await getCurrentWorkspace();

  const result = await getOrders({
    workspaceId: workspace.id,
    search: params.search,
    status: params.status,
    paymentStatus: params.paymentStatus,
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 25,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection as "asc" | "desc" | undefined,
  });

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and track customer orders.</p>
        </div>
        <Link
          href="/dashboard/orders/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background"
        >
          <Plus className="h-4 w-4" />
          Create Order
        </Link>
      </div>
      <OrderDataTable
        data={result.orders}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
      />
    </div>
  );
}
