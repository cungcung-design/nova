type Props = {
  data: {
    newCustomers: number;
    returningCustomers: number;
  };
};

export function CustomerReport({
  data,
}: Props) {
  const total =
    data.newCustomers +
    data.returningCustomers;

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="font-semibold">
        Customer Analytics
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Customer acquisition and retention.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">
            New Customers
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {data.newCustomers}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">
            Returning
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {data.returningCustomers}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>
            Returning customer rate
          </span>

          <span className="font-medium">
            {total === 0
              ? "0"
              : (
                  (data.returningCustomers /
                    total) *
                  100
                ).toFixed(1)}
            %
          </span>
        </div>

        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground"
            style={{
              width:
                total === 0
                  ? "0%"
                  : `${
                      (data.returningCustomers /
                        total) *
                      100
                    }%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}