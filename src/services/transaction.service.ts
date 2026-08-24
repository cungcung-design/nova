import type { Prisma, TransactionStatus, TransactionType } from "@prisma/client";

import { db } from "@/lib/db";
import { toNumber } from "@/lib/utils";
import { sanitizeSearchQuery } from "@/lib/security/security";

type GetTransactionsInput = {
  workspaceId: string;
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
};

export async function getTransactions({
  workspaceId,
  search,
  status,
  type,
  page = 1,
  pageSize = 25,
}: GetTransactionsInput) {
  const safeSearch = search ? sanitizeSearchQuery(search) : undefined;
  const skip = (page - 1) * pageSize;

  const where: Prisma.TransactionWhereInput = {
    workspaceId,
    ...(status ? { status: status as TransactionStatus } : {}),
    ...(type ? { type: type as TransactionType } : {}),
    ...(safeSearch
      ? {
          OR: [
            { description: { contains: safeSearch, mode: "insensitive" } },
            { providerId: { contains: safeSearch, mode: "insensitive" } },
            {
              order: {
                orderNumber: { contains: safeSearch, mode: "insensitive" },
              },
            },
            { customer: { name: { contains: safeSearch, mode: "insensitive" } } },
            {
              customer: {
                email: { contains: safeSearch, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        order: {
          select: { id: true, orderNumber: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    db.transaction.count({ where }),
  ]);

  return {
    transactions: rows.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      status: transaction.status,
      amount: toNumber(transaction.amount),
      currency: transaction.currency,
      provider: transaction.provider,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
      order: transaction.order,
      customer: transaction.customer,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
