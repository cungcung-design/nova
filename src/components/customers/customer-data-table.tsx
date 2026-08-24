"use client";

import { DataTable } from "@/components/data-table/data-table";
import { CustomerFilters } from "@/components/data-table/filters/customer-filters";
import { CustomerStatusBadge } from "@/components/customers/customer-status-badge";
import Link from "next/link";
import type { TableColumn } from "@/types/table";

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

const columns: TableColumn<Customer>[] = [
  {
    id: "name",
    header: "Customer",
    accessor: "name",
    sortable: true,
    render: (row) => (
      <div>
        <Link href={`/dashboard/customers/${row.id}`} className="font-medium hover:underline">
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

export function CustomerDataTable({ data, total, page, pageSize }: CustomerDataTableProps) {
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
      renderFilters={<CustomerFilters />}
    />
  );
}
