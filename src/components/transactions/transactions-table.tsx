"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TransactionRow = {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  provider: string;
  createdAt: string;
  order: { id: string; orderNumber: string };
  customer: { id: string; name: string; email: string | null };
};

type TransactionsTableProps = {
  transactions: TransactionRow[];
  total: number;
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
};

export function TransactionsTable({
  transactions,
  total,
  page,
  pageSize,
  search = "",
  status = "",
}: TransactionsTableProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pushFilters(next: {
    search?: string;
    status?: string;
    page?: number;
  }) {
    const params = new URLSearchParams();
    const nextSearch = next.search ?? search;
    const nextStatus = next.status ?? status;
    const nextPage = next.page ?? 1;

    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    if (nextStatus) params.set("status", nextStatus);
    if (nextPage > 1) params.set("page", String(nextPage));

    setPending(true);
    router.push(`/dashboard/transactions?${params.toString()}`);
    router.refresh();
    setPending(false);
  }

  async function onSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    pushFilters({
      search: String(form.get("search") ?? ""),
      status: String(form.get("status") ?? ""),
      page: 1,
    });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={onSearch}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          name="search"
          type="search"
          defaultValue={search}
          placeholder="Search order, customer, or reference"
          className="h-11 min-w-0 flex-1 rounded-xl border bg-background px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-11 rounded-xl border bg-background px-3 text-sm"
          aria-label="Transaction status"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-xl border px-4 text-sm font-medium"
        >
          Filter
        </button>
      </form>

      <div className="rounded-2xl border bg-card">
        {transactions.length === 0 ? (
          <div className="p-16 text-center text-sm text-muted-foreground">
            No transactions found.
          </div>
        ) : (
          <>
            <div className="space-y-3 p-4 md:hidden">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/dashboard/orders/${transaction.order.id}`}
                      className="font-medium hover:underline"
                    >
                      {transaction.order.orderNumber}
                    </Link>
                    <span className="text-sm font-medium">
                      {transaction.currency} {transaction.amount.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{transaction.customer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.status} · {transaction.type}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left">
                  <tr>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-muted/30">
                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/dashboard/orders/${transaction.order.id}`}
                          className="font-medium hover:underline"
                        >
                          {transaction.order.orderNumber}
                        </Link>
                      </td>
                      <td className="max-w-[14rem] truncate px-5 py-4">
                        <p>{transaction.customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.customer.email ?? "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4">{transaction.type}</td>
                      <td className="px-5 py-4">{transaction.status}</td>
                      <td className="px-5 py-4 text-right font-medium">
                        {transaction.currency} {transaction.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 border-t px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">{total} transactions</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => pushFilters({ page: page - 1 })}
              className="h-11 rounded-lg border px-3 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => pushFilters({ page: page + 1 })}
              className="h-11 rounded-lg border px-3 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
