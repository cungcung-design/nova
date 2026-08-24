"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import type { SortState } from "@/types/data-table";
import type { TableColumn } from "@/types/table";
import { TableToolbar } from "./table-toolbar";
import { ColumnVisibility } from "./column-visibility";
import { TablePagination } from "./table-pagination";
import { TableSkeleton } from "./table-skeleton";
import { TableEmpty } from "./table-empty";
import { SelectCheckbox } from "./select-checkbox";
import { BulkActionToolbar } from "./bulk-action-toolbar";
import { ExportMenu } from "./export-menu";
import { downloadFile } from "@/lib/download-file";
import { tableResourceToExportResource } from "@/lib/export/validation";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import { DropdownMenu, useDropdown } from "@/components/ui/dropdown-menu";

type BulkAction = {
  label: string;
  action: string;
  variant?: "default" | "destructive";
};

type DataTableProps<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  columns: TableColumn<T>[];
  loading?: boolean;
  resource: string;
  getRowId: (row: T) => string;
  bulkActions?: BulkAction[];
  searchPlaceholder?: string;
  renderFilters?: React.ReactNode;
  filterPanel?: React.ReactNode;
  filterChips?: React.ReactNode;
};

export function DataTable<T>({
  data,
  total,
  page,
  pageSize,
  columns,
  loading = false,
  resource,
  getRowId,
  bulkActions = [],
  searchPlaceholder = "Search...",
  renderFilters,
  filterPanel,
  filterChips,
}: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const {
    selectedIds,
    selectedArray,
    selectedCount,
    toggle,
    selectMany,
    clear,
  } = useBulkSelection<string>();

  const [showFilters, setShowFilters] = useState(false);
  const columnsMenu = useDropdown();
  const [bulkLoading, setBulkLoading] = useState(false);

  const urlSearch = searchParams.get("search") || "";
  const urlSortBy = searchParams.get("sortBy") || "";
  const urlSortDirection = searchParams.get("sortDirection") === "asc" ? "asc" : "desc";
  const urlColumns = searchParams.get("columns");

  const [inputSearch, setInputSearch] = useState(urlSearch);
  const debouncedSearch = useDebounce(inputSearch, 300);

  const defaultVisible = useMemo(
    () => new Set(columns.filter((c) => c.hideable !== false).map((c) => c.id)),
    [columns]
  );

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    if (urlColumns) {
      return new Set(urlColumns.split(","));
    }
    return defaultVisible;
  });

  const [sortState, setSortState] = useState<SortState>(() => ({
    field: urlSortBy,
    direction: urlSortDirection,
  }));

  const visibleData = useMemo(
    () => data,
    [data]
  );

  const allVisibleSelected =
    visibleData.length > 0 && visibleData.every((row) => selectedIds.has(getRowId(row)));
  const someVisibleSelected = visibleData.some((row) => selectedIds.has(getRowId(row)));

  const activeFilterCount = useMemo(() => {
    let count = 0;
    searchParams.forEach((_, key) => {
      if (!["search", "page", "pageSize", "sortBy", "sortDirection", "columns"].includes(key)) {
        count++;
      }
    });
    return count;
  }, [searchParams]);

  const buildUrl = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      }
      return `${pathname}?${params.toString()}`;
    },
    [searchParams, pathname]
  );

  const updateUrl = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      router.push(buildUrl(updates));
    },
    [router, buildUrl]
  );

  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateUrl({ search: debouncedSearch || undefined, page: 1 });
    }
  }, [debouncedSearch, updateUrl, urlSearch]);

  useEffect(() => {
    if (sortState.field !== urlSortBy || sortState.direction !== urlSortDirection) {
      updateUrl({ sortBy: sortState.field || undefined, sortDirection: sortState.direction });
    }
  }, [sortState.field, sortState.direction, updateUrl, urlSortBy, urlSortDirection]);

  function handleSort(field: string) {
    setSortState((prev) => {
      const newDirection = prev.field === field && prev.direction === "asc" ? "desc" : "asc";
      return { field, direction: newDirection };
    });
  }

  function handlePageChange(newPage: number) {
    updateUrl({ page: newPage });
  }

  function handlePageSizeChange(newPageSize: number) {
    updateUrl({ pageSize: newPageSize, page: 1 });
  }

  function toggleRow(id: string) {
    toggle(id);
  }

  function toggleSelectAll() {
    if (allVisibleSelected) {
      const next = selectedArray.filter((id) => !visibleData.some((row) => getRowId(row) === id));
      selectMany(next);
    } else {
      const currentPageIds = visibleData.map((row) => getRowId(row));
      selectMany([...new Set([...selectedArray, ...currentPageIds])]);
    }
  }

  function toggleColumn(columnId: string) {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      updateUrl({ columns: Array.from(next).join(",") });
      return next;
    });
  }

  function handleClearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    const keysToRemove: string[] = [];
    params.forEach((_, key) => {
      if (!["page", "pageSize", "sortBy", "sortDirection", "columns", "search"].includes(key)) {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach((key) => params.delete(key));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleBulkAction(action: string, ids: string[]) {
    const isDestructive = bulkActions.some((a) => a.action === action && a.variant === "destructive");

    if (isDestructive && !window.confirm(`Are you sure you want to ${action} ${ids.length} item${ids.length === 1 ? "" : "s"}? This action cannot be undone.`)) {
      return;
    }

    setBulkLoading(true);
    try {
      const response = await fetch(`/api/${resource}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });

      const data = await response.json().catch(() => ({ error: "Bulk action failed." }));

      if (!response.ok) {
        throw new Error(data.error || "Bulk action failed.");
      }

      clear();
      router.refresh();
    } catch (error) {
      console.error("Bulk action error:", error);
      window.alert(error instanceof Error ? error.message : "Bulk action failed.");
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleExportSelected() {
    if (selectedArray.length === 0) {
      return;
    }

    setBulkLoading(true);
    try {
      await downloadFile(
        `/api/${resource}/export`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            format: "csv",
            scope: "selected",
            ids: selectedArray,
          }),
        },
        `${resource}.csv`
      );
    } catch (error) {
      console.error("Export error:", error);
      window.alert(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setBulkLoading(false);
    }
  }

  function handleExportFiltered() {
    const exportResource = tableResourceToExportResource(resource);

    if (!exportResource) {
      window.alert("Exports are not available for this table.");
      return;
    }

    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (!["page", "pageSize", "columns"].includes(key) && value) {
        filters[key] = value;
      }
    });

    setBulkLoading(true);

    void fetch("/api/exports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resource: exportResource,
        format: "CSV",
        filters,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? data.error ?? "Export failed.");
        }

        if (data.job?.status === "FAILED") {
          throw new Error(data.job.errorMessage ?? "Export failed.");
        }

        router.push(`/dashboard/exports?job=${data.job.id}`);
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Export failed.");
      })
      .finally(() => {
        setBulkLoading(false);
      });
  }

  const activeColumns = useMemo(
    () => columns.filter((col) => visibleColumns.has(col.id)),
    [columns, visibleColumns]
  );

  if (loading) {
    return <TableSkeleton rows={8} columns={activeColumns.length} />;
  }

  return (
    <div className="rounded-2xl border bg-card">
      {selectedCount > 0 && bulkActions.length > 0 ? (
        <BulkActionToolbar
          selectedCount={selectedCount}
          actions={bulkActions}
          onBulkAction={(action) => handleBulkAction(action, selectedArray)}
          onExport={handleExportSelected}
          onClear={clear}
          loading={bulkLoading}
        />
      ) : (
        <TableToolbar
          search={inputSearch}
          onSearchChange={setInputSearch}
          activeFilters={activeFilterCount}
          searchPlaceholder={searchPlaceholder}
          filterSlot={filterPanel}
          hideClearButton={Boolean(filterPanel)}
          exportSlot={
            <ExportMenu
              selectedCount={selectedCount}
              onExportSelected={handleExportSelected}
              onExportFiltered={handleExportFiltered}
              disabled={bulkLoading}
            />
          }
          onFilterClick={() => {
            setShowFilters(!showFilters);
            columnsMenu.close();
          }}
          onColumnsClick={columnsMenu.toggle}
          columnsButtonRef={columnsMenu.triggerRef}
          columnsOpen={columnsMenu.open}
          columnsMenu={
            <DropdownMenu
              open={columnsMenu.open}
              onClose={columnsMenu.close}
              triggerRef={columnsMenu.triggerRef}
              labelledBy={columnsMenu.triggerId}
            >
              <ColumnVisibility
                columns={columns}
                visibleColumns={visibleColumns}
                onToggle={toggleColumn}
              />
            </DropdownMenu>
          }
          onClearFilters={handleClearFilters}
        />
      )}

      {filterChips}

      {!loading && showFilters && renderFilters && !filterPanel && (
        <div className="border-b px-4 py-4">{renderFilters}</div>
      )}

      {data.length === 0 ? (
        <TableEmpty
          title="No results found"
          description="Try changing your search or filters."
        />
      ) : (
        <>
          <div className="md:hidden space-y-3 p-4">
            {data.map((row) => {
              const id = getRowId(row);
              const isSelected = selectedIds.has(id);

              return (
                <div
                  key={id}
                  className={`rounded-xl border bg-card p-4 ${isSelected ? "ring-2 ring-foreground" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 font-medium break-words">
                      {columns[0].render
                        ? columns[0].render(row)
                        : String((row as unknown as Record<string, unknown>)[String(columns[0].accessor)] ?? "")}
                    </div>
                    <SelectCheckbox
                      checked={isSelected}
                      onChange={() => toggleRow(id)}
                      label={`Select ${String(columns[0].accessor)}`}
                    />
                  </div>
                  <div className="mt-3 space-y-2">
                    {columns.slice(1).map((col) => (
                      <div key={col.id} className="flex items-start justify-between gap-3 text-sm">
                        <span className="shrink-0 text-muted-foreground">{col.header}</span>
                        <span className="min-w-0 break-words text-right">
                          {col.render ? col.render(row) : String((row as unknown as Record<string, unknown>)[String(col.accessor)] ?? "")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-6 py-4">
                    <SelectCheckbox
                      checked={allVisibleSelected}
                      indeterminate={someVisibleSelected && !allVisibleSelected}
                      onChange={toggleSelectAll}
                      label="Select all rows"
                    />
                  </th>
                  {activeColumns.map((col) => (
                    <th
                      key={col.id}
                      className={`px-6 py-4 font-medium ${col.sortable ? "cursor-pointer select-none hover:text-foreground" : ""} ${col.className ?? ""}`}
                      onClick={() => col.sortable && handleSort(col.id)}
                    >
                      <div className="flex items-center gap-1">
                        {col.header}
                        {col.sortable && sortState.field === col.id && (
                          <span className="text-[10px]">
                            {sortState.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const id = getRowId(row);
                  const isSelected = selectedIds.has(id);

                  return (
                    <tr
                      key={id}
                      className={`border-b last:border-0 hover:bg-muted/50 ${isSelected ? "bg-muted/30" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <SelectCheckbox
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          label={`Select row ${id}`}
                        />
                      </td>
                      {activeColumns.map((col) => (
                        <td key={col.id} className={`max-w-[18rem] truncate px-6 py-4 ${col.className ?? ""}`}>
                          {col.render ? col.render(row) : String((row as unknown as Record<string, unknown>)[String(col.accessor)] ?? "")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
