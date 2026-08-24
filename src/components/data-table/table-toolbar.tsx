"use client";

import { Filter, SlidersHorizontal, X } from "lucide-react";

import { TableSearch } from "./table-search";

type TableToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  activeFilters: number;
  searchPlaceholder?: string;
  onFilterClick: () => void;
  onColumnsClick: () => void;
  onClearFilters: () => void;
};

export function TableToolbar({
  search,
  onSearchChange,
  activeFilters,
  searchPlaceholder,
  onFilterClick,
  onColumnsClick,
  onClearFilters,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
      <TableSearch
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder ?? "Search..."}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onFilterClick}
          className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition hover:bg-muted"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilters > 0 && (
            <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] text-background">
              {activeFilters}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onColumnsClick}
          className="hidden h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition hover:bg-muted md:inline-flex"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Columns
        </button>

        {activeFilters > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
