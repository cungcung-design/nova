"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { ExportButton } from "@/components/export/export-button";

type Props = {
  range: 7 | 30 | 90;
};

export function ReportHeader({
  range,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeRange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Business intelligence
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Analyze your business performance in detail.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex rounded-xl border bg-card p-1">
          {["7", "30", "90"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => changeRange(value)}
              className={`rounded-lg px-3 py-2 text-sm ${
                range.toString() === value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground"
              }`}
            >
              {value} days
            </button>
          ))}
        </div>

        <ExportButton resource="ANALYTICS" filters={{ range }} />
      </div>
    </div>
  );
}
