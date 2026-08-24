"use client";

import { useRouter, useSearchParams } from "next/navigation";

type ProductFilterProps = {
  onFilterChange?: () => void;
};

export function ProductFilters({ onFilterChange }: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || "";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/dashboard/products?${params.toString()}`);
    onFilterChange?.();
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-semibold text-muted-foreground">Status</label>
        <select
          value={status}
          onChange={(event) => update("status", event.target.value)}
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
        </select>
      </div>
    </div>
  );
}
