"use client";

import { useEffect, useState } from "react";

type AuditLog = {
  id: string;
  action: string;
  entity: string | null;
  entityType?: string | null;
  entityId: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/audit-logs?page=1&pageSize=50");

        if (response.status === 401) {
          throw new Error("You need to sign in to view audit logs.");
        }

        if (response.status === 403) {
          throw new Error("You do not have permission to view audit logs.");
        }

        if (!response.ok) {
          throw new Error("Failed to load audit logs.");
        }

        const result = await response.json();
        setLogs(result.data ?? result.logs ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load audit logs.",
        );
        console.error(loadError);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Security
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Audit Logs
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track important actions across your workspace.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-16 text-center text-sm text-muted-foreground">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-sm text-muted-foreground">
            No audit activity yet.
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">
                    {formatAction(log.action)}
                    {log.entity || log.entityType
                      ? ` · ${log.entity ?? log.entityType}`
                      : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {log.user
                      ? `${log.user.name ?? "User"} · ${log.user.email}`
                      : "System"}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatAction(action: string) {
  return action
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
