"use client";

import { Search, X } from "lucide-react";

type TableSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function TableSearch({ value, onChange, placeholder = "Search..." }: TableSearchProps) {
  return (
    <div className="relative w-full md:max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border bg-background pl-9 pr-9 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/10"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
