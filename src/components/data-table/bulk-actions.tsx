"use client";

import { Trash2, Download } from "lucide-react";

type BulkActionsProps = {
  selectedCount: number;
  onDelete: () => void;
  onExport: () => void;
};

export function BulkActions({
  selectedCount,
  onDelete,
  onExport,
}: BulkActionsProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {selectedCount} selected
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition hover:bg-muted"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </div>
  );
}
