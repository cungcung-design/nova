"use client";

import { DataTable } from "@/components/data-table/data-table";
import { ProductFilters } from "@/components/data-table/filters/product-filters";
import Link from "next/link";
import type { TableColumn } from "@/types/table";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  price: string | number;
  stock: number;
  status: string;
  createdAt: Date;
};

type ProductDataTableProps = {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
};

const columns: TableColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    accessor: "name",
    sortable: true,
    render: (row) => (
      <Link href={`/dashboard/products/${row.id}`} className="font-medium hover:underline">
        {row.name}
      </Link>
    ),
  },
  {
    id: "sku",
    header: "SKU",
    accessor: "sku",
    render: (row) => row.sku ?? "—",
  },
  {
    id: "price",
    header: "Price",
    accessor: "price",
    sortable: true,
    render: (row) => `$${Number(row.price).toFixed(2)}`,
  },
  {
    id: "stock",
    header: "Stock",
    accessor: "stock",
    sortable: true,
    render: (row) => row.stock,
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
    id: "createdAt",
    header: "Created",
    accessor: "createdAt",
    sortable: true,
    render: (row) => new Date(row.createdAt).toISOString().split("T")[0],
  },
];

export function ProductDataTable({ data, total, page, pageSize }: ProductDataTableProps) {
  return (
    <DataTable
      data={data}
      total={total}
      page={page}
      pageSize={pageSize}
      columns={columns}
      resource="products"
      getRowId={(row) => row.id}
      bulkActions={[
        { label: "Activate", action: "activate" },
        { label: "Deactivate", action: "deactivate" },
        { label: "Delete", action: "delete", variant: "destructive" },
      ]}
      searchPlaceholder="Search products..."
      renderFilters={<ProductFilters />}
    />
  );
}
