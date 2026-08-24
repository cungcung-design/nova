"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  price: unknown;
  stock: number;
  status: string;
  createdAt: Date;
};

type Props = {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
};

export function ProductTable({
  products,
  total,
  page,
  totalPages,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function changePage(nextPage: number) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set("page", String(nextPage));

    router.push(
      `/dashboard/products?${params.toString()}`,
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="border-b px-6 py-4">
        <p className="text-sm text-muted-foreground">
          {total} products
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
          <h3 className="font-semibold">
            No products found
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your filters or add a product.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-6 py-4 font-medium">
                    Product
                  </th>

                  <th className="px-6 py-4 font-medium">
                    SKU
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Price
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Stock
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="font-medium hover:underline"
                      >
                        {product.name}
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {product.sku ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      ${Number(product.price).toFixed(2)}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {product.stock}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full border px-2.5 py-1 text-xs">
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() =>
                  changePage(page - 1)
                }
                className="rounded-lg border p-2 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() =>
                  changePage(page + 1)
                }
                className="rounded-lg border p-2 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
