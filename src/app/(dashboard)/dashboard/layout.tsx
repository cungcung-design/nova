import { AppSidebar } from "@/components/dashboard/app-sidebar";
import Topbar from "@/components/dashboard/topbar";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireUser } from "@/lib/authz";
import { getUserWorkspaces } from "@/services/workspace.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const currentWorkspace =
    await getCurrentWorkspace();

  const workspaces =
    await getUserWorkspaces(user.id);

  const workspaceData = workspaces.map(
    (workspace) => ({
      id: workspace.id,
      name: workspace.name,
      plan: workspace.plan,
      role: currentWorkspace.role,
    }),
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AppSidebar
          currentWorkspace={{
            id: currentWorkspace.id,
            name: currentWorkspace.name,
            plan: currentWorkspace.plan,
            role: currentWorkspace.role,
          }}
          workspaces={workspaceData}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}