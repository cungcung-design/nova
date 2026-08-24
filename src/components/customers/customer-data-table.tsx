"use client";

import { DataTable } from "@/components/data-table/data-table";
import { FilterPanel } from "@/components/data-table/filter-panel";
import { FilterChips } from "@/components/data-table/filter-chips";
import { CustomerStatusBadge } from "@/components/customers/customer-status-badge";
import { useTableFilters } from "@/hooks/use-table-filters";
import {
  formatCurrencyFilter,
  getCustomerFilters,
} from "@/lib/filters";
import Link from "next/link";
import type { TableColumn } from "@/types/table";
import type { FilterChip } from "@/types/filters";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  status: string;
  createdAt: Date;
};

type CustomerDataTableProps = {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  LEAD: "Lead",
};

const columns: TableColumn<Customer>[] = [
  {
    id: "name",
    header: "Customer",
    accessor: "name",
    sortable: true,
    render: (row) => (
      <div>
        <Link
          href={`/dashboard/customers/${row.id}`}
          className="font-medium hover:underline"
        >
          {row.name}
        </Link>
        <p className="text-xs text-muted-foreground">{row.email ?? "—"}</p>
      </div>
    ),
  },
  {
    id: "company",
    header: "Company",
    accessor: "company",
    render: (row) => row.company || "—",
  },
  {
    id: "status",
    header: "Status",
    accessor: "status",
    sortable: true,
    render: (row) => <CustomerStatusBadge status={row.status} />,
  },
  {
    id: "createdAt",
    header: "Created",
    accessor: "createdAt",
    sortable: true,
    render: (row) => new Date(row.createdAt).toISOString().split("T")[0],
  },
];

export function CustomerDataTable({
  data,
  total,
  page,
  pageSize,
}: CustomerDataTableProps) {
  const { params, setFilter, setFilters, clearFilters } = useTableFilters();
  const filters = getCustomerFilters(params);

  const chips: FilterChip[] = [];

  if (filters.statuses && filters.statuses.length > 0) {
    chips.push({
      key: "status",
      label: filters.statuses.map((status) => statusLabels[status] ?? status).join(", "),
    });
  }

  if (filters.minRevenue != null) {
    chips.push({
      key: "minRevenue",
      label: `Revenue ≥ ${formatCurrencyFilter(filters.minRevenue)}`,
    });
  }

  if (filters.maxRevenue != null) {
    chips.push({
      key: "maxRevenue",
      label: `Revenue ≤ ${formatCurrencyFilter(filters.maxRevenue)}`,
    });
  }

  if (filters.createdFrom) {
    chips.push({ key: "createdFrom", label: `From ${filters.createdFrom}` });
  }

  if (filters.createdTo) {
    chips.push({ key: "createdTo", label: `To ${filters.createdTo}` });
  }

  return (
    <DataTable
      data={data}
      total={total}
      page={page}
      pageSize={pageSize}
      columns={columns}
      resource="customers"
      getRowId={(row) => row.id}
      bulkActions={[
        { label: "Archive", action: "archive" },
        { label: "Activate", action: "activate" },
        { label: "Delete", action: "delete", variant: "destructive" },
      ]}
      searchPlaceholder="Search customers..."
      filterPanel={
        <FilterPanel
          status={filters.status}
          minRevenue={filters.minRevenue?.toString() ?? ""}
          maxRevenue={filters.maxRevenue?.toString() ?? ""}
          createdFrom={filters.createdFrom ?? ""}
          createdTo={filters.createdTo ?? ""}
          onApply={(next) =>
            setFilters({
              status: next.status,
              minRevenue: next.minRevenue,
              maxRevenue: next.maxRevenue,
              createdFrom: next.createdFrom,
              createdTo: next.createdTo,
              dateFrom: undefined,
              dateTo: undefined,
              datePreset: undefined,
            })
          }
          onClear={clearFilters}
        />
      }
      filterChips={
        <FilterChips
          filters={chips}
          onRemove={(key) => {
            if (key === "createdFrom") {
              setFilters({ createdFrom: undefined, dateFrom: undefined });
              return;
            }

            if (key === "createdTo") {
              setFilters({ createdTo: undefined, dateTo: undefined });
              return;
            }

            setFilter(key, undefined);
          }}
          onClear={clearFilters}
        />
      }
    />
  );
}
