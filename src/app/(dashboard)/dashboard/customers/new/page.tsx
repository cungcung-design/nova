import Link from "next/link";

import { CustomerForm } from "@/components/customers/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <Link
          href="/dashboard/customers"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to customers
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">
          Add customer
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a new customer for this workspace.
        </p>
      </div>

      <CustomerForm />
    </div>
  );
}
