"use client";

import { ChevronDown, Download } from "lucide-react";

import { DropdownMenu, useDropdown } from "@/components/ui/dropdown-menu";

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
  const menu = useDropdown();

  return (
    <div className="relative">
      <button
        {...menu.triggerProps}
        disabled={disabled}
        className="inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      <DropdownMenu
        open={menu.open}
        onClose={menu.close}
        triggerRef={menu.triggerRef}
        labelledBy={menu.triggerId}
        className="w-56 p-1.5"
      >
        <button
          type="button"
          role="menuitem"
          disabled={selectedCount === 0}
          onClick={() => {
            menu.close();
            onExportSelected();
          }}
          className="flex min-h-11 w-full flex-col justify-center rounded-lg px-3 py-2 text-left transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          <span className="text-sm font-medium">Export selected</span>
          <span className="text-xs text-muted-foreground">
            {selectedCount} selected
          </span>
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() => {
            menu.close();
            onExportFiltered();
          }}
          className="flex min-h-11 w-full flex-col justify-center rounded-lg px-3 py-2 text-left transition hover:bg-muted"
        >
          <span className="text-sm font-medium">Export filtered</span>
          <span className="text-xs text-muted-foreground">
            Export current search
          </span>
        </button>
      </DropdownMenu>
    </div>
  );
}
