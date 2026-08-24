"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type TablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

type PaginationNavProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getPageItems(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) {
    items.push("ellipsis");
  }

  for (let current = start; current <= end; current += 1) {
    items.push(current);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);
  return items;
}

const segmentClassName =
  "relative inline-flex h-8 min-w-8 items-center justify-center border-y border-r border-border bg-background px-2 text-sm tabular-nums text-muted-foreground transition-colors first:rounded-l-md first:border-l last:rounded-r-md hover:bg-muted hover:text-foreground focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40";

export function PaginationNav({
  page,
  totalPages,
  onPageChange,
}: PaginationNavProps) {
  const pages = getPageItems(page, totalPages);

  return (
    <nav className="inline-flex isolate" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={segmentClassName}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="relative inline-flex h-8 min-w-14 items-center justify-center border-y border-r border-border bg-background px-2.5 text-sm tabular-nums text-muted-foreground sm:hidden">
        {page} / {totalPages}
      </span>

      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="relative hidden h-8 min-w-8 items-center justify-center border-y border-r border-border bg-background text-sm text-muted-foreground sm:inline-flex"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              segmentClassName,
              "hidden sm:inline-flex",
              item === page && "z-10 bg-muted font-medium text-foreground",
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={segmentClassName}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-sm tabular-nums text-muted-foreground">
        {total === 0 ? "No results" : `${start}–${end} of ${total}`}
      </p>

      <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          aria-label="Rows per page"
          className="h-8 rounded-md border bg-background px-2 text-sm text-foreground outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>

        <PaginationNav
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
