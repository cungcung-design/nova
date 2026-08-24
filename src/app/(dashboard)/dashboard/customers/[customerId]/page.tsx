import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { getCustomerById } from "@/services/customer.service";

type Props = {
  params: Promise<{
    customerId: string;
  }>;
};

export default async function CustomerPage({
  params,
}: Props) {
  const { customerId } = await params;

  const workspace =
    await getCurrentWorkspace();

  const customer =
    await getCustomerById(
      workspace.id,
      customerId,
    );

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <Link
          href="/dashboard/customers"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Customers
        </Link>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {customer.name}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {customer.email ?? "No email"}
            </p>
          </div>

          <Link
            href={`/dashboard/customers/${customer.id}/edit`}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium"
          >
            Edit customer
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">
            Customer information
          </h2>

          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">
                Company
              </p>
              <p className="mt-1">
                {customer.company ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Phone
              </p>
              <p className="mt-1">
                {customer.phone ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">
                Status
              </p>
              <p className="mt-1">
                {customer.status}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">
            Recent orders
          </h2>

          {customer.orders.length === 0 ? (
            <p className="mt-5 text-sm text-muted-foreground">
              No orders yet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {customer.orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {order.orderNumber}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {order.status}
                    </p>
                  </div>

                  <p className="text-sm font-medium">
                    ${Number(order.total).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
