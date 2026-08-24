"use client";

import { Calendar, Filter, RotateCcw, X } from "lucide-react";
import { useState } from "react";

import { statusParamToValues } from "@/lib/filters";

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Lead", value: "LEAD" },
] as const;

type FilterPanelProps = {
  status?: string;
  minRevenue?: string;
  maxRevenue?: string;
  createdFrom?: string;
  createdTo?: string;
  onApply: (filters: {
    status?: string;
    minRevenue?: string;
    maxRevenue?: string;
    createdFrom?: string;
    createdTo?: string;
  }) => void;
  onClear: () => void;
};

export function FilterPanel({
  status,
  minRevenue,
  maxRevenue,
  createdFrom,
  createdTo,
  onApply,
  onClear,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [draftStatuses, setDraftStatuses] = useState<string[]>(
    statusParamToValues(status),
  );
  const [draftMinRevenue, setDraftMinRevenue] = useState(minRevenue ?? "");
  const [draftMaxRevenue, setDraftMaxRevenue] = useState(maxRevenue ?? "");
  const [draftCreatedFrom, setDraftCreatedFrom] = useState(createdFrom ?? "");
  const [draftCreatedTo, setDraftCreatedTo] = useState(createdTo ?? "");

  const appliedCount = [
    statusParamToValues(status).length > 0,
    Boolean(minRevenue),
    Boolean(maxRevenue),
    Boolean(createdFrom),
    Boolean(createdTo),
  ].filter(Boolean).length;

  function toggleOpen() {
    if (!open) {
      setDraftStatuses(statusParamToValues(status));
      setDraftMinRevenue(minRevenue ?? "");
      setDraftMaxRevenue(maxRevenue ?? "");
      setDraftCreatedFrom(createdFrom ?? "");
      setDraftCreatedTo(createdTo ?? "");
    }

    setOpen((current) => !current);
  }

  function toggleStatus(value: string) {
    setDraftStatuses((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function apply() {
    onApply({
      status: draftStatuses.length > 0 ? draftStatuses.join(",") : "all",
      minRevenue: draftMinRevenue,
      maxRevenue: draftMaxRevenue,
      createdFrom: draftCreatedFrom,
      createdTo: draftCreatedTo,
    });

    setOpen(false);
  }

  function clear() {
    setDraftStatuses([]);
    setDraftMinRevenue("");
    setDraftMaxRevenue("");
    setDraftCreatedFrom("");
    setDraftCreatedTo("");

    onClear();
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggleOpen}
        className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition hover:bg-muted"
      >
        <Filter className="h-4 w-4" />
        Filters
        {appliedCount > 0 && (
          <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] text-background">
            {appliedCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close filters"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-label="Filters"
            className="fixed inset-x-4 top-24 z-30 max-h-[80vh] overflow-y-auto rounded-2xl border bg-background p-4 shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[320px] sm:max-h-none"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Filters</h3>
                <p className="text-xs text-muted-foreground">
                  Refine your results
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-1.5 block text-sm font-medium">Status</p>
                <div className="space-y-2 rounded-lg border p-3">
                  {STATUS_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={draftStatuses.includes(option.value)}
                        onChange={() => toggleStatus(option.value)}
                        className="h-4 w-4 rounded border"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Revenue range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Minimum"
                    value={draftMinRevenue}
                    onChange={(event) => setDraftMinRevenue(event.target.value)}
                    className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Maximum"
                    value={draftMaxRevenue}
                    onChange={(event) => setDraftMaxRevenue(event.target.value)}
                    className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Created date
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="date"
                      value={draftCreatedFrom}
                      onChange={(event) =>
                        setDraftCreatedFrom(event.target.value)
                      }
                      className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="date"
                      value={draftCreatedTo}
                      onChange={(event) => setDraftCreatedTo(event.target.value)}
                      className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2 border-t pt-4">
              <button
                type="button"
                onClick={clear}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-medium hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                type="button"
                onClick={apply}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-foreground text-sm font-medium text-background hover:opacity-90"
              >
                Apply filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
