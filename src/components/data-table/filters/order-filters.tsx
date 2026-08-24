"use client";

import { useRouter, useSearchParams } from "next/navigation";

type OrderFilterProps = {
  onFilterChange?: () => void;
};

export function OrderFilters({ onFilterChange }: OrderFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || "";
  const paymentStatus = searchParams.get("paymentStatus") || "";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/dashboard/orders?${params.toString()}`);
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
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold text-muted-foreground">Payment</label>
        <select
          value={paymentStatus}
          onChange={(event) => update("paymentStatus", event.target.value)}
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none"
        >
          <option value="">All payments</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>
    </div>
  );
}
