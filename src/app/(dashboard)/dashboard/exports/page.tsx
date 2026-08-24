import { Suspense } from "react";

import { ExportCenter } from "@/components/export/export-center";

export default function ExportsPage() {
  return (
    <div className="p-6 lg:p-8">
      <Suspense
        fallback={
          <div className="space-y-3">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          </div>
        }
      >
        <ExportCenter />
      </Suspense>
    </div>
  );
}
