import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import type {
  AnalyticsSummary,
} from "@/types/analytics";

type Props = {
  summary: AnalyticsSummary;
};

function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
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
      className={`inline-flex items-center gap-1 text-xs font-medium ${
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

export function StatCards({
  summary,
}: Props) {
  const cards = [
    {
      title: "Revenue",
      value: formatCurrency(
        summary.revenue,
      ),
      growth:
        summary.revenueGrowth,
      icon: TrendingUp,
    },

    {
      title: "Orders",
      value:
        summary.orders.toLocaleString(),
      growth:
        summary.orderGrowth,
      icon: ShoppingBag,
    },

    {
      title: "Customers",
      value:
        summary.customers.toLocaleString(),
      growth:
        summary.customerGrowth,
      icon: Users,
    },

    {
      title: "Avg. Order Value",
      value: formatCurrency(
        summary.averageOrderValue,
      ),
      growth: 0,
      icon: CreditCard,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="group rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {card.title}
                </p>

                <p className="mt-3 break-all text-2xl font-semibold tracking-tight">
                  {card.value}
                </p>
              </div>

              <div className="rounded-xl border p-2.5">
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Growth
                value={
                  card.growth
                }
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