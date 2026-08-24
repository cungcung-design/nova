"use client";

import Link from "next/link";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

type Order = {
  id: string;
  orderNumber: string;
  total: unknown;
  status: string;
  createdAt: string | Date;
  customer: {
    name: string;
    email: string | null;
  };
};

type Props = {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
};

export function OrderTable({
  orders,
  total,
  page,
  totalPages,
}: Props) {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  function changePage(
    nextPage: number,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    params.set(
      "page",
      String(nextPage),
    );

    router.push(
      `/dashboard/orders?${params.toString()}`,
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="border-b px-6 py-4">
        <p className="text-sm text-muted-foreground">
          {total} orders
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center text-center">
          <h3 className="font-semibold">
            No orders found
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Create your first order to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-6 py-4">
                    Order
                  </th>

                  <th className="px-6 py-4">
                    Customer
                  </th>

                  <th className="px-6 py-4">
                    Amount
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map(
                  (order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="font-medium hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium">
                            {
                              order
                                .customer
                                .name
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {
                              order
                                .customer
                                .email
                            }
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium">
                        $
                        {Number(
                          order.total,
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full border px-2.5 py-1 text-xs">
                          {order.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toISOString().split("T")[0]}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of{" "}
              {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() =>
                  changePage(
                    page - 1,
                  )
                }
                className="rounded-lg border p-2 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  changePage(
                    page + 1,
                  )
                }
                className="rounded-lg border p-2 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
