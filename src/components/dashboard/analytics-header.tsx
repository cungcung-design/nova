"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type Props = {
  range: 7 | 30 | 90;
};

export function AnalyticsHeader({
  range,
}: Props) {
  const router = useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  function changeRange(
    value: string,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    params.set("range", value);

    router.push(
      `${pathname}?${params.toString()}`,
    );
  }

  return (
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Overview
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Monitor your business performance and growth.
        </p>
      </div>

      <div className="flex rounded-xl border bg-card p-1">
        {[
          {
            value: "7",
            label: "7 Days",
          },
          {
            value: "30",
            label: "30 Days",
          },
          {
            value: "90",
            label: "90 Days",
          },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() =>
              changeRange(
                item.value,
              )
            }
            className={`rounded-lg px-3 py-2 text-sm transition ${
              range.toString() ===
              item.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}