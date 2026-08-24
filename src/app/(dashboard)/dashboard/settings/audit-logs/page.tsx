import { getCurrentWorkspace } from "@/lib/current-workspace";

import { requireWorkspaceRole } from "@/lib/workspace-permissions";

import { getAuditLogs } from "@/services/audit.service";

export default async function AuditLogsPage() {
  const workspace =
    await getCurrentWorkspace();

  await requireWorkspaceRole(
    workspace.id,
    workspace.userId,
    "ADMIN",
  );

  const result = await getAuditLogs(
    workspace.id,
    {
      page: 1,
      limit: 25,
    },
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Audit Logs
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Track important activity across your workspace.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-6 py-4 text-left font-medium">
                  User
                </th>

                <th className="px-6 py-4 text-left font-medium">
                  Action
                </th>

                <th className="px-6 py-4 text-left font-medium">
                  Description
                </th>

                <th className="px-6 py-4 text-left font-medium">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {result.logs.map((log) => (
                <tr
                  key={log.id}
                  className="transition hover:bg-muted/30"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">
                        {log.user?.name ??
                          "System"}
                      </p>

                      {log.user?.email && (
                        <p className="text-xs text-muted-foreground">
                          {log.user.email}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                      {log.action}
                    </span>
                  </td>

                  <td className="max-w-md px-6 py-4 text-muted-foreground">
                    {log.description ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {log.createdAt.toISOString().replace("T", " ").split(".")[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}