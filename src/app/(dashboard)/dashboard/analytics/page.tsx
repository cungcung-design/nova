import { Suspense } from "react";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { getAnalytics } from "@/services/analytics.service";
import { AnalyticsHeader } from "@/components/dashboard/analytics-header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

type Props = {
  searchParams: Promise<{
    range?: string;
  }>;
};

export default async function AnalyticsPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const workspace = await getCurrentWorkspace();
  await requireRole(workspace.id, [...permissions.reports.view]);

  const range =
    params.range === "7"
      ? 7
      : params.range === "90"
        ? 90
        : 30;

  const analytics = await getAnalytics(workspace.id, range);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-muted" />}>
        <AnalyticsHeader
          range={range}
          title="Analytics"
          description="Track revenue, customers, and order performance."
        />
      </Suspense>

      <StatCards summary={analytics.summary} />

      <RevenueChart data={analytics.revenueChart} />
    </div>
  );
}
