"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ExportFormat, ExportResource } from "@/types/export";

type ExportButtonProps = {
  resource: ExportResource;
  filters?: Record<string, unknown>;
};

export function ExportButton({ resource, filters }: ExportButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function exportData(format: ExportFormat) {
    try {
      setLoading(true);

      const response = await fetch("/api/exports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource,
          format,
          filters: filters ?? {},
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? data.error ?? "Export failed.");
      }

      if (data.job?.status === "FAILED") {
        throw new Error(data.job.errorMessage ?? data.message ?? "Export failed.");
      }

      router.push(`/dashboard/exports?job=${data.job.id}`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <select
        disabled={loading}
        defaultValue=""
        aria-label="Export"
        onChange={(event) => {
          const value = event.target.value;

          if (value === "") {
            return;
          }

          void exportData(value as ExportFormat);
          event.target.value = "";
        }}
        className="h-10 rounded-xl border bg-background px-3 text-sm disabled:opacity-50"
      >
        <option value="">{loading ? "Preparing..." : "Export"}</option>
        <option value="CSV">Export CSV</option>
        <option value="XLSX">Export Excel</option>
        <option value="PDF">Export PDF</option>
      </select>
    </div>
  );
}
