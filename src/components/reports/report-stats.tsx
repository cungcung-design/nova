import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";

import type {
  ReportSummary,
} from "@/types/reports";

type Props = {
  summary: ReportSummary;
};

function currency(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  ).format(value);
}

function Growth({
  value,
}: {
  value: number;
}) {
  const positive = value >= 0;

  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium ${
        positive
          ? "text-emerald-600"
          : "text-red-600"
      }`}
    >
      {positive ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" />
      )}

      {Math.abs(value).toFixed(
        1,
      )}
      %
    </span>
  );
}

export function ReportStats({
  summary,
}: Props) {
  const cards = [
    {
      title: "Total Revenue",
      value: currency(
        summary.revenue,
      ),
      growth:
        summary.revenueGrowth,
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value:
        summary.orders.toLocaleString(),
      growth:
        summary.ordersGrowth,
      icon: ShoppingCart,
    },
    {
      title: "New Customers",
      value:
        summary.customers.toLocaleString(),
      growth:
        summary.customersGrowth,
      icon: Users,
    },
    {
      title: "Average Order",
      value: currency(
        summary.averageOrderValue,
      ),
      growth: 0,
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {card.title}
                </p>

                <p className="mt-3 text-2xl font-semibold">
                  {card.value}
                </p>
              </div>

              <div className="rounded-xl border p-2.5">
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Growth
                value={card.growth}
              />

              <span className="text-xs text-muted-foreground">
                vs. previous period
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}