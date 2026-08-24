"use client";

import { X } from "lucide-react";

import type { FilterChip } from "@/types/filters";

type FilterChipsProps = {
  filters: FilterChip[];
  onRemove: (key: string) => void;
  onClear: () => void;
};

export function FilterChips({
  filters,
  onRemove,
  onClear,
}: FilterChipsProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={() => onRemove(filter.key)}
          className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
        >
          {filter.label}
          <X className="h-3 w-3" />
        </button>
      ))}

      <button
        type="button"
        onClick={onClear}
        className="text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        Clear all
      </button>
    </div>
  );
}
