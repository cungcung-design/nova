"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ProductFormProps = {
  product?: {
    id: string;
    name: string;
    description: string | null;
    sku: string | null;
    price: unknown;
    cost: unknown;
    stock: number;
    status: string;
  };
};

export function ProductForm({
  product,
}: ProductFormProps) {
  const router = useRouter();

  const editing = Boolean(product);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const formData = new FormData(
      event.currentTarget,
    );

    const body = {
      name: formData.get("name"),
      description: formData.get("description"),
      sku: formData.get("sku"),
      price: formData.get("price"),
      cost: formData.get("cost"),
      stock: formData.get("stock"),
      status: formData.get("status"),
    };

    const response = await fetch(
      editing
        ? `/api/products/${product!.id}`
        : "/api/products",
      {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setError(
        data.error ?? "Something went wrong.",
      );
      setLoading(false);
      return;
    }

    router.push(
      editing
        ? `/dashboard/products/${product!.id}`
        : "/dashboard/products",
    );

    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="max-w-3xl space-y-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">
            Product name
          </label>

          <input
            name="name"
            required
            defaultValue={product?.name ?? ""}
            className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">
            Description
          </label>

          <textarea
            name="description"
            rows={4}
            defaultValue={
              product?.description ?? ""
            }
            className="w-full rounded-lg border p-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            SKU
          </label>

          <input
            name="sku"
            defaultValue={product?.sku ?? ""}
            className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Price
          </label>

          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={
              product
                ? Number(product.price)
                : ""
            }
            className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Cost
          </label>

          <input
            name="cost"
            type="number"
            min="0"
            step="0.01"
            defaultValue={
              product?.cost
                ? Number(product.cost)
                : ""
            }
            className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Stock
          </label>

          <input
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={
              product?.stock ?? 0
            }
            className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Status
        </label>

        <select
          name="status"
          defaultValue={
            product?.status ?? "ACTIVE"
          }
          className="h-10 rounded-lg border bg-background px-3 text-sm"
        >
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_STOCK">
            Out of stock
          </option>
          <option value="INACTIVE">
            Inactive
          </option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <button
        disabled={loading}
        className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : editing
            ? "Save changes"
            : "Create product"}
      </button>
    </form>
  );
}
