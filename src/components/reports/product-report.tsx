type Props = {
  products: {
    id: string;
    name: string;
    unitsSold: number;
    revenue: number;
  }[];
};

function currency(
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

export function ProductReport({
  products,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-6 py-5">
        <h2 className="font-semibold">
          Product Performance
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Your highest-performing products.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No product sales available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-6 py-4 font-medium">
                  Product
                </th>

                <th className="px-6 py-4 font-medium">
                  Units Sold
                </th>

                <th className="px-6 py-4 text-right font-medium">
                  Revenue
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map(
                (product, index) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold">
                          {index + 1}
                        </span>

                        <span className="font-medium">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-muted-foreground">
                      {product.unitsSold}
                    </td>

                    <td className="px-6 py-4 text-right font-semibold">
                      {currency(
                        product.revenue,
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}