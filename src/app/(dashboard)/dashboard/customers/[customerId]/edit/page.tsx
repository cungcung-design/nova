"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CustomerForm } from "@/components/customers/customer-form";

type Props = {
  params: Promise<{ customerId: string }>;
};

export default function EditCustomerPage({ params }: Props) {
  const router = useRouter();
  const [customer, setCustomer] = useState<{
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { customerId } = await params;
        const response = await fetch(
          `/api/customers/${customerId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load customer");
        }

        const data = await response.json();
        setCustomer(data);
      } catch {
        setError("Failed to load customer.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params]);

  if (loading) {
    return (
      <div className="space-y-8 p-6 lg:p-8">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6 lg:p-8 text-sm text-destructive">
        {error ?? "Customer not found."}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Edit customer
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update customer information.
        </p>
      </div>

      <CustomerForm
        customer={customer}
      />
    </div>
  );
}
