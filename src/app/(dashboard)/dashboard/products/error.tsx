"use client";

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h2 className="text-lg font-semibold">
        Something went wrong
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        We couldn't load your products.
      </p>

      <button
        onClick={reset}
        className="mt-5 rounded-lg bg-foreground px-4 py-2 text-sm text-background"
      >
        Try again
      </button>
    </div>
  );
}
