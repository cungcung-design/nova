import { getCurrentWorkspace } from "@/lib/current-workspace";

import { getReport } from "@/services/report.service";

import { ReportHeader } from "@/components/reports/report-header";

import { ReportStats } from "@/components/reports/report-stats";

import { RevenueReport } from "@/components/reports/revenue-report";

import { OrderStatus } from "@/components/reports/order-status";

import { CustomerReport } from "@/components/reports/customer-report";

import { ProductReport } from "@/components/reports/product-report";

type Props = {
  searchParams: Promise<{
    range?: string;
  }>;
};

export default async function ReportsPage({
  searchParams,
}: Props) {
  const params =
    await searchParams;

  const range =
    params.range === "7"
      ? 7
      : params.range === "90"
        ? 90
        : 30;

  const workspace =
    await getCurrentWorkspace();

  const report =
    await getReport(
      workspace.id,
      range,
    );

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <ReportHeader range={range} />

      <ReportStats
        summary={report.summary}
      />

      <RevenueReport
        data={report.revenueByDay}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <OrderStatus
          data={report.orderStatus}
        />

        <CustomerReport
          data={report.customers}
        />
      </div>

      <ProductReport
        products={report.products}
      />
    </div>
  );
}