"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  status: string;
  createdAt: Date;
};

type CustomerTableProps = {
  customers: Customer[];
  total: number;
  page: number;
  totalPages: number;
};

export function CustomerTable({
  customers,
  total,
  page,
  totalPages,
}: CustomerTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function changePage(newPage: number) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set("page", String(newPage));

    router.push(
      `/dashboard/customers?${params.toString()}`,
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="border-b px-6 py-4">
        <p className="text-sm text-muted-foreground">
          {total} customers
        </p>
      </div>

      <div className="overflow-x-auto">
        {customers.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <h3 className="font-semibold">
              No customers yet
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Add your first customer to get started.
            </p>

            <Link
              href="/dashboard/customers/new"
              className="mt-4 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Add Customer
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-6 py-4 font-medium">
                  Customer
                </th>

                <th className="px-6 py-4 font-medium">
                  Company
                </th>

                <th className="px-6 py-4 font-medium">
                  Status
                </th>

                <th className="px-6 py-4 font-medium">
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b last:border-0 hover:bg-muted/50"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/customers/${customer.id}`}
                      className="font-medium hover:underline"
                    >
                      {customer.name}
                    </Link>

                    <p className="text-xs text-muted-foreground">
                      {customer.email}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {customer.company || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full border px-2.5 py-1 text-xs">
                      {customer.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(customer.createdAt).toISOString().split("T")[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => changePage(page - 1)}
            className="rounded-lg border p-2 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            disabled={page >= totalPages}
            onClick={() => changePage(page + 1)}
            className="rounded-lg border p-2 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
