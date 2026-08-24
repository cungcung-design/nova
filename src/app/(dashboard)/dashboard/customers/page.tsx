import { Plus } from "lucide-react";
import Link from "next/link";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { getCustomers } from "@/services/customer.service";
import { CustomerDataTable } from "@/components/customers/customer-data-table";
import { getCustomerFiltersFromRecord } from "@/lib/filters";

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sort?: string;
    sortDirection?: string;
    direction?: string;
    dateFrom?: string;
    dateTo?: string;
    createdFrom?: string;
    createdTo?: string;
    minRevenue?: string;
    maxRevenue?: string;
  }>;
};

export default async function CustomersPage({ searchParams }: Props) {
  const params = await searchParams;
  const workspace = await getCurrentWorkspace();
  const filters = getCustomerFiltersFromRecord(params);

  const result = await getCustomers({
    workspaceId: workspace.id,
    search: filters.search,
    statuses: filters.statuses,
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 25,
    sortBy: params.sortBy ?? params.sort,
    sortDirection: (params.sortDirection ?? params.direction) as
      | "asc"
      | "desc"
      | undefined,
    createdFrom: filters.createdFrom,
    createdTo: filters.createdTo,
    minRevenue: filters.minRevenue,
    maxRevenue: filters.maxRevenue,
  });

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
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
      <CustomerDataTable
        data={result.customers.map((customer) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          company: customer.company,
          status: customer.status,
          createdAt: customer.createdAt,
        }))}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
      />
    </div>
  );
}
