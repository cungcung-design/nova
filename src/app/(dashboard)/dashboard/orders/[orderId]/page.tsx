import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { getOrderById } from "@/services/order.service";
import { OrderStatusSelect } from "@/components/orders/order-status-select";
import { hasPermission, permissions } from "@/lib/permissions";

type Props = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderPage({
  params,
}: Props) {
  const { orderId } = await params;

  const workspace =
    await getCurrentWorkspace();

  const order =
    await getOrderById(
      workspace.id,
      orderId,
    );

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <Link
          href="/dashboard/orders"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Orders
        </Link>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {order.orderNumber}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(order.createdAt).toISOString().split("T")[0]}
            </p>
          </div>

          <OrderStatusSelect
            orderId={order.id}
            status={order.status}
            canUpdate={hasPermission(workspace.role, permissions.orders.update)}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">
            Customer
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">
                Name
              </p>
              <p className="mt-1">
                {order.customer.name}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Email
              </p>
              <p className="mt-1">
                {order.customer.email ?? "—"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">
            Order Summary
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Subtotal
              </span>
              <span>
                $
                {Number(
                  order.subtotal,
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Tax
              </span>
              <span>
                $
                {Number(
                  order.tax,
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Discount
              </span>
              <span>
                -
                $
                {Number(
                  order.discount,
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>Total</span>
              <span>
                $
                {Number(
                  order.total,
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">
          Items
        </h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-3 font-medium">
                  Product
                </th>

                <th className="pb-3 font-medium">
                  Qty
                </th>

                <th className="pb-3 font-medium">
                  Price
                </th>

                <th className="pb-3 font-medium text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {order.items.map(
                (item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-0"
                  >
                    <td className="py-4 text-sm font-medium">
                      {
                        item.product
                          .name
                      }
                    </td>

                    <td className="py-4 text-sm">
                      {item.quantity}
                    </td>

                    <td className="py-4 text-sm">
                      $
                      {Number(
                        item.price,
                      ).toFixed(2)}
                    </td>

                    <td className="py-4 text-sm text-right">
                      $
                      {Number(
                        item.total,
                      ).toFixed(2)}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
