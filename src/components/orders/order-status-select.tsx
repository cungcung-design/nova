"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@prisma/client";

const STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
];

type OrderStatusSelectProps = {
  orderId: string;
  status: OrderStatus;
  canUpdate: boolean;
};

export function OrderStatusSelect({
  orderId,
  status,
  canUpdate,
}: OrderStatusSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onChange(next: OrderStatus) {
    if (!canUpdate || next === value) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update order.");
      }

      setValue(next);
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update order.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!canUpdate) {
    return (
      <span className="rounded-full border px-3 py-1 text-xs font-medium">
        {value}
      </span>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="order-status" className="sr-only">
        Order status
      </label>
      <select
        id="order-status"
        value={value}
        disabled={saving}
        onChange={(event) => {
          void onChange(event.target.value as OrderStatus);
        }}
        className="h-10 rounded-xl border bg-background px-3 text-sm"
      >
        {STATUSES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
