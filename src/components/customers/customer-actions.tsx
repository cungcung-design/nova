"use client";

import Link from "next/link";
import { Pencil, Trash } from "lucide-react";

import { DeleteCustomerDialog } from "./delete-customer-dialog";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  status: string;
  createdAt: Date;
};

type CustomerActionsProps = {
  customer: Customer;
};

export function CustomerActions({
  customer,
}: CustomerActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/dashboard/customers/${customer.id}/edit`}
        className="rounded-lg border p-2 text-sm hover:bg-muted"
      >
        <Pencil className="h-4 w-4" />
      </Link>

      <DeleteCustomerDialog customerId={customer.id} />
    </div>
  );
}
