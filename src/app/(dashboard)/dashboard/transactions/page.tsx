export default function TransactionsPage() {
  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Business
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Transactions
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Payment history and transaction records.
        </p>
      </div>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Transactions are coming soon.
        </p>
      </section>
    </div>
  );
}
