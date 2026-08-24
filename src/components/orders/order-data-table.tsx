"use client";

import { DataTable } from "@/components/data-table/data-table";
import { OrderFilters } from "@/components/data-table/filters/order-filters";
import Link from "next/link";
import type { TableColumn } from "@/types/table";

type Order = {
  id: string;
  orderNumber: string;
  total: string | number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  customer: {
    name: string;
    email: string | null;
  };
};

type OrderDataTableProps = {
  data: Order[];
  total: number;
  page: number;
  pageSize: number;
};

const columns: TableColumn<Order>[] = [
  {
    id: "orderNumber",
    header: "Order",
    accessor: "orderNumber",
    sortable: true,
    render: (row) => (
      <Link href={`/dashboard/orders/${row.id}`} className="font-medium hover:underline">
        {row.orderNumber}
      </Link>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    accessor: "customer",
    render: (row) => (
      <div>
        <p className="text-sm font-medium">{row.customer.name}</p>
        <p className="text-xs text-muted-foreground">{row.customer.email}</p>
      </div>
    ),
  },
  {
    id: "total",
    header: "Amount",
    accessor: "total",
    sortable: true,
    render: (row) => `$${Number(row.total).toFixed(2)}`,
  },
  {
    id: "status",
    header: "Status",
    accessor: "status",
    sortable: true,
    render: (row) => (
      <span className="rounded-full border px-2.5 py-1 text-xs">{row.status}</span>
    ),
  },
  {
    id: "paymentStatus",
    header: "Payment",
    accessor: "paymentStatus",
    sortable: true,
    render: (row) => row.paymentStatus,
  },
  {
    id: "createdAt",
    header: "Date",
    accessor: "createdAt",
    sortable: true,
    render: (row) => new Date(row.createdAt).toISOString().split("T")[0],
  },
];

export function OrderDataTable({ data, total, page, pageSize }: OrderDataTableProps) {
  return (
    <DataTable
      data={data}
      total={total}
      page={page}
      pageSize={pageSize}
      columns={columns}
      resource="orders"
      getRowId={(row) => row.id}
      bulkActions={[
        { label: "Cancel", action: "cancel" },
      ]}
      searchPlaceholder="Search orders..."
      renderFilters={<OrderFilters />}
    />
  );
}
