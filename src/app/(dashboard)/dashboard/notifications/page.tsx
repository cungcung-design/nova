import { getCurrentWorkspace } from "@/lib/current-workspace";

import { getNotifications } from "@/services/notification.service";

export default async function NotificationsPage() {
  const workspace = await getCurrentWorkspace();

  const notifications = await getNotifications(workspace.userId, workspace.id);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Workspace
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Notifications
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Alerts and updates tied to your account.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold">
            All Notifications
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Full notification history for this workspace.
          </p>
        </div>

        {notifications.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex flex-col gap-2 px-6 py-5"
              >
                <p className="text-sm font-medium">
                  {notification.title}
                </p>

                <p className="text-xs text-muted-foreground">
                  {notification.message}
                </p>

                <p className="text-[11px] text-muted-foreground">
                  {new Date(notification.createdAt).toISOString().replace("T", " ").split(".")[0]}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
