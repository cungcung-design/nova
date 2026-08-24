import { db } from "@/lib/db";

type ProductFilters = {
  workspaceId: string;
  search?: string;
  status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  page?: number;
  pageSize?: number;
};

export async function getProducts({
  workspaceId,
  search,
  status,
  page = 1,
  pageSize = 10,
}: ProductFilters) {
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
          sku: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
  };

  const [products, total] =
    await Promise.all([
      db.product.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),

      db.product.count({
        where,
      }),
    ]);

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(
      total / pageSize,
    ),
  };
}

export async function getProductById(
  workspaceId: string,
  productId: string,
) {
  return db.product.findFirst({
    where: {
      id: productId,
      workspaceId,
    },
    include: {
      orderItems: {
        include: {
          order: true,
        },
        orderBy: {
          order: {
            createdAt: "desc",
          },
        },
        take: 10,
      },
    },
  });
}

export async function createProduct(
  workspaceId: string,
  data: {
    name: string;
    description?: string;
    sku?: string;
    price: number;
    cost?: number;
    stock: number;
    status:
      | "ACTIVE"
      | "INACTIVE"
      | "OUT_OF_STOCK";
  },
) {
  return db.product.create({
    data: {
      ...data,
      workspaceId,
    },
  });
}

export async function updateProduct(
  workspaceId: string,
  productId: string,
  data: {
    name?: string;
    description?: string;
    sku?: string;
    price?: number;
    cost?: number;
    stock?: number;
    status?:
      | "ACTIVE"
      | "INACTIVE"
      | "OUT_OF_STOCK";
  },
) {
  return db.product.updateMany({
    where: {
      id: productId,
      workspaceId,
    },
    data,
  });
}

export async function deleteProduct(
  workspaceId: string,
  productId: string,
) {
  return db.product.deleteMany({
    where: {
      id: productId,
      workspaceId,
    },
  });
}
