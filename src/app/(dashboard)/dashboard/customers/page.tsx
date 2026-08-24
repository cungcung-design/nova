import Link from "next/link";
import { Plus } from "lucide-react";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { getCustomers } from "@/services/customer.service";

import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerFilters } from "@/components/customers/customer-filters";

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: "ACTIVE" | "INACTIVE" | "LEAD";
    page?: string;
  }>;
};

export default async function CustomersPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const workspace =
    await getCurrentWorkspace();

  const result = await getCustomers({
    workspaceId: workspace.id,
    search: params.search,
    status: params.status,
    page: Number(params.page) || 1,
    pageSize: 10,
  });

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Customers
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your customers and relationships.
          </p>
        </div>

        <Link
          href="/dashboard/customers/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Link>
      </div>

      <CustomerFilters />

      <CustomerTable
        customers={result.customers}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
      />
    </div>
  );
}
