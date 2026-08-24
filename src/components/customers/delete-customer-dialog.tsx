"use client";

import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";

type Props = {
  customerId: string;
};

export function DeleteCustomerDialog({
  customerId,
}: Props) {
  const router = useRouter();

  async function removeCustomer() {
    const response = await fetch(
      `/api/customers/${customerId}`,
      {
        method: "DELETE",
      },
    );

    if (response.ok) {
      router.push("/dashboard/customers");
      router.refresh();
    }
  }

  return (
    <button
      onClick={removeCustomer}
      className="rounded-lg border p-2 text-sm hover:bg-muted"
    >
      <Trash className="h-4 w-4" />
    </button>
  );
}
