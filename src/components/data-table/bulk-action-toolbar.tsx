"use client";

import {
  Download,
  X,
} from "lucide-react";

type BulkActionToolbarProps = {
  selectedCount: number;
  actions: Array<{
    label: string;
    action: string;
    variant?: "default" | "destructive";
  }>;
  onBulkAction: (action: string) => void;
  onExport: () => void;
  onClear: () => void;
  loading?: boolean;
};

export function BulkActionToolbar({
  selectedCount,
  actions,
  onBulkAction,
  onExport,
  onClear,
  loading = false,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-4 py-3">
      <div className="mr-auto flex items-center gap-2">
        <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">
          {selectedCount}
        </span>

        <span className="text-sm font-medium">
          selected
        </span>

        <button
          type="button"
          onClick={onClear}
          className="ml-1 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {actions.map((action) => (
        <button
          key={action.action}
          type="button"
          disabled={loading}
          onClick={() => onBulkAction(action.action)}
          className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition hover:bg-background disabled:pointer-events-none disabled:opacity-50 ${
            action.variant === "destructive"
              ? "text-destructive"
              : ""
          }`}
        >
          {action.label}
        </button>
      ))}

      <button
        type="button"
        disabled={loading}
        onClick={onExport}
        className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition hover:bg-background disabled:pointer-events-none disabled:opacity-50"
      >
        <Download className="h-4 w-4" />

        Export
      </button>
    </div>
  );
}
