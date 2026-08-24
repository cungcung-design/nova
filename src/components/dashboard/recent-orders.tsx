import Link from "next/link";

type Props = {
  orders: Array<{
    id: string;
    orderNumber: string;
    total: unknown;
    status: string;
    createdAt: Date;

    customer: {
      id: string;
      name: string;
      email: string | null;
    };
  }>;
};

function formatCurrency(
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

export function RecentOrders({
  orders,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-6 py-5">
        <div>
          <h2 className="font-semibold">
            Recent Orders
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Latest activity from your customers.
          </p>
        </div>

        <Link
          href="/dashboard/orders"
          className="text-sm font-medium hover:underline"
        >
          View all
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center p-6 text-sm text-muted-foreground">
          No orders yet.
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="flex items-center justify-between gap-4 border-b px-6 py-4 last:border-0 hover:bg-muted/40"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {order.orderNumber}
                </p>

                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {order.customer.name}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatCurrency(
                    Number(
                      order.total,
                    ),
                  )}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {order.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}