import Link from "next/link";
import { Plus } from "lucide-react";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { getProducts } from "@/services/product.service";
import { ProductDataTable } from "@/components/products/product-data-table";

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortDirection?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const workspace = await getCurrentWorkspace();

  const result = await getProducts({
    workspaceId: workspace.id,
    search: params.search,
    status: params.status,
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 25,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection as "asc" | "desc" | undefined,
  });

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your products, pricing, and inventory.</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>
      <ProductDataTable
        data={result.products}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
      />
    </div>
  );
}
