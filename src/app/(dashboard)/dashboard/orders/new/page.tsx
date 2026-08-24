"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: string;
  name: string;
  email: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type CartItem = {
  productId: string;
  quantity: number;
  product: Product;
};

export default function NewOrderPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerQuery, setCustomerQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setCatalogLoading(true);
      setCatalogError("");

      try {
        const [customersRes, productsRes] = await Promise.all([
          fetch("/api/customers?pageSize=100"),
          fetch("/api/products?pageSize=100"),
        ]);

        if (!customersRes.ok || !productsRes.ok) {
          throw new Error("Unable to load customers and products.");
        }

        const customerData = await customersRes.json();
        const productData = await productsRes.json();
        setCustomers(customerData.customers ?? []);
        setProducts(productData.products ?? []);
      } catch (loadError) {
        setCatalogError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load customers and products.",
        );
      } finally {
        setCatalogLoading(false);
      }
    }

    void load();
  }, []);

  function addItem(product: Product) {
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        quantity: 1,
        product,
      },
    ]);
  }

  function updateQuantity(
    productId: string,
    quantity: number,
  ) {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity }
          : item,
      ),
    );
  }

  function removeItem(productId: string) {
    setItems((prev) =>
      prev.filter(
        (item) =>
          item.productId !==
          productId,
      ),
    );
  }

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      item.product.price *
        item.quantity,
    0,
  );

  const total =
    subtotal + tax - discount;

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const response = await fetch(
      "/api/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          items: items.map(
            (item) => ({
              productId:
                item.productId,
              quantity:
                item.quantity,
            }),
          ),
          tax,
          discount,
          notes,
        }),
      },
    );

    if (!response.ok) {
      const data =
        await response.json();
      setError(
        data.error ??
          "Failed to create order.",
      );
      setLoading(false);
      return;
    }

    router.push(
      "/dashboard/orders",
    );
    router.refresh();
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Create Order
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Build a new order for a customer.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        <div className="max-w-2xl space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Customer
            </label>

            <select
              value={customerId}
              onChange={(
                event
              ) =>
                setCustomerId(
                  event.target.value,
                )
              }
              required
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none"
            >
              <option value="">
                {catalogLoading
                  ? "Loading customers..."
                  : customers.length === 0
                    ? "No customers found"
                    : "Select customer"}
              </option>

              {customers
                .filter((customer) =>
                  customer.name
                    .toLowerCase()
                    .includes(customerQuery.toLowerCase()),
                )
                .map(
                (customer) => (
                  <option
                    key={
                      customer.id
                    }
                    value={
                      customer.id
                    }
                  >
                    {customer.name}
                  </option>
                ),
              )}
            </select>
            <input
              type="search"
              value={customerQuery}
              onChange={(event) => setCustomerQuery(event.target.value)}
              placeholder="Filter customers"
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none"
            />
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            Products
          </h2>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={
                  item.productId
                }
                className="flex items-center gap-4 rounded-2xl border bg-card p-4"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {
                      item.product
                        .name
                    }
                  </p>

                  <p className="text-xs text-muted-foreground">
                    $
                    {item.product.price.toFixed(
                      2,
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        Math.max(
                          1,
                          item.quantity -
                            1,
                        ),
                      )
                    }
                    className="rounded-lg border p-2 text-xs"
                  >
                    -
                  </button>

                  <span className="w-8 text-center text-sm">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        Math.min(
                          item.product.stock,
                          item.quantity +
                            1,
                        ),
                      )
                    }
                    className="rounded-lg border p-2 text-xs"
                  >
                    +
                  </button>
                </div>

                <p className="w-24 text-right text-sm font-medium">
                  $
                  {(
                    item.product.price *
                    item.quantity
                  ).toFixed(2)}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    removeItem(
                      item.productId,
                    )
                  }
                  className="rounded-lg border p-2 text-xs text-destructive"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="search"
              value={productQuery}
              onChange={(event) => setProductQuery(event.target.value)}
              placeholder="Filter products"
              className="h-11 max-w-sm rounded-lg border bg-background px-3 text-sm outline-none"
            />
            <div className="flex flex-wrap gap-2">
            {catalogLoading ? (
              <p className="text-sm text-muted-foreground">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products found.</p>
            ) : (
            products
              .filter(
                (product) =>
                  !items.some(
                    (item) =>
                      item.productId ===
                      product.id,
                  ) &&
                  product.name
                    .toLowerCase()
                    .includes(productQuery.toLowerCase()),
              )
              .map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() =>
                    addItem(
                      product,
                    )
                  }
                  className="min-h-11 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                >
                  +{" "}
                  {product.name}
                </button>
              ))
            )}
            </div>
          </div>
        </section>

        <section className="max-w-sm space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tax
            </label>

            <input
              type="number"
              min={0}
              value={tax}
              onChange={(
                event
              ) =>
                setTax(
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Discount
            </label>

            <input
              type="number"
              min={0}
              value={discount}
              onChange={(
                event
              ) =>
                setDiscount(
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(
                event
              ) =>
                setNotes(
                  event.target
                    .value,
                )
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none"
              rows={3}
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Subtotal
              </span>
              <span>
                $
                {subtotal.toFixed(
                  2,
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Tax
              </span>
              <span>
                $
                {tax.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Discount
              </span>
              <span>
                -
                $
                {discount.toFixed(
                  2,
                )}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>
                Total
              </span>
              <span>
                $
                {total.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {catalogError && (
          <div className="rounded-lg border p-3 text-sm text-destructive">
            {catalogError}
          </div>
        )}

        {error && (
          <div className="rounded-lg border p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            !customerId ||
            items.length ===
              0
          }
          className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : "Create Order"}
        </button>
      </form>
    </div>
  );
}
