import { getCustomerFiltersFromRecord } from "@/lib/filters";
import { getFilterStringList, toStringRecord } from "@/lib/export/filters";
import { db } from "@/lib/db";
import { getCustomers } from "@/services/customer.service";

export async function getCustomersForExport(
  workspaceId: string,
  filters: Record<string, unknown> = {},
) {
  const ids = getFilterStringList(filters, "ids");

  if (ids && ids.length > 0) {
    const customers = await db.customer.findMany({
      where: {
        workspaceId,
        id: { in: ids },
      },
      orderBy: { createdAt: "desc" },
      take: 10000,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        status: true,
        createdAt: true,
      },
    });

    return customers.map(mapCustomer);
  }

  const parsed = getCustomerFiltersFromRecord(toStringRecord(filters));

  const result = await getCustomers({
    workspaceId,
    search: parsed.search,
    statuses: parsed.statuses,
    page: 1,
    pageSize: 10000,
    createdFrom: parsed.createdFrom,
    createdTo: parsed.createdTo,
    minRevenue: parsed.minRevenue,
    maxRevenue: parsed.maxRevenue,
  });

  return result.customers.map(mapCustomer);
}

function mapCustomer(customer: {
  id: string;
  name: string;
  email: string | null;
  company?: string | null;
  status: string;
  createdAt: Date;
}) {
  return {
    ID: customer.id,
    Name: customer.name,
    Email: customer.email,
    Company: customer.company ?? "",
    Status: customer.status,
    Created: customer.createdAt.toISOString(),
  };
}
