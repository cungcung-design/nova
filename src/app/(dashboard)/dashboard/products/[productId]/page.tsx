import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { getProductById } from "@/services/product.service";

type Props = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductPage({
  params,
}: Props) {
  const { productId } = await params;

  const workspace =
    await getCurrentWorkspace();

  const product =
    await getProductById(
      workspace.id,
      productId,
    );

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <Link
        href="/dashboard/products"
        className="text-sm text-muted-foreground"
      >
        ← Products
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {product.name}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {product.sku ?? "No SKU"}
          </p>
        </div>

        <Link
          href={`/dashboard/products/${product.id}/edit`}
          className="rounded-lg border px-4 py-2.5 text-sm font-medium"
        >
          Edit product
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Price
          </p>

          <p className="mt-2 text-2xl font-semibold">
            ${Number(product.price).toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Cost
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {product.cost
              ? `$${Number(product.cost).toFixed(2)}`
              : "—"}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Stock
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {product.stock}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Status
          </p>

          <p className="mt-2 text-sm font-medium">
            {product.status}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">
          Description
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {product.description ||
            "No description available."}
        </p>
      </section>
    </div>
  );
}
