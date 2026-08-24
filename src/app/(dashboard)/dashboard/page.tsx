import { getCurrentWorkspace } from "@/lib/current-workspace";

import {
  getAnalytics,
} from "@/services/analytics.service";

import {
  getActivities,
} from "@/services/activity.service";

import { AnalyticsHeader } from "@/components/dashboard/analytics-header";

import { StatCards } from "@/components/dashboard/stat-cards";

import { RevenueChart } from "@/components/dashboard/revenue-chart";

import { RecentOrders } from "@/components/dashboard/recent-orders";

import { TopProducts } from "@/components/dashboard/top-products";

import { ActivityTimeline } from "@/components/activity/activity-timeline";

type Props = {
  searchParams: Promise<{
    range?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const workspace = await getCurrentWorkspace();

  const range =
    params.range === "7"
      ? 7
      : params.range === "90"
        ? 90
        : 30;

  const [analytics, activities] = await Promise.all([
    getAnalytics(workspace.id, range),
    getActivities(workspace.id),
  ]);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <AnalyticsHeader range={range} />

      <StatCards summary={analytics.summary} />

      <RevenueChart data={analytics.revenueChart} />

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentOrders orders={analytics.recentOrders} />

        <TopProducts products={analytics.topProducts} />
      </div>

      <ActivityTimeline activities={activities} />
    </div>
  );
}
