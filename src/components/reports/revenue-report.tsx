"use client";

import type {
  RevenuePoint,
} from "@/types/analytics";

type Props = {
  data: RevenuePoint[];
};

export function RevenueReport({
  data,
}: Props) {
  const max = Math.max(
    ...data.map(
      (item) => item.revenue,
    ),
    1,
  );

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div>
        <h2 className="font-semibold">
          Revenue Analysis
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Daily revenue performance.
        </p>
      </div>

      <div className="mt-8 flex h-72 items-end gap-1 overflow-hidden">
        {data.map((item) => {
          const height =
            (item.revenue / max) *
            100;

          return (
            <div
              key={item.date}
              className="group relative flex h-full flex-1 items-end"
            >
              <div
                className="w-full rounded-t-md bg-foreground/80 transition-all group-hover:bg-foreground"
                style={{
                  height: `${Math.max(
                    height,
                    item.revenue > 0
                      ? 2
                      : 0,
                  )}%`,
                }}
                title={`${item.date}: $${item.revenue.toFixed(2)}`}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}