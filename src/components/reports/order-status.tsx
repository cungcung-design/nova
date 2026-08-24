type Props = {
  data: {
    status: string;
    count: number;
  }[];
};

export function OrderStatus({
  data,
}: Props) {
  const total = data.reduce(
    (sum, item) =>
      sum + item.count,
    0,
  );

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="font-semibold">
        Order Status
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Distribution of orders by status.
      </p>

      <div className="mt-6 space-y-5">
        {data.map((item) => {
          const percentage =
            total === 0
              ? 0
              : (item.count /
                  total) *
                100;

          return (
            <div
              key={item.status}
            >
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium">
                  {item.status}
                </span>

                <span className="text-muted-foreground">
                  {item.count} (
                  {percentage.toFixed(
                    1,
                  )}
                  %)
                </span>
              </div>

              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}