import { AppSidebar } from "@/components/dashboard/app-sidebar";
import Topbar from "@/components/dashboard/topbar";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireUser } from "@/lib/authz";
import { getUserWorkspaces } from "@/services/workspace.service";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser().catch(() => null);

  if (!user) {
    redirect("/login");
  }

  const currentWorkspace = await getCurrentWorkspace();
  const workspaces = await getUserWorkspaces(user.id);

  const workspaceData = workspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    plan: workspace.plan,
    role: workspace.memberships[0]?.role ?? currentWorkspace.role,
  }));

  const isAdmin =
    currentWorkspace.role === "OWNER" || currentWorkspace.role === "ADMIN";

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
          <Topbar
            isAdmin={isAdmin}
            role={currentWorkspace.role}
            currentWorkspace={{
              id: currentWorkspace.id,
              name: currentWorkspace.name,
              plan: currentWorkspace.plan,
              role: currentWorkspace.role,
            }}
            workspaces={workspaceData}
          />

          <main className="mx-auto w-full min-w-0 max-w-[1600px] flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}