"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function CustomerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(
    key: string,
    value: string,
  ) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");

    router.push(
      `/dashboard/customers?${params.toString()}`,
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          defaultValue={
            searchParams.get("search") ?? ""
          }
          onChange={(event) =>
            updateFilter(
              "search",
              event.target.value,
            )
          }
          placeholder="Search customers..."
          className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2"
        />
      </div>

      <select
        defaultValue={
          searchParams.get("status") ?? ""
        }
        onChange={(event) =>
          updateFilter(
            "status",
            event.target.value,
          )
        }
        className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
      >
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="LEAD">Lead</option>
        <option value="INACTIVE">Inactive</option>
      </select>
    </div>
  );
}
