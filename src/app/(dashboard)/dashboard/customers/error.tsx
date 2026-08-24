"use client";

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="text-lg font-semibold">
        Something went wrong
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        We could not load your customers.
      </p>

      <button
        onClick={reset}
        className="mt-5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
      >
        Try again
      </button>
    </div>
  );
}
