"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CustomerFormProps = {
  customer?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    status: string;
  };
};

export function CustomerForm({
  customer,
}: CustomerFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const editing = Boolean(customer);

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const formData = new FormData(
      event.currentTarget,
    );

    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"),
      status: formData.get("status"),
    };

    const response = await fetch(
      editing
        ? `/api/customers/${customer!.id}`
        : "/api/customers",
      {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setError(
        data.error ?? "Something went wrong.",
      );
      setLoading(false);
      return;
    }

    router.push(
      editing
        ? `/dashboard/customers/${customer!.id}`
        : "/dashboard/customers",
    );

    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="max-w-2xl space-y-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Name
          </label>

          <input
            name="name"
            required
            defaultValue={customer?.name ?? ""}
            className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Email
          </label>

          <input
            name="email"
            type="email"
            defaultValue={customer?.email ?? ""}
            className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Phone
          </label>

          <input
            name="phone"
            defaultValue={customer?.phone ?? ""}
            className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Company
          </label>

          <input
            name="company"
            defaultValue={
              customer?.company ?? ""
            }
            className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Status
        </label>

        <select
          name="status"
          defaultValue={
            customer?.status ?? "ACTIVE"
          }
          className="h-10 rounded-lg border bg-background px-3 text-sm"
        >
          <option value="ACTIVE">Active</option>
          <option value="LEAD">Lead</option>
          <option value="INACTIVE">
            Inactive
          </option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border p-3 text-sm">
          {error}
        </div>
      )}

      <button
        disabled={loading}
        className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : editing
            ? "Save changes"
            : "Create customer"}
      </button>
    </form>
  );
}
