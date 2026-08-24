"use client";

import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";

type Props = {
  productId: string;
};

export function DeleteProductDialog({
  productId,
}: Props) {
  const router = useRouter();

  async function removeProduct() {
    const response = await fetch(
      `/api/products/${productId}`,
      {
        method: "DELETE",
      },
    );

    if (response.ok) {
      router.push("/dashboard/products");
      router.refresh();
    }
  }

  return (
    <button
      onClick={removeProduct}
      className="rounded-lg border p-2 text-sm hover:bg-muted"
    >
      <Trash className="h-4 w-4" />
    </button>
  );
}
