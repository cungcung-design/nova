import { getCurrentWorkspace } from "@/lib/current-workspace";
import { WorkspaceSettingsForm } from "@/components/settings/workspace-settings-form";

export default async function SettingsPage() {
  const workspace = await getCurrentWorkspace();
  const canEdit =
    workspace.role === "OWNER" || workspace.role === "ADMIN";

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">System</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage workspace preferences and configuration.
        </p>
      </div>

      <WorkspaceSettingsForm
        name={workspace.name}
        plan={workspace.plan}
        role={workspace.role}
        canEdit={canEdit}
      />
    </div>
  );
}
