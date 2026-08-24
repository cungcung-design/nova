import { getFilterNumber } from "@/lib/export/filters";
import { getReport } from "@/services/report.service";

export async function getAnalyticsForExport(
  workspaceId: string,
  filters: Record<string, unknown> = {},
) {
  const rangeValue = getFilterNumber(filters, "range") ?? 30;
  const range = rangeValue === 7 || rangeValue === 90 ? rangeValue : 30;

  const report = await getReport(workspaceId, range);

  const rows: Record<string, unknown>[] = [
    {
      Section: "Summary",
      Metric: "Revenue",
      Value: report.summary.revenue,
    },
    {
      Section: "Summary",
      Metric: "Orders",
      Value: report.summary.orders,
    },
    {
      Section: "Summary",
      Metric: "Customers",
      Value: report.summary.customers,
    },
    {
      Section: "Summary",
      Metric: "Average order value",
      Value: report.summary.averageOrderValue,
    },
    ...report.revenueByDay.map((item) => ({
      Section: "Revenue by day",
      Metric: item.date,
      Value: item.revenue,
    })),
    ...report.orderStatus.map((item) => ({
      Section: "Orders by status",
      Metric: item.status,
      Value: item.count,
    })),
    ...report.products.map((item) => ({
      Section: "Top products",
      Metric: item.name,
      Value: item.revenue,
    })),
  ];

  return rows;
}
