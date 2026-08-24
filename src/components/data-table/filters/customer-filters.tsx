"use client";

import { useRouter, useSearchParams } from "next/navigation";

type CustomerFilterProps = {
  onFilterChange?: () => void;
};

export function CustomerFilters({ onFilterChange }: CustomerFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || "";
  const datePreset = searchParams.get("datePreset") || "";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/dashboard/customers?${params.toString()}`);
    onFilterChange?.();
  }

  function applyDatePreset(preset: string) {
    const params = new URLSearchParams(searchParams.toString());
    const now = new Date();
    let from: Date;

    switch (preset) {
      case "today":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "last7":
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last30":
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        params.delete("datePreset");
        params.delete("dateFrom");
        params.delete("dateTo");
        params.set("page", "1");
        router.push(`/dashboard/customers?${params.toString()}`);
        onFilterChange?.();
        return;
    }

    params.set("datePreset", preset);
    params.set("dateFrom", from.toISOString().split("T")[0]);
    params.set("dateTo", now.toISOString().split("T")[0]);
    params.set("page", "1");
    router.push(`/dashboard/customers?${params.toString()}`);
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
          <option value="LEAD">Lead</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold text-muted-foreground">Created</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => applyDatePreset("today")}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted ${
              datePreset === "today" ? "border-foreground bg-muted" : ""
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => applyDatePreset("last7")}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted ${
              datePreset === "last7" ? "border-foreground bg-muted" : ""
            }`}
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => applyDatePreset("last30")}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted ${
              datePreset === "last30" ? "border-foreground bg-muted" : ""
            }`}
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => applyDatePreset("")}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted ${
              !datePreset ? "border-foreground bg-muted" : ""
            }`}
          >
            All time
          </button>
        </div>
      </div>
    </div>
  );
}
