import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type CustomerFilters = {
  workspaceId: string;
  search?: string;
  status?: "ACTIVE" | "INACTIVE" | "LEAD";
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
};

export async function getCustomers({
  workspaceId,
  search,
  status,
  page = 1,
  pageSize = 25,
  sortBy = "createdAt",
  sortDirection = "desc",
  dateFrom,
  dateTo,
}: CustomerFilters) {
  const allowedSortFields = ["createdAt", "name", "email"] as const;
  const safeSortBy = allowedSortFields.includes(sortBy as (typeof allowedSortFields)[number])
    ? sortBy
    : "createdAt";

  const safeSortDirection = sortDirection === "asc" ? "asc" : "desc";

  const where: Prisma.CustomerWhereInput = {
    workspaceId,
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { company: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lt: new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000) } : {}),
          },
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: { [safeSortBy]: safeSortDirection },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.customer.count({ where }),
  ]);

  return {
    customers,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getCustomerById(workspaceId: string, customerId: string) {
  return db.customer.findFirst({
    where: { id: customerId, workspaceId },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

export async function createCustomer(
  workspaceId: string,
  userId: string,
  data: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    status: "ACTIVE" | "INACTIVE" | "LEAD";
  },
) {
  return db.customer.create({
    data: { ...data, workspaceId, createdById: userId },
  });
}

export async function updateCustomer(
  workspaceId: string,
  customerId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    status?: "ACTIVE" | "INACTIVE" | "LEAD";
  },
) {
  return db.customer.updateMany({
    where: { id: customerId, workspaceId },
    data,
  });
}

export async function deleteCustomer(workspaceId: string, customerId: string) {
  return db.customer.deleteMany({
    where: { id: customerId, workspaceId },
  });
}

export async function bulkUpdateCustomers(
  workspaceId: string,
  ids: string[],
  action: string,
) {
  if (action === "delete") {
    return db.customer.deleteMany({
      where: { id: { in: ids }, workspaceId },
    });
  }

  if (action === "archive") {
    return db.customer.updateMany({
      where: { id: { in: ids }, workspaceId },
      data: { status: "INACTIVE" },
    });
  }

  if (action === "activate") {
    return db.customer.updateMany({
      where: { id: { in: ids }, workspaceId },
      data: { status: "ACTIVE" },
    });
  }

  throw new Error(`Unsupported bulk action: ${action}`);
}
