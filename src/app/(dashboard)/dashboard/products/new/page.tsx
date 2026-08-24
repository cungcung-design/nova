import Link from "next/link";

import { ProductForm } from "@/components/products/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <Link
          href="/dashboard/products"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to products
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">
          Add product
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a product for this workspace.
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
