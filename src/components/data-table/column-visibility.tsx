"use client";

import { Check } from "lucide-react";

import type { TableColumn } from "@/types/table";

type ColumnVisibilityProps<T> = {
  columns: TableColumn<T>[];
  visibleColumns: Set<string>;
  onToggle: (columnId: string) => void;
};

export function ColumnVisibility<T>({
  columns,
  visibleColumns,
  onToggle,
}: ColumnVisibilityProps<T>) {
  return (
    <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-xl border bg-background p-2 shadow-xl">
      <div className="px-3 py-2">
        <p className="text-xs font-semibold">Show columns</p>
        <p className="mt-1 text-xs text-muted-foreground">Choose which columns are visible.</p>
      </div>

      <div className="space-y-1">
        {columns
          .filter((column) => column.hideable !== false)
          .map((column) => {
            const visible = visibleColumns.has(column.id);

            return (
              <button
                key={column.id}
                type="button"
                onClick={() => onToggle(column.id)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded border">
                  {visible && <Check className="h-3 w-3" />}
                </span>
                {column.header}
              </button>
            );
          })}
      </div>
    </div>
  );
}
