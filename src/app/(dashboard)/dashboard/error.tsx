"use client";

export default function DashboardError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h2 className="text-xl font-semibold">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong while loading your analytics. Please try again.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background"
        >
          Try again
        </button>
      </div>
    </div>
  );
}