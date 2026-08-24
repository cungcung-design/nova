export default function Loading() {
  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />

        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />

        <div className="h-4 w-80 animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>

      <div className="h-[420px] animate-pulse rounded-2xl bg-muted" />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />

        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}