export default function SettingsPage() {
  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          System
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage workspace preferences and configuration.
        </p>
      </div>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Settings are coming soon. For now, use the Team page under Settings.
        </p>
      </section>
    </div>
  );
}
