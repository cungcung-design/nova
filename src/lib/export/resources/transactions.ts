import type { Prisma, TransactionStatus, TransactionType } from "@prisma/client";

import { db } from "@/lib/db";
import { toNumber } from "@/lib/utils";
import { getFilterString, getFilterStringList } from "@/lib/export/filters";

export async function getTransactionsForExport(
  workspaceId: string,
  filters: Record<string, unknown> = {},
) {
  const ids = getFilterStringList(filters, "ids");
  const search = getFilterString(filters, "search");
  const status = getFilterString(filters, "status");
  const type = getFilterString(filters, "type");

  const where: Prisma.TransactionWhereInput = {
    workspaceId,
    ...(ids ? { id: { in: ids } } : {}),
    ...(status ? { status: status as TransactionStatus } : {}),
    ...(type ? { type: type as TransactionType } : {}),
    ...(search
      ? {
          OR: [
            { description: { contains: search, mode: "insensitive" } },
            { providerId: { contains: search, mode: "insensitive" } },
            { order: { orderNumber: { contains: search, mode: "insensitive" } } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
            { customer: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const transactions = await db.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10000,
    select: {
      id: true,
      type: true,
      status: true,
      amount: true,
      currency: true,
      provider: true,
      createdAt: true,
      order: {
        select: { orderNumber: true },
      },
      customer: {
        select: { name: true, email: true },
      },
    },
  });

  return transactions.map((transaction) => ({
    ID: transaction.id,
    Type: transaction.type,
    Status: transaction.status,
    Amount: toNumber(transaction.amount),
    Currency: transaction.currency,
    Provider: transaction.provider,
    Order: transaction.order.orderNumber,
    Customer: transaction.customer.name,
    Email: transaction.customer.email,
    Created: transaction.createdAt.toISOString(),
  }));
}
