import { getCurrentWorkspace } from "@/lib/current-workspace";

import { getActivities } from "@/services/activity.service";

import { ActivityTimeline } from "@/components/activity/activity-timeline";

export default async function ActivityPage() {
  const workspace = await getCurrentWorkspace();

  const activities = await getActivities(workspace.id);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Workspace
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Activity
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Recent actions across your workspace.
        </p>
      </div>

      <ActivityTimeline activities={activities} />
    </div>
  );
}
