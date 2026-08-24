import { ExportButton } from "@/components/export/export-button";

export default function TransactionsPage() {
  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Business</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Transactions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Payment history and transaction records.
          </p>
        </div>

        <ExportButton resource="TRANSACTIONS" />
      </div>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Transactions are coming soon. You can still export the current
          workspace payment history from here.
        </p>
      </section>
    </div>
  );
}
