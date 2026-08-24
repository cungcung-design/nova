import { getCurrentWorkspace } from "@/lib/current-workspace";
import { getNotifications } from "@/services/notification.service";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default async function NotificationsPage() {
  const workspace = await getCurrentWorkspace();
  const notifications = await getNotifications(workspace.userId, workspace.id);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Notifications
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Alerts and updates tied to your account.
        </p>
      </div>

      <NotificationsList notifications={notifications} />
    </div>
  );
}
