import { db } from "@/lib/db";
import { toNumber } from "@/lib/utils";
import type { Prisma, ProductStatus } from "@prisma/client";

type ProductFilters = {
  workspaceId: string;
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
};

export async function getProducts({
  workspaceId,
  search,
  status,
  page = 1,
  pageSize = 25,
  sortBy = "createdAt",
  sortDirection = "desc",
}: ProductFilters) {
  const allowedSortFields = ["createdAt", "name", "price", "stock"] as const;
  const safeSortBy = allowedSortFields.includes(sortBy as (typeof allowedSortFields)[number])
    ? sortBy
    : "createdAt";

  const safeSortDirection = sortDirection === "asc" ? "asc" : "desc";

  const where: Prisma.ProductWhereInput = {
    workspaceId,
    ...(status ? { status: status as ProductStatus } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { [safeSortBy]: safeSortDirection },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return {
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      status: product.status,
      stock: product.stock,
      createdAt: product.createdAt,
      price: toNumber(product.price),
      cost: product.cost == null ? null : toNumber(product.cost),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProductById(workspaceId: string, productId: string) {
  return db.product.findFirst({
    where: { id: productId, workspaceId },
    include: {
      orderItems: { include: { order: true }, orderBy: { order: { createdAt: "desc" } }, take: 10 },
    },
  });
}

export async function createProduct(
  workspaceId: string,
  data: Omit<Prisma.ProductUncheckedCreateInput, "workspaceId">,
) {
  return db.product.create({
    data: { ...data, workspaceId },
  });
}

export async function updateProduct(workspaceId: string, productId: string, data: Prisma.ProductUncheckedUpdateInput) {
  return db.product.updateMany({
    where: { id: productId, workspaceId },
    data,
  });
}

export async function deleteProduct(workspaceId: string, productId: string) {
  return db.product.deleteMany({
    where: { id: productId, workspaceId },
  });
}

export async function bulkUpdateProducts(workspaceId: string, ids: string[], action: string) {
  if (action === "delete") {
    return db.product.deleteMany({
      where: { id: { in: ids }, workspaceId },
    });
  }

  if (action === "activate") {
    return db.product.updateMany({
      where: { id: { in: ids }, workspaceId },
      data: { status: "ACTIVE" },
    });
  }

  if (action === "deactivate") {
    return db.product.updateMany({
      where: { id: { in: ids }, workspaceId },
      data: { status: "INACTIVE" },
    });
  }

  throw new Error(`Unsupported bulk action: ${action}`);
}
