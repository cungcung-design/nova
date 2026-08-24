import { db } from "@/lib/db";
import type { CustomerStatus, Prisma } from "@prisma/client";
import { toNumber } from "@/lib/utils";

type GetCustomersParams = {
  workspaceId: string;
  search?: string;
  statuses?: Array<"ACTIVE" | "INACTIVE" | "LEAD">;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  createdFrom?: string;
  createdTo?: string;
  minRevenue?: number;
  maxRevenue?: number;
};

function startOfUtcDay(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function exclusiveEndOfUtcDay(value: string) {
  return new Date(startOfUtcDay(value).getTime() + 24 * 60 * 60 * 1000);
}

async function getCustomerIdsByRevenue(
  workspaceId: string,
  minRevenue?: number,
  maxRevenue?: number,
) {
  const grouped = await db.order.groupBy({
    by: ["customerId"],
    where: {
      workspaceId,
      status: { not: "CANCELLED" },
    },
    _sum: {
      total: true,
    },
  });

  const matchingFromOrders = grouped
    .filter((row) => {
      const revenue = toNumber(row._sum.total);
      if (minRevenue != null && revenue < minRevenue) {
        return false;
      }
      if (maxRevenue != null && revenue > maxRevenue) {
        return false;
      }
      return true;
    })
    .map((row) => row.customerId);

  const includeZeroRevenue =
    (minRevenue == null || minRevenue <= 0) &&
    (maxRevenue == null || maxRevenue >= 0);

  if (!includeZeroRevenue) {
    return matchingFromOrders;
  }

  const customersWithOrders = grouped.map((row) => row.customerId);

  if (customersWithOrders.length === 0) {
    return null;
  }

  const zeroOrderCustomers = await db.customer.findMany({
    where: {
      workspaceId,
      id: { notIn: customersWithOrders },
    },
    select: { id: true },
  });

  return [
    ...matchingFromOrders,
    ...zeroOrderCustomers.map((customer) => customer.id),
  ];
}

export async function getCustomers({
  workspaceId,
  search,
  statuses,
  page = 1,
  pageSize = 25,
  sortBy = "createdAt",
  sortDirection = "desc",
  createdFrom,
  createdTo,
  minRevenue,
  maxRevenue,
}: GetCustomersParams) {
  const allowedSortFields = ["createdAt", "name", "email", "status"] as const;
  const safeSortBy = allowedSortFields.includes(
    sortBy as (typeof allowedSortFields)[number],
  )
    ? sortBy
    : "createdAt";

  const safeSortDirection = sortDirection === "asc" ? "asc" : "desc";

  const where: Prisma.CustomerWhereInput = {
    workspaceId,
    ...(statuses && statuses.length > 0
      ? { status: { in: statuses as CustomerStatus[] } }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { company: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(createdFrom || createdTo
      ? {
          createdAt: {
            ...(createdFrom ? { gte: startOfUtcDay(createdFrom) } : {}),
            ...(createdTo ? { lt: exclusiveEndOfUtcDay(createdTo) } : {}),
          },
        }
      : {}),
  };

  if (minRevenue != null || maxRevenue != null) {
    const ids = await getCustomerIdsByRevenue(
      workspaceId,
      minRevenue,
      maxRevenue,
    );

    if (ids && ids.length === 0) {
      return {
        customers: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    if (ids) {
      where.id = { in: ids };
    }
  }

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
