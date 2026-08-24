"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { ExportRecord } from "@/types/export";

export function ExportCenter() {
  const searchParams = useSearchParams();
  const highlightedJobId = searchParams.get("job");

  const [jobs, setJobs] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/exports");
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load exports.");
        }

        setJobs(data.jobs ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load exports.",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Reports</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Export Center
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generate and download workspace reports.
        </p>
      </header>

      <div className="rounded-2xl border bg-card">
        <div className="border-b p-6">
          <h2 className="font-semibold">Export history</h2>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-sm text-destructive">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="font-semibold">No exports yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your generated reports will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between ${
                  highlightedJobId === job.id ? "bg-muted/40" : ""
                }`}
              >
                <div>
                  <p className="font-medium">{job.resource}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.format} · {new Date(job.createdAt).toLocaleString()}
                    {job.fileName ? ` · ${job.fileName}` : ""}
                  </p>
                  {job.status === "FAILED" && job.errorMessage ? (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{job.errorMessage}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-4">
                  <StatusBadge status={job.status} />

                  {job.status === "COMPLETED" && job.fileUrl ? (
                    <a
                      href={job.fileUrl}
                      className="text-sm font-medium underline"
                    >
                      Download
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ExportRecord["status"];
}) {
  const styles: Record<ExportRecord["status"], string> = {
    PENDING: "border-muted-foreground/30 text-muted-foreground",
    PROCESSING: "border-amber-500 text-amber-700 dark:text-amber-400",
    COMPLETED: "border-emerald-500 text-emerald-700 dark:text-emerald-400",
    FAILED: "border-red-500 text-red-700 dark:text-red-400",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
