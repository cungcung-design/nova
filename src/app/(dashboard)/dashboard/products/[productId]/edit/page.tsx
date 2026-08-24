import { notFound } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { getProductById } from "@/services/product.service";
import { toNumber } from "@/lib/utils";

import { ProductForm } from "@/components/products/product-form";

type Props = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function EditProductPage({
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
      <div>
        <h1 className="text-2xl font-semibold">
          Edit product
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update product information.
        </p>
      </div>

      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          price: toNumber(product.price),
          cost: product.cost == null ? null : toNumber(product.cost),
          stock: product.stock,
          status: product.status,
        }}
      />
    </div>
  );
}
