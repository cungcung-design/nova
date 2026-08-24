import { Activity } from "lucide-react";

type ActivityItem = {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date | string;
  user: {
    name: string | null;
    image: string | null;
  } | null;
};

type Props = {
  activities: ActivityItem[];
};

export function ActivityTimeline({ activities }: Props) {
  return (
    <section className="rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border p-2">
            <Activity className="h-4 w-4" />
          </div>

          <div>
            <h2 className="font-semibold">
              Recent Activity
            </h2>

            <p className="text-sm text-muted-foreground">
              What&apos;s happening in your workspace.
            </p>
          </div>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No activity yet.
        </div>
      ) : (
        <div className="divide-y">
          {activities.map((item) => (
            <div key={item.id} className="flex gap-4 px-6 py-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-semibold">
                {item.user?.name?.slice(0, 1).toUpperCase() ?? "S"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {item.title}
                </p>

                {item.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}

                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(item.createdAt).toISOString().replace("T", " ").split(".")[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
