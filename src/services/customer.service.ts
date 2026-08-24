import { db } from "@/lib/db";

type CustomerFilters = {
  workspaceId: string;
  search?: string;
  status?: "ACTIVE" | "INACTIVE" | "LEAD";
  page?: number;
  pageSize?: number;
};

export async function getCustomers({
  workspaceId,
  search,
  status,
  page = 1,
  pageSize = 10,
}: CustomerFilters) {
  const where = {
    workspaceId,

    ...(status && {
      status,
    }),

    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
        {
          company: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
  };

  const [customers, total] =
    await Promise.all([
      db.customer.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),

      db.customer.count({
        where,
      }),
    ]);

  return {
    customers,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getCustomerById(
  workspaceId: string,
  customerId: string,
) {
  return db.customer.findFirst({
    where: {
      id: customerId,
      workspaceId,
    },

    include: {
      orders: {
        orderBy: {
          createdAt: "desc",
        },

        take: 10,
      },
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
    data: {
      ...data,
      workspaceId,
      createdById: userId,
    },
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
    where: {
      id: customerId,
      workspaceId,
    },
    data,
  });
}

export async function deleteCustomer(
  workspaceId: string,
  customerId: string,
) {
  return db.customer.deleteMany({
    where: {
      id: customerId,
      workspaceId,
    },
  });
}
