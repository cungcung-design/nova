type Props = {
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
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

export function TopProducts({
  products,
}: Props) {
  const maxRevenue = Math.max(
    ...products.map(
      (product) =>
        product.revenue,
    ),
    1,
  );

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div>
        <h2 className="font-semibold">
          Top Products
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Best performing products in this period.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
          No product sales yet.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {products.map(
            (product, index) => {
              const percentage =
                (product.revenue /
                  maxRevenue) *
                100;

              return (
                <div
                  key={product.id}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {product.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {product.quantity}{" "}
                          units sold
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold">
                      {formatCurrency(
                        product.revenue,
                      )}
                    </p>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}