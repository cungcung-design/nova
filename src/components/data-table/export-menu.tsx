"use client";

import {
  ChevronDown,
  Download,
} from "lucide-react";

import {
  useState,
} from "react";

type ExportMenuProps = {
  selectedCount: number;
  onExportSelected: () => void;
  onExportFiltered: () => void;
  disabled?: boolean;
};

export function ExportMenu({
  selectedCount,
  onExportSelected,
  onExportFiltered,
  disabled = false,
}: ExportMenuProps) {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
        className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        <Download className="h-4 w-4" />

        Export

        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() =>
              setOpen(false)
            }
            aria-label="Close export menu"
          />

          <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border bg-background p-1.5 shadow-xl">
            <button
              type="button"
              disabled={
                selectedCount ===
                0
              }
              onClick={() => {
                setOpen(false);
                onExportSelected();
              }}
              className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <span className="text-sm font-medium">
                Export selected
              </span>

              <span className="text-xs text-muted-foreground">
                {selectedCount} selected
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onExportFiltered();
              }}
              className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition hover:bg-muted"
            >
              <span className="text-sm font-medium">
                Export filtered
              </span>

              <span className="text-xs text-muted-foreground">
                Export current search
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
